-- =============================================================
-- GreenBasket: order safety (server-side prices + stock)
-- Run ONCE in Supabase Dashboard -> SQL Editor (after the other migrations).
-- Safe to re-run.
--
-- What it does:
--  * Ignores prices/totals sent by the browser. Each order is re-priced from the
--    products table, so editing the cart in dev tools can't lower the price.
--  * Rejects orders for inactive/missing products, bad quantities, or too little stock.
--  * Reduces product stock when an order is placed; gives it back if the order is
--    cancelled (and takes it again if a cancelled order is re-opened).
--  * Forces new orders to start as 'pending' with cash-on-delivery.
--  * Limits each customer to 5 pending orders at a time.
-- =============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_reserved BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.prepare_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD;
  v_total NUMERIC := 0;
  v_items JSONB := '[]'::jsonb;
BEGIN
  IF jsonb_typeof(NEW.items) IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty';
  END IF;

  -- abuse guard: a customer can have at most 5 orders waiting for the shop at once
  IF NEW.user_id IS NOT NULL
     AND (SELECT count(*) FROM orders WHERE user_id = NEW.user_id AND status = 'pending') >= 5 THEN
    RAISE EXCEPTION 'You already have 5 orders waiting for the shop. Please wait for them to be confirmed, or cancel one.';
  END IF;

  -- one row per product id (duplicates merged), locked in id order to avoid deadlocks
  FOR r IN
    SELECT x.pid, x.qty, p.name, p.price, p.unit, p.image, p.active
    FROM (
      SELECT (e->>'id')::int AS pid, SUM((e->>'quantity')::int) AS qty
      FROM jsonb_array_elements(NEW.items) e
      GROUP BY 1
    ) x
    LEFT JOIN products p ON p.id = x.pid
    ORDER BY x.pid
  LOOP
    IF r.name IS NULL OR r.active IS NOT TRUE THEN
      RAISE EXCEPTION 'A product in your cart is no longer available';
    END IF;
    IF r.qty < 1 THEN
      RAISE EXCEPTION 'Invalid quantity for %', r.name;
    END IF;
    IF r.qty > 100 THEN
      RAISE EXCEPTION 'You can order at most 100 of % at a time. Please call the shop for bulk orders.', r.name;
    END IF;

    UPDATE products SET stock = stock - r.qty, updated_at = now()
    WHERE id = r.pid AND stock >= r.qty;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Not enough stock for %', r.name;
    END IF;

    v_total := v_total + r.price * r.qty;
    v_items := v_items || jsonb_build_object(
      'id', r.pid, 'name', r.name, 'price', r.price,
      'unit', r.unit, 'image', r.image, 'quantity', r.qty);
  END LOOP;

  NEW.items := v_items;
  NEW.total := v_total;
  NEW.status := 'pending';
  NEW.payment_method := 'cod';
  NEW.stock_reserved := true;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_prepare ON orders;
CREATE TRIGGER orders_prepare BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.prepare_order();

-- Give stock back on cancel / take it again on re-open (only for orders that reserved stock)
CREATE OR REPLACE FUNCTION public.adjust_stock_on_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD;
BEGIN
  IF NEW.stock_reserved AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
      UPDATE products p SET stock = p.stock + x.qty, updated_at = now()
      FROM (SELECT (e->>'id')::int AS pid, SUM((e->>'quantity')::int) AS qty
            FROM jsonb_array_elements(NEW.items) e GROUP BY 1) x
      WHERE p.id = x.pid;
    ELSIF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
      FOR r IN
        SELECT (e->>'id')::int AS pid, SUM((e->>'quantity')::int) AS qty
        FROM jsonb_array_elements(NEW.items) e GROUP BY 1 ORDER BY 1
      LOOP
        UPDATE products SET stock = stock - r.qty, updated_at = now()
        WHERE id = r.pid AND stock >= r.qty;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Not enough stock to re-open this order (product %)', r.pid;
        END IF;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_stock_upd ON orders;
CREATE TRIGGER orders_stock_upd BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.adjust_stock_on_status();

-- =============================================================
-- GreenBasket: hardening (abuse limits, field limits, tracking throttle, hidden inactive products)
-- Run ONCE in Supabase Dashboard -> SQL Editor, AFTER all the other migrations
-- (it needs public.is_admin() and public.prepare_order()). Safe to re-run.
--
-- What it does:
--  * Limits abuse of order placing even with many accounts: max 5 pending orders per phone
--    number, max 10 orders per customer per hour, max 30 different products per order.
--  * Puts size limits on the text fields of an order (existing rows are left alone).
--  * Throttles guest order tracking: 15 look-ups per phone number per 10 minutes.
--  * Hides inactive products from the public (the admin still sees them).
--  * Removes the two old "open" order policies from the first schema file, if they are still there.
-- =============================================================

DO $$ BEGIN
  IF to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION 'Run supabase-migration-customer-auth.sql first';
  END IF;
  IF to_regprocedure('public.prepare_order()') IS NULL THEN
    RAISE EXCEPTION 'Run supabase-migration-order-safety.sql first';
  END IF;
END $$;

-- 1. Old open policies (only exist if the customer-auth migration was skipped)
DROP POLICY IF EXISTS "Anyone can place orders" ON orders;
DROP POLICY IF EXISTS "Anyone can place an order" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;

-- 2. Order abuse limits (same function as order-safety, plus the new checks)
CREATE OR REPLACE FUNCTION public.prepare_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD;
  v_total NUMERIC := 0;
  v_items JSONB := '[]'::jsonb;
  v_phone TEXT := right(regexp_replace(COALESCE(NEW.phone, ''), '\D', '', 'g'), 10);
BEGIN
  IF jsonb_typeof(NEW.items) IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty';
  END IF;
  IF jsonb_array_length(NEW.items) > 30 THEN
    RAISE EXCEPTION 'An order can have at most 30 different products. Please split it into two orders.';
  END IF;

  IF NEW.user_id IS NOT NULL THEN
    IF (SELECT count(*) FROM orders WHERE user_id = NEW.user_id AND status = 'pending') >= 5 THEN
      RAISE EXCEPTION 'You already have 5 orders waiting for the shop. Please wait for them to be confirmed, or cancel one.';
    END IF;
    IF (SELECT count(*) FROM orders WHERE user_id = NEW.user_id AND created_at > now() - interval '1 hour') >= 10 THEN
      RAISE EXCEPTION 'You have placed many orders in the last hour. Please try again later or call the shop.';
    END IF;
  END IF;

  -- same phone number across several accounts counts as one customer
  IF length(v_phone) >= 7 AND (
       SELECT count(*) FROM orders
       WHERE status = 'pending' AND right(regexp_replace(phone, '\D', '', 'g'), 10) = v_phone
     ) >= 5 THEN
    RAISE EXCEPTION 'This phone number already has 5 orders waiting for the shop. Please wait for them to be confirmed, or call the shop.';
  END IF;

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

CREATE INDEX IF NOT EXISTS orders_phone_pending_idx
  ON orders ((right(regexp_replace(phone, '\D', '', 'g'), 10))) WHERE status = 'pending';

-- 3. Size limits on order text (NOT VALID = only checked for new/changed rows, old rows are fine)
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN SELECT * FROM (VALUES
    ('orders_customer_name_len', 'length(customer_name) BETWEEN 1 AND 100'),
    ('orders_email_len',         'length(email) <= 254'),
    ('orders_phone_len',         'length(phone) BETWEEN 7 AND 20'),
    ('orders_address_len',       'length(address) BETWEEN 1 AND 300'),
    ('orders_city_len',          'length(city) BETWEEN 1 AND 100'),
    ('orders_pincode_len',       'length(pincode) BETWEEN 4 AND 10'),
    ('orders_landmark_len',      'length(landmark) <= 150'),
    ('orders_notes_len',         'length(notes) <= 500')
  ) AS t(name, expr) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = c.name AND conrelid = 'public.orders'::regclass) THEN
      EXECUTE format('ALTER TABLE orders ADD CONSTRAINT %I CHECK (%s) NOT VALID', c.name, c.expr);
    END IF;
  END LOOP;
END $$;

-- 4. Guest order tracking: throttle look-ups per phone number
CREATE TABLE IF NOT EXISTS track_attempts (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS track_attempts_phone_at_idx ON track_attempts (phone, at);
ALTER TABLE track_attempts ENABLE ROW LEVEL SECURITY;   -- no policies: only the function below can touch it
REVOKE ALL ON track_attempts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_order(p_order TEXT, p_phone TEXT)
RETURNS TABLE (
  id UUID, created_at TIMESTAMPTZ, status TEXT, total NUMERIC, items JSONB,
  customer_name TEXT, city TEXT, history JSONB
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone TEXT := left(trim(COALESCE(p_phone, '')), 20);
BEGIN
  IF (SELECT count(*) FROM track_attempts a WHERE a.phone = v_phone AND a.at > now() - interval '10 minutes') >= 15 THEN
    RAISE EXCEPTION 'Too many attempts. Please wait a few minutes and try again.';
  END IF;
  INSERT INTO track_attempts (phone) VALUES (v_phone);
  IF random() < 0.02 THEN DELETE FROM track_attempts a WHERE a.at < now() - interval '1 day'; END IF;

  RETURN QUERY
  SELECT o.id, o.created_at, o.status, o.total, o.items, o.customer_name, o.city,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('status', h.status, 'at', h.created_at) ORDER BY h.created_at)
              FROM order_status_history h WHERE h.order_id = o.id), '[]'::jsonb)
  FROM orders o
  WHERE o.phone = v_phone
    AND length(trim(p_order)) >= 8
    AND replace(o.id::text, '-', '') ILIKE replace(trim(p_order), '-', '') || '%'
  LIMIT 1;
END $$;
GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;

-- 5. Inactive products are visible to the admin only
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products FOR SELECT
  USING (active IS NOT FALSE OR public.is_admin());

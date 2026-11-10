-- =============================================================
-- GreenBasket: customer accounts + order tracking
-- Run ONCE in Supabase Dashboard -> SQL Editor (after supabase-schema.sql)
-- Safe to re-run.
-- =============================================================

-- 1. Link orders to customers + track status changes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT now();
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- 2. Admin list. A logged-in customer must NOT count as admin.
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

DROP POLICY IF EXISTS "Admins can read admins" ON admins;
CREATE POLICY "Admins can read admins" ON admins FOR SELECT USING (user_id = auth.uid());

-- >>> IMPORTANT: add yourself as admin (replace the email with your admin login email):
-- INSERT INTO admins (user_id) SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL';

-- 3. Status history (powers the tracking timeline)
CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.log_order_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history(order_id, status) VALUES (NEW.id, NEW.status);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at := now();
    INSERT INTO order_status_history(order_id, status) VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_status_ins ON orders;
CREATE TRIGGER orders_status_ins AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION log_order_status();
DROP TRIGGER IF EXISTS orders_status_upd ON orders;
CREATE TRIGGER orders_status_upd BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION log_order_status();

-- 4. Replace the old "any authenticated user is admin" policies
DROP POLICY IF EXISTS "Anyone can place orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;

-- login required: customers can only place orders as themselves
DROP POLICY IF EXISTS "Place orders" ON orders;
CREATE POLICY "Place orders" ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Customers can view own orders" ON orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin can update orders" ON orders FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can update products" ON products FOR UPDATE
  USING (public.is_admin());
CREATE POLICY "Admin can insert products" ON products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read own order history" ON order_status_history;
CREATE POLICY "Read own order history" ON order_status_history FOR SELECT
  USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- 5. Guest tracking: order id (full UUID or first 8 chars) + phone number
CREATE OR REPLACE FUNCTION public.track_order(p_order TEXT, p_phone TEXT)
RETURNS TABLE (
  id UUID, created_at TIMESTAMPTZ, status TEXT, total NUMERIC, items JSONB,
  customer_name TEXT, city TEXT, history JSONB
) LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT o.id, o.created_at, o.status, o.total, o.items, o.customer_name, o.city,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('status', h.status, 'at', h.created_at) ORDER BY h.created_at)
              FROM order_status_history h WHERE h.order_id = o.id), '[]'::jsonb)
  FROM orders o
  WHERE o.phone = trim(p_phone)
    AND length(trim(p_order)) >= 8
    AND replace(o.id::text, '-', '') ILIKE replace(trim(p_order), '-', '') || '%'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;

-- 6. Live updates on the My Orders page
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

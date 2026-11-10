-- =============================================================
-- GreenBasket: faster admin dashboard stats + order list indexes
-- Run ONCE in Supabase Dashboard -> SQL Editor (after the customer-auth migration,
-- because it uses public.is_admin()). Safe to re-run.
-- =============================================================

CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

-- Dashboard numbers computed in the database (no 1000-row limit).
-- Revenue ignores cancelled orders. Admin only.
CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS TABLE (total_orders BIGINT, pending_orders BIGINT, revenue NUMERIC, product_count BIGINT)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  RETURN QUERY SELECT
    (SELECT count(*) FROM orders),
    (SELECT count(*) FROM orders WHERE status = 'pending'),
    (SELECT COALESCE(sum(o.total), 0) FROM orders o WHERE o.status <> 'cancelled'),
    (SELECT count(*) FROM products);
END $$;

REVOKE ALL ON FUNCTION public.admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;

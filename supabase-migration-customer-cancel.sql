-- =============================================================
-- GreenBasket: let customers cancel their own PENDING orders
-- Run ONCE in Supabase Dashboard -> SQL Editor (after the order-safety migration,
-- so cancelling gives the stock back). Safe to re-run.
--
-- Customers still can't edit orders directly: this function is the only door,
-- and it only works for the customer's own order while it is still 'pending'.
-- =============================================================
CREATE OR REPLACE FUNCTION public.cancel_my_order(p_order UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM orders
  WHERE id = p_order AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'This order is already %, so it can''t be cancelled online. Please call the shop.', v_status;
  END IF;

  UPDATE orders SET status = 'cancelled' WHERE id = p_order;
END $$;

REVOKE ALL ON FUNCTION public.cancel_my_order(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_my_order(UUID) TO authenticated;

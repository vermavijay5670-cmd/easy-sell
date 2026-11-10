-- =============================================================
-- GreenBasket: server-side Telegram notifications (new order + customer cancellation)
-- Run in Supabase Dashboard -> SQL Editor, AFTER deploying the `notify-order` Edge Function.
--
-- 1) Replace YOUR_PROJECT_REF (appears once, in the INSERT below) with the part before
--    .supabase.co in your project URL
-- 2) Replace YOUR_WEBHOOK_SECRET with the SAME value as the WEBHOOK_SECRET secret of the
--    Edge Function
-- Safe to re-run (re-running updates the stored values).
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Private settings table: row security is on and there are NO policies, so the website
-- (anon / logged-in users) can never read it. Only the trigger functions below can.
CREATE TABLE IF NOT EXISTS app_secrets (key TEXT PRIMARY KEY, value TEXT NOT NULL);
ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app_secrets FROM anon, authenticated;

INSERT INTO app_secrets (key, value) VALUES
  ('notify_url',    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-order'),
  ('notify_secret', 'YOUR_WEBHOOK_SECRET')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- shared sender: never lets a notification problem block an order
CREATE OR REPLACE FUNCTION public.send_notification(p_body JSONB)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_url TEXT := (SELECT value FROM app_secrets WHERE key = 'notify_url');
  v_secret TEXT := (SELECT value FROM app_secrets WHERE key = 'notify_secret');
BEGIN
  -- skip until a real project URL (lowercase letters/digits before .supabase.co) has been filled in
  IF v_url IS NULL OR v_url !~ '^https://[a-z0-9]+\.supabase\.co/' THEN RETURN; END IF;
  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
    body    := p_body
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'send_notification failed: %', SQLERRM;
END $$;
REVOKE ALL ON FUNCTION public.send_notification(JSONB) FROM PUBLIC, anon, authenticated;

-- new order -> Telegram
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.send_notification(jsonb_build_object('record', to_jsonb(NEW)));
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_notify ON orders;
CREATE TRIGGER orders_notify AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();

-- customer cancelled -> Telegram (cancellations made by the admin are not announced)
CREATE OR REPLACE FUNCTION public.notify_order_cancelled()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.send_notification(jsonb_build_object('type', 'cancelled', 'order', to_jsonb(NEW)));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_notify_cancel ON orders;
CREATE TRIGGER orders_notify_cancel AFTER UPDATE OF status ON orders
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM 'cancelled' AND NEW.status = 'cancelled')
  EXECUTE FUNCTION public.notify_order_cancelled();

-- the old version of notify_new_order embedded the URL/secret; nothing else to clean up

-- =============================================================
-- GreenBasket: table permissions for the Supabase API
-- Run in Supabase Dashboard -> SQL Editor. Safe to run again.
--
-- Newer Supabase projects do NOT automatically give the API roles (anon / authenticated)
-- access to tables you create in the SQL editor. Without these grants every request fails with
-- "permission denied" before the row-level rules are even checked: admin login says "no admin
-- access" and orders can't be placed. The row-level rules still decide WHO can do WHAT;
-- this file only lets those rules run. Deliberately NOT granted: app_secrets, track_attempts.
-- =============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- storefront (visitors can only read)
GRANT SELECT ON products, shop_settings TO anon;

-- logged-in customers and the admin (row-level rules limit what each can really do)
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, UPDATE                 ON shop_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON orders TO authenticated;
GRANT SELECT                         ON admins, order_status_history TO authenticated;

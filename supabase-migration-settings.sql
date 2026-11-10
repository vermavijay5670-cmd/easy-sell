-- =============================================================
-- GreenBasket: editable shop name
-- Run ONCE in Supabase Dashboard -> SQL Editor (after the customer-auth migration,
-- because it uses public.is_admin()). Safe to re-run.
-- =============================================================
CREATE TABLE IF NOT EXISTS shop_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- single row
  shop_name TEXT NOT NULL DEFAULT 'GreenBasket',
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON shop_settings;
CREATE POLICY "Anyone can read settings" ON shop_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update settings" ON shop_settings;
CREATE POLICY "Admin can update settings" ON shop_settings FOR UPDATE USING (public.is_admin());

-- Contact details + footer tagline (added later; safe to re-run)
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS tagline TEXT NOT NULL DEFAULT 'Your trusted source for farm-fresh vegetables, herbs, and authentic spices delivered straight to your doorstep.';

-- Social links + customer reviews (added later; safe to re-run)
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS instagram TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS facebook  TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS whatsapp  TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS testimonials JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Editable categories + home page banner text (general grocery store)
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS categories JSONB;                       -- NULL = built-in default list
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS hero_badge TEXT NOT NULL DEFAULT '';    -- '' = built-in default text
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS hero_title TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT NOT NULL DEFAULT '';

-- swap the old vegetables-only footer text for the grocery one (only if it was never customised)
UPDATE shop_settings
SET tagline = 'Your neighbourhood grocery store: everyday essentials, fresh produce and quality staples delivered to your doorstep.'
WHERE tagline = 'Your trusted source for farm-fresh vegetables, herbs, and authentic spices delivered straight to your doorstep.';

-- Remove the made-up sample contact details from shops that never entered their own
-- (the footer hides empty fields; fill in the real ones under Admin -> Shop Settings)
ALTER TABLE shop_settings ALTER COLUMN phone SET DEFAULT '';
ALTER TABLE shop_settings ALTER COLUMN email SET DEFAULT '';
ALTER TABLE shop_settings ALTER COLUMN address SET DEFAULT '';
UPDATE shop_settings SET phone = ''   WHERE phone = '+91 98765 43210';
UPDATE shop_settings SET email = ''   WHERE email = 'hello@greenbasket.in';
UPDATE shop_settings SET address = '' WHERE address = E'123, Fresh Market Lane,\nBengaluru, Karnataka 560001';

-- =============================================================
-- MetalPunch Pro — Punched Plates Selling Website
-- Supabase SQL Schema (complete, run top to bottom)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ORDERS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ   DEFAULT now(),
  customer_name   TEXT          NOT NULL,
  email           TEXT,
  phone           TEXT          NOT NULL,
  address         TEXT          NOT NULL,
  city            TEXT          NOT NULL,
  pincode         TEXT          NOT NULL,
  landmark        TEXT,
  notes           TEXT,
  items           JSONB         NOT NULL,  -- [{ id, name, price, quantity, unit }]
  total           DECIMAL(12,2) NOT NULL,
  status          TEXT          DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','dispatched','delivered','cancelled')),
  payment_method  TEXT          DEFAULT 'cod'
);

-- ─────────────────────────────────────────────────────────────
-- 2. PRODUCTS TABLE  (punched metal plates)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              INTEGER       PRIMARY KEY,
  name            TEXT          NOT NULL,
  category        TEXT          NOT NULL,
  -- Category values: round-plates | square-plates | rectangular-plates |
  --   custom-shapes | fine-mesh | heavy-duty | stainless-steel | mild-steel | aluminium
  price           DECIMAL(12,2) NOT NULL,
  unit            TEXT          NOT NULL,   -- e.g. 'Per Sheet (1mm thick)'
  stock           INTEGER       DEFAULT 0,
  image           TEXT,                     -- URL or NULL (SVG placeholder used in UI)
  description     TEXT,
  badge           TEXT,                     -- e.g. 'Bestseller','Premium','Heavy Duty'
  active          BOOLEAN       DEFAULT true,
  updated_at      TIMESTAMPTZ   DEFAULT now(),
  -- Plate-specific metadata (optional; used for filtering/specs display)
  material        TEXT,         -- 'SS304' | 'SS316' | 'MS' | 'Aluminium' | 'GI'
  hole_shape      TEXT,         -- 'Round' | 'Square' | 'Rectangular' | 'Hexagonal' | 'Slot'
  hole_size_mm    DECIMAL(6,2), -- diameter or side length in mm
  pitch_mm        DECIMAL(6,2), -- centre-to-centre distance in mm
  thickness_mm    DECIMAL(5,2), -- sheet thickness in mm
  sheet_width_mm  INTEGER,      -- width in mm
  sheet_length_mm INTEGER       -- length in mm
);

-- ─────────────────────────────────────────────────────────────
-- 3. SHOP SETTINGS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_settings (
  id              INTEGER       PRIMARY KEY DEFAULT 1,
  shop_name       TEXT          NOT NULL DEFAULT 'MetalPunch Pro',
  tagline         TEXT,
  hero_badge      TEXT,
  hero_title      TEXT,
  hero_subtitle   TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  whatsapp        TEXT,
  instagram       TEXT,
  facebook        TEXT,
  categories      JSONB         DEFAULT '[]'::jsonb,
  testimonials    JSONB         DEFAULT '[]'::jsonb,
  updated_at      TIMESTAMPTZ   DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- ─────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Public: anyone can browse active products
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
      AND policyname = 'Public can view active products'
  ) THEN
    CREATE POLICY "Public can view active products"
      ON products FOR SELECT USING (active = true);
  END IF;
END $$;

-- Public: anyone can read shop settings (name, contact, categories, etc.)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_settings'
      AND policyname = 'Public can read shop settings'
  ) THEN
    CREATE POLICY "Public can read shop settings"
      ON shop_settings FOR SELECT USING (true);
  END IF;
END $$;

-- Orders: NO policy here on purpose. Orders stay locked (nobody can read or write them)
-- until supabase-migration-customer-auth.sql adds the real rules (own orders / admin only).

-- ─────────────────────────────────────────────────────────────
-- 5. SEED — Default shop settings row
-- ─────────────────────────────────────────────────────────────
INSERT INTO shop_settings (
  id, shop_name, tagline, hero_badge, hero_title, hero_subtitle, categories
) VALUES (
  1,
  'MetalPunch Pro',
  'Premium perforated metal plates & sheets in various hole sizes, patterns and materials. Industrial supply for filtration, construction, architecture and manufacturing.',
  '🏭 Industrial-Grade Punched Plates',
  'Precision Punched Metal Plates
for Every Application',
  'High-quality perforated metal plates in stainless steel, mild steel & aluminium. Available in round, square and rectangular hole patterns. Bulk orders welcome.',
  '[
    {"id":"round-plates",    "name":"Round Punched Plates",          "icon":"⭕"},
    {"id":"square-plates",   "name":"Square Punched Plates",         "icon":"⬜"},
    {"id":"rectangular-plates","name":"Rectangular Plates",          "icon":"▬"},
    {"id":"custom-shapes",   "name":"Custom Shapes",                 "icon":"🔷"},
    {"id":"fine-mesh",       "name":"Fine Mesh / Micro Holes",       "icon":"🔲"},
    {"id":"heavy-duty",      "name":"Heavy Duty / Thick Gauge",      "icon":"🏗️"},
    {"id":"stainless-steel", "name":"Stainless Steel",               "icon":"✨"},
    {"id":"mild-steel",      "name":"Mild Steel",                    "icon":"🔩"},
    {"id":"aluminium",       "name":"Aluminium Plates",              "icon":"🪙"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 6. SEED — 20 sample punched plate products
-- ─────────────────────────────────────────────────────────────
INSERT INTO products
  (id, name, category, price, unit, stock, image, description, badge, active,
   material, hole_shape, hole_size_mm, pitch_mm, thickness_mm, sheet_width_mm, sheet_length_mm)
VALUES
-- Round plates (SS)
(1,  'SS Round Hole Punched Plate 1000×500 mm — 3mm hole, 5mm pitch',
     'round-plates', 1850, 'Per Sheet (1mm thick)', 120, NULL,
     'Stainless steel 304 perforated sheet with 3mm round holes on 5mm pitch. Ideal for filtration, sieves and architectural grilles.',
     'Bestseller', true, 'SS304', 'Round', 3, 5, 1, 500, 1000),

(2,  'SS Round Hole Punched Plate 1000×500 mm — 5mm hole, 8mm pitch',
     'round-plates', 1620, 'Per Sheet (1mm thick)', 90, NULL,
     '5mm round holes on 8mm staggered pitch. Good for ventilation panels, speaker grilles and industrial screens.',
     NULL, true, 'SS304', 'Round', 5, 8, 1, 500, 1000),

(3,  'MS Round Hole Punched Plate 1200×600 mm — 6mm hole',
     'round-plates', 980, 'Per Sheet (1.2mm thick)', 200, NULL,
     'Mild steel perforated sheet with 6mm round holes. Galvanised finish available on request.',
     NULL, true, 'MS', 'Round', 6, 10, 1.2, 600, 1200),

(4,  'SS Round Hole Punched Plate 2000×1000 mm — 10mm hole',
     'round-plates', 4200, 'Per Sheet (1.5mm thick)', 60, NULL,
     'Large-format 304 SS sheet with 10mm holes — popular for safety guards, partition screens and machine guards.',
     'Heavy', true, 'SS304', 'Round', 10, 15, 1.5, 1000, 2000),

-- Square plates
(5,  'SS Square Hole Punched Plate 1000×500 mm — 5×5mm holes',
     'square-plates', 2100, 'Per Sheet (1mm thick)', 80, NULL,
     'Precision-punched square holes in 304 SS. Used in sorting screens, radiator covers and decorative facades.',
     'Premium', true, 'SS304', 'Square', 5, 8, 1, 500, 1000),

(6,  'MS Square Hole Punched Plate 1200×600 mm — 8×8mm holes',
     'square-plates', 1150, 'Per Sheet (1.2mm thick)', 150, NULL,
     'Mild steel square-hole sheet with clean cut edges. Powder-coated finish available.',
     NULL, true, 'MS', 'Square', 8, 12, 1.2, 600, 1200),

(7,  'Aluminium Square Hole Punched Plate 1000×500 mm — 4×4mm holes',
     'square-plates', 2650, 'Per Sheet (1mm thick)', 50, NULL,
     'Lightweight aluminium sheet, anodised natural finish. Great for HVAC, false ceilings and furniture.',
     'Lightweight', true, 'Aluminium', 'Square', 4, 7, 1, 500, 1000),

-- Rectangular plates
(8,  'SS Rectangular Hole Punched Plate 1000×500 mm — 10×5mm slots',
     'rectangular-plates', 2300, 'Per Sheet (1mm thick)', 70, NULL,
     'Oblong slot holes for high airflow applications — heaters, oven liners and exhaust panels.',
     NULL, true, 'SS304', 'Slot', 10, 15, 1, 500, 1000),

(9,  'MS Rectangular Hole Punched Plate 1200×600 mm — 15×6mm slots',
     'rectangular-plates', 1380, 'Per Sheet (1.5mm thick)', 100, NULL,
     'Larger slot holes for agriculture sieves, conveyor guards and grain separators.',
     NULL, true, 'MS', 'Slot', 15, 20, 1.5, 600, 1200),

-- Fine mesh / Micro holes
(10, 'SS Micro-Hole Punched Plate 500×500 mm — 1mm holes',
     'fine-mesh', 3200, 'Per Sheet (0.8mm thick)', 40, NULL,
     'Ultra-fine 1mm round perforations for laboratory filtration, sugar refining and pharmaceutical sieving.',
     'Precision', true, 'SS304', 'Round', 1, 2, 0.8, 500, 500),

(11, 'SS Fine Mesh Plate 1000×500 mm — 1.5mm holes, 2.5mm pitch',
     'fine-mesh', 2800, 'Per Sheet (0.8mm thick)', 55, NULL,
     'Fine-pattern perforated sheet for sound dampening panels, acoustic ceilings and air-purifier filters.',
     NULL, true, 'SS304', 'Round', 1.5, 2.5, 0.8, 500, 1000),

-- Heavy Duty
(12, 'MS Heavy Duty Punched Plate 1200×600 mm — 12mm holes (3mm thick)',
     'heavy-duty', 3500, 'Per Sheet', 45, NULL,
     'Extra-thick mild steel plate for industrial machine guards, mining screens and heavy-load platforms.',
     'Heavy Duty', true, 'MS', 'Round', 12, 18, 3, 600, 1200),

(13, 'SS Heavy Duty Punched Plate 1000×500 mm — 8mm holes (2mm thick)',
     'heavy-duty', 4800, 'Per Sheet', 30, NULL,
     'Marine-grade 316 SS, 2mm thick with 8mm punched holes. Corrosion-resistant for offshore and food processing.',
     'Marine Grade', true, 'SS316', 'Round', 8, 12, 2, 500, 1000),

-- Stainless Steel
(14, 'SS 304 Polished Punched Plate 500×500 mm — 3mm holes',
     'stainless-steel', 1950, 'Per Sheet (1mm thick)', 110, NULL,
     'Mirror-polished 304 stainless steel punched plate for decorative and architectural use.',
     'Polished', true, 'SS304', 'Round', 3, 5, 1, 500, 500),

(15, 'SS 316 Anti-corrosion Punched Plate 1000×500 mm — 5mm holes',
     'stainless-steel', 3100, 'Per Sheet (1.2mm thick)', 65, NULL,
     '316 grade for coastal, chemical and food-contact environments. Passes FDA food-safe standards.',
     'Food Safe', true, 'SS316', 'Round', 5, 8, 1.2, 500, 1000),

-- Mild Steel
(16, 'MS Punched Plate 1000×500 mm — 6mm holes (Hot Dip Galvanised)',
     'mild-steel', 1200, 'Per Sheet (1.5mm thick)', 180, NULL,
     'Hot-dip galvanised mild steel perforated plate. Rust-free for 15+ years outdoors.',
     'Galvanised', true, 'GI', 'Round', 6, 10, 1.5, 500, 1000),

(17, 'MS Punched Plate 1200×600 mm — 8mm holes (Powder Coated Black)',
     'mild-steel', 1450, 'Per Sheet (1.5mm thick)', 130, NULL,
     'Powder-coated matte black finish for interior architecture, furniture and partition walls.',
     'Black Coated', true, 'MS', 'Round', 8, 12, 1.5, 600, 1200),

-- Aluminium
(18, 'Aluminium Punched Plate 1000×500 mm — 3mm holes',
     'aluminium', 2200, 'Per Sheet (1mm thick)', 85, NULL,
     'Lightweight 5052 aluminium sheet with 3mm punched holes. Used in aircraft interiors and automotive panels.',
     NULL, true, 'Aluminium', 'Round', 3, 5, 1, 500, 1000),

(19, 'Aluminium Punched Plate 1000×500 mm — 6mm holes (Anodised)',
     'aluminium', 2700, 'Per Sheet (1.5mm thick)', 60, NULL,
     'Anodised aluminium for UV and corrosion resistance. Ideal for façade cladding and decorative screens.',
     'Anodised', true, 'Aluminium', 'Round', 6, 10, 1.5, 500, 1000),

(20, 'Aluminium Micro Punched Plate 500×500 mm — 1.5mm holes',
     'aluminium', 3400, 'Per Sheet (1mm thick)', 35, NULL,
     'Fine 1.5mm round perforations in aluminium for speaker grilles, air diffusers and instrument panels.',
     'Precision', true, 'Aluminium', 'Round', 1.5, 2.5, 1, 500, 500)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 7. HELPER: Updated-at trigger for products
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS settings_updated_at ON shop_settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON shop_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 8. USEFUL VIEWS
-- ─────────────────────────────────────────────────────────────

-- Active products only (what customers see)
CREATE OR REPLACE VIEW active_products AS
  SELECT * FROM products WHERE active = true ORDER BY category, id;

-- Orders summary for admin dashboard
CREATE OR REPLACE VIEW order_summary AS
  SELECT
    id,
    created_at,
    customer_name,
    phone,
    city,
    total,
    status,
    payment_method,
    jsonb_array_length(items) AS item_count
  FROM orders
  ORDER BY created_at DESC;

-- ─────────────────────────────────────────────────────────────
-- DONE — Run supabase-migration-*.sql files next for:
--   • Admin auth (admin login)
--   • Customer auth (order tracking / login)
--   • Hardening (hide inactive products from anon role)
--   • Telegram notifications (optional)
-- ─────────────────────────────────────────────────────────────

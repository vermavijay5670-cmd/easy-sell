-- =============================================================
-- GreenBasket Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  notes TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','dispatched','delivered','cancelled')),
  payment_method TEXT DEFAULT 'cod'
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  image TEXT,
  description TEXT,
  badge TEXT,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ROW LEVEL SECURITY
-- Locked by default: orders has NO policies here, so nobody can read or write orders
-- until supabase-migration-customer-auth.sql adds the proper ones (own orders / admin only).
-- Products start publicly readable; supabase-migration-hardening.sql later hides inactive ones.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Anyone can view products') THEN
    CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
  END IF;
END $$;

-- 4. SEED INITIAL PRODUCTS
INSERT INTO products (id, name, category, price, unit, stock, image, description, badge, active) VALUES
(1, 'Areca Leaf Round Plate 10"', 'areca-plates', 189, 'Pack of 25', 200, NULL, 'Pressed from fallen areca palm leaves. Sturdy, leak-proof and fully compostable.', 'Eco', true),
(2, 'Areca Leaf Round Plate 8"', 'areca-plates', 149, 'Pack of 25', 250, NULL, 'Smaller round plate for snacks, sweets and starters.', null, true),
(3, 'Areca Leaf Square Plate 9"', 'areca-plates', 199, 'Pack of 25', 150, NULL, 'Deep-pressed square plate with a neat rim. Looks great at weddings and events.', 'Premium', true),
(4, 'Areca Leaf Thali Plate 12"', 'areca-plates', 299, 'Pack of 25', 100, NULL, 'Large thali-size plate for full meals. Holds hot and oily food without bending.', 'Bestseller', true),
(5, 'Paper Plate Round 9" (Plain)', 'paper-plates', 89, 'Pack of 50', 400, NULL, 'Everyday white paper plate, good for parties, picnics and street food.', 'Bestseller', true),
(6, 'Paper Plate Round 7" (Plain)', 'paper-plates', 69, 'Pack of 50', 400, NULL, 'Light plate for snacks, sweets and desserts.', null, true),
(7, 'Printed Paper Plate 9"', 'paper-plates', 109, 'Pack of 50', 300, NULL, 'Colourful printed design for birthdays and festivals.', null, true),
(8, 'Heavy Duty Paper Plate 10" (Coated)', 'paper-plates', 159, 'Pack of 50', 200, NULL, 'Thick coated plate that does not go soggy with gravy.', 'Sturdy', true),
(9, 'Sugarcane Bagasse Plate 10"', 'plant-based', 229, 'Pack of 25', 150, NULL, 'Made from sugarcane waste. Microwave safe and compostable.', 'Eco', true),
(10, 'Sugarcane Bagasse Bowl 350 ml', 'plant-based', 199, 'Pack of 25', 150, NULL, 'Compostable bowl for dal, curry, rice and desserts.', 'Eco', true),
(11, 'Palm Leaf Bowl Round 5"', 'bowls', 139, 'Pack of 25', 180, NULL, 'Natural leaf bowl, ideal for sabzi, raita and sweets.', null, true),
(12, 'Paper Bowl 250 ml', 'bowls', 79, 'Pack of 50', 350, NULL, 'Coated paper bowl for soups, ice cream and snacks.', null, true),
(13, 'Paper Bowl 500 ml with Lid', 'bowls', 149, 'Pack of 25', 200, NULL, 'Leak-resistant bowl with lid for takeaway and delivery.', 'Takeaway', true),
(14, 'Paper Cup 150 ml (Tea)', 'cups', 59, 'Pack of 50', 500, NULL, 'Hot-drink paper cup for tea and coffee stalls.', 'Bestseller', true),
(15, 'Paper Cup 250 ml', 'cups', 89, 'Pack of 50', 400, NULL, 'Double-wall feel, comfortable to hold with hot drinks.', null, true),
(16, 'Paper Glass 200 ml (Cold)', 'cups', 69, 'Pack of 50', 400, NULL, 'Cold drinks, lassi and juice. Food-grade coating.', null, true),
(17, 'Wooden Spoon Set', 'cutlery', 129, 'Pack of 50', 250, NULL, 'Smooth birchwood spoons. A plastic-free alternative.', 'Eco', true),
(18, 'Wooden Fork & Knife Set', 'cutlery', 169, 'Pack of 25 sets', 200, NULL, 'Natural wooden cutlery for events and takeaway.', null, true),
(19, 'Paper Napkin / Tissue', 'packaging', 99, 'Pack of 100', 500, NULL, 'Soft white napkins for tables and takeaway.', null, true),
(20, 'Kraft Food Box with Window', 'packaging', 249, 'Pack of 25', 120, NULL, 'Grease-resistant kraft box, good for snacks, cakes and meals.', 'Takeaway', true)
ON CONFLICT (id) DO NOTHING;

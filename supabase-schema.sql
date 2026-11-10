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
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT orders (customers placing orders)
CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admin) can SELECT/UPDATE orders
CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Anyone can read products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users (admin) can update products
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 4. SEED INITIAL PRODUCTS
INSERT INTO products (id, name, category, price, unit, stock, image, description, badge, active) VALUES
(1, 'Fresh Tomatoes', 'vegetables', 40, '1 kg', 50, 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=300&q=80', 'Farm-fresh red tomatoes, perfect for cooking and salads.', 'Fresh', true),
(2, 'Carrots', 'vegetables', 35, '500g', 40, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&q=80', 'Crunchy and sweet carrots, rich in beta-carotene.', 'Organic', true),
(3, 'Potatoes', 'vegetables', 30, '1 kg', 100, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&q=80', 'Premium quality potatoes for all your cooking needs.', null, true),
(4, 'Onions', 'vegetables', 25, '1 kg', 80, 'https://images.unsplash.com/photo-1618512496248-a4c6955b2e0a?w=300&q=80', 'Fresh red onions, essential for every kitchen.', null, true),
(5, 'Spinach', 'leafy', 20, '250g', 30, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80', 'Tender baby spinach leaves, packed with iron and vitamins.', 'Organic', true),
(6, 'Coriander Leaves', 'leafy', 15, '100g', 25, 'https://images.unsplash.com/photo-1592909791130-84a89c765de8?w=300&q=80', 'Fresh aromatic coriander, perfect for garnishing.', 'Fresh', true),
(7, 'Fenugreek Leaves', 'leafy', 18, '200g', 20, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80', 'Nutritious methi leaves with a slightly bitter taste.', null, true),
(8, 'Capsicum', 'vegetables', 50, '500g', 35, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&q=80', 'Colorful bell peppers, great for stir fries and salads.', null, true),
(9, 'Ginger', 'vegetables', 80, '250g', 45, 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300&q=80', 'Fresh organic ginger root with strong aroma.', 'Organic', true),
(10, 'Garlic', 'vegetables', 60, '250g', 60, 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=300&q=80', 'Fresh white garlic bulbs, essential kitchen staple.', null, true),
(11, 'Cherry Tomatoes', 'fruits', 80, '300g', 20, 'https://images.unsplash.com/photo-1529474944862-1b17bbdda49b?w=300&q=80', 'Sweet and tangy cherry tomatoes, great for salads.', 'Premium', true),
(12, 'Green Chillies', 'vegetables', 20, '100g', 50, 'https://images.unsplash.com/photo-1627735485469-dc461bd97f70?w=300&q=80', 'Fresh hot green chillies for that perfect spice kick.', 'Hot 🌶️', true),
(13, 'Cumin Seeds', 'whole-spices', 90, '100g', 30, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80', 'Premium quality jeera with rich earthy aroma.', null, true),
(14, 'Coriander Seeds', 'whole-spices', 70, '100g', 35, 'https://images.unsplash.com/photo-1614797734476-e8b5e31b8e72?w=300&q=80', 'Whole dhania seeds for fresh grinding and tempering.', null, true),
(15, 'Black Pepper', 'whole-spices', 150, '100g', 25, 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=300&q=80', 'Bold and pungent whole black peppercorns.', 'Premium', true),
(16, 'Cardamom', 'whole-spices', 200, '50g', 15, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80', 'Aromatic green cardamom pods for sweets and biryani.', 'Premium', true),
(17, 'Turmeric Powder', 'ground-spices', 85, '100g', 40, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&q=80', 'Pure haldi powder with deep golden color and health benefits.', 'Organic', true),
(18, 'Red Chilli Powder', 'ground-spices', 95, '100g', 35, 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=300&q=80', 'Bright red hot chilli powder for rich color and heat.', 'Hot 🌶️', true),
(19, 'Garam Masala', 'ground-spices', 120, '100g', 30, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80', 'Aromatic blend of whole spices, ground fresh in-house.', 'Bestseller', true),
(20, 'Curry Leaves', 'herbs', 10, '50g', 40, 'https://images.unsplash.com/photo-1606914469633-bd45058e9e45?w=300&q=80', 'Fresh curry leaves to add authentic South Indian flavor.', 'Fresh', true),
(21, 'Mint Leaves', 'herbs', 15, '100g', 30, 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=300&q=80', 'Fresh pudina leaves for chutneys, raita, and drinks.', 'Fresh', true),
(22, 'Broccoli', 'vegetables', 60, '500g', 20, 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&q=80', 'Fresh green broccoli florets, rich in nutrients.', 'Organic', true),
(23, 'Cauliflower', 'vegetables', 40, '1 pc', 25, 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=300&q=80', 'White cauliflower head, perfect for curries and stir fries.', null, true),
(24, 'Cloves', 'whole-spices', 180, '50g', 20, 'https://images.unsplash.com/photo-1614797736913-82a9fc3e8c2b?w=300&q=80', 'Strong aromatic cloves for biryani and masalas.', 'Premium', true)
ON CONFLICT (id) DO NOTHING;

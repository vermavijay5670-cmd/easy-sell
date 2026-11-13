-- =============================================================
-- MetalPunch Pro — Seed Data (punched plates)
-- Run AFTER supabase-schema.sql
-- =============================================================

-- Clear and re-seed products (safe for development)
-- TRUNCATE products RESTART IDENTITY CASCADE;  -- uncomment only in dev

INSERT INTO products
  (id, name, category, price, unit, stock, image, description, badge, active,
   material, hole_shape, hole_size_mm, pitch_mm, thickness_mm, sheet_width_mm, sheet_length_mm)
VALUES
(1,  'SS Round Hole Punched Plate 1000×500 mm — 3mm hole, 5mm pitch', 'round-plates', 1850, 'Per Sheet (1mm thick)',   120, NULL, 'Stainless steel 304 perforated sheet with 3mm round holes on 5mm pitch. Ideal for filtration, sieves and architectural grilles.', 'Bestseller',   true, 'SS304',    'Round',       3,    5,    1,    500,  1000),
(2,  'SS Round Hole Punched Plate 1000×500 mm — 5mm hole, 8mm pitch', 'round-plates', 1620, 'Per Sheet (1mm thick)',   90,  NULL, '5mm round holes on 8mm staggered pitch. Good for ventilation panels, speaker grilles and industrial screens.',               NULL,           true, 'SS304',    'Round',       5,    8,    1,    500,  1000),
(3,  'MS Round Hole Punched Plate 1200×600 mm — 6mm hole',            'round-plates', 980,  'Per Sheet (1.2mm thick)', 200, NULL, 'Mild steel perforated sheet with 6mm round holes. Galvanised finish available on request.',                                   NULL,           true, 'MS',       'Round',       6,    10,   1.2,  600,  1200),
(4,  'SS Round Hole Punched Plate 2000×1000 mm — 10mm hole',          'round-plates', 4200, 'Per Sheet (1.5mm thick)', 60,  NULL, 'Large-format 304 SS sheet with 10mm holes — popular for safety guards, partition screens and machine guards.',               'Heavy',        true, 'SS304',    'Round',       10,   15,   1.5,  1000, 2000),
(5,  'SS Square Hole Punched Plate 1000×500 mm — 5×5mm holes',        'square-plates',2100, 'Per Sheet (1mm thick)',   80,  NULL, 'Precision-punched square holes in 304 SS. Used in sorting screens, radiator covers and decorative facades.',                 'Premium',      true, 'SS304',    'Square',      5,    8,    1,    500,  1000),
(6,  'MS Square Hole Punched Plate 1200×600 mm — 8×8mm holes',        'square-plates',1150, 'Per Sheet (1.2mm thick)', 150, NULL, 'Mild steel square-hole sheet with clean cut edges. Powder-coated finish available.',                                         NULL,           true, 'MS',       'Square',      8,    12,   1.2,  600,  1200),
(7,  'Aluminium Square Hole Punched Plate 1000×500 mm — 4×4mm holes', 'square-plates',2650, 'Per Sheet (1mm thick)',   50,  NULL, 'Lightweight aluminium sheet, anodised natural finish. Great for HVAC, false ceilings and furniture.',                        'Lightweight',  true, 'Aluminium','Square',      4,    7,    1,    500,  1000),
(8,  'SS Rectangular Hole Punched Plate 1000×500 mm — 10×5mm slots',  'rectangular-plates',2300,'Per Sheet (1mm thick)',70, NULL, 'Oblong slot holes for high airflow applications — heaters, oven liners and exhaust panels.',                                 NULL,           true, 'SS304',    'Slot',        10,   15,   1,    500,  1000),
(9,  'MS Rectangular Hole Punched Plate 1200×600 mm — 15×6mm slots',  'rectangular-plates',1380,'Per Sheet (1.5mm thick)',100,NULL,'Larger slot holes for agriculture sieves, conveyor guards and grain separators.',                                            NULL,           true, 'MS',       'Slot',        15,   20,   1.5,  600,  1200),
(10, 'SS Micro-Hole Punched Plate 500×500 mm — 1mm holes',            'fine-mesh',    3200, 'Per Sheet (0.8mm thick)', 40,  NULL, 'Ultra-fine 1mm round perforations for laboratory filtration, sugar refining and pharmaceutical sieving.',                    'Precision',    true, 'SS304',    'Round',       1,    2,    0.8,  500,  500),
(11, 'SS Fine Mesh Plate 1000×500 mm — 1.5mm holes, 2.5mm pitch',     'fine-mesh',    2800, 'Per Sheet (0.8mm thick)', 55,  NULL, 'Fine-pattern perforated sheet for sound dampening panels, acoustic ceilings and air-purifier filters.',                      NULL,           true, 'SS304',    'Round',       1.5,  2.5,  0.8,  500,  1000),
(12, 'MS Heavy Duty Punched Plate 1200×600 mm — 12mm holes (3mm thick)','heavy-duty', 3500, 'Per Sheet',               45,  NULL, 'Extra-thick mild steel plate for industrial machine guards, mining screens and heavy-load platforms.',                        'Heavy Duty',   true, 'MS',       'Round',       12,   18,   3,    600,  1200),
(13, 'SS Heavy Duty Punched Plate 1000×500 mm — 8mm holes (2mm thick)','heavy-duty',  4800, 'Per Sheet',               30,  NULL, 'Marine-grade 316 SS, 2mm thick with 8mm punched holes. Corrosion-resistant for offshore and food processing.',              'Marine Grade', true, 'SS316',    'Round',       8,    12,   2,    500,  1000),
(14, 'SS 304 Polished Punched Plate 500×500 mm — 3mm holes',          'stainless-steel',1950,'Per Sheet (1mm thick)', 110, NULL, 'Mirror-polished 304 stainless steel punched plate for decorative and architectural use.',                                     'Polished',     true, 'SS304',    'Round',       3,    5,    1,    500,  500),
(15, 'SS 316 Anti-corrosion Punched Plate 1000×500 mm — 5mm holes',   'stainless-steel',3100,'Per Sheet (1.2mm thick)',65, NULL, '316 grade for coastal, chemical and food-contact environments. Passes FDA food-safe standards.',                              'Food Safe',    true, 'SS316',    'Round',       5,    8,    1.2,  500,  1000),
(16, 'MS Punched Plate 1000×500 mm — 6mm holes (Hot Dip Galvanised)',  'mild-steel',   1200, 'Per Sheet (1.5mm thick)', 180, NULL, 'Hot-dip galvanised mild steel perforated plate. Rust-free for 15+ years outdoors.',                                         'Galvanised',   true, 'GI',       'Round',       6,    10,   1.5,  500,  1000),
(17, 'MS Punched Plate 1200×600 mm — 8mm holes (Powder Coated Black)', 'mild-steel',   1450, 'Per Sheet (1.5mm thick)', 130, NULL, 'Powder-coated matte black finish for interior architecture, furniture and partition walls.',                                 'Black Coated', true, 'MS',       'Round',       8,    12,   1.5,  600,  1200),
(18, 'Aluminium Punched Plate 1000×500 mm — 3mm holes',               'aluminium',    2200, 'Per Sheet (1mm thick)',   85,  NULL, 'Lightweight 5052 aluminium sheet with 3mm punched holes. Used in aircraft interiors and automotive panels.',                 NULL,           true, 'Aluminium','Round',       3,    5,    1,    500,  1000),
(19, 'Aluminium Punched Plate 1000×500 mm — 6mm holes (Anodised)',     'aluminium',    2700, 'Per Sheet (1.5mm thick)', 60,  NULL, 'Anodised aluminium for UV and corrosion resistance. Ideal for façade cladding and decorative screens.',                     'Anodised',     true, 'Aluminium','Round',       6,    10,   1.5,  500,  1000),
(20, 'Aluminium Micro Punched Plate 500×500 mm — 1.5mm holes',         'aluminium',    3400, 'Per Sheet (1mm thick)',   35,  NULL, 'Fine 1.5mm round perforations in aluminium for speaker grilles, air diffusers and instrument panels.',                      'Precision',    true, 'Aluminium','Round',       1.5,  2.5,  1,    500,  500)
ON CONFLICT (id) DO UPDATE SET
  name            = EXCLUDED.name,
  category        = EXCLUDED.category,
  price           = EXCLUDED.price,
  unit            = EXCLUDED.unit,
  stock           = EXCLUDED.stock,
  description     = EXCLUDED.description,
  badge           = EXCLUDED.badge,
  active          = EXCLUDED.active,
  material        = EXCLUDED.material,
  hole_shape      = EXCLUDED.hole_shape,
  hole_size_mm    = EXCLUDED.hole_size_mm,
  pitch_mm        = EXCLUDED.pitch_mm,
  thickness_mm    = EXCLUDED.thickness_mm,
  sheet_width_mm  = EXCLUDED.sheet_width_mm,
  sheet_length_mm = EXCLUDED.sheet_length_mm;

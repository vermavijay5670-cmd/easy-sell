export const products = [
  // Round Punched Plates
  { id: 1,  name: 'SS Round Hole Punched Plate 1000×500 mm — 3mm hole, 1.5mm pitch', category: 'round-plates', price: 1850, unit: 'Per Sheet (1mm thick)', stock: 120, image: null, description: 'Stainless steel 304 perforated sheet with 3mm round holes on 5mm pitch. Ideal for filtration, sieves and architectural grilles.', badge: 'Bestseller' },
  { id: 2,  name: 'SS Round Hole Punched Plate 1000×500 mm — 5mm hole, 8mm pitch', category: 'round-plates', price: 1620, unit: 'Per Sheet (1mm thick)', stock: 90,  image: null, description: '5mm round holes on 8mm staggered pitch. Good for ventilation panels, speaker grilles and industrial screens.', badge: null },
  { id: 3,  name: 'MS Round Hole Punched Plate 1200×600 mm — 6mm hole', category: 'round-plates', price: 980,  unit: 'Per Sheet (1.2mm thick)', stock: 200, image: null, description: 'Mild steel perforated sheet with 6mm round holes. Galvanised finish available on request.', badge: null },
  { id: 4,  name: 'SS Round Hole Punched Plate 2000×1000 mm — 10mm hole', category: 'round-plates', price: 4200, unit: 'Per Sheet (1.5mm thick)', stock: 60,  image: null, description: 'Large-format 304 SS sheet with 10mm holes — popular for safety guards, partition screens and machine guards.', badge: 'Heavy' },

  // Square Punched Plates
  { id: 5,  name: 'SS Square Hole Punched Plate 1000×500 mm — 5×5mm holes', category: 'square-plates', price: 2100, unit: 'Per Sheet (1mm thick)', stock: 80,  image: null, description: 'Precision-punched square holes in 304 SS. Used in sorting screens, radiator covers and decorative facades.', badge: 'Premium' },
  { id: 6,  name: 'MS Square Hole Punched Plate 1200×600 mm — 8×8mm holes', category: 'square-plates', price: 1150, unit: 'Per Sheet (1.2mm thick)', stock: 150, image: null, description: 'Mild steel square-hole sheet with clean cut edges. Powder-coated finish available.', badge: null },
  { id: 7,  name: 'Aluminium Square Hole Punched Plate 1000×500 mm — 4×4mm holes', category: 'square-plates', price: 2650, unit: 'Per Sheet (1mm thick)', stock: 50,  image: null, description: 'Lightweight aluminium sheet, anodised natural finish. Great for HVAC, false ceilings and furniture.', badge: 'Lightweight' },

  // Rectangular Plates
  { id: 8,  name: 'SS Rectangular Hole Punched Plate 1000×500 mm — 10×5mm slots', category: 'rectangular-plates', price: 2300, unit: 'Per Sheet (1mm thick)', stock: 70,  image: null, description: 'Oblong slot holes for high airflow applications — heaters, oven liners and exhaust panels.', badge: null },
  { id: 9,  name: 'MS Rectangular Hole Punched Plate 1200×600 mm — 15×6mm slots', category: 'rectangular-plates', price: 1380, unit: 'Per Sheet (1.5mm thick)', stock: 100, image: null, description: 'Larger slot holes for agriculture sieves, conveyor guards and grain separators.', badge: null },

  // Fine Mesh / Micro Holes
  { id: 10, name: 'SS Micro-Hole Punched Plate 500×500 mm — 1mm holes', category: 'fine-mesh', price: 3200, unit: 'Per Sheet (0.8mm thick)', stock: 40,  image: null, description: 'Ultra-fine 1mm round perforations for laboratory filtration, sugar refining and pharmaceutical sieving.', badge: 'Precision' },
  { id: 11, name: 'SS Fine Mesh Plate 1000×500 mm — 1.5mm holes, 2.5mm pitch', category: 'fine-mesh', price: 2800, unit: 'Per Sheet (0.8mm thick)', stock: 55,  image: null, description: 'Fine-pattern perforated sheet for sound dampening panels, acoustic ceilings and air-purifier filters.', badge: null },

  // Heavy Duty / Thick Gauge
  { id: 12, name: 'MS Heavy Duty Punched Plate 1200×600 mm — 12mm holes (3mm thick)', category: 'heavy-duty', price: 3500, unit: 'Per Sheet', stock: 45,  image: null, description: 'Extra-thick mild steel plate for industrial machine guards, mining screens and heavy-load platforms.', badge: 'Heavy Duty' },
  { id: 13, name: 'SS Heavy Duty Punched Plate 1000×500 mm — 8mm holes (2mm thick)', category: 'heavy-duty', price: 4800, unit: 'Per Sheet', stock: 30,  image: null, description: 'Marine-grade 316 SS, 2mm thick with 8mm punched holes. Corrosion-resistant for offshore and food processing.', badge: 'Marine Grade' },

  // Stainless Steel
  { id: 14, name: 'SS 304 Polished Punched Plate 500×500 mm — 3mm holes', category: 'stainless-steel', price: 1950, unit: 'Per Sheet (1mm thick)', stock: 110, image: null, description: 'Mirror-polished 304 stainless steel punched plate for decorative and architectural use.', badge: 'Polished' },
  { id: 15, name: 'SS 316 Anti-corrosion Punched Plate 1000×500 mm — 5mm holes', category: 'stainless-steel', price: 3100, unit: 'Per Sheet (1.2mm thick)', stock: 65,  image: null, description: '316 grade for coastal, chemical and food-contact environments. Passes FDA food-safe standards.', badge: 'Food Safe' },

  // Mild Steel
  { id: 16, name: 'MS Punched Plate 1000×500 mm — 6mm holes (Hot Dip Galvanised)', category: 'mild-steel', price: 1200, unit: 'Per Sheet (1.5mm thick)', stock: 180, image: null, description: 'Hot-dip galvanised mild steel perforated plate. Rust-free for 15+ years outdoors.', badge: 'Galvanised' },
  { id: 17, name: 'MS Punched Plate 1200×600 mm — 8mm holes (Powder Coated Black)', category: 'mild-steel', price: 1450, unit: 'Per Sheet (1.5mm thick)', stock: 130, image: null, description: 'Powder-coated matte black finish for interior architecture, furniture and partition walls.', badge: 'Black Coated' },

  // Aluminium
  { id: 18, name: 'Aluminium Punched Plate 1000×500 mm — 3mm holes', category: 'aluminium', price: 2200, unit: 'Per Sheet (1mm thick)', stock: 85,  image: null, description: 'Lightweight 5052 aluminium sheet with 3mm punched holes. Used in aircraft interiors and automotive panels.', badge: null },
  { id: 19, name: 'Aluminium Punched Plate 1000×500 mm — 6mm holes (Anodised)', category: 'aluminium', price: 2700, unit: 'Per Sheet (1.5mm thick)', stock: 60,  image: null, description: 'Anodised aluminium for UV and corrosion resistance. Ideal for façade cladding and decorative screens.', badge: 'Anodised' },
  { id: 20, name: 'Aluminium Micro Punched Plate 500×500 mm — 1.5mm holes', category: 'aluminium', price: 3400, unit: 'Per Sheet (1mm thick)', stock: 35,  image: null, description: 'Fine 1.5mm round perforations in aluminium for speaker grilles, air diffusers and instrument panels.', badge: 'Precision' },
]

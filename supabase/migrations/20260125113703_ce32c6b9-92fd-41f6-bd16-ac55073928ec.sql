-- Seed missing OT services for Shifa Medical Center
-- First ensure OT category exists
INSERT INTO service_categories (id, code, name, icon, color, organization_id, sort_order, is_active)
VALUES (
  gen_random_uuid(),
  'ot',
  'OT / Surgery',
  'Scissors',
  '#8b5cf6',
  'b1111111-1111-1111-1111-111111111111',
  7,
  true
)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Seed OT services
INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Nursing Charges - Surgery',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  5000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Nursing Charges - Surgery' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Recovery/PACU Charges',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  5000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Recovery/PACU Charges' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Anesthesia - Local',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  5000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Anesthesia - Local' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Anesthesia - Spinal/Epidural',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  15000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Anesthesia - Spinal/Epidural' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Anesthesia - General',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  25000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Anesthesia - General' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Anesthesia - Sedation',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  10000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Anesthesia - Sedation' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Assistant Surgeon Fee',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  15000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Assistant Surgeon Fee' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'OT Room Charges - Standard',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  10000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'OT Room Charges - Standard' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'OT Room Charges - Major',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  20000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'OT Room Charges - Major' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Surgical Consumables - Basic',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  5000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Surgical Consumables - Basic' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Surgical Consumables - Laparoscopic',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  15000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Surgical Consumables - Laparoscopic' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);

INSERT INTO service_types (name, category_id, default_price, organization_id, is_active)
SELECT 
  'Hernia Mesh Implant',
  (SELECT id FROM service_categories WHERE code = 'ot' AND organization_id = 'b1111111-1111-1111-1111-111111111111'),
  25000,
  'b1111111-1111-1111-1111-111111111111',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM service_types 
  WHERE name = 'Hernia Mesh Implant' 
  AND organization_id = 'b1111111-1111-1111-1111-111111111111'
);
-- Add OT Services category for all organizations (if not exists)
-- Using 'procedure' as the enum category since OT services are procedures
INSERT INTO service_categories (organization_id, code, name, icon, color, sort_order, is_system)
SELECT 
  id,
  'ot',
  'OT Services',
  'scissors',
  'indigo',
  7,
  true
FROM organizations
ON CONFLICT (organization_id, code) DO NOTHING;

-- Add surgery_id column to ipd_charges to link charges to specific surgeries
ALTER TABLE ipd_charges 
ADD COLUMN IF NOT EXISTS surgery_id UUID REFERENCES surgeries(id) ON DELETE SET NULL;

-- Create index for efficient surgery charge lookups
CREATE INDEX IF NOT EXISTS idx_ipd_charges_surgery_id ON ipd_charges(surgery_id);

-- Seed standard OT services for existing organizations
-- Using 'procedure' enum value since OT services are procedures
INSERT INTO service_types (organization_id, category, category_id, name, default_price, is_active)
SELECT 
  o.id,
  'procedure',
  sc.id,
  s.name,
  s.price,
  true
FROM organizations o
CROSS JOIN (VALUES
  ('OT Room Charges (per hour)', 5000),
  ('Surgeon Fee - Major', 50000),
  ('Surgeon Fee - Minor', 25000),
  ('Anesthesia - General', 20000),
  ('Anesthesia - Spinal/Epidural', 15000),
  ('Anesthesia - Local', 5000),
  ('Recovery/PACU Charges', 5000),
  ('Basic Consumables Kit', 8000),
  ('Advanced Consumables Kit', 15000),
  ('Assistant Surgeon Fee', 15000)
) AS s(name, price)
JOIN service_categories sc ON sc.organization_id = o.id AND sc.code = 'ot'
WHERE NOT EXISTS (
  SELECT 1 FROM service_types st 
  WHERE st.organization_id = o.id 
  AND st.name = s.name
  AND st.category_id = sc.id
);
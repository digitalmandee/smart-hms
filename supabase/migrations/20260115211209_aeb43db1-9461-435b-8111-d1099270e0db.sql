-- Enable IPD care menu items with correct paths
UPDATE menu_items 
SET is_active = true, path = '/app/ipd/vitals' 
WHERE code = 'ipd.care.vitals';

UPDATE menu_items 
SET is_active = true, path = '/app/ipd/nursing-notes' 
WHERE code = 'ipd.care.nursing';

UPDATE menu_items 
SET is_active = true, path = '/app/ipd/care-plans' 
WHERE code = 'ipd.care.plans';

UPDATE menu_items 
SET is_active = true, path = '/app/ipd/diet' 
WHERE code = 'ipd.care.diet';

UPDATE menu_items 
SET is_active = true, path = '/app/ipd/history' 
WHERE code = 'ipd.care.history';

-- Add sample inventory for medicines that don't have inventory
INSERT INTO medicine_inventory (
  branch_id, medicine_id, batch_number, 
  quantity, unit_price, selling_price, expiry_date, reorder_level
)
SELECT 
  b.id,
  m.id,
  'BATCH-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LEFT(m.id::text, 4),
  100,
  50.00,
  75.00,
  CURRENT_DATE + INTERVAL '1 year',
  20
FROM medicines m
CROSS JOIN branches b
WHERE b.organization_id = m.organization_id
AND NOT EXISTS (
  SELECT 1 FROM medicine_inventory mi 
  WHERE mi.medicine_id = m.id AND mi.branch_id = b.id
)
AND m.is_active = true
LIMIT 20;
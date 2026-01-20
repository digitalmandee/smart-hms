-- Add OPD Walk-in Registration menu item
INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_permission, required_module)
SELECT 
  'opd.walk-in',
  'Walk-in Registration',
  '/app/opd/walk-in',
  'Footprints',
  (SELECT id FROM menu_items WHERE code = 'opd' AND parent_id IS NULL LIMIT 1),
  2,
  true,
  'appointments.check-in',
  'opd'
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE path = '/app/opd/walk-in'
);

-- Also add to reception section
INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_permission, required_module)
SELECT 
  'reception.walk-in',
  'Walk-in Registration',
  '/app/opd/walk-in',
  'Footprints',
  (SELECT id FROM menu_items WHERE code = 'reception' AND parent_id IS NULL LIMIT 1),
  3,
  true,
  'appointments.check-in',
  'opd'
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE code = 'reception.walk-in'
);
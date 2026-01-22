-- Add OPD Orders menu item under OPD
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 
  'opd.orders',
  'OPD Orders',
  'ClipboardList',
  '/app/opd/orders',
  (SELECT id FROM menu_items WHERE code = 'opd' AND parent_id IS NULL LIMIT 1),
  7,
  'opd.doctor',
  'opd',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE code = 'opd.orders'
);

-- Add OPD Checkout menu item under OPD
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 
  'opd.checkout',
  'OPD Checkout',
  'Receipt',
  '/app/opd/checkout',
  (SELECT id FROM menu_items WHERE code = 'opd' AND parent_id IS NULL LIMIT 1),
  8,
  'billing.invoices.create',
  'opd',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items WHERE code = 'opd.checkout'
);
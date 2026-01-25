-- Add Surgeon Fee Templates menu item under Settings
INSERT INTO menu_items (id, name, code, path, icon, parent_id, sort_order, is_active, required_permission, required_module)
VALUES (
  gen_random_uuid(),
  'Surgeon Fee Templates',
  'settings-surgeon-fees',
  '/app/settings/surgeon-fees',
  'Scissors',
  '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc',
  28,
  true,
  'settings.manage',
  'ot'
)
ON CONFLICT (code) DO NOTHING;

-- Also add route to App.tsx (handled separately in code)
-- Add OT Billing menu item under OT module for reception
INSERT INTO menu_items (id, name, code, path, icon, parent_id, sort_order, is_active, required_permission, required_module)
SELECT
  gen_random_uuid(),
  'Fee Templates',
  'ot-fee-templates',
  '/app/settings/surgeon-fees',
  'FileText',
  (SELECT id FROM menu_items WHERE code = 'ot' AND parent_id IS NULL LIMIT 1),
  15,
  true,
  'ot.manage',
  'ot'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'ot-fee-templates');
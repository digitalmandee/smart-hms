-- Insert reception.view permission
INSERT INTO permissions (code, name, description, module)
VALUES ('reception.view', 'View Reception', 'Access to reception dashboard and features', 'reception')
ON CONFLICT (code) DO NOTHING;

-- Insert Reception parent menu
INSERT INTO menu_items (id, code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES (
  gen_random_uuid(),
  'reception',
  'Reception',
  'Desk',
  NULL,
  NULL,
  2,
  'reception.view',
  NULL,
  true
);

-- Insert Reception Dashboard child menu
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT
  'reception.dashboard',
  'Dashboard',
  'LayoutDashboard',
  '/app/reception',
  id,
  1,
  'reception.view',
  NULL,
  true
FROM menu_items WHERE code = 'reception';

-- Update sort_order for existing menus to make room (shift menus after position 2)
UPDATE menu_items SET sort_order = sort_order + 1 
WHERE parent_id IS NULL AND sort_order >= 2 AND code != 'reception';
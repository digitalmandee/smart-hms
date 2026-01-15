-- Add Inventory & Procurement menu items
INSERT INTO menu_items (name, code, icon, sort_order, is_active)
VALUES ('Inventory', 'inventory', 'Package', 70, true)
ON CONFLICT (code) DO NOTHING;

-- Insert Inventory children
WITH parent AS (
  SELECT id FROM menu_items WHERE code = 'inventory' AND parent_id IS NULL LIMIT 1
)
INSERT INTO menu_items (name, code, path, icon, parent_id, sort_order, is_active)
VALUES
  ('Dashboard', 'inventory_dashboard', '/app/inventory', 'LayoutDashboard', (SELECT id FROM parent), 1, true),
  ('Item Catalog', 'inventory_items', '/app/inventory/items', 'Box', (SELECT id FROM parent), 2, true),
  ('Categories', 'inventory_categories', '/app/inventory/categories', 'FolderTree', (SELECT id FROM parent), 3, true),
  ('Stock Levels', 'inventory_stock', '/app/inventory/stock', 'TrendingUp', (SELECT id FROM parent), 4, true),
  ('Vendors', 'inventory_vendors', '/app/inventory/vendors', 'Building2', (SELECT id FROM parent), 5, true),
  ('Purchase Orders', 'inventory_pos', '/app/inventory/purchase-orders', 'FileText', (SELECT id FROM parent), 6, true),
  ('Goods Receipt', 'inventory_grn', '/app/inventory/grn', 'PackageCheck', (SELECT id FROM parent), 7, true),
  ('Requisitions', 'inventory_requisitions', '/app/inventory/requisitions', 'ClipboardList', (SELECT id FROM parent), 8, true),
  ('Reports', 'inventory_reports', '/app/inventory/reports', 'BarChart3', (SELECT id FROM parent), 9, true)
ON CONFLICT (code) DO NOTHING;

-- Add Laboratory menu items
INSERT INTO menu_items (name, code, icon, sort_order, is_active)
VALUES ('Laboratory', 'laboratory', 'FlaskConical', 15, true)
ON CONFLICT (code) DO NOTHING;

-- Insert Laboratory children
WITH parent AS (
  SELECT id FROM menu_items WHERE code = 'laboratory' AND parent_id IS NULL LIMIT 1
)
INSERT INTO menu_items (name, code, path, icon, parent_id, sort_order, is_active)
VALUES
  ('Lab Queue', 'lab_queue', '/app/lab/queue', 'ListChecks', (SELECT id FROM parent), 1, true),
  ('Result Entry', 'lab_results', '/app/lab/orders', 'FileEdit', (SELECT id FROM parent), 2, true)
ON CONFLICT (code) DO NOTHING;
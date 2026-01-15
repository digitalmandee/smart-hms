-- =============================================
-- SEED PHARMACY MENU ITEMS (Fixed column names)
-- =============================================

-- First, delete existing pharmacy children to replace with complete menu
DELETE FROM public.menu_items 
WHERE parent_id IN (SELECT id FROM public.menu_items WHERE path = '/app/pharmacy' AND parent_id IS NULL);

-- Get Pharmacy parent ID and update its sort order
UPDATE public.menu_items 
SET sort_order = 60, icon = 'Pill'
WHERE path = '/app/pharmacy' AND parent_id IS NULL;

-- Insert complete Pharmacy menu children
INSERT INTO public.menu_items (name, code, path, icon, parent_id, sort_order, is_active, required_permission, required_module)
SELECT 
  child.name,
  child.code,
  child.path,
  child.icon,
  parent.id,
  child.sort_order,
  true,
  child.required_permission,
  'pharmacy'
FROM public.menu_items parent
CROSS JOIN (VALUES
  ('Dashboard', 'pharmacy_dashboard', '/app/pharmacy', 'LayoutDashboard', 1, 'pharmacy:read'),
  ('POS Terminal', 'pharmacy_pos', '/app/pharmacy/pos', 'Store', 2, 'pharmacy:write'),
  ('Prescription Queue', 'pharmacy_queue', '/app/pharmacy/queue', 'ClipboardList', 3, 'pharmacy:read'),
  ('Transactions', 'pharmacy_transactions', '/app/pharmacy/pos/transactions', 'Receipt', 4, 'pharmacy:read'),
  ('Cash Sessions', 'pharmacy_sessions', '/app/pharmacy/pos/sessions', 'Clock', 5, 'pharmacy:read'),
  ('Medicine Catalog', 'pharmacy_medicines', '/app/pharmacy/medicines', 'Pill', 6, 'pharmacy:read'),
  ('Categories', 'pharmacy_categories', '/app/pharmacy/categories', 'Tags', 7, 'pharmacy:read'),
  ('Inventory', 'pharmacy_inventory', '/app/pharmacy/inventory', 'Package', 8, 'pharmacy:read'),
  ('Add Stock', 'pharmacy_add_stock', '/app/pharmacy/stock/new', 'PackagePlus', 9, 'pharmacy:write'),
  ('Stock Alerts', 'pharmacy_alerts', '/app/pharmacy/alerts', 'AlertTriangle', 10, 'pharmacy:read'),
  ('Reports', 'pharmacy_reports', '/app/pharmacy/reports', 'BarChart3', 11, 'pharmacy:read')
) AS child(name, code, path, icon, sort_order, required_permission)
WHERE parent.path = '/app/pharmacy' AND parent.parent_id IS NULL;
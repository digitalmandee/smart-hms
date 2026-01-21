-- Add PACS menu items for radiology module

-- Add PACS Studies menu item
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 
  'radiology_pacs', 
  'PACS Studies', 
  'Radio', 
  '/app/radiology/pacs', 
  mi.id, 
  6, 
  'radiology', 
  'radiology.view', 
  true
FROM menu_items mi
WHERE mi.code = 'radiology'
ON CONFLICT (code) DO NOTHING;

-- Add PACS Settings menu item
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 
  'radiology_pacs_settings', 
  'PACS Settings', 
  'Server', 
  '/app/radiology/pacs/settings', 
  mi.id, 
  11, 
  'radiology', 
  'radiology.setup', 
  true
FROM menu_items mi
WHERE mi.code = 'radiology'
ON CONFLICT (code) DO NOTHING;
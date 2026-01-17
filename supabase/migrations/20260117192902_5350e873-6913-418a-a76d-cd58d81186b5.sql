-- Add Pharmacy Settings menu item
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
VALUES 
  ('pharmacy_settings', 'Settings', 'Settings', '/app/pharmacy/settings', '1d820a04-efd6-424b-8100-0fd9e8197ebf', 99, 'pharmacy.view', true),
  ('pharmacy_stock_movements', 'Stock Movements', 'ArrowLeftRight', '/app/pharmacy/stock-movements', '1d820a04-efd6-424b-8100-0fd9e8197ebf', 85, 'pharmacy.view', true)
ON CONFLICT (code) DO UPDATE SET 
  path = EXCLUDED.path,
  is_active = true;
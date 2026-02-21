
-- =============================================
-- Reorganize Inventory/Warehouse Menu Structure
-- =============================================

-- STEP 1: Create 6 sub-group parent items under Inventory
INSERT INTO menu_items (id, code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active) VALUES
  (gen_random_uuid(), 'inventory_procurement', 'Procurement', 'ShoppingCart', NULL, '8f02912c-ea19-4358-be76-16ec5765a561', 10, NULL, 'inventory', true),
  (gen_random_uuid(), 'inventory_stock_mgmt', 'Stock Management', 'Package', NULL, '8f02912c-ea19-4358-be76-16ec5765a561', 20, NULL, 'inventory', true),
  (gen_random_uuid(), 'inventory_warehouse_ops', 'Warehouse Operations', 'Warehouse', NULL, '8f02912c-ea19-4358-be76-16ec5765a561', 30, NULL, 'inventory', true),
  (gen_random_uuid(), 'inventory_picking_packing', 'Picking & Packing', 'PackageCheck', NULL, '8f02912c-ea19-4358-be76-16ec5765a561', 40, NULL, 'inventory', true),
  (gen_random_uuid(), 'inventory_shipping', 'Shipping', 'Truck', NULL, '8f02912c-ea19-4358-be76-16ec5765a561', 50, NULL, 'inventory', true),
  (gen_random_uuid(), 'inventory_barcode_integrations', 'Barcode & Integrations', 'Scan', NULL, '8f02912c-ea19-4358-be76-16ec5765a561', 60, NULL, 'inventory', true);

-- STEP 2: Move existing items under correct sub-group parents and fix sort_order

-- Move Requisitions under Procurement (sort 11)
UPDATE menu_items SET parent_id = (SELECT id FROM menu_items WHERE code = 'inventory_procurement'), sort_order = 11, name = 'Purchase Requisitions' WHERE id = '501263d0-f964-43f7-8de8-3bdac783e42f';

-- Move Purchase Orders under Procurement (sort 12)
UPDATE menu_items SET parent_id = (SELECT id FROM menu_items WHERE code = 'inventory_procurement'), sort_order = 12 WHERE id = '6572a544-bcf3-4e85-b5d9-7e6da0f824d6';

-- Move GRN under Procurement (sort 13)
UPDATE menu_items SET parent_id = (SELECT id FROM menu_items WHERE code = 'inventory_procurement'), sort_order = 13 WHERE id = '8facffc8-3d25-4248-8bad-ffdcdae66af3';

-- Move Vendors under Procurement (sort 14)
UPDATE menu_items SET parent_id = (SELECT id FROM menu_items WHERE code = 'inventory_procurement'), sort_order = 14 WHERE id = '8cc62abb-11f7-43c8-9335-76b36a479135';

-- Move Stock Levels under Stock Management (sort 21)
UPDATE menu_items SET parent_id = (SELECT id FROM menu_items WHERE code = 'inventory_stock_mgmt'), sort_order = 21 WHERE id = 'de038b94-6e50-4fe6-adfb-983d01d85f97';

-- Move Warehouses/Stores under Stock Management (sort 25)
UPDATE menu_items SET parent_id = (SELECT id FROM menu_items WHERE code = 'inventory_stock_mgmt'), sort_order = 25 WHERE id = 'eb3db5b1-b2dd-478e-9362-6fd76ed118af';

-- Move Store Transfers under Stock Management (sort 24)
UPDATE menu_items SET parent_id = (SELECT id FROM menu_items WHERE code = 'inventory_stock_mgmt'), sort_order = 24 WHERE id = '33677736-0f30-43a7-94cd-f266590dccb3';

-- Move Reports to sort 70
UPDATE menu_items SET sort_order = 70 WHERE id = '5c04228d-83dd-46b8-a9db-fe4d7f24c3af';

-- STEP 3: Insert new leaf menu items

-- Stock Management leaves
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active) VALUES
  ('inventory_adjustments', 'Stock Adjustments', 'Edit', '/app/inventory/stock-adjustments', (SELECT id FROM menu_items WHERE code = 'inventory_stock_mgmt'), 22, NULL, 'inventory', true),
  ('inventory_reorder_alerts', 'Reorder Alerts', 'Bell', '/app/inventory/reorder-alerts', (SELECT id FROM menu_items WHERE code = 'inventory_stock_mgmt'), 23, NULL, 'inventory', true);

-- Warehouse Operations leaves
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active) VALUES
  ('inventory_storage_map', 'Storage Map', 'Map', '/app/inventory/warehouse/map', (SELECT id FROM menu_items WHERE code = 'inventory_warehouse_ops'), 31, NULL, 'inventory', true),
  ('inventory_zones', 'Zones', 'LayoutGrid', '/app/inventory/warehouse/zones', (SELECT id FROM menu_items WHERE code = 'inventory_warehouse_ops'), 32, NULL, 'inventory', true),
  ('inventory_bins', 'Bins', 'Grid3x3', '/app/inventory/warehouse/bins', (SELECT id FROM menu_items WHERE code = 'inventory_warehouse_ops'), 33, NULL, 'inventory', true),
  ('inventory_bin_assignments', 'Bin Assignments', 'ArrowDownToLine', '/app/inventory/warehouse/assignments', (SELECT id FROM menu_items WHERE code = 'inventory_warehouse_ops'), 34, NULL, 'inventory', true),
  ('inventory_putaway', 'Put-Away Worklist', 'Inbox', '/app/inventory/putaway', (SELECT id FROM menu_items WHERE code = 'inventory_warehouse_ops'), 35, NULL, 'inventory', true);

-- Picking & Packing leaves
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active) VALUES
  ('inventory_picking_dashboard', 'Picking Dashboard', 'Gauge', '/app/inventory/picking/dashboard', (SELECT id FROM menu_items WHERE code = 'inventory_picking_packing'), 41, NULL, 'inventory', true),
  ('inventory_pick_lists', 'Pick Lists', 'ListChecks', '/app/inventory/picking', (SELECT id FROM menu_items WHERE code = 'inventory_picking_packing'), 42, NULL, 'inventory', true),
  ('inventory_packing_slips', 'Packing Slips', 'PackagePlus', '/app/inventory/packing', (SELECT id FROM menu_items WHERE code = 'inventory_picking_packing'), 43, NULL, 'inventory', true);

-- Shipping leaves
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active) VALUES
  ('inventory_dispatch_dashboard', 'Dispatch Dashboard', 'Gauge', '/app/inventory/shipping/dashboard', (SELECT id FROM menu_items WHERE code = 'inventory_shipping'), 51, NULL, 'inventory', true),
  ('inventory_shipments', 'Shipments', 'Truck', '/app/inventory/shipping', (SELECT id FROM menu_items WHERE code = 'inventory_shipping'), 52, NULL, 'inventory', true);

-- Barcode & Integrations leaves
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active) VALUES
  ('inventory_barcode_labels', 'Barcode Labels', 'Tag', '/app/inventory/barcode-labels', (SELECT id FROM menu_items WHERE code = 'inventory_barcode_integrations'), 61, NULL, 'inventory', true),
  ('inventory_barcode_scanner', 'Barcode Scanner', 'Scan', '/app/inventory/integrations/barcode-scanner', (SELECT id FROM menu_items WHERE code = 'inventory_barcode_integrations'), 62, NULL, 'inventory', true),
  ('inventory_api_keys', 'API Keys', 'Webhook', '/app/inventory/integrations/api-keys', (SELECT id FROM menu_items WHERE code = 'inventory_barcode_integrations'), 63, NULL, 'inventory', true);

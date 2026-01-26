-- Seed Inventory Items
INSERT INTO inventory_items (organization_id, item_code, name, description, category_id, unit_of_measure, reorder_level, minimum_stock, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', 'ITM-00001', 'Surgical Gloves (Large)', 'Disposable surgical gloves',
  (SELECT id FROM inventory_categories WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' LIMIT 1), 'Box', 50, 20, true
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE item_code = 'ITM-00001');

INSERT INTO inventory_items (organization_id, item_code, name, description, category_id, unit_of_measure, reorder_level, minimum_stock, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', 'ITM-00002', 'Disposable Syringes 5ml', 'Sterile syringes',
  (SELECT id FROM inventory_categories WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' LIMIT 1), 'Pack', 100, 50, true
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE item_code = 'ITM-00002');

INSERT INTO inventory_items (organization_id, item_code, name, description, category_id, unit_of_measure, reorder_level, minimum_stock, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', 'ITM-00003', 'IV Cannula 20G', 'IV cannula',
  (SELECT id FROM inventory_categories WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' LIMIT 1), 'Pack', 75, 30, true
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE item_code = 'ITM-00003');

INSERT INTO inventory_items (organization_id, item_code, name, description, category_id, unit_of_measure, reorder_level, minimum_stock, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', 'ITM-00004', 'Face Masks (Surgical)', 'Surgical masks',
  (SELECT id FROM inventory_categories WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' LIMIT 1), 'Box', 100, 50, true
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE item_code = 'ITM-00004');

INSERT INTO inventory_items (organization_id, item_code, name, description, category_id, unit_of_measure, reorder_level, minimum_stock, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', 'ITM-00005', 'Cotton Wool 500g', 'Absorbent cotton',
  (SELECT id FROM inventory_categories WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' LIMIT 1), 'Pack', 30, 10, true
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE item_code = 'ITM-00005');

-- Seed Stock (no organization_id in inventory_stock)
DO $$
DECLARE v_branch_id UUID;
BEGIN
  SELECT id INTO v_branch_id FROM branches WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' LIMIT 1;
  
  INSERT INTO inventory_stock (branch_id, item_id, quantity, unit_cost, batch_number, expiry_date, received_date)
  SELECT v_branch_id, id, 200, 850, 'BTH-2026-001', '2027-12-31', CURRENT_DATE - 30
  FROM inventory_items WHERE item_code = 'ITM-00001' AND NOT EXISTS (SELECT 1 FROM inventory_stock s WHERE s.item_id = inventory_items.id);
  
  INSERT INTO inventory_stock (branch_id, item_id, quantity, unit_cost, batch_number, expiry_date, received_date)
  SELECT v_branch_id, id, 500, 120, 'BTH-2026-002', '2027-06-30', CURRENT_DATE - 20
  FROM inventory_items WHERE item_code = 'ITM-00002' AND NOT EXISTS (SELECT 1 FROM inventory_stock s WHERE s.item_id = inventory_items.id);
  
  INSERT INTO inventory_stock (branch_id, item_id, quantity, unit_cost, batch_number, expiry_date, received_date)
  SELECT v_branch_id, id, 300, 180, 'BTH-2026-003', '2027-09-30', CURRENT_DATE - 15
  FROM inventory_items WHERE item_code = 'ITM-00003' AND NOT EXISTS (SELECT 1 FROM inventory_stock s WHERE s.item_id = inventory_items.id);
  
  -- Low stock item
  INSERT INTO inventory_stock (branch_id, item_id, quantity, unit_cost, batch_number, expiry_date, received_date)
  SELECT v_branch_id, id, 45, 450, 'BTH-2026-004', CURRENT_DATE + 60, CURRENT_DATE - 60
  FROM inventory_items WHERE item_code = 'ITM-00004' AND NOT EXISTS (SELECT 1 FROM inventory_stock s WHERE s.item_id = inventory_items.id);
  
  INSERT INTO inventory_stock (branch_id, item_id, quantity, unit_cost, batch_number, expiry_date, received_date)
  SELECT v_branch_id, id, 15, 320, 'BTH-2026-005', '2028-06-30', CURRENT_DATE - 5
  FROM inventory_items WHERE item_code = 'ITM-00005' AND NOT EXISTS (SELECT 1 FROM inventory_stock s WHERE s.item_id = inventory_items.id);
END $$;
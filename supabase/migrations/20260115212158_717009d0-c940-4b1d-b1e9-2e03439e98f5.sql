-- Phase 1: Add OPD Token Display menu item (TV Display for waiting areas)
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 
  'opd_token_display', 
  'Token Display (TV)', 
  'Monitor', 
  '/app/appointments/token-display',
  id,
  15,
  'appointments.view',
  true
FROM menu_items WHERE code = 'appointments'
ON CONFLICT (code) DO UPDATE SET 
  name = 'Token Display (TV)',
  path = '/app/appointments/token-display',
  is_active = true;

-- Phase 2: Add/Update Token Kiosk menu item for self-service
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 
  'opd_token_kiosk', 
  'Token Kiosk', 
  'Ticket', 
  '/app/appointments/kiosk',
  id,
  16,
  'appointments.view',
  true
FROM menu_items WHERE code = 'appointments'
ON CONFLICT (code) DO UPDATE SET 
  name = 'Token Kiosk',
  path = '/app/appointments/kiosk',
  is_active = true;

-- Phase 3: Update existing queue menu to be clearer
UPDATE menu_items 
SET name = 'Patient Queue', icon = 'ListChecks'
WHERE code = 'appointments.queue';

-- Phase 4: Update ER Queue Display menu (already exists, ensure active)
UPDATE menu_items 
SET is_active = true, path = '/app/emergency/display'
WHERE code = 'er_display';

-- Phase 5: Add sample medicine inventory if empty
-- First check if we have inventory data
DO $$
DECLARE
  inv_count INTEGER;
  target_branch UUID;
  target_org UUID;
BEGIN
  -- Get the first valid branch and org
  SELECT b.id, b.organization_id INTO target_branch, target_org
  FROM branches b
  LIMIT 1;
  
  -- Count existing inventory
  SELECT COUNT(*) INTO inv_count FROM medicine_inventory;
  
  -- Only add sample data if we have less than 5 items
  IF inv_count < 5 THEN
    -- Insert inventory for existing medicines
    INSERT INTO medicine_inventory (
      branch_id, medicine_id, batch_number, 
      quantity, unit_price, selling_price, expiry_date, reorder_level
    )
    SELECT 
      target_branch,
      m.id,
      'BATCH-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || SUBSTRING(m.id::text, 1, 4),
      FLOOR(RANDOM() * 200 + 50)::INTEGER,  -- Random qty 50-250
      ROUND((RANDOM() * 100 + 20)::numeric, 2),  -- Random unit price 20-120
      ROUND((RANDOM() * 150 + 30)::numeric, 2),  -- Random selling price 30-180
      CURRENT_DATE + INTERVAL '1 year' + (RANDOM() * 180 || ' days')::INTERVAL,
      20
    FROM medicines m
    WHERE m.organization_id = target_org
    AND NOT EXISTS (
      SELECT 1 FROM medicine_inventory mi 
      WHERE mi.medicine_id = m.id AND mi.branch_id = target_branch
    )
    LIMIT 20;
  END IF;
END $$;
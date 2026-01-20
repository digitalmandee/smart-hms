-- Reorganize IPD Menu Structure
-- Create logical submenus: Bed Management, Records, and reorganize existing items

-- First, get the IPD parent menu ID
DO $$
DECLARE
  v_ipd_parent_id UUID;
  v_ipd_setup_id UUID;
  v_bed_mgmt_id UUID;
  v_records_id UUID;
  v_admissions_id UUID;
  v_patient_care_id UUID;
  v_discharge_id UUID;
BEGIN
  -- Get IPD parent
  SELECT id INTO v_ipd_parent_id FROM menu_items WHERE code = 'ipd' LIMIT 1;
  
  -- Get existing IPD Setup parent
  SELECT id INTO v_ipd_setup_id FROM menu_items WHERE code = 'ipd.setup' LIMIT 1;
  
  -- Create "Bed Management" parent submenu if not exists
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
  VALUES ('ipd.beds', 'Bed Management', 'BedDouble', NULL, v_ipd_parent_id, 10, 'ipd', 'ipd.beds.view', true)
  ON CONFLICT (code) DO UPDATE SET 
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order,
    is_active = true
  RETURNING id INTO v_bed_mgmt_id;
  
  -- Create "Records" parent submenu if not exists
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
  VALUES ('ipd.records', 'Records', 'FolderOpen', NULL, v_ipd_parent_id, 35, 'ipd', 'ipd.records.view', true)
  ON CONFLICT (code) DO UPDATE SET 
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order,
    is_active = true
  RETURNING id INTO v_records_id;
  
  -- Get or create Admissions parent
  SELECT id INTO v_admissions_id FROM menu_items WHERE code = 'ipd.admissions' LIMIT 1;
  IF v_admissions_id IS NULL THEN
    INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
    VALUES ('ipd.admissions', 'Admissions', 'UserPlus', NULL, v_ipd_parent_id, 5, 'ipd', 'ipd.admissions.view', true)
    RETURNING id INTO v_admissions_id;
  ELSE
    UPDATE menu_items SET sort_order = 5, is_active = true WHERE id = v_admissions_id;
  END IF;
  
  -- Get or create Patient Care parent
  SELECT id INTO v_patient_care_id FROM menu_items WHERE code = 'ipd.patient-care' LIMIT 1;
  IF v_patient_care_id IS NULL THEN
    INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
    VALUES ('ipd.patient-care', 'Patient Care', 'Stethoscope', NULL, v_ipd_parent_id, 15, 'ipd', 'ipd.patient-care.view', true)
    RETURNING id INTO v_patient_care_id;
  ELSE
    UPDATE menu_items SET sort_order = 15, is_active = true WHERE id = v_patient_care_id;
  END IF;
  
  -- Get or create Discharge parent
  SELECT id INTO v_discharge_id FROM menu_items WHERE code = 'ipd.discharge' LIMIT 1;
  IF v_discharge_id IS NULL THEN
    INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
    VALUES ('ipd.discharge', 'Discharge', 'LogOut', NULL, v_ipd_parent_id, 25, 'ipd', 'ipd.discharge.view', true)
    RETURNING id INTO v_discharge_id;
  ELSE
    UPDATE menu_items SET sort_order = 25, is_active = true WHERE id = v_discharge_id;
  END IF;
  
  -- Update IPD Dashboard sort order
  UPDATE menu_items SET sort_order = 1, parent_id = v_ipd_parent_id 
  WHERE code = 'ipd.dashboard';
  
  -- Move items under "Bed Management" submenu
  UPDATE menu_items SET parent_id = v_bed_mgmt_id, sort_order = 1 WHERE code = 'ipd.bed-map';
  UPDATE menu_items SET parent_id = v_bed_mgmt_id, sort_order = 2 WHERE code = 'ipd.wards';
  UPDATE menu_items SET parent_id = v_bed_mgmt_id, sort_order = 3 WHERE code = 'ipd.housekeeping';
  UPDATE menu_items SET parent_id = v_bed_mgmt_id, sort_order = 4 WHERE code = 'ipd.bed-transfers';
  
  -- Move items under "Admissions" submenu
  UPDATE menu_items SET parent_id = v_admissions_id, sort_order = 1 WHERE code = 'ipd.new-admission';
  UPDATE menu_items SET parent_id = v_admissions_id, sort_order = 2 WHERE code = 'ipd.active-admissions';
  UPDATE menu_items SET parent_id = v_admissions_id, sort_order = 3 WHERE code = 'ipd.admission-history';
  
  -- Move items under "Patient Care" submenu
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 1 WHERE code = 'ipd.daily-rounds';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 2 WHERE code = 'ipd.nursing-station';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 3 WHERE code = 'ipd.vitals-chart';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 4 WHERE code = 'ipd.nursing-notes';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 5 WHERE code = 'ipd.medication-chart';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 6 WHERE code = 'ipd.care-plans';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 7 WHERE code = 'ipd.diet-management';
  
  -- Move items under "Discharge" submenu
  UPDATE menu_items SET parent_id = v_discharge_id, sort_order = 1 WHERE code = 'ipd.pending-discharge';
  UPDATE menu_items SET parent_id = v_discharge_id, sort_order = 2 WHERE code = 'ipd.discharge-summaries';
  UPDATE menu_items SET parent_id = v_discharge_id, sort_order = 3 WHERE code = 'ipd.final-billing';
  
  -- Move items under "Records" submenu
  UPDATE menu_items SET parent_id = v_records_id, sort_order = 1 WHERE code = 'ipd.birth-records';
  UPDATE menu_items SET parent_id = v_records_id, sort_order = 2 WHERE code = 'ipd.death-records';
  
  -- Update IPD Reports sort order
  UPDATE menu_items SET sort_order = 40, parent_id = v_ipd_parent_id WHERE code = 'ipd.reports';
  
  -- Update IPD Setup sort order and ensure it's a direct child of IPD
  UPDATE menu_items SET sort_order = 50, parent_id = v_ipd_parent_id WHERE code = 'ipd.setup';
  
  -- Move setup items under "IPD Setup" submenu with proper sort orders
  UPDATE menu_items SET parent_id = v_ipd_setup_id, sort_order = 1 WHERE code = 'ipd.setup.wards';
  UPDATE menu_items SET parent_id = v_ipd_setup_id, sort_order = 2 WHERE code = 'ipd.setup.beds';
  UPDATE menu_items SET parent_id = v_ipd_setup_id, sort_order = 3 WHERE code = 'ipd.setup.ward-types';
  UPDATE menu_items SET parent_id = v_ipd_setup_id, sort_order = 4 WHERE code = 'ipd.setup.bed-types';
  UPDATE menu_items SET parent_id = v_ipd_setup_id, sort_order = 5 WHERE code = 'ipd.setup.bed-features';
  UPDATE menu_items SET parent_id = v_ipd_setup_id, sort_order = 6 WHERE code = 'ipd.setup.floors';
  UPDATE menu_items SET parent_id = v_ipd_setup_id, sort_order = 7 WHERE code = 'ipd.setup.diet-types';
  
  -- Deactivate any orphaned or duplicate menu items that were moved
  -- (Items that have wrong parent_id or are duplicates)
  
END $$;

-- Verify the new structure
SELECT 
  m.code,
  m.name,
  p.code as parent_code,
  m.sort_order,
  m.is_active
FROM menu_items m
LEFT JOIN menu_items p ON m.parent_id = p.id
WHERE m.code LIKE 'ipd.%'
ORDER BY COALESCE(p.sort_order, 0), m.sort_order;
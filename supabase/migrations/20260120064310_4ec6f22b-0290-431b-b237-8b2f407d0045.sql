-- Fix IPD Menu Hierarchy - properly nest children under parent submenus

-- Get all parent IDs
DO $$
DECLARE
  v_ipd_id UUID := '9b1253a5-d6c4-495e-857a-b64d2bca9120';
  v_beds_id UUID := 'e38943d2-fba4-4cc2-9f12-9e8b1cd99d3c';
  v_admissions_id UUID := 'd3b4d0dd-d1ed-4817-8b01-f6524601581f';
  v_patient_care_id UUID := 'c239134c-e594-42a6-9fae-e9fabc2375d9';
  v_discharge_id UUID := '15b37514-9881-4224-85a6-e5a3040a7977';
  v_records_id UUID;
  v_setup_id UUID;
BEGIN
  -- Get Records parent ID
  SELECT id INTO v_records_id FROM menu_items WHERE code = 'ipd.records' LIMIT 1;
  
  -- Get Setup parent ID
  SELECT id INTO v_setup_id FROM menu_items WHERE code = 'ipd.setup' LIMIT 1;
  
  -- Move Bed Management children under ipd.beds parent
  UPDATE menu_items SET parent_id = v_beds_id, sort_order = 1 WHERE code = 'ipd.beds.map';
  UPDATE menu_items SET parent_id = v_beds_id, sort_order = 2 WHERE code = 'ipd.beds.wards';
  UPDATE menu_items SET parent_id = v_beds_id, sort_order = 3 WHERE code = 'ipd.beds.housekeeping';
  UPDATE menu_items SET parent_id = v_beds_id, sort_order = 4 WHERE code = 'ipd.beds.transfers';
  
  -- Move Admissions children under ipd.admissions parent
  UPDATE menu_items SET parent_id = v_admissions_id, sort_order = 1 WHERE code = 'ipd.admissions.new';
  UPDATE menu_items SET parent_id = v_admissions_id, sort_order = 2 WHERE code = 'ipd.admissions.active';
  UPDATE menu_items SET parent_id = v_admissions_id, sort_order = 3 WHERE code = 'ipd.admissions.history';
  
  -- Move Patient Care children under ipd.patient-care parent
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 1 WHERE code = 'ipd.care.rounds';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 2 WHERE code = 'ipd.care.vitals';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 3 WHERE code = 'ipd.care.nursing';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 4 WHERE code = 'ipd.care.medications';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 5 WHERE code = 'ipd.care.emar';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 6 WHERE code = 'ipd.care.diet';
  UPDATE menu_items SET parent_id = v_patient_care_id, sort_order = 7 WHERE code = 'ipd.care.plans';
  
  -- Move Discharge children under ipd.discharge parent
  UPDATE menu_items SET parent_id = v_discharge_id, sort_order = 1 WHERE code = 'ipd.discharge.pending';
  UPDATE menu_items SET parent_id = v_discharge_id, sort_order = 2 WHERE code = 'ipd.discharge.summaries';
  UPDATE menu_items SET parent_id = v_discharge_id, sort_order = 3 WHERE code = 'ipd.discharge.billing';
  
  -- Move Records children under ipd.records parent
  UPDATE menu_items SET parent_id = v_records_id, sort_order = 1 WHERE code = 'ipd.records.births';
  UPDATE menu_items SET parent_id = v_records_id, sort_order = 2 WHERE code = 'ipd.records.deaths';
  
  -- Move Setup children under ipd.setup parent
  UPDATE menu_items SET parent_id = v_setup_id, sort_order = 1 WHERE code = 'ipd.setup.wards';
  UPDATE menu_items SET parent_id = v_setup_id, sort_order = 2 WHERE code = 'ipd.setup.beds';
  UPDATE menu_items SET parent_id = v_setup_id, sort_order = 3 WHERE code = 'ipd.setup.ward_types';
  UPDATE menu_items SET parent_id = v_setup_id, sort_order = 4 WHERE code = 'ipd.setup.bed_types';
  UPDATE menu_items SET parent_id = v_setup_id, sort_order = 5 WHERE code = 'ipd.setup.bed_features';
  UPDATE menu_items SET parent_id = v_setup_id, sort_order = 6 WHERE code = 'ipd.setup.floors';
  UPDATE menu_items SET parent_id = v_setup_id, sort_order = 7 WHERE code = 'ipd.setup.diet_types';
  
  -- Deactivate the duplicate ipd.care parent (we have ipd.patient-care now)
  UPDATE menu_items SET is_active = false WHERE code = 'ipd.care';
  
  -- Deactivate old duplicate items
  UPDATE menu_items SET is_active = false WHERE code = 'ipd_charges';
  UPDATE menu_items SET is_active = false WHERE code = 'ipd_reports';
  
  -- Update main IPD submenu sort orders
  UPDATE menu_items SET sort_order = 1 WHERE code = 'ipd.dashboard';
  UPDATE menu_items SET sort_order = 5 WHERE code = 'ipd.admissions';
  UPDATE menu_items SET sort_order = 10 WHERE code = 'ipd.beds';
  UPDATE menu_items SET sort_order = 15 WHERE code = 'ipd.patient-care';
  UPDATE menu_items SET sort_order = 25 WHERE code = 'ipd.discharge';
  UPDATE menu_items SET sort_order = 35 WHERE code = 'ipd.records';
  UPDATE menu_items SET sort_order = 40 WHERE code = 'ipd.reports';
  UPDATE menu_items SET sort_order = 45 WHERE code = 'ipd.charges';
  UPDATE menu_items SET sort_order = 50 WHERE code = 'ipd.setup';
  
END $$;

-- Verify the hierarchy
SELECT 
  CASE WHEN p.name IS NULL THEN m.name ELSE '  └── ' || m.name END as menu_tree,
  m.code,
  m.path,
  m.sort_order,
  m.is_active
FROM menu_items m
LEFT JOIN menu_items p ON m.parent_id = p.id
WHERE m.code LIKE 'ipd%' AND m.is_active = true
ORDER BY 
  CASE WHEN p.code IS NULL THEN m.sort_order ELSE p.sort_order * 100 + m.sort_order END;
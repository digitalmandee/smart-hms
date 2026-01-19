-- Seed IPD data for City General Hospital (organization_id: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
-- First, get the branch_id for City General Hospital
DO $$
DECLARE
  v_org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_branch_id UUID;
  v_ward_general_id UUID := gen_random_uuid();
  v_ward_icu_id UUID := gen_random_uuid();
  v_ward_pediatric_id UUID := gen_random_uuid();
  v_ward_maternity_id UUID := gen_random_uuid();
  v_ward_surgical_id UUID := gen_random_uuid();
  v_bed_ids UUID[] := ARRAY[]::UUID[];
  v_patient_id UUID;
  v_admission_id UUID;
  v_bed_id UUID;
BEGIN
  -- Get the first branch for this org
  SELECT id INTO v_branch_id FROM branches WHERE organization_id = v_org_id LIMIT 1;
  
  IF v_branch_id IS NULL THEN
    RAISE NOTICE 'No branch found for City General Hospital, skipping seed';
    RETURN;
  END IF;
  
  -- Delete existing wards and beds for this org to avoid duplicates
  DELETE FROM beds WHERE ward_id IN (SELECT id FROM wards WHERE organization_id = v_org_id);
  DELETE FROM wards WHERE organization_id = v_org_id;
  
  -- Create wards
  INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, building, floor, room_section, total_beds, is_active)
  VALUES 
    (v_ward_general_id, v_org_id, v_branch_id, 'General Ward', 'GEN-A', 'general', 'Main Building', 'Ground Floor', 'Section A', 12, true),
    (v_ward_icu_id, v_org_id, v_branch_id, 'Intensive Care Unit', 'ICU-1', 'icu', 'Main Building', '1st Floor', 'Critical Care Wing', 8, true),
    (v_ward_pediatric_id, v_org_id, v_branch_id, 'Pediatric Ward', 'PED-A', 'pediatric', 'East Wing', 'Ground Floor', 'Children Section', 10, true),
    (v_ward_maternity_id, v_org_id, v_branch_id, 'Maternity Ward', 'MAT-1', 'maternity', 'West Wing', '2nd Floor', 'Labor & Delivery', 8, true),
    (v_ward_surgical_id, v_org_id, v_branch_id, 'Surgical Ward', 'SURG-A', 'surgical', 'Surgical Block', '1st Floor', 'Post-Op Section', 10, true);
  
  -- Create beds for General Ward (12 beds, 4 columns, 3 rows)
  INSERT INTO beds (id, ward_id, bed_number, bed_type, status, position_row, position_col, is_active, features)
  SELECT 
    gen_random_uuid(),
    v_ward_general_id,
    'GEN-' || LPAD(n::text, 2, '0'),
    CASE WHEN n <= 4 THEN 'standard' WHEN n <= 8 THEN 'electric' ELSE 'bariatric' END,
    CASE 
      WHEN n = 1 THEN 'occupied'::bed_status
      WHEN n = 2 THEN 'occupied'::bed_status
      WHEN n = 5 THEN 'housekeeping'::bed_status 
      WHEN n = 9 THEN 'maintenance'::bed_status
      WHEN n = 10 THEN 'reserved'::bed_status
      ELSE 'available'::bed_status 
    END,
    ((n-1) / 4) + 1,
    ((n-1) % 4) + 1,
    true,
    CASE 
      WHEN n <= 4 THEN '["oxygen_outlet"]'::jsonb
      WHEN n <= 8 THEN '["oxygen_outlet", "suction"]'::jsonb
      ELSE '["oxygen_outlet", "suction", "cardiac_monitor"]'::jsonb
    END
  FROM generate_series(1, 12) n;
  
  -- Create beds for ICU (8 beds, 4 columns, 2 rows)
  INSERT INTO beds (id, ward_id, bed_number, bed_type, status, position_row, position_col, is_active, features)
  SELECT 
    gen_random_uuid(),
    v_ward_icu_id,
    'ICU-' || LPAD(n::text, 2, '0'),
    'icu',
    CASE 
      WHEN n = 1 THEN 'occupied'::bed_status
      WHEN n = 3 THEN 'occupied'::bed_status
      WHEN n = 5 THEN 'housekeeping'::bed_status 
      ELSE 'available'::bed_status 
    END,
    ((n-1) / 4) + 1,
    ((n-1) % 4) + 1,
    true,
    '["ventilator", "cardiac_monitor", "infusion_pump", "oxygen_outlet", "suction"]'::jsonb
  FROM generate_series(1, 8) n;
  
  -- Create beds for Pediatric Ward (10 beds, 5 columns, 2 rows)
  INSERT INTO beds (id, ward_id, bed_number, bed_type, status, position_row, position_col, is_active, features)
  SELECT 
    gen_random_uuid(),
    v_ward_pediatric_id,
    'PED-' || LPAD(n::text, 2, '0'),
    CASE WHEN n <= 3 THEN 'pediatric' WHEN n <= 6 THEN 'crib' ELSE 'standard' END,
    CASE 
      WHEN n = 2 THEN 'occupied'::bed_status
      WHEN n = 7 THEN 'reserved'::bed_status
      ELSE 'available'::bed_status 
    END,
    ((n-1) / 5) + 1,
    ((n-1) % 5) + 1,
    true,
    '["oxygen_outlet", "pediatric_rails"]'::jsonb
  FROM generate_series(1, 10) n;
  
  -- Create beds for Maternity Ward (8 beds, 4 columns, 2 rows)
  INSERT INTO beds (id, ward_id, bed_number, bed_type, status, position_row, position_col, is_active, features)
  SELECT 
    gen_random_uuid(),
    v_ward_maternity_id,
    'MAT-' || LPAD(n::text, 2, '0'),
    CASE WHEN n <= 2 THEN 'labor' WHEN n <= 4 THEN 'delivery' ELSE 'postpartum' END,
    CASE 
      WHEN n = 1 THEN 'occupied'::bed_status
      WHEN n = 4 THEN 'housekeeping'::bed_status
      ELSE 'available'::bed_status 
    END,
    ((n-1) / 4) + 1,
    ((n-1) % 4) + 1,
    true,
    '["fetal_monitor", "oxygen_outlet"]'::jsonb
  FROM generate_series(1, 8) n;
  
  -- Create beds for Surgical Ward (10 beds, 5 columns, 2 rows)
  INSERT INTO beds (id, ward_id, bed_number, bed_type, status, position_row, position_col, is_active, features)
  SELECT 
    gen_random_uuid(),
    v_ward_surgical_id,
    'SURG-' || LPAD(n::text, 2, '0'),
    'electric',
    CASE 
      WHEN n = 1 THEN 'occupied'::bed_status
      WHEN n = 2 THEN 'occupied'::bed_status
      WHEN n = 6 THEN 'maintenance'::bed_status
      ELSE 'available'::bed_status 
    END,
    ((n-1) / 5) + 1,
    ((n-1) % 5) + 1,
    true,
    '["oxygen_outlet", "suction", "infusion_pump", "patient_lift"]'::jsonb
  FROM generate_series(1, 10) n;
  
  RAISE NOTICE 'Successfully seeded IPD data for City General Hospital';
END $$;
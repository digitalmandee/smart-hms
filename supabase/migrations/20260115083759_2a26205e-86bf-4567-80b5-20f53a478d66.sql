-- Seed IPD Master Data: Wards, Beds, and OT Rooms

DO $$
DECLARE
  org1_id UUID;
  org1_branch_id UUID;
  org2_id UUID;
  org2_branch_id UUID;
  ward_general_1 UUID;
  ward_icu_1 UUID;
  ward_peds_1 UUID;
  ward_maternity_1 UUID;
  ward_private_1 UUID;
  ward_general_2 UUID;
  ward_icu_2 UUID;
  ward_peds_2 UUID;
  ward_maternity_2 UUID;
  ward_private_2 UUID;
BEGIN
  -- Get first organization (Shifa Medical)
  SELECT o.id, b.id INTO org1_id, org1_branch_id
  FROM organizations o
  JOIN branches b ON b.organization_id = o.id AND b.is_main_branch = true
  WHERE o.slug = 'shifa-medical'
  LIMIT 1;

  -- Get second organization (City Hospital)
  SELECT o.id, b.id INTO org2_id, org2_branch_id
  FROM organizations o
  JOIN branches b ON b.organization_id = o.id AND b.is_main_branch = true
  WHERE o.slug = 'city-hospital'
  LIMIT 1;

  IF org1_id IS NOT NULL THEN
    -- Create Wards for Organization 1
    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'General Ward', 'GW', 'general', 10, 'Ground Floor', true, '101', 500)
    RETURNING id INTO ward_general_1;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'Intensive Care Unit', 'ICU', 'icu', 6, '2nd Floor', true, '102', 5000)
    RETURNING id INTO ward_icu_1;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'Pediatric Ward', 'PED', 'pediatric', 8, '1st Floor', true, '103', 800)
    RETURNING id INTO ward_peds_1;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'Maternity Ward', 'MAT', 'maternity', 6, '1st Floor', true, '104', 1200)
    RETURNING id INTO ward_maternity_1;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'Private Rooms', 'PVT', 'private', 4, '3rd Floor', true, '105', 3000)
    RETURNING id INTO ward_private_1;

    -- Create Beds
    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_general_1, 'GW-' || LPAD(n::TEXT, 3, '0'), 
           CASE WHEN n <= 4 THEN 'standard' WHEN n <= 7 THEN 'electric' ELSE 'bariatric' END,
           'available', true, ((n-1) / 5) + 1, ((n-1) % 5) + 1
    FROM generate_series(1, 10) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_icu_1, 'ICU-' || LPAD(n::TEXT, 3, '0'), 'icu', 'available', true, 1, n
    FROM generate_series(1, 6) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_peds_1, 'PED-' || LPAD(n::TEXT, 3, '0'), 'pediatric', 'available', true, ((n-1) / 4) + 1, ((n-1) % 4) + 1
    FROM generate_series(1, 8) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_maternity_1, 'MAT-' || LPAD(n::TEXT, 3, '0'), 'standard', 'available', true, ((n-1) / 3) + 1, ((n-1) % 3) + 1
    FROM generate_series(1, 6) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_private_1, 'PVT-' || LPAD(n::TEXT, 3, '0'), 'electric', 'available', true, 1, n
    FROM generate_series(1, 4) n;

    -- Create OT Rooms (correct columns: room_number, name)
    INSERT INTO ot_rooms (organization_id, branch_id, room_number, name, room_type, status, floor, equipment, is_active)
    VALUES 
      (org1_id, org1_branch_id, 'OT-1', 'General Surgery OT', 'general', 'available', '2nd Floor', '["Surgical Table", "Anesthesia Machine", "Monitors"]'::jsonb, true),
      (org1_id, org1_branch_id, 'OT-2', 'Orthopedic OT', 'orthopedic', 'available', '2nd Floor', '["C-Arm", "Surgical Table", "Power Tools"]'::jsonb, true),
      (org1_id, org1_branch_id, 'OT-3', 'Cardiac OT', 'cardiac', 'available', '2nd Floor', '["Heart-Lung Machine", "IABP", "Monitors"]'::jsonb, true),
      (org1_id, org1_branch_id, 'OT-E', 'Emergency OT', 'emergency', 'available', 'Ground Floor', '["Surgical Table", "Emergency Kit", "Monitors"]'::jsonb, true);
  END IF;

  IF org2_id IS NOT NULL THEN
    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'General Ward', 'GW', 'general', 10, 'Ground Floor', true, '201', 400)
    RETURNING id INTO ward_general_2;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'Intensive Care Unit', 'ICU', 'icu', 6, '2nd Floor', true, '202', 4000)
    RETURNING id INTO ward_icu_2;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'Pediatric Ward', 'PED', 'pediatric', 8, '1st Floor', true, '203', 700)
    RETURNING id INTO ward_peds_2;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'Maternity Ward', 'MAT', 'maternity', 6, '1st Floor', true, '204', 1000)
    RETURNING id INTO ward_maternity_2;

    INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, total_beds, floor, is_active, contact_extension, charge_per_day)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'Private Rooms', 'PVT', 'private', 4, '3rd Floor', true, '205', 2500)
    RETURNING id INTO ward_private_2;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_general_2, 'GW-' || LPAD(n::TEXT, 3, '0'), 
           CASE WHEN n <= 4 THEN 'standard' WHEN n <= 7 THEN 'electric' ELSE 'bariatric' END,
           'available', true, ((n-1) / 5) + 1, ((n-1) % 5) + 1
    FROM generate_series(1, 10) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_icu_2, 'ICU-' || LPAD(n::TEXT, 3, '0'), 'icu', 'available', true, 1, n
    FROM generate_series(1, 6) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_peds_2, 'PED-' || LPAD(n::TEXT, 3, '0'), 'pediatric', 'available', true, ((n-1) / 4) + 1, ((n-1) % 4) + 1
    FROM generate_series(1, 8) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_maternity_2, 'MAT-' || LPAD(n::TEXT, 3, '0'), 'standard', 'available', true, ((n-1) / 3) + 1, ((n-1) % 3) + 1
    FROM generate_series(1, 6) n;

    INSERT INTO beds (ward_id, bed_number, bed_type, status, is_active, position_row, position_col)
    SELECT ward_private_2, 'PVT-' || LPAD(n::TEXT, 3, '0'), 'electric', 'available', true, 1, n
    FROM generate_series(1, 4) n;

    INSERT INTO ot_rooms (organization_id, branch_id, room_number, name, room_type, status, floor, equipment, is_active)
    VALUES 
      (org2_id, org2_branch_id, 'OT-1', 'General Surgery OT', 'general', 'available', '2nd Floor', '["Surgical Table", "Anesthesia Machine", "Monitors"]'::jsonb, true),
      (org2_id, org2_branch_id, 'OT-2', 'Orthopedic OT', 'orthopedic', 'available', '2nd Floor', '["C-Arm", "Surgical Table", "Power Tools"]'::jsonb, true),
      (org2_id, org2_branch_id, 'OT-E', 'Emergency OT', 'emergency', 'available', 'Ground Floor', '["Surgical Table", "Emergency Kit", "Monitors"]'::jsonb, true);
  END IF;
END $$;
-- =====================================================
-- COMPREHENSIVE IPD SEED DATA - Multi-Building Hospital
-- =====================================================

-- Step 1: Update existing wards with building and room_section info
UPDATE wards SET 
  building = 'Main Building', 
  room_section = 'Section A'
WHERE code = 'GW' AND organization_id = (SELECT id FROM organizations WHERE slug = 'shifa');

UPDATE wards SET 
  building = 'Surgical Block', 
  room_section = 'Critical Wing'
WHERE code = 'ICU' AND organization_id = (SELECT id FROM organizations WHERE slug = 'shifa');

UPDATE wards SET 
  building = 'Mother & Child Center', 
  room_section = 'Pediatric Wing'
WHERE code = 'PED' AND organization_id = (SELECT id FROM organizations WHERE slug = 'shifa');

UPDATE wards SET 
  building = 'Mother & Child Center', 
  room_section = 'Maternity Wing'
WHERE code = 'MAT' AND organization_id = (SELECT id FROM organizations WHERE slug = 'shifa');

UPDATE wards SET 
  building = 'Main Building', 
  room_section = 'East Wing'
WHERE code = 'PVT' AND organization_id = (SELECT id FROM organizations WHERE slug = 'shifa');

-- Step 2: Insert new wards with explicit casting
INSERT INTO wards (organization_id, branch_id, name, code, ward_type, floor, building, room_section, total_beds, is_active)
SELECT 
  o.id,
  b.id,
  ward_data.name,
  ward_data.code,
  ward_data.ward_type::ward_type,
  ward_data.floor,
  ward_data.building,
  ward_data.room_section,
  ward_data.total_beds,
  true
FROM organizations o
CROSS JOIN branches b
CROSS JOIN (VALUES
  ('Emergency Ward', 'ER', 'emergency', 'Ground Floor', 'Main Building', 'ER Wing', 12),
  ('General Ward - Male', 'GWM', 'general', '1st Floor', 'Main Building', 'Section B', 16),
  ('General Ward - Female', 'GWF', 'general', '2nd Floor', 'Main Building', 'Section B', 16),
  ('Medical Ward', 'MED', 'general', '3rd Floor', 'Main Building', 'Section A', 12),
  ('Cardiac Care Unit', 'CCU', 'cardiac', '2nd Floor', 'Surgical Block', 'Cardiac Wing', 8),
  ('Surgical ICU', 'SICU', 'icu', '2nd Floor', 'Surgical Block', 'ICU Wing', 6),
  ('Post-Op Recovery', 'POR', 'general', '1st Floor', 'Surgical Block', 'Recovery Wing', 10),
  ('Surgical Ward', 'SRG', 'surgical', '1st Floor', 'Surgical Block', 'Surgical Wing', 14),
  ('NICU', 'NICU', 'nicu', '2nd Floor', 'Mother & Child Center', 'NICU Wing', 8),
  ('Labor & Delivery', 'LND', 'labor', '1st Floor', 'Mother & Child Center', 'L&D Wing', 6),
  ('Pediatric ICU', 'PICU', 'icu', '2nd Floor', 'Mother & Child Center', 'PICU Wing', 6),
  ('VIP Suites', 'VIP', 'private', '4th Floor', 'Main Building', 'VIP Wing', 8)
) AS ward_data(name, code, ward_type, floor, building, room_section, total_beds)
WHERE o.slug = 'shifa' AND b.is_main_branch = true
ON CONFLICT DO NOTHING;

-- Step 3: Update existing beds with grid positions
DO $$
DECLARE
  ward_rec RECORD;
  bed_rec RECORD;
  row_num INT;
  col_num INT;
  bed_index INT;
  max_cols INT := 4;
BEGIN
  FOR ward_rec IN SELECT id FROM wards WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'shifa')
  LOOP
    bed_index := 0;
    FOR bed_rec IN SELECT id FROM beds WHERE ward_id = ward_rec.id ORDER BY bed_number
    LOOP
      row_num := (bed_index / max_cols) + 1;
      col_num := (bed_index % max_cols) + 1;
      UPDATE beds SET position_row = row_num, position_col = col_num WHERE id = bed_rec.id;
      bed_index := bed_index + 1;
    END LOOP;
  END LOOP;
END $$;

-- Step 4: Create beds for new wards with proper positions
-- Using valid bed_status values: available, occupied, reserved, maintenance, blocked, housekeeping
DO $$
DECLARE
  ward_rec RECORD;
  bed_count INT;
  i INT;
  row_num INT;
  col_num INT;
  max_cols INT := 4;
  bed_type TEXT;
  status_val TEXT;
  rand_val FLOAT;
BEGIN
  FOR ward_rec IN 
    SELECT w.id, w.code, w.total_beds, w.ward_type::text as ward_type
    FROM wards w
    WHERE w.organization_id = (SELECT id FROM organizations WHERE slug = 'shifa')
      AND NOT EXISTS (SELECT 1 FROM beds WHERE ward_id = w.id)
  LOOP
    bed_count := COALESCE(ward_rec.total_beds, 10);
    
    FOR i IN 1..bed_count LOOP
      row_num := ((i - 1) / max_cols) + 1;
      col_num := ((i - 1) % max_cols) + 1;
      
      bed_type := CASE ward_rec.ward_type
        WHEN 'icu' THEN 'icu'
        WHEN 'nicu' THEN 'pediatric'
        WHEN 'emergency' THEN 'stretcher'
        WHEN 'private' THEN 'electric'
        WHEN 'cardiac' THEN 'icu'
        ELSE 'standard'
      END;
      
      rand_val := random();
      status_val := CASE 
        WHEN rand_val < 0.50 THEN 'available'
        WHEN rand_val < 0.75 THEN 'occupied'
        WHEN rand_val < 0.85 THEN 'reserved'
        WHEN rand_val < 0.93 THEN 'maintenance'
        ELSE 'housekeeping'
      END;
      
      INSERT INTO beds (ward_id, bed_number, bed_type, status, position_row, position_col, is_active)
      VALUES (
        ward_rec.id,
        ward_rec.code || '-' || LPAD(i::TEXT, 2, '0'),
        bed_type,
        status_val::bed_status,
        row_num,
        col_num,
        true
      );
    END LOOP;
  END LOOP;
END $$;

-- Step 5: Set varied statuses for existing beds (with correct enum values)
UPDATE beds SET status = 'occupied' 
WHERE id IN (
  SELECT b.id FROM beds b
  JOIN wards w ON w.id = b.ward_id
  WHERE w.organization_id = (SELECT id FROM organizations WHERE slug = 'shifa')
    AND b.status = 'available'
  ORDER BY random()
  LIMIT 12
);

UPDATE beds SET status = 'reserved'
WHERE id IN (
  SELECT b.id FROM beds b
  JOIN wards w ON w.id = b.ward_id
  WHERE w.organization_id = (SELECT id FROM organizations WHERE slug = 'shifa')
    AND b.status = 'available'
  ORDER BY random()
  LIMIT 6
);

UPDATE beds SET status = 'maintenance'
WHERE id IN (
  SELECT b.id FROM beds b
  JOIN wards w ON w.id = b.ward_id
  WHERE w.organization_id = (SELECT id FROM organizations WHERE slug = 'shifa')
    AND b.status = 'available'
  ORDER BY random()
  LIMIT 4
);

UPDATE beds SET status = 'housekeeping'
WHERE id IN (
  SELECT b.id FROM beds b
  JOIN wards w ON w.id = b.ward_id
  WHERE w.organization_id = (SELECT id FROM organizations WHERE slug = 'shifa')
    AND b.status = 'available'
  ORDER BY random()
  LIMIT 4
);
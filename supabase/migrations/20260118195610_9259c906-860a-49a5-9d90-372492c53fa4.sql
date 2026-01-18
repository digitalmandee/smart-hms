-- SEED IPD DATA - Using valid enum values
-- Update existing wards with building info
UPDATE wards SET building = 'Main Building', room_section = 'Section A' WHERE code = 'GW' AND organization_id = 'b1111111-1111-1111-1111-111111111111';
UPDATE wards SET building = 'Surgical Block', room_section = 'Critical Wing' WHERE code = 'ICU' AND organization_id = 'b1111111-1111-1111-1111-111111111111';
UPDATE wards SET building = 'Mother & Child Center', room_section = 'Pediatric Wing' WHERE code = 'PED' AND organization_id = 'b1111111-1111-1111-1111-111111111111';
UPDATE wards SET building = 'Mother & Child Center', room_section = 'Maternity Wing' WHERE code = 'MAT' AND organization_id = 'b1111111-1111-1111-1111-111111111111';
UPDATE wards SET building = 'Main Building', room_section = 'East Wing' WHERE code = 'PVT' AND organization_id = 'b1111111-1111-1111-1111-111111111111';

-- Insert new wards with valid ward_type enum values
INSERT INTO wards (organization_id, branch_id, name, code, ward_type, floor, building, room_section, total_beds, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', b.id, ward_data.name, ward_data.code, ward_data.ward_type::ward_type, ward_data.floor, ward_data.building, ward_data.room_section, ward_data.total_beds, true
FROM branches b
CROSS JOIN (VALUES
  ('Emergency Ward', 'ER', 'emergency', 'Ground Floor', 'Main Building', 'ER Wing', 12),
  ('General Ward - Male', 'GWM', 'general', '1st Floor', 'Main Building', 'Section B', 16),
  ('General Ward - Female', 'GWF', 'general', '2nd Floor', 'Main Building', 'Section B', 16),
  ('Medical Ward', 'MED', 'general', '3rd Floor', 'Main Building', 'Section A', 12),
  ('Cardiac Care Unit', 'CCU', 'ccu', '2nd Floor', 'Surgical Block', 'Cardiac Wing', 8),
  ('Surgical ICU', 'SICU', 'icu', '2nd Floor', 'Surgical Block', 'ICU Wing', 6),
  ('Post-Op Recovery', 'POR', 'surgical', '1st Floor', 'Surgical Block', 'Recovery Wing', 10),
  ('Surgical Ward', 'SRG', 'surgical', '1st Floor', 'Surgical Block', 'Surgical Wing', 14),
  ('NICU', 'NICU', 'nicu', '2nd Floor', 'Mother & Child Center', 'NICU Wing', 8),
  ('Labor & Delivery', 'LND', 'maternity', '1st Floor', 'Mother & Child Center', 'L&D Wing', 6),
  ('Pediatric ICU', 'PICU', 'picu', '2nd Floor', 'Mother & Child Center', 'PICU Wing', 6),
  ('VIP Suites', 'VIP', 'vip', '4th Floor', 'Main Building', 'VIP Wing', 8)
) AS ward_data(name, code, ward_type, floor, building, room_section, total_beds)
WHERE b.organization_id = 'b1111111-1111-1111-1111-111111111111' AND b.is_main_branch = true
ON CONFLICT DO NOTHING;

-- Update existing beds with grid positions
DO $$ DECLARE ward_rec RECORD; bed_rec RECORD; idx INT; BEGIN
  FOR ward_rec IN SELECT id FROM wards WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' LOOP
    idx := 0;
    FOR bed_rec IN SELECT id FROM beds WHERE ward_id = ward_rec.id ORDER BY bed_number LOOP
      UPDATE beds SET position_row = (idx / 4) + 1, position_col = (idx % 4) + 1 WHERE id = bed_rec.id;
      idx := idx + 1;
    END LOOP;
  END LOOP;
END $$;

-- Create beds for new wards
DO $$ DECLARE ward_rec RECORD; i INT; bed_type TEXT; status_val TEXT; rand_val FLOAT; BEGIN
  FOR ward_rec IN SELECT w.id, w.code, w.total_beds, w.ward_type::text FROM wards w WHERE w.organization_id = 'b1111111-1111-1111-1111-111111111111' AND NOT EXISTS (SELECT 1 FROM beds WHERE ward_id = w.id) LOOP
    FOR i IN 1..COALESCE(ward_rec.total_beds, 10) LOOP
      bed_type := CASE ward_rec.ward_type WHEN 'icu' THEN 'icu' WHEN 'nicu' THEN 'pediatric' WHEN 'picu' THEN 'pediatric' WHEN 'ccu' THEN 'icu' WHEN 'emergency' THEN 'stretcher' WHEN 'vip' THEN 'electric' ELSE 'standard' END;
      rand_val := random();
      status_val := CASE WHEN rand_val < 0.50 THEN 'available' WHEN rand_val < 0.75 THEN 'occupied' WHEN rand_val < 0.85 THEN 'reserved' WHEN rand_val < 0.93 THEN 'maintenance' ELSE 'housekeeping' END;
      INSERT INTO beds (ward_id, bed_number, bed_type, status, position_row, position_col, is_active) VALUES (ward_rec.id, ward_rec.code || '-' || LPAD(i::TEXT, 2, '0'), bed_type, status_val::bed_status, ((i-1)/4)+1, ((i-1)%4)+1, true);
    END LOOP;
  END LOOP;
END $$;
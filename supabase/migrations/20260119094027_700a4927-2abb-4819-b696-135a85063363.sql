-- Seed Wards for Al-Noor Family Clinic
INSERT INTO wards (id, organization_id, branch_id, name, code, ward_type, floor, building, total_beds, is_active)
VALUES 
-- Observation Ward (for short stays, recovery)
('22220001-0001-0001-0001-000000000001', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222',
 'Observation Ward', 'OBS', 'general', 'Ground', 'Main Building', 4, true),

-- Procedure Room (for minor surgeries/procedures)
('22220001-0001-0001-0001-000000000002', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222',
 'Procedure Room', 'PROC', 'surgical', 'Ground', 'Main Building', 2, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Beds for Observation Ward (4 beds)
INSERT INTO beds (id, ward_id, bed_number, bed_type, status, position_row, position_col, is_active)
VALUES
('22220002-0001-0001-0001-000000000001', '22220001-0001-0001-0001-000000000001', 'OBS-001', 'standard', 'available', 1, 1, true),
('22220002-0001-0001-0001-000000000002', '22220001-0001-0001-0001-000000000001', 'OBS-002', 'standard', 'available', 1, 2, true),
('22220002-0001-0001-0001-000000000003', '22220001-0001-0001-0001-000000000001', 'OBS-003', 'standard', 'available', 2, 1, true),
('22220002-0001-0001-0001-000000000004', '22220001-0001-0001-0001-000000000001', 'OBS-004', 'electric', 'available', 2, 2, true),

-- Procedure Room Beds (2 beds)
('22220002-0001-0001-0001-000000000005', '22220001-0001-0001-0001-000000000002', 'PROC-001', 'procedure', 'available', 1, 1, true),
('22220002-0001-0001-0001-000000000006', '22220001-0001-0001-0001-000000000002', 'PROC-002', 'procedure', 'available', 1, 2, true)
ON CONFLICT (id) DO NOTHING;
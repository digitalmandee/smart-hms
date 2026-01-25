
-- Direct insert of missing OT demo doctors
INSERT INTO doctors (id, organization_id, branch_id, profile_id, specialization, qualification, license_number, consultation_fee, is_available)
VALUES 
  ('d4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000030', 'General Surgery', 'FCPS Surgery', 'PMC-SURG-001', 3000, true),
  ('d5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000031', 'Anesthesiology', 'FCPS Anesthesiology', 'PMC-ANES-001', 2500, true)
ON CONFLICT (id) DO UPDATE SET specialization = EXCLUDED.specialization, is_available = true;

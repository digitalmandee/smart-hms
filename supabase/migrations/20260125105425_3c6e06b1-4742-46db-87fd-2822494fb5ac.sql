
-- Create NEW doctor records for OT demo accounts in Shifa Medical Center
-- Using unique IDs to avoid conflicts with existing records in other orgs
INSERT INTO doctors (id, organization_id, branch_id, profile_id, specialization, qualification, license_number, consultation_fee, is_available)
VALUES 
  ('d0300000-0000-0000-0000-000000000030', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000030', 'General Surgery', 'FCPS Surgery', 'PMC-SURG-002', 3000, true),
  ('d0310000-0000-0000-0000-000000000031', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000031', 'Anesthesiology', 'FCPS Anesthesiology', 'PMC-ANES-002', 2500, true)
ON CONFLICT (id) DO NOTHING;

-- Assign organization and branch to all demo users
-- Organization: Shifa Medical Center (b1111111-1111-1111-1111-111111111111)
-- Branch: Main Branch - Gulberg (c1111111-1111-1111-1111-111111111111)

UPDATE public.profiles 
SET 
  organization_id = 'b1111111-1111-1111-1111-111111111111',
  branch_id = 'c1111111-1111-1111-1111-111111111111'
WHERE email IN (
  'superadmin@healthos.demo',
  'orgadmin@healthos.demo',
  'branchadmin@healthos.demo',
  'doctor@healthos.demo',
  'nurse@healthos.demo',
  'receptionist@healthos.demo',
  'pharmacist@healthos.demo',
  'labtech@healthos.demo',
  'accountant@healthos.demo'
);
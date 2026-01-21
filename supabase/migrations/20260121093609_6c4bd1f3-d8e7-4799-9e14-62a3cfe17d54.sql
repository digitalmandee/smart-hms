-- Grant IPD bed and admission permissions to receptionist role
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'receptionist'::app_role, id, true, NULL
FROM permissions 
WHERE code IN (
  'ipd.beds.view',
  'ipd.wards.view',
  'ipd.admissions.view',
  'ipd.admissions.create',
  'ipd.dashboard',
  'ipd.view'
)
ON CONFLICT DO NOTHING;
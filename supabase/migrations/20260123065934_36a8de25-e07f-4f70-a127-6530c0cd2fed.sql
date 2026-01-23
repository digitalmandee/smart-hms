-- Grant ipd.discharge.manage permission to doctors
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 
  'doctor'::app_role,
  p.id,
  true,
  NULL
FROM permissions p
WHERE p.code = 'ipd.discharge.manage'
ON CONFLICT DO NOTHING;
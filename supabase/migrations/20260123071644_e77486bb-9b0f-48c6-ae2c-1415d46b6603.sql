-- Grant IPD charges and discharge permissions to receptionist role
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'receptionist'::app_role, id, true
FROM permissions 
WHERE code IN ('ipd.charges.manage', 'ipd.discharge.manage')
ON CONFLICT DO NOTHING;

-- Also grant to branch_admin since they handle billing
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin'::app_role, id, true
FROM permissions 
WHERE code IN ('ipd.charges.manage', 'ipd.discharge.manage')
ON CONFLICT DO NOTHING;
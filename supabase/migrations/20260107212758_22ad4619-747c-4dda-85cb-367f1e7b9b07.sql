-- Grant reception.view permission to receptionist role
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'receptionist'::app_role, id, true, NULL
FROM permissions 
WHERE code = 'reception.view'
ON CONFLICT DO NOTHING;
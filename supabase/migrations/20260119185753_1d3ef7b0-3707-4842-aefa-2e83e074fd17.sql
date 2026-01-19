-- Grant all IPD permissions to org_admin role for all organizations
-- First, remove any existing entries to avoid duplicates
DELETE FROM role_permissions 
WHERE role = 'org_admin' 
AND permission_id IN (SELECT id FROM permissions WHERE code LIKE 'ipd.%');

-- Insert fresh IPD permissions for org_admin (organization_id = NULL means global/default)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'org_admin', p.id, true, NULL
FROM permissions p 
WHERE p.code LIKE 'ipd.%';
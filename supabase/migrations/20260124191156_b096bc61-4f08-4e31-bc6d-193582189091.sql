-- Grant hr.payroll.view permission to branch_admin role
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin', id, true
FROM permissions 
WHERE code = 'hr.payroll.view'
ON CONFLICT DO NOTHING;

-- Also grant hr.payroll.process to branch_admin (optional, for processing payroll)
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin', id, true
FROM permissions 
WHERE code = 'hr.payroll.process'
ON CONFLICT DO NOTHING;

-- Remove required_permission from hr.payroll parent menu (let children control access)
-- This makes the parent visible, but children still require permissions
UPDATE menu_items 
SET required_permission = NULL 
WHERE code = 'hr.payroll';

-- Ensure hr.compliance children don't require module check since parent already does
UPDATE menu_items 
SET required_module = NULL 
WHERE code LIKE 'hr.compliance.%';
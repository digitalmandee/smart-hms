-- Phase 1: Add 9 new permissions
INSERT INTO permissions (code, name, module, description) VALUES
('lab.manage', 'Manage Lab Configuration', 'laboratory', 'Manage lab test templates and categories'),
('lab.templates', 'Manage Test Templates', 'laboratory', 'Create and edit lab test templates'),
('lab.categories', 'Manage Lab Categories', 'laboratory', 'Manage lab test categories'),
('insurance.view', 'View Insurance', 'billing', 'View insurance companies and plans'),
('insurance.manage', 'Manage Insurance', 'billing', 'Create/edit insurance companies and plans'),
('insurance.claims', 'Manage Claims', 'billing', 'Create and process insurance claims'),
('audit.view', 'View Audit Logs', 'settings', 'View system audit trail'),
('sms.manage', 'Manage SMS Gateway', 'settings', 'Configure SMS gateway settings'),
('reports.templates', 'Manage Report Templates', 'settings', 'Manage report templates')
ON CONFLICT (code) DO NOTHING;

-- Phase 2: Add menu items for lab templates
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'lab_test_templates', 'Test Templates', 'FlaskConical', '/app/lab/templates',
  id, 30, 'lab.manage', true
FROM menu_items WHERE code = 'laboratory'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'lab_test_categories', 'Test Categories', 'Folders', '/app/lab/categories',
  id, 40, 'lab.manage', true
FROM menu_items WHERE code = 'laboratory'
ON CONFLICT (code) DO NOTHING;

-- Phase 3: Update existing menu items with correct permissions
UPDATE menu_items SET required_permission = 'insurance.manage' WHERE code = 'insurance_companies';
UPDATE menu_items SET required_permission = 'insurance.manage' WHERE code = 'insurance_plans';
UPDATE menu_items SET required_permission = 'insurance.claims' WHERE code = 'insurance_claims';
UPDATE menu_items SET required_permission = 'audit.view' WHERE code = 'audit_logs';
UPDATE menu_items SET required_permission = 'sms.manage' WHERE code = 'sms_settings';
UPDATE menu_items SET required_permission = 'reports.templates' WHERE code = 'report_templates';

-- Phase 4: Assign new permissions to admin roles (using organization_id = NULL for global permissions)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'super_admin'::app_role, id, true, NULL FROM permissions 
WHERE code IN ('lab.manage', 'lab.templates', 'lab.categories', 'insurance.view', 'insurance.manage', 'insurance.claims', 'audit.view', 'sms.manage', 'reports.templates')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'org_admin'::app_role, id, true, NULL FROM permissions 
WHERE code IN ('lab.manage', 'lab.templates', 'lab.categories', 'insurance.view', 'insurance.manage', 'insurance.claims', 'audit.view', 'sms.manage', 'reports.templates')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'branch_admin'::app_role, id, true, NULL FROM permissions 
WHERE code IN ('lab.manage', 'lab.templates', 'lab.categories', 'insurance.view', 'insurance.manage', 'insurance.claims', 'audit.view', 'sms.manage', 'reports.templates')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Phase 5: Assign lab permissions to lab_technician
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'lab_technician'::app_role, id, true, NULL FROM permissions 
WHERE code IN ('lab.manage', 'lab.templates', 'lab.categories')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Phase 6: Assign insurance permissions to accountant and finance_manager
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'accountant'::app_role, id, true, NULL FROM permissions 
WHERE code IN ('insurance.view', 'insurance.manage', 'insurance.claims')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'finance_manager'::app_role, id, true, NULL FROM permissions 
WHERE code IN ('insurance.view', 'insurance.manage', 'insurance.claims')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Phase 7: Fix missing super_admin permissions (17 permissions)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'super_admin'::app_role, id, true, NULL FROM permissions 
WHERE code IN (
  'hr.attendance.reports', 'hr.biometric.manage', 'hr.categories.manage', 'hr.departments.manage',
  'hr.designations.manage', 'hr.holidays.manage', 'hr.leaves.manage_types', 'hr.loans.manage',
  'hr.reports.view', 'hr.shifts.manage', 'ipd.charges.manage', 'ipd.charges.view',
  'ipd.discharge.manage', 'ipd.reports.view', 'radiology.orders.create', 'radiology.reports.create', 'radiology.reports.verify'
)
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Also grant these to org_admin and branch_admin
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'org_admin'::app_role, id, true, NULL FROM permissions 
WHERE code IN (
  'hr.attendance.reports', 'hr.biometric.manage', 'hr.categories.manage', 'hr.departments.manage',
  'hr.designations.manage', 'hr.holidays.manage', 'hr.leaves.manage_types', 'hr.loans.manage',
  'hr.reports.view', 'hr.shifts.manage', 'ipd.charges.manage', 'ipd.charges.view',
  'ipd.discharge.manage', 'ipd.reports.view', 'radiology.orders.create', 'radiology.reports.create', 'radiology.reports.verify'
)
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'branch_admin'::app_role, id, true, NULL FROM permissions 
WHERE code IN (
  'hr.attendance.reports', 'hr.biometric.manage', 'hr.categories.manage', 'hr.departments.manage',
  'hr.designations.manage', 'hr.holidays.manage', 'hr.leaves.manage_types', 'hr.loans.manage',
  'hr.reports.view', 'hr.shifts.manage', 'ipd.charges.manage', 'ipd.charges.view',
  'ipd.discharge.manage', 'ipd.reports.view', 'radiology.orders.create', 'radiology.reports.create', 'radiology.reports.verify'
)
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;
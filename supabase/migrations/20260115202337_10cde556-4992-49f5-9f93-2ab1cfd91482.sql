-- =====================================================
-- COMPREHENSIVE ROLE & MENU FIX MIGRATION (PERMISSIONS ONLY)
-- =====================================================

-- Part 1: Remove incorrect patients.view permission from HR roles
DELETE FROM public.role_permissions 
WHERE role IN ('hr_manager', 'hr_officer') 
AND permission_id IN (SELECT id FROM public.permissions WHERE code = 'patients.view');

-- Part 2: Add missing menu items for Doctors & Nurses under HR & Staff
-- Parent ID for hr = '720b3ed9-16d0-4dbf-bfec-ffe859430a37'
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_permission)
VALUES 
  ('hr.doctors', 'Doctors', '/app/hr/doctors', 'Stethoscope', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 15, true, 'hr.employees.view'),
  ('hr.nurses', 'Nurses', '/app/hr/nurses', 'HeartPulse', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 16, true, 'hr.employees.view')
ON CONFLICT (code) DO UPDATE SET
  path = EXCLUDED.path,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  required_permission = EXCLUDED.required_permission,
  is_active = true;

-- Part 3: Add missing HR Setup menu items
-- Parent ID for hr.setup = '27857093-f814-4aae-87ee-cbd0cc0d8b79'
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_permission)
VALUES 
  ('hr.setup.salary_components', 'Salary Components', '/app/hr/setup/salary-components', 'Calculator', '27857093-f814-4aae-87ee-cbd0cc0d8b79', 70, true, 'hr.salary.manage'),
  ('hr.setup.tax_slabs', 'Tax Slabs', '/app/hr/setup/tax-slabs', 'Percent', '27857093-f814-4aae-87ee-cbd0cc0d8b79', 71, true, 'hr.salary.manage'),
  ('hr.reports', 'HR Reports', '/app/hr/reports', 'FileText', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 80, true, 'hr.reports.view'),
  ('hr.attendance.reports_menu', 'Attendance Reports', '/app/hr/attendance/reports', 'BarChart', '720b3ed9-16d0-4dbf-bfec-ffe859430a37', 25, true, 'hr.attendance.reports')
ON CONFLICT (code) DO UPDATE SET
  path = EXCLUDED.path,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  required_permission = EXCLUDED.required_permission,
  is_active = true;

-- Part 4: Grant ALL HR permissions to hr_manager
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'hr_manager'::public.app_role, p.id, true, NULL
FROM public.permissions p
WHERE p.module = 'hr'
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role = 'hr_manager' AND rp.permission_id = p.id
  );

-- Part 5: Grant basic HR permissions to hr_officer (no salary/payroll)
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'hr_officer'::public.app_role, p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  'hr.view',
  'hr.dashboard',
  'hr.employees.view',
  'hr.employees.create',
  'hr.employees.edit',
  'hr.departments.manage',
  'hr.designations.manage',
  'hr.categories.manage',
  'hr.shifts.manage',
  'hr.holidays.manage',
  'hr.attendance.view',
  'hr.attendance.edit',
  'hr.attendance.reports',
  'hr.leaves.view',
  'hr.leaves.approve',
  'hr.biometric.manage'
)
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'hr_officer' AND rp.permission_id = p.id
);

-- Part 6: Ensure ot_technician has all OT permissions
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ot_technician'::public.app_role, p.id, true, NULL
FROM public.permissions p
WHERE p.module = 'ot'
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role = 'ot_technician' AND rp.permission_id = p.id
  );

-- Part 7: Fix Finance Manager - remove patients access, ensure full accounts access
DELETE FROM public.role_permissions 
WHERE role = 'finance_manager' 
AND permission_id IN (SELECT id FROM public.permissions WHERE code = 'patients.view');

-- Part 8: Fix Store Manager - remove patients access
DELETE FROM public.role_permissions 
WHERE role = 'store_manager' 
AND permission_id IN (SELECT id FROM public.permissions WHERE code = 'patients.view');

-- Part 9: Grant Store Manager full inventory access
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'store_manager'::public.app_role, p.id, true, NULL
FROM public.permissions p
WHERE p.module = 'inventory'
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role = 'store_manager' AND rp.permission_id = p.id
  );

-- Part 10: Grant Finance Manager full accounts/billing access
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'finance_manager'::public.app_role, p.id, true, NULL
FROM public.permissions p
WHERE p.module IN ('accounts', 'billing')
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role = 'finance_manager' AND rp.permission_id = p.id
  );
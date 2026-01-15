-- Part 1: Fix Blood Bank permission code mismatches (colon -> dot format)
UPDATE menu_items SET required_permission = 'blood_bank.view' WHERE required_permission = 'blood_bank:view';
UPDATE menu_items SET required_permission = 'blood_bank.cross_match' WHERE required_permission = 'blood_bank:cross_match';
UPDATE menu_items SET required_permission = 'blood_bank.donations.manage' WHERE required_permission = 'blood_bank:manage_donations';
UPDATE menu_items SET required_permission = 'blood_bank.requests.manage' WHERE required_permission = 'blood_bank:process_requests';
UPDATE menu_items SET required_permission = 'blood_bank.transfusions.manage' WHERE required_permission = 'blood_bank:manage_transfusions';

-- Part 2: Add HR Manager permissions (full HR + payroll access)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'hr_manager', p.id, true, NULL
FROM permissions p
WHERE p.code IN (
  'dashboard.view',
  'hr.view', 'hr.dashboard',
  'hr.employees.view', 'hr.employees.create', 'hr.employees.edit', 'hr.employees.delete',
  'hr.attendance.view', 'hr.attendance.edit',
  'hr.leaves.view', 'hr.leaves.approve',
  'hr.payroll.view', 'hr.payroll.process', 'hr.payroll.approve',
  'hr.salary.view', 'hr.salary.manage',
  'hr.departments.view', 'hr.departments.manage',
  'hr.designations.view', 'hr.designations.manage',
  'hr.shifts.view', 'hr.shifts.manage',
  'hr.holidays.view', 'hr.holidays.manage',
  'patients.view'
)
ON CONFLICT DO NOTHING;

-- Part 3: Add HR Officer permissions (HR without salary/payroll)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'hr_officer', p.id, true, NULL
FROM permissions p
WHERE p.code IN (
  'dashboard.view',
  'hr.view', 'hr.dashboard',
  'hr.employees.view', 'hr.employees.create', 'hr.employees.edit',
  'hr.attendance.view', 'hr.attendance.edit',
  'hr.leaves.view',
  'hr.departments.view',
  'hr.designations.view',
  'hr.shifts.view',
  'hr.holidays.view',
  'patients.view'
)
ON CONFLICT DO NOTHING;

-- Part 4: Add Finance Manager permissions (accounts + billing)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'finance_manager', p.id, true, NULL
FROM permissions p
WHERE p.code IN (
  'dashboard.view',
  'accounts.view', 'accounts.journal', 'accounts.ledger', 'accounts.reports',
  'accounts.manage', 'accounts.create', 'accounts.edit',
  'billing.view', 'billing.create', 'billing.edit', 'billing.payments', 'billing.discounts', 'billing.reports',
  'reports.financial', 'reports.export',
  'patients.view'
)
ON CONFLICT DO NOTHING;

-- Part 5: Add OT Technician permissions
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ot_technician', p.id, true, NULL
FROM permissions p
WHERE p.code IN (
  'dashboard.view',
  'ot.view', 'ot.schedule', 'ot.manage_rooms',
  'patients.view'
)
ON CONFLICT DO NOTHING;

-- Part 6: Ensure Emergency menu items have proper permissions
UPDATE menu_items SET required_permission = 'emergency.view' WHERE code = 'emergency' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'emergency.view' WHERE code = 'er_dashboard' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'emergency.register' WHERE code = 'er_register' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'emergency.triage' WHERE code = 'er_triage' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'emergency.view' WHERE code = 'er_queue' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'emergency.view' WHERE code = 'er_queue_display' AND required_permission IS NULL;

-- Part 7: Ensure Inventory menu items have proper permissions
UPDATE menu_items SET required_permission = 'inventory.view' WHERE code = 'inventory' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.view' WHERE code = 'inventory_dashboard' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.manage' WHERE code = 'inventory_items' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.manage' WHERE code = 'inventory_categories' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.view' WHERE code = 'inventory_stock' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.purchase_orders' WHERE code = 'inventory_po' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.grn' WHERE code = 'inventory_grn' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.vendors' WHERE code = 'inventory_vendors' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.requisitions' WHERE code = 'inventory_requisitions' AND required_permission IS NULL;

-- Part 8: Ensure OT menu items have proper permissions
UPDATE menu_items SET required_permission = 'ot.view' WHERE code = 'ot' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'ot.view' WHERE code = 'ot_dashboard' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'ot.schedule' WHERE code = 'ot_schedule' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'ot.manage_rooms' WHERE code = 'ot_rooms' AND required_permission IS NULL;

-- Part 9: Ensure HR menu items have proper permissions
UPDATE menu_items SET required_permission = 'hr.view' WHERE code = 'hr' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'hr.view' WHERE code = 'hr_dashboard' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'hr.employees.view' WHERE code = 'hr_employees' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'hr.attendance.view' WHERE code = 'hr_attendance' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'hr.leaves.view' WHERE code = 'hr_leaves' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'hr.payroll.view' WHERE code = 'hr_payroll' AND required_permission IS NULL;

-- Part 10: Ensure Accounts menu items have proper permissions
UPDATE menu_items SET required_permission = 'accounts.view' WHERE code = 'accounts' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'accounts.view' WHERE code = 'accounts_dashboard' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'accounts.view' WHERE code = 'accounts_coa' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'accounts.journal' WHERE code = 'accounts_journal' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'accounts.ledger' WHERE code = 'accounts_ledger' AND required_permission IS NULL;
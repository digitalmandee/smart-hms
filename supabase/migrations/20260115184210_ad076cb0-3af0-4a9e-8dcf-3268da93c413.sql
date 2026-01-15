-- =====================================================
-- COMPREHENSIVE ROLE PERMISSIONS & MENU FIX MIGRATION
-- =====================================================

-- Part 1: Fix Pharmacy menu path mismatches
UPDATE public.menu_items SET path = '/app/pharmacy/queue' WHERE path = '/app/pharmacy/prescriptions';
UPDATE public.menu_items SET path = '/app/pharmacy/pos/transactions' WHERE path = '/app/pharmacy/transactions';
UPDATE public.menu_items SET path = '/app/pharmacy/pos/sessions' WHERE path = '/app/pharmacy/sessions';

-- Part 2: Grant ALL module permissions to Super Admin, Org Admin, Branch Admin
-- Super Admin permissions (full access to everything)
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'super_admin', p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  -- Dashboard
  'dashboard.view',
  -- Accounts
  'accounts.view', 'accounts.journal', 'accounts.ledger', 'accounts.reports',
  -- Billing
  'billing.view', 'billing.create', 'billing.edit', 'billing.payments', 'billing.discounts', 'billing.refunds', 'billing.reports',
  -- Blood Bank
  'blood_bank.view', 'blood_bank.donors.manage', 'blood_bank.donations.manage', 'blood_bank.inventory.manage',
  'blood_bank.requests.manage', 'blood_bank.cross_match', 'blood_bank.transfusions.manage',
  -- Emergency
  'emergency.view', 'emergency.register', 'emergency.triage', 'emergency.treat',
  -- HR
  'hr.view', 'hr.dashboard', 'hr.employees.view', 'hr.employees.create', 'hr.employees.edit', 'hr.employees.delete',
  'hr.attendance.view', 'hr.attendance.edit', 'hr.leaves.view', 'hr.leaves.approve',
  'hr.payroll.view', 'hr.payroll.process', 'hr.payroll.approve', 'hr.salary.view', 'hr.salary.manage',
  'hr.setup.departments', 'hr.setup.designations', 'hr.setup.shifts', 'hr.setup.leave_types', 'hr.setup.holidays',
  -- Inventory
  'inventory.view', 'inventory.manage', 'inventory.po', 'inventory.grn', 'inventory.requisitions',
  -- IPD
  'ipd.view', 'ipd.dashboard', 'ipd.admissions.view', 'ipd.admissions.create', 'ipd.admissions.edit',
  'ipd.beds.view', 'ipd.beds.manage', 'ipd.wards.view', 'ipd.wards.manage',
  'ipd.nursing.view', 'ipd.nursing.manage', 'ipd.vitals.view', 'ipd.vitals.manage',
  'ipd.emar.view', 'ipd.emar.manage', 'ipd.medications.view', 'ipd.medications.manage',
  'ipd.rounds.view', 'ipd.rounds.manage', 'ipd.diet.view', 'ipd.diet.manage',
  'ipd.discharge.view', 'ipd.discharge.initiate', 'ipd.discharge.approve',
  -- Laboratory
  'laboratory.view', 'laboratory.orders', 'laboratory.results', 'laboratory.reports',
  -- OPD
  'opd.view', 'opd.consultation',
  -- OT
  'ot:view', 'ot:schedule', 'ot:manage_rooms', 'ot:start_surgery', 'ot:anesthesia', 'ot:pacu',
  -- Patients
  'patients.view', 'patients.create', 'patients.edit', 'patients.delete',
  -- Pharmacy
  'pharmacy.view', 'pharmacy.dispense', 'pharmacy.inventory', 'pharmacy.pos', 'pharmacy.pos.sessions', 'pharmacy.reports',
  -- Radiology
  'radiology.view', 'radiology.orders.view', 'radiology.orders.manage', 'radiology.capture', 'radiology.report', 'radiology.verify',
  -- Reception
  'reception.view',
  -- Reports
  'reports.view', 'reports.financial', 'reports.clinical', 'reports.export',
  -- Settings
  'settings.view', 'settings.organization', 'settings.branches', 'settings.users', 'settings.roles'
)
ON CONFLICT DO NOTHING;

-- Org Admin permissions (everything except super_admin specific)
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'org_admin', p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  'dashboard.view',
  'accounts.view', 'accounts.journal', 'accounts.ledger', 'accounts.reports',
  'billing.view', 'billing.create', 'billing.edit', 'billing.payments', 'billing.discounts', 'billing.refunds', 'billing.reports',
  'blood_bank.view', 'blood_bank.donors.manage', 'blood_bank.donations.manage', 'blood_bank.inventory.manage',
  'blood_bank.requests.manage', 'blood_bank.cross_match', 'blood_bank.transfusions.manage',
  'emergency.view', 'emergency.register', 'emergency.triage', 'emergency.treat',
  'hr.view', 'hr.dashboard', 'hr.employees.view', 'hr.employees.create', 'hr.employees.edit', 'hr.employees.delete',
  'hr.attendance.view', 'hr.attendance.edit', 'hr.leaves.view', 'hr.leaves.approve',
  'hr.payroll.view', 'hr.payroll.process', 'hr.payroll.approve', 'hr.salary.view', 'hr.salary.manage',
  'hr.setup.departments', 'hr.setup.designations', 'hr.setup.shifts', 'hr.setup.leave_types', 'hr.setup.holidays',
  'inventory.view', 'inventory.manage', 'inventory.po', 'inventory.grn', 'inventory.requisitions',
  'ipd.view', 'ipd.dashboard', 'ipd.admissions.view', 'ipd.admissions.create', 'ipd.admissions.edit',
  'ipd.beds.view', 'ipd.beds.manage', 'ipd.wards.view', 'ipd.wards.manage',
  'ipd.nursing.view', 'ipd.nursing.manage', 'ipd.vitals.view', 'ipd.vitals.manage',
  'ipd.emar.view', 'ipd.emar.manage', 'ipd.medications.view', 'ipd.medications.manage',
  'ipd.rounds.view', 'ipd.rounds.manage', 'ipd.diet.view', 'ipd.diet.manage',
  'ipd.discharge.view', 'ipd.discharge.initiate', 'ipd.discharge.approve',
  'laboratory.view', 'laboratory.orders', 'laboratory.results', 'laboratory.reports',
  'opd.view', 'opd.consultation',
  'ot:view', 'ot:schedule', 'ot:manage_rooms', 'ot:start_surgery', 'ot:anesthesia', 'ot:pacu',
  'patients.view', 'patients.create', 'patients.edit', 'patients.delete',
  'pharmacy.view', 'pharmacy.dispense', 'pharmacy.inventory', 'pharmacy.pos', 'pharmacy.pos.sessions', 'pharmacy.reports',
  'radiology.view', 'radiology.orders.view', 'radiology.orders.manage', 'radiology.capture', 'radiology.report', 'radiology.verify',
  'reception.view',
  'reports.view', 'reports.financial', 'reports.clinical', 'reports.export',
  'settings.view', 'settings.organization', 'settings.branches', 'settings.users', 'settings.roles'
)
ON CONFLICT DO NOTHING;

-- Branch Admin permissions (similar to org_admin but scoped to branch)
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'branch_admin', p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  'dashboard.view',
  'accounts.view', 'accounts.journal', 'accounts.ledger', 'accounts.reports',
  'billing.view', 'billing.create', 'billing.edit', 'billing.payments', 'billing.discounts', 'billing.reports',
  'blood_bank.view', 'blood_bank.donors.manage', 'blood_bank.donations.manage', 'blood_bank.inventory.manage',
  'blood_bank.requests.manage', 'blood_bank.cross_match', 'blood_bank.transfusions.manage',
  'emergency.view', 'emergency.register', 'emergency.triage', 'emergency.treat',
  'hr.view', 'hr.dashboard', 'hr.employees.view', 'hr.employees.create', 'hr.employees.edit',
  'hr.attendance.view', 'hr.attendance.edit', 'hr.leaves.view', 'hr.leaves.approve',
  'hr.setup.departments', 'hr.setup.designations', 'hr.setup.shifts',
  'inventory.view', 'inventory.manage', 'inventory.po', 'inventory.grn', 'inventory.requisitions',
  'ipd.view', 'ipd.dashboard', 'ipd.admissions.view', 'ipd.admissions.create', 'ipd.admissions.edit',
  'ipd.beds.view', 'ipd.beds.manage', 'ipd.wards.view', 'ipd.wards.manage',
  'ipd.nursing.view', 'ipd.nursing.manage', 'ipd.vitals.view', 'ipd.vitals.manage',
  'ipd.emar.view', 'ipd.emar.manage', 'ipd.medications.view', 'ipd.medications.manage',
  'ipd.rounds.view', 'ipd.rounds.manage', 'ipd.diet.view', 'ipd.diet.manage',
  'ipd.discharge.view', 'ipd.discharge.initiate', 'ipd.discharge.approve',
  'laboratory.view', 'laboratory.orders', 'laboratory.results', 'laboratory.reports',
  'opd.view', 'opd.consultation',
  'ot:view', 'ot:schedule', 'ot:manage_rooms', 'ot:start_surgery', 'ot:anesthesia', 'ot:pacu',
  'patients.view', 'patients.create', 'patients.edit',
  'pharmacy.view', 'pharmacy.dispense', 'pharmacy.inventory', 'pharmacy.pos', 'pharmacy.pos.sessions', 'pharmacy.reports',
  'radiology.view', 'radiology.orders.view', 'radiology.orders.manage', 'radiology.capture', 'radiology.report', 'radiology.verify',
  'reception.view',
  'reports.view', 'reports.financial', 'reports.clinical', 'reports.export',
  'settings.view', 'settings.branches', 'settings.users'
)
ON CONFLICT DO NOTHING;

-- Part 3: Grant OT Technician permissions
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ot_technician', p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  'dashboard.view',
  'ot:view', 'ot:schedule', 'ot:manage_rooms', 'ot:start_surgery', 'ot:anesthesia', 'ot:pacu',
  'patients.view'
)
ON CONFLICT DO NOTHING;

-- Part 4: Grant Store Manager permissions
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'store_manager', p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  'dashboard.view',
  'inventory.view', 'inventory.manage', 'inventory.po', 'inventory.grn', 'inventory.requisitions',
  'pharmacy.inventory',
  'reports.view'
)
ON CONFLICT DO NOTHING;

-- Part 5: Grant IPD Nurse permissions
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ipd_nurse', p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  'dashboard.view',
  'ipd.view', 'ipd.dashboard', 'ipd.admissions.view',
  'ipd.nursing.view', 'ipd.nursing.manage',
  'ipd.vitals.view', 'ipd.vitals.manage',
  'ipd.emar.view', 'ipd.emar.manage',
  'ipd.medications.view',
  'ipd.rounds.view',
  'ipd.diet.view',
  'patients.view'
)
ON CONFLICT DO NOTHING;

-- Part 6: Grant Radiology Technician permissions
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'radiology_technician', p.id, true, NULL
FROM public.permissions p
WHERE p.code IN (
  'dashboard.view',
  'radiology.view', 'radiology.orders.view', 'radiology.orders.manage', 'radiology.capture',
  'patients.view'
)
ON CONFLICT DO NOTHING;

-- Part 7: Ensure menu items have proper required_permission values
-- Emergency menu items
UPDATE public.menu_items SET required_permission = 'emergency.view' WHERE code = 'er_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'emergency.register' WHERE code = 'er_register' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'emergency.triage' WHERE code = 'er_triage' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'emergency.view' WHERE code = 'er_queue' AND required_permission IS NULL;

-- Inventory menu items
UPDATE public.menu_items SET required_permission = 'inventory.view' WHERE code = 'inventory_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'inventory.manage' WHERE code = 'inventory_items' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'inventory.po' WHERE code = 'inventory_po' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'inventory.grn' WHERE code = 'inventory_grn' AND required_permission IS NULL;

-- OT menu items
UPDATE public.menu_items SET required_permission = 'ot:view' WHERE code = 'ot_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'ot:schedule' WHERE code = 'ot_schedule' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'ot:manage_rooms' WHERE code = 'ot_rooms' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'ot:pacu' WHERE code = 'ot_pacu' AND required_permission IS NULL;

-- HR menu items
UPDATE public.menu_items SET required_permission = 'hr.view' WHERE code = 'hr_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'hr.employees.view' WHERE code = 'hr_employees' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'hr.attendance.view' WHERE code = 'hr_attendance' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'hr.leaves.view' WHERE code = 'hr_leaves' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'hr.payroll.view' WHERE code = 'hr_payroll' AND required_permission IS NULL;

-- Accounts menu items
UPDATE public.menu_items SET required_permission = 'accounts.view' WHERE code = 'accounts_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'accounts.journal' WHERE code = 'accounts_journal' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'accounts.ledger' WHERE code = 'accounts_ledger' AND required_permission IS NULL;

-- Pharmacy menu items (ensure POS is accessible to admins)
UPDATE public.menu_items SET required_permission = 'pharmacy.pos' WHERE code = 'pharmacy_pos' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'pharmacy.pos.sessions' WHERE code = 'pharmacy_sessions' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'pharmacy.pos' WHERE code = 'pharmacy_transactions' AND required_permission IS NULL;

-- Blood Bank menu items (fix any remaining colon format issues)
UPDATE public.menu_items SET required_permission = 'blood_bank.view' WHERE required_permission LIKE 'blood_bank:%';
UPDATE public.menu_items SET required_permission = 'blood_bank.donors.manage' WHERE code LIKE '%donor%' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'blood_bank.donations.manage' WHERE code LIKE '%donation%' AND required_permission IS NULL;

-- Radiology menu items
UPDATE public.menu_items SET required_permission = 'radiology.view' WHERE code = 'radiology_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'radiology.orders.view' WHERE code = 'radiology_orders' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'radiology.capture' WHERE code = 'radiology_worklist' AND required_permission IS NULL;

-- IPD menu items
UPDATE public.menu_items SET required_permission = 'ipd.view' WHERE code = 'ipd_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'ipd.admissions.view' WHERE code = 'ipd_admissions' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'ipd.beds.view' WHERE code = 'ipd_beds' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'ipd.nursing.view' WHERE code = 'ipd_nursing' AND required_permission IS NULL;

-- Laboratory menu items
UPDATE public.menu_items SET required_permission = 'laboratory.view' WHERE code = 'lab_dashboard' AND required_permission IS NULL;
UPDATE public.menu_items SET required_permission = 'laboratory.orders' WHERE code = 'lab_queue' AND required_permission IS NULL;
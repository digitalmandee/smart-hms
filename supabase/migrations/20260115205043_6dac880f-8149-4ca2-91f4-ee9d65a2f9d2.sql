-- Phase 1: Fix Menu Item Path Mismatches
UPDATE menu_items SET path = '/app/ipd/rounds' WHERE path = '/app/ipd/care/rounds';
UPDATE menu_items SET path = '/app/ipd/discharges' WHERE path = '/app/ipd/discharge';
UPDATE menu_items SET path = '/app/ipd/wards' WHERE path = '/app/ipd/setup/wards';
UPDATE menu_items SET path = '/app/ipd/beds' WHERE path = '/app/ipd/setup/beds';
UPDATE menu_items SET path = '/app/ipd/housekeeping' WHERE path = '/app/ipd/beds/housekeeping';
UPDATE menu_items SET path = '/app/pharmacy/inventory/add' WHERE path = '/app/pharmacy/stock-entry';
UPDATE menu_items SET path = '/app/lab/queue' WHERE path = '/app/lab/orders';

-- Phase 2: Disable Menu Items Without Pages
UPDATE menu_items SET is_active = false WHERE path IN (
  '/app/hr/attendance/biometric',
  '/app/hr/attendance/corrections',
  '/app/hr/attendance/reports',
  '/app/hr/employees/directory',
  '/app/hr/leaves/approvals',
  '/app/hr/leaves/balances',
  '/app/hr/leaves/calendar',
  '/app/hr/payroll/loans',
  '/app/hr/payroll/process',
  '/app/hr/payroll/reports',
  '/app/hr/payroll/salaries',
  '/app/hr/payroll/slips',
  '/app/hr/reports',
  '/app/hr/setup/salary-components',
  '/app/hr/setup/tax-slabs',
  '/app/ipd/beds/wards',
  '/app/ipd/beds/transfers',
  '/app/ipd/care/vitals',
  '/app/ipd/care/nursing',
  '/app/ipd/care/emar',
  '/app/ipd/care/medications',
  '/app/ipd/care/plans',
  '/app/ipd/care/diet',
  '/app/ipd/charges',
  '/app/ipd/discharge/billing',
  '/app/ipd/discharge/summaries',
  '/app/ipd/admissions/history',
  '/app/ipd/reports',
  '/app/ipd/setup/diet-types',
  '/app/accounts/journal-entries',
  '/app/accounts/ledger',
  '/app/appointments/schedule',
  '/app/reports',
  '/app/reports/financial',
  '/app/reports/patients'
);

-- Phase 3: Add Missing Permissions to Accounts Menu Items
UPDATE menu_items SET required_permission = 'accounts.view' WHERE code = 'chart_of_accounts' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'accounts.view' WHERE code = 'journal_entries' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'accounts.view' WHERE code = 'general_ledger' AND required_permission IS NULL;

-- Phase 4: Fix Inventory Menu Items Missing Permissions
UPDATE menu_items SET required_permission = 'inventory.po.view' WHERE code = 'inventory_pos' AND required_permission IS NULL;
UPDATE menu_items SET required_permission = 'inventory.view' WHERE code = 'inventory_reports' AND required_permission IS NULL;
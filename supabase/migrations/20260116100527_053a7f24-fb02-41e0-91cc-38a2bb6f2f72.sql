-- Complete Accounts & Finance Module Enhancement Migration - Fixed
-- Phase 1: Seed Hospital-Specific Account Types (25+ types)

INSERT INTO account_types (organization_id, code, name, category, is_debit_normal, sort_order, is_system)
SELECT 
  o.id,
  t.code,
  t.name,
  t.category::text,
  t.is_debit_normal,
  t.sort_order,
  true
FROM organizations o
CROSS JOIN (VALUES
  -- Asset Types
  ('CASH_BANK', 'Cash & Bank', 'asset', true, 100),
  ('RECEIVABLES', 'Accounts Receivable', 'asset', true, 110),
  ('PATIENT_RECV', 'Patient Receivables', 'asset', true, 120),
  ('INSURANCE_RECV', 'Insurance Receivables', 'asset', true, 130),
  ('INVENTORY', 'Inventory', 'asset', true, 140),
  ('MEDICAL_EQUIPMENT', 'Medical Equipment', 'asset', true, 150),
  ('FIXED_ASSETS', 'Fixed Assets', 'asset', true, 160),
  ('PREPAID_EXPENSES', 'Prepaid Expenses', 'asset', true, 170),
  -- Liability Types
  ('PAYABLES', 'Accounts Payable', 'liability', false, 200),
  ('VENDOR_PAYABLES', 'Vendor Payables', 'liability', false, 210),
  ('TAX_LIABILITIES', 'Tax Liabilities', 'liability', false, 220),
  ('ACCRUED_EXPENSES', 'Accrued Expenses', 'liability', false, 230),
  ('LOANS_PAYABLE', 'Loans Payable', 'liability', false, 240),
  ('DEFERRED_REVENUE', 'Deferred Revenue', 'liability', false, 250),
  -- Equity Types
  ('OWNERS_EQUITY', 'Owner''s Equity', 'equity', false, 300),
  ('RETAINED_EARNINGS', 'Retained Earnings', 'equity', false, 310),
  ('CAPITAL_CONTRIBUTIONS', 'Capital Contributions', 'equity', false, 320),
  -- Revenue Types
  ('PATIENT_SERVICES', 'Patient Services Revenue', 'revenue', false, 400),
  ('INSURANCE_PAYMENTS', 'Insurance Payments', 'revenue', false, 410),
  ('PHARMACY_SALES', 'Pharmacy Sales', 'revenue', false, 420),
  ('LAB_REVENUE', 'Laboratory Revenue', 'revenue', false, 430),
  ('RADIOLOGY_REVENUE', 'Radiology Revenue', 'revenue', false, 440),
  ('IPD_REVENUE', 'IPD Revenue', 'revenue', false, 450),
  ('OT_REVENUE', 'Operation Theatre Revenue', 'revenue', false, 460),
  ('OTHER_MEDICAL', 'Other Medical Services', 'revenue', false, 470),
  ('GOVT_SUBSIDIES', 'Government Subsidies', 'revenue', false, 480),
  -- Expense Types
  ('SALARIES_WAGES', 'Salaries & Wages', 'expense', true, 500),
  ('MEDICAL_SUPPLIES', 'Medical Supplies Expense', 'expense', true, 510),
  ('PHARMACY_PURCHASES', 'Pharmacy Purchases', 'expense', true, 520),
  ('LAB_SUPPLIES', 'Laboratory Supplies', 'expense', true, 530),
  ('UTILITIES', 'Utilities', 'expense', true, 540),
  ('RENT_MAINTENANCE', 'Rent & Maintenance', 'expense', true, 550),
  ('DEPRECIATION', 'Depreciation', 'expense', true, 560),
  ('INSURANCE_EXPENSE', 'Insurance Expense', 'expense', true, 570),
  ('ADMINISTRATIVE', 'Administrative Expenses', 'expense', true, 580)
) AS t(code, name, category, is_debit_normal, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM account_types at 
  WHERE at.organization_id = o.id AND at.code = t.code
);

-- Phase 2: Add New Permissions for Accounts Module
INSERT INTO permissions (code, name, module, description) VALUES
('accounts.receivables', 'Manage Receivables', 'accounts', 'View and manage accounts receivable'),
('accounts.payables', 'Manage Payables', 'accounts', 'View and manage accounts payable'),
('accounts.bank', 'Manage Bank Accounts', 'accounts', 'Manage bank accounts and reconciliation'),
('accounts.budgets', 'Manage Budgets', 'accounts', 'Manage budgets and fiscal years'),
('accounts.settings', 'Account Settings', 'accounts', 'Manage account types and categories'),
('accounts.journal', 'Manage Journal Entries', 'accounts', 'Create and post journal entries'),
('accounts.reports', 'View Financial Reports', 'accounts', 'Access financial reports and statements')
ON CONFLICT (code) DO NOTHING;

-- Phase 3: Add New Menu Items for Accounts Module
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'accounts_receivable', 'Accounts Receivable', 'Receipt', '/app/accounts/receivables',
  id, 60, 'accounts.receivables', true
FROM menu_items WHERE code = 'accounts'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'accounts_payable', 'Accounts Payable', 'CreditCard', '/app/accounts/payables',
  id, 70, 'accounts.payables', true
FROM menu_items WHERE code = 'accounts'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'bank_accounts', 'Bank & Cash', 'Building2', '/app/accounts/bank-accounts',
  id, 80, 'accounts.bank', true
FROM menu_items WHERE code = 'accounts'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'budgets_fiscal', 'Budgets & Fiscal Years', 'PiggyBank', '/app/accounts/budgets',
  id, 90, 'accounts.budgets', true
FROM menu_items WHERE code = 'accounts'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'account_settings', 'Account Settings', 'Settings', '/app/accounts/settings',
  id, 100, 'accounts.settings', true
FROM menu_items WHERE code = 'accounts'
ON CONFLICT (code) DO NOTHING;

-- Activate journal_entries and general_ledger menu items
UPDATE menu_items SET is_active = true WHERE code IN ('journal_entries', 'general_ledger');

-- Fix general_ledger path to match route
UPDATE menu_items SET path = '/app/accounts/ledger' WHERE code = 'general_ledger';

-- Update journal entries menu item path
UPDATE menu_items SET path = '/app/accounts/journal-entries' WHERE code = 'journal_entries';

-- Phase 4: Assign new permissions to admin roles
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT role::app_role, p.id, true, NULL
FROM permissions p
CROSS JOIN (VALUES ('super_admin'), ('org_admin'), ('branch_admin')) AS r(role)
WHERE p.code IN ('accounts.receivables', 'accounts.payables', 'accounts.bank', 'accounts.budgets', 'accounts.settings', 'accounts.journal', 'accounts.reports')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Assign to accountant and finance_manager roles
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT role::app_role, p.id, true, NULL
FROM permissions p
CROSS JOIN (VALUES ('accountant'), ('finance_manager')) AS r(role)
WHERE p.code IN ('accounts.receivables', 'accounts.payables', 'accounts.bank', 'accounts.budgets', 'accounts.journal', 'accounts.reports')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;
-- ==============================================
-- SEED: Chart of Accounts for all organizations
-- ==============================================

-- First, create Account Types for each organization that doesn't have them
INSERT INTO public.account_types (organization_id, code, name, category, is_debit_normal, is_system, sort_order)
SELECT o.id, 'AST', 'Assets', 'asset', true, true, 1
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM account_types at WHERE at.organization_id = o.id AND at.code = 'AST')
ON CONFLICT DO NOTHING;

INSERT INTO public.account_types (organization_id, code, name, category, is_debit_normal, is_system, sort_order)
SELECT o.id, 'LIA', 'Liabilities', 'liability', false, true, 2
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM account_types at WHERE at.organization_id = o.id AND at.code = 'LIA')
ON CONFLICT DO NOTHING;

INSERT INTO public.account_types (organization_id, code, name, category, is_debit_normal, is_system, sort_order)
SELECT o.id, 'EQU', 'Equity', 'equity', false, true, 3
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM account_types at WHERE at.organization_id = o.id AND at.code = 'EQU')
ON CONFLICT DO NOTHING;

INSERT INTO public.account_types (organization_id, code, name, category, is_debit_normal, is_system, sort_order)
SELECT o.id, 'REV', 'Revenue', 'revenue', false, true, 4
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM account_types at WHERE at.organization_id = o.id AND at.code = 'REV')
ON CONFLICT DO NOTHING;

INSERT INTO public.account_types (organization_id, code, name, category, is_debit_normal, is_system, sort_order)
SELECT o.id, 'EXP', 'Expenses', 'expense', true, true, 5
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM account_types at WHERE at.organization_id = o.id AND at.code = 'EXP')
ON CONFLICT DO NOTHING;

-- Now create the Chart of Accounts for each organization
-- ASSETS (1000 series)
INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '1000',
  'Cash in Hand',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  true,
  true,
  50000,
  65000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '1000')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '1010',
  'Bank Account - Current',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  true,
  true,
  500000,
  725000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '1010')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '1020',
  'Bank Account - Savings',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  true,
  true,
  200000,
  200000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '1020')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  'AR-001',
  'Accounts Receivable',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  true,
  true,
  150000,
  185000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = 'AR-001')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  'INV-001',
  'Inventory - Medicines',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  true,
  true,
  300000,
  350000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = 'INV-001')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '1300',
  'Prepaid Expenses',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  false,
  true,
  25000,
  20000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '1300')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '1400',
  'Fixed Assets - Equipment',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  false,
  true,
  1000000,
  950000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '1400')
ON CONFLICT DO NOTHING;

-- LIABILITIES (2000 series)
INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  'AP-001',
  'Accounts Payable',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'LIA' LIMIT 1),
  true,
  true,
  100000,
  125000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = 'AP-001')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '2100',
  'Accrued Expenses',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'LIA' LIMIT 1),
  false,
  true,
  30000,
  35000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '2100')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '2200',
  'Tax Payable',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'LIA' LIMIT 1),
  false,
  true,
  15000,
  22000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '2200')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '2300',
  'Salaries Payable',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'LIA' LIMIT 1),
  false,
  true,
  0,
  80000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '2300')
ON CONFLICT DO NOTHING;

-- EQUITY (3000 series)
INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '3000',
  'Owner''s Capital',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EQU' LIMIT 1),
  true,
  true,
  2000000,
  2000000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '3000')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '3100',
  'Retained Earnings',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EQU' LIMIT 1),
  true,
  true,
  80000,
  213000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '3100')
ON CONFLICT DO NOTHING;

-- REVENUE (4000 series)
INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  'REV-001',
  'Service Revenue - OPD',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'REV' LIMIT 1),
  true,
  true,
  0,
  450000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = 'REV-001')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '4010',
  'Service Revenue - IPD',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'REV' LIMIT 1),
  false,
  true,
  0,
  280000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '4010')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '4020',
  'Service Revenue - Emergency',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'REV' LIMIT 1),
  false,
  true,
  0,
  95000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '4020')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  'REV-PHARM-001',
  'Pharmacy Sales Revenue',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'REV' LIMIT 1),
  true,
  true,
  0,
  320000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = 'REV-PHARM-001')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '4200',
  'Laboratory Revenue',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'REV' LIMIT 1),
  false,
  true,
  0,
  175000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '4200')
ON CONFLICT DO NOTHING;

-- EXPENSES (5000 series)
INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '5000',
  'Salaries & Wages',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EXP' LIMIT 1),
  false,
  true,
  0,
  420000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '5000')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '5100',
  'Cost of Medicines Sold',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EXP' LIMIT 1),
  false,
  true,
  0,
  180000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '5100')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '5200',
  'Utilities',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EXP' LIMIT 1),
  false,
  true,
  0,
  45000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '5200')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '5300',
  'Rent & Maintenance',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EXP' LIMIT 1),
  false,
  true,
  0,
  120000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '5300')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '5400',
  'Medical Supplies',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EXP' LIMIT 1),
  false,
  true,
  0,
  85000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '5400')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  '5500',
  'Administrative Expenses',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'EXP' LIMIT 1),
  false,
  true,
  0,
  35000
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = '5500')
ON CONFLICT DO NOTHING;

INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, is_active, opening_balance, current_balance)
SELECT 
  o.id,
  'CASH-001',
  'Petty Cash',
  (SELECT id FROM account_types WHERE organization_id = o.id AND code = 'AST' LIMIT 1),
  true,
  true,
  10000,
  8500
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.organization_id = o.id AND a.account_number = 'CASH-001')
ON CONFLICT DO NOTHING;
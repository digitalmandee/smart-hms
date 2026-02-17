
-- Fix A: Re-parent 7 IPD care children to the active parent (ipd.care = 507a300b)
UPDATE menu_items SET parent_id = '507a300b-8b07-4996-86ca-464be762120d' 
WHERE id IN (
  '61ecf02b-da22-4d47-8f6e-8b20533fd279',
  '3de77354-3b0f-419d-acf0-7966be1eb129',
  '3660cfac-d83d-411c-808c-cda9b67093f7',
  'c099472c-89b8-49f8-b36e-1ac631dcca06',
  '24f95e28-c70c-4fd6-a68c-dcf6e9d089b3',
  '355e6610-d6b6-4ad2-9c69-2f1b79ce3596',
  '1a729274-95ae-444a-8f53-29ad05eb701b'
);

-- Fix B: Insert 3 children under IPD Records (46d4a867)
INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
VALUES 
  ('ipd.records.births', 'Birth Records', '/app/ipd/birth-records', '46d4a867-9664-460a-8c97-cce2bca4a800', 1, 'ipd', true, 'Baby'),
  ('ipd.records.deaths', 'Death Records', '/app/ipd/death-records', '46d4a867-9664-460a-8c97-cce2bca4a800', 2, 'ipd', true, 'FileX'),
  ('ipd.records.reports', 'IPD Reports', '/app/ipd/reports', '46d4a867-9664-460a-8c97-cce2bca4a800', 3, 'ipd', true, 'BarChart3')
ON CONFLICT DO NOTHING;

-- Fix C: Add Nursing Station under ipd.care
INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
VALUES ('ipd.care.nursing-station', 'Nursing Station', '/app/ipd/nursing', '507a300b-8b07-4996-86ca-464be762120d', 8, 'ipd', true, 'Stethoscope')
ON CONFLICT DO NOTHING;

-- Fix D: Add Billing Insurance & Claims submenu
INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
VALUES 
  ('billing.insurance', 'Insurance & Claims', NULL, '778ba27e-7311-458e-baf8-187197fddb49', 10, NULL, true, 'ShieldCheck'),
  ('billing.daily-closing', 'Daily Closing', '/app/billing/daily-closing', '778ba27e-7311-458e-baf8-187197fddb49', 20, NULL, true, 'CalendarCheck')
ON CONFLICT DO NOTHING;

-- Get the insurance parent id for children (use a subquery approach)
INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
SELECT 'billing.insurance.companies', 'Insurance Companies', '/app/billing/insurance/companies', id, 1, NULL, true, 'Building2'
FROM menu_items WHERE code = 'billing.insurance'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
SELECT 'billing.insurance.plans', 'Insurance Plans', '/app/billing/insurance/plans', id, 2, NULL, true, 'FileText'
FROM menu_items WHERE code = 'billing.insurance'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
SELECT 'billing.insurance.claims', 'Claims', '/app/billing/claims', id, 3, NULL, true, 'ClipboardList'
FROM menu_items WHERE code = 'billing.insurance'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
SELECT 'billing.insurance.claims-report', 'Claims Report', '/app/billing/claims-report', id, 4, NULL, true, 'BarChart3'
FROM menu_items WHERE code = 'billing.insurance'
ON CONFLICT DO NOTHING;

-- Fix E: Add missing Accounts menu items
INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon)
VALUES 
  ('accounts_coa', 'Chart of Accounts', '/app/accounts/chart-of-accounts', '4e72e3f0-bba0-480b-adb6-2418f606df08', 20, NULL, true, 'BookOpen'),
  ('accounts_types', 'Account Types', '/app/accounts/types', '4e72e3f0-bba0-480b-adb6-2418f606df08', 25, NULL, true, 'Layers'),
  ('accounts_journal', 'Journal Entries', '/app/accounts/journal-entries', '4e72e3f0-bba0-480b-adb6-2418f606df08', 30, NULL, true, 'FileText'),
  ('accounts_ledger', 'General Ledger', '/app/accounts/ledger', '4e72e3f0-bba0-480b-adb6-2418f606df08', 35, NULL, true, 'BookOpen'),
  ('accounts_bank', 'Bank & Cash', '/app/accounts/bank-accounts', '4e72e3f0-bba0-480b-adb6-2418f606df08', 40, NULL, true, 'Landmark'),
  ('accounts_budgets', 'Budgets', '/app/accounts/budgets', '4e72e3f0-bba0-480b-adb6-2418f606df08', 45, NULL, true, 'PiggyBank'),
  ('accounts_reports', 'Financial Reports', '/app/accounts/reports', '4e72e3f0-bba0-480b-adb6-2418f606df08', 50, NULL, true, 'BarChart3'),
  ('accounts_vendor_payments', 'Vendor Payments', '/app/accounts/vendor-payments', '4e72e3f0-bba0-480b-adb6-2418f606df08', 55, NULL, true, 'CreditCard')
ON CONFLICT DO NOTHING;

-- Fix G: Update OPD required_module to 'opd' where NULL
UPDATE menu_items SET required_module = 'opd' 
WHERE code IN ('opd', 'opd.doctor_dashboard', 'opd.nurse_station', 'opd.consultations')
AND required_module IS NULL;

-- Add OPD Admin Dashboard menu item
INSERT INTO menu_items (code, name, path, parent_id, sort_order, required_module, is_active, icon, required_permission)
VALUES ('opd.admin_dashboard', 'OPD Dashboard', '/app/opd/admin-dashboard', '1988dc16-98fc-4cb6-9146-c05fe8abaf36', 1, 'opd', true, 'LayoutDashboard', NULL)
ON CONFLICT DO NOTHING;

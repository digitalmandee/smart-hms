DO $$
DECLARE
  v_accounts_id UUID := '4e72e3f0-bba0-480b-adb6-2418f606df08';
  v_operations_id UUID;
  v_assets_id UUID;
  v_reports_id UUID;
  v_compliance_id UUID;
  v_existing_fr_id UUID;
  v_existing_at_id UUID;
  v_existing_ar_id UUID;
  v_existing_ap_id UUID;
  v_existing_vp_id UUID;
  v_existing_bank_id UUID;
  v_existing_budgets_id UUID;
  v_existing_expenses_id UUID;
BEGIN
  -- 1. Create the 4 new group containers (no path = headers)
  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('accounts_operations', 'Operations', 'Briefcase', NULL, v_accounts_id, 100, 'accounts.view', true)
  ON CONFLICT (code) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_operations_id;

  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('accounts_assets_budgets', 'Assets & Budgets', 'Package', NULL, v_accounts_id, 200, 'accounts.view', true)
  ON CONFLICT (code) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_assets_id;

  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('accounts_reports_group', 'Reports', 'BarChart3', NULL, v_accounts_id, 300, 'accounts.view', true)
  ON CONFLICT (code) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_reports_id;

  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('accounts_compliance', 'Compliance', 'ShieldCheck', NULL, v_accounts_id, 400, 'accounts.view', true)
  ON CONFLICT (code) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_compliance_id;

  -- 2. Move existing items under Operations group
  UPDATE public.menu_items SET parent_id = v_operations_id, sort_order = 10 WHERE code = 'accounts_payable';
  UPDATE public.menu_items SET parent_id = v_operations_id, sort_order = 20 WHERE code = 'accounts_receivable';
  UPDATE public.menu_items SET parent_id = v_operations_id, sort_order = 30 WHERE code = 'accounts_vendor_payments';
  UPDATE public.menu_items SET parent_id = v_operations_id, sort_order = 60 WHERE code = 'bank_accounts';

  -- 3. Move existing 'Budgets & Fiscal Years' under Assets & Budgets
  UPDATE public.menu_items SET parent_id = v_assets_id, sort_order = 30 WHERE code = 'budgets_fiscal';

  -- 4. Move/repoint old 'Financial Reports' top-level under Reports group, rename as hub
  UPDATE public.menu_items
    SET parent_id = v_reports_id, sort_order = 5, name = 'Reports Hub'
    WHERE id = '33b40ddd-6093-4a25-b5d3-bcb41d07206f';

  -- 5. Move Account Types under Compliance
  UPDATE public.menu_items SET parent_id = v_compliance_id, sort_order = 20 WHERE code = 'account_settings';

  -- 6. Insert NEW menu items (idempotent via code uniqueness)
  -- Operations children
  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active) VALUES
    ('accounts_vendor_statement', 'Vendor Statement', 'FileText', '/app/accounts/vendor-statement', v_operations_id, 35, 'accounts.payables', true),
    ('accounts_patient_deposits', 'Patient Deposits', 'Wallet', '/app/accounts/patient-deposits', v_operations_id, 40, 'accounts.receivables', true),
    ('accounts_credit_notes', 'Credit Notes', 'FileMinus', '/app/accounts/credit-notes', v_operations_id, 45, 'accounts.receivables', true),
    ('accounts_expense_management', 'Expense Management', 'Receipt', '/app/accounts/expenses', v_operations_id, 50, 'accounts.payables', true),
    ('accounts_pdc_register', 'PDC Register', 'CalendarClock', '/app/accounts/pdc-register', v_operations_id, 55, 'accounts.payables', true),
    ('accounts_bank_reconciliation', 'Bank Reconciliation', 'CheckCircle2', '/app/accounts/bank-reconciliation', v_operations_id, 65, 'accounts.bank', true)
  ON CONFLICT (code) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order,
    path = EXCLUDED.path,
    name = EXCLUDED.name,
    is_active = true;

  -- Assets & Budgets children
  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active) VALUES
    ('accounts_fixed_assets', 'Fixed Assets', 'Building2', '/app/accounts/fixed-assets', v_assets_id, 10, 'accounts.view', true),
    ('accounts_cost_centers', 'Cost Centers', 'GitBranch', '/app/accounts/cost-centers', v_assets_id, 20, 'accounts.view', true),
    ('accounts_recurring_entries', 'Recurring Entries', 'Repeat', '/app/accounts/recurring-entries', v_assets_id, 40, 'accounts.view', true),
    ('accounts_period_management', 'Period Management', 'CalendarRange', '/app/accounts/period-management', v_assets_id, 50, 'accounts.view', true)
  ON CONFLICT (code) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order,
    path = EXCLUDED.path,
    name = EXCLUDED.name,
    is_active = true;

  -- Reports children
  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active) VALUES
    ('accounts_trial_balance', 'Trial Balance', 'Scale', '/app/accounts/reports/trial-balance', v_reports_id, 10, 'accounts.view', true),
    ('accounts_balance_sheet', 'Balance Sheet', 'BookOpen', '/app/accounts/reports/balance-sheet', v_reports_id, 20, 'accounts.view', true),
    ('accounts_profit_loss', 'Profit & Loss', 'TrendingUp', '/app/accounts/reports/profit-loss', v_reports_id, 30, 'accounts.view', true),
    ('accounts_cash_flow', 'Cash Flow', 'Waves', '/app/accounts/reports/cash-flow', v_reports_id, 40, 'accounts.view', true),
    ('accounts_revenue_by_source', 'Revenue by Source', 'PieChart', '/app/accounts/reports/revenue-by-source', v_reports_id, 50, 'accounts.view', true),
    ('accounts_revenue_drilldown', 'Revenue Drill-Down', 'Search', '/app/accounts/reports/revenue-drilldown', v_reports_id, 55, 'accounts.view', true),
    ('accounts_department_pnl', 'Department P&L', 'LayoutGrid', '/app/accounts/reports/department-pnl', v_reports_id, 60, 'accounts.view', true),
    ('accounts_cost_center_pnl', 'Cost Center P&L', 'GitMerge', '/app/accounts/reports/cost-center-pnl', v_reports_id, 70, 'accounts.view', true),
    ('accounts_detailed_pnl', 'Detailed P&L', 'FileBarChart', '/app/accounts/reports/detailed-pnl', v_reports_id, 80, 'accounts.view', true),
    ('accounts_consolidated_pnl', 'Consolidated P&L', 'Layers', '/app/accounts/reports/consolidated-pnl', v_reports_id, 90, 'accounts.view', true),
    ('accounts_budget_variance', 'Budget Variance', 'BarChart2', '/app/accounts/reports/budget-variance', v_reports_id, 100, 'accounts.view', true),
    ('accounts_ar_reconciliation', 'AR Reconciliation', 'GitPullRequest', '/app/accounts/reports/ar-reconciliation', v_reports_id, 110, 'accounts.view', true),
    ('accounts_cash_to_bank', 'Cash to Bank', 'ArrowRightLeft', '/app/accounts/cash-to-bank-report', v_reports_id, 120, 'accounts.view', true),
    ('accounts_payroll_cost_allocation', 'Payroll Cost Allocation', 'Users', '/app/accounts/reports/payroll-cost', v_reports_id, 130, 'accounts.view', true),
    ('accounts_vat_return', 'VAT Return', 'FileSpreadsheet', '/app/accounts/reports/vat-return', v_reports_id, 140, 'accounts.view', true)
  ON CONFLICT (code) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order,
    path = EXCLUDED.path,
    name = EXCLUDED.name,
    is_active = true;

  -- Compliance children
  INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active) VALUES
    ('accounts_year_end_closing', 'Year-End Closing', 'Lock', '/app/accounts/year-end-closing', v_compliance_id, 10, 'accounts.view', true),
    ('accounts_audit_log', 'Audit Log', 'ScrollText', '/app/accounts/audit-log', v_compliance_id, 30, 'accounts.view', true)
  ON CONFLICT (code) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order,
    path = EXCLUDED.path,
    name = EXCLUDED.name,
    is_active = true;

END $$;

-- Bank Transactions (8 records)
INSERT INTO bank_transactions (bank_account_id, transaction_date, transaction_type, description, debit_amount, credit_amount, reference_number, is_reconciled)
VALUES
  ('d8887c9e-254e-4a28-b24b-a5029e5473c3', '2026-02-15', 'deposit', 'Patient collections deposit', 0, 125000, 'DEP-20260215-001', false),
  ('d8887c9e-254e-4a28-b24b-a5029e5473c3', '2026-02-20', 'deposit', 'Insurance reimbursement', 0, 85000, 'DEP-20260220-001', false),
  ('d8887c9e-254e-4a28-b24b-a5029e5473c3', '2026-02-25', 'withdrawal', 'Vendor payment - PharmaCare', 45000, 0, 'CHQ-20260225-001', false),
  ('d8887c9e-254e-4a28-b24b-a5029e5473c3', '2026-03-01', 'deposit', 'Daily collections', 0, 95000, 'DEP-20260301-001', false),
  ('d8887c9e-254e-4a28-b24b-a5029e5473c3', '2026-03-05', 'withdrawal', 'Utility bill payment', 18500, 0, 'CHQ-20260305-001', false),
  ('d8887c9e-254e-4a28-b24b-a5029e5473c3', '2026-03-08', 'deposit', 'Lab revenue deposit', 0, 42000, 'DEP-20260308-001', false),
  ('9f7b4e9b-6b49-4909-b304-7ca832c0bca1', '2026-02-28', 'withdrawal', 'February payroll', 320000, 0, 'PAY-20260228-001', false),
  ('9f7b4e9b-6b49-4909-b304-7ca832c0bca1', '2026-03-01', 'deposit', 'Payroll fund transfer', 0, 350000, 'TRF-20260301-001', false)
ON CONFLICT DO NOTHING;

-- Patient Deposits (5 records)
INSERT INTO patient_deposits (organization_id, branch_id, patient_id, amount, type, payment_method_id, reference_number, notes, status, created_by)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e1a11111-1111-1111-1111-111111111111', 50000, 'deposit', 'f1a11111-1111-1111-1111-111111111111', 'PD-001', 'IPD advance for cardiac surgery', 'active', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2a22222-2222-2222-2222-222222222222', 25000, 'deposit', 'f1a11111-1111-1111-1111-111111111111', 'PD-002', 'IPD advance for maternity ward', 'active', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e3a33333-3333-3333-3333-333333333333', 15000, 'deposit', 'f2a22222-2222-2222-2222-222222222222', 'PD-003', 'General surgery deposit', 'active', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e4a44444-4444-4444-4444-444444444444', 30000, 'application', 'f1a11111-1111-1111-1111-111111111111', 'PD-004', 'Applied against discharge invoice', 'applied', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e5a55555-5555-5555-5555-555555555555', 10000, 'refund', 'f1a11111-1111-1111-1111-111111111111', 'PD-005', 'Deposit refund - surgery cancelled', 'completed', '00000000-0000-0000-0000-000000000030')
ON CONFLICT DO NOTHING;

-- Credit Notes (3 records)
INSERT INTO credit_notes (organization_id, branch_id, credit_note_number, note_type, invoice_id, patient_id, amount, tax_amount, total_amount, reason, status, zatca_document_type, created_by)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'CN-260301-0001', 'credit', 'cf345b27-3c1a-4998-bef2-c0c48fc3331a', 'e1a11111-1111-1111-1111-111111111111', 100, 15, 115, 'Duplicate lab test charge', 'draft', '381', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'CN-260302-0001', 'credit', '8207732f-32f1-417c-966f-9fc0830c7fb8', 'e2a22222-2222-2222-2222-222222222222', 350, 52.50, 402.50, 'Overcharged consultation fee', 'approved', '381', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'CN-260303-0001', 'debit', '1e14a1ee-8268-45ff-869d-65da6491e532', 'e3a33333-3333-3333-3333-333333333333', 200, 30, 230, 'Additional procedure charge', 'voided', '383', '00000000-0000-0000-0000-000000000030')
ON CONFLICT DO NOTHING;

-- Expenses (5 records)
INSERT INTO expenses (organization_id, branch_id, expense_number, amount, category, description, paid_to, payment_method_id, reference_number, notes, created_by)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'EXP-260301-0001', 8500, 'petty_cash', 'Electricity bill - March 2026', 'K-Electric', 'f1a11111-1111-1111-1111-111111111111', 'ELEC-MAR-2026', 'Monthly utility payment', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'EXP-260302-0001', 3200, 'petty_cash', 'Office supplies and stationery', 'National Stationers', 'f1a11111-1111-1111-1111-111111111111', 'OS-260302', 'Printer paper, toner, pens', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'EXP-260303-0001', 12000, 'misc', 'Emergency generator maintenance', 'GenTech Services', 'f1a11111-1111-1111-1111-111111111111', 'GEN-SVC-2026', 'Annual maintenance contract Q1', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'EXP-260304-0001', 4500, 'staff_advance', 'Staff travel advance - Dr. Ahmed', 'Dr. Ahmed Raza', 'f1a11111-1111-1111-1111-111111111111', 'SA-DRA-260304', 'Conference travel to Islamabad', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'EXP-260305-0001', 1800, 'petty_cash', 'Tea and refreshments', 'Hospital Canteen', 'f1a11111-1111-1111-1111-111111111111', 'TEA-MAR-2026', 'Monthly canteen expenses', '00000000-0000-0000-0000-000000000030')
ON CONFLICT DO NOTHING;

-- Vendor Payments (3 records) — status: paid/pending/approved/cancelled
INSERT INTO vendor_payments (organization_id, branch_id, vendor_id, payment_date, amount, payment_method_id, reference_number, notes, status, created_by)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '7ace5455-8baa-4dfc-a240-43d59d310216', '2026-02-25', 45000, 'f1a11111-1111-1111-1111-111111111111', 'VP-HBL-20260225', 'Payment for Feb medicines supply', 'paid', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '28055b93-a4b7-45f7-a029-8c317f97de64', '2026-03-02', 28000, 'f1a11111-1111-1111-1111-111111111111', 'VP-CHQ-20260302', 'Medical equipment parts', 'paid', '00000000-0000-0000-0000-000000000030'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '98911f4e-2d3e-44b2-aa08-7937a1fc26d1', '2026-03-08', 15500, 'f1a11111-1111-1111-1111-111111111111', 'VP-HBL-20260308', 'Lab reagents and supplies Q1', 'pending', '00000000-0000-0000-0000-000000000030')
ON CONFLICT DO NOTHING;

-- Budget Periods (3 quarters)
INSERT INTO budget_periods (organization_id, fiscal_year_id, name, start_date, end_date, is_closed)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'a2a599d0-09dd-4f62-b561-2ac968f8923a', 'Q1 2026', '2026-01-01', '2026-03-31', false),
  ('b1111111-1111-1111-1111-111111111111', 'a2a599d0-09dd-4f62-b561-2ac968f8923a', 'Q2 2026', '2026-04-01', '2026-06-30', false),
  ('b1111111-1111-1111-1111-111111111111', 'a2a599d0-09dd-4f62-b561-2ac968f8923a', 'Q3 2026', '2026-07-01', '2026-09-30', false)
ON CONFLICT DO NOTHING;


-- =============================================
-- 1. RE-POINT vendor_payments FK to JE-VP-* entries, then delete old duplicates
-- =============================================

-- Update vendor_payments to point to the trigger-generated JE-VP-* entries
UPDATE vendor_payments SET journal_entry_id = 'a0026317-d44b-47ac-a503-dd996b3fa15f' WHERE id = 'd1111111-bbbb-1111-1111-111111111111';
UPDATE vendor_payments SET journal_entry_id = '51d3d42a-0910-4cbd-a147-9c99a7a57588' WHERE id = 'd2222222-bbbb-2222-2222-222222222222';
UPDATE vendor_payments SET journal_entry_id = '54185a26-a55d-4bef-bedb-5725aa8a2793' WHERE id = 'd3333333-bbbb-3333-3333-333333333333';
UPDATE vendor_payments SET journal_entry_id = '856a1cec-2956-4900-a32e-a5c019ab2108' WHERE id = 'd4444444-bbbb-4444-4444-444444444444';
UPDATE vendor_payments SET journal_entry_id = 'b0a0341d-f4a3-4ca3-8344-71afff30b81c' WHERE id = 'd5555555-bbbb-5555-5555-555555555555';

-- Now delete the old duplicate JE lines
DELETE FROM journal_entry_lines WHERE journal_entry_id IN (
  'd1111111-aaaa-1111-1111-111111111111',
  'd2222222-aaaa-2222-2222-222222222222',
  'd3333333-aaaa-3333-3333-333333333333',
  'd4444444-aaaa-4444-4444-444444444444',
  'd5555555-aaaa-5555-5555-555555555555'
);

-- Delete the old duplicate journal entries
DELETE FROM journal_entries WHERE id IN (
  'd1111111-aaaa-1111-1111-111111111111',
  'd2222222-aaaa-2222-2222-222222222222',
  'd3333333-aaaa-3333-3333-333333333333',
  'd4444444-aaaa-4444-4444-444444444444',
  'd5555555-aaaa-5555-5555-555555555555'
);

-- =============================================
-- 2. CREATE ACCOUNT TYPES FOR ORG a1111111 + BACKFILL GRN JEs
-- =============================================

INSERT INTO account_types (code, name, category, is_debit_normal, is_system, sort_order, organization_id)
VALUES
  ('AST', 'Assets', 'asset', true, true, 1, 'a1111111-1111-1111-1111-111111111111'),
  ('LIA', 'Liabilities', 'liability', false, true, 2, 'a1111111-1111-1111-1111-111111111111'),
  ('EQU', 'Equity', 'equity', false, true, 3, 'a1111111-1111-1111-1111-111111111111'),
  ('REV', 'Revenue', 'revenue', false, true, 4, 'a1111111-1111-1111-1111-111111111111'),
  ('EXP', 'Expenses', 'expense', true, true, 5, 'a1111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_inv_id UUID;
  v_ap_id UUID;
  v_je_id UUID;
  v_org_id UUID := 'a1111111-1111-1111-1111-111111111111';
BEGIN
  v_inv_id := get_or_create_default_account(v_org_id, 'INV-001', 'Inventory Asset', 'asset');
  v_ap_id := get_or_create_default_account(v_org_id, 'AP-001', 'Accounts Payable', 'liability');

  -- GRN-20260212-0001 (Rs. 57,250)
  INSERT INTO journal_entries (
    entry_number, entry_date, reference_type, reference_id,
    description, organization_id, is_posted
  ) VALUES (
    'JE-GRN-260212-BF01', '2026-02-12', 'grn', 'a6000001-1111-4000-a000-000000000002',
    'GRN: GRN-20260212-0001 (backfill)', v_org_id, true
  ) RETURNING id INTO v_je_id;

  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
  VALUES
    (v_je_id, v_inv_id, 57250, 0, 'Inventory received - GRN-20260212-0001'),
    (v_je_id, v_ap_id, 0, 57250, 'Vendor liability - GRN-20260212-0001');

  -- GRN-20260215-0001 (Rs. 25,300)
  INSERT INTO journal_entries (
    entry_number, entry_date, reference_type, reference_id,
    description, organization_id, is_posted
  ) VALUES (
    'JE-GRN-260215-BF01', '2026-02-15', 'grn', 'a6000001-1111-4000-a000-000000000003',
    'GRN: GRN-20260215-0001 (backfill)', v_org_id, true
  ) RETURNING id INTO v_je_id;

  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
  VALUES
    (v_je_id, v_inv_id, 25300, 0, 'Inventory received - GRN-20260215-0001'),
    (v_je_id, v_ap_id, 0, 25300, 'Vendor liability - GRN-20260215-0001');
END $$;

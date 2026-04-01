
DO $$
DECLARE
  r RECORD;
  v_total NUMERIC;
  v_inv_id UUID;
  v_ap_id UUID;
  v_je_id UUID;
  v_entry_number TEXT;
  v_seq INT;
  v_has_types BOOLEAN;
BEGIN
  FOR r IN
    SELECT g.id, g.grn_number, g.organization_id, g.received_by
    FROM goods_received_notes g
    WHERE g.status IN ('verified', 'posted')
      AND g.organization_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM journal_entries WHERE reference_type = 'grn' AND reference_id = g.id)
  LOOP
    -- Check if org has account types
    SELECT EXISTS (SELECT 1 FROM account_types WHERE organization_id = r.organization_id AND category = 'asset') INTO v_has_types;
    IF NOT v_has_types THEN CONTINUE; END IF;

    SELECT COALESCE(SUM(quantity_received * unit_cost), 0) INTO v_total
    FROM grn_items WHERE grn_id = r.id;

    IF v_total <= 0 THEN CONTINUE; END IF;

    v_inv_id := get_or_create_default_account(r.organization_id, 'INV-001', 'Inventory Asset', 'asset');
    v_ap_id := get_or_create_default_account(r.organization_id, 'AP-001', 'Accounts Payable', 'liability');

    v_seq := floor(random() * 9000 + 1000)::int;
    v_entry_number := 'JE-GRN-' || to_char(now(), 'YYMMDD') || '-' || v_seq::text;

    INSERT INTO journal_entries (
      entry_number, entry_date, reference_type, reference_id,
      description, organization_id, is_posted, created_by
    ) VALUES (
      v_entry_number, CURRENT_DATE, 'grn', r.id,
      'GRN: ' || COALESCE(r.grn_number, r.id::text),
      r.organization_id, true, r.received_by
    ) RETURNING id INTO v_je_id;

    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_je_id, v_inv_id, v_total, 0, 'Inventory received - ' || COALESCE(r.grn_number, ''));

    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_je_id, v_ap_id, 0, v_total, 'Vendor liability - ' || COALESCE(r.grn_number, ''));
  END LOOP;
END $$;

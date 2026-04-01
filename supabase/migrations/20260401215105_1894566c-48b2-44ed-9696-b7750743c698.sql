
DO $$
DECLARE
  v_rev001_id UUID;
  v_ipd_rev_id UUID;
  v_je_id UUID;
  v_org_id UUID;
  r RECORD;
BEGIN
  -- Fix specific known entry JE-INV-260401-5254
  SELECT je.id, je.organization_id INTO v_je_id, v_org_id
  FROM journal_entries je
  WHERE je.entry_number = 'JE-INV-260401-5254';

  IF v_je_id IS NOT NULL THEN
    SELECT id INTO v_rev001_id FROM accounts WHERE account_number = 'REV-001' AND organization_id = v_org_id;
    SELECT id INTO v_ipd_rev_id FROM accounts WHERE account_number = '4010' AND organization_id = v_org_id;

    IF v_rev001_id IS NOT NULL AND v_ipd_rev_id IS NOT NULL THEN
      UPDATE journal_entry_lines
      SET account_id = v_ipd_rev_id
      WHERE journal_entry_id = v_je_id
        AND account_id = v_rev001_id
        AND credit_amount > 0;
    END IF;
  END IF;

  -- Fix any other INV- prefixed invoices linked to admissions
  FOR r IN
    SELECT i.invoice_number, je.id as je_id, je.organization_id as org_id
    FROM invoices i
    JOIN admissions a ON (a.discharge_invoice_id = i.id OR a.admission_invoice_id = i.id)
    JOIN journal_entries je ON je.reference_id = i.id AND je.reference_type = 'invoice'
    WHERE i.invoice_number LIKE 'INV-%'
      AND je.id != v_je_id
  LOOP
    SELECT id INTO v_rev001_id FROM accounts WHERE account_number = 'REV-001' AND organization_id = r.org_id;
    SELECT id INTO v_ipd_rev_id FROM accounts WHERE account_number = '4010' AND organization_id = r.org_id;

    IF v_rev001_id IS NOT NULL AND v_ipd_rev_id IS NOT NULL THEN
      UPDATE journal_entry_lines
      SET account_id = v_ipd_rev_id
      WHERE journal_entry_id = r.je_id
        AND account_id = v_rev001_id
        AND credit_amount > 0;
    END IF;
  END LOOP;

  -- Recalculate balances for REV-001 and 4010 using account_types for direction
  FOR r IN
    SELECT a.id, a.opening_balance, at.is_debit_normal
    FROM accounts a
    JOIN account_types at ON a.account_type_id = at.id
    WHERE a.account_number IN ('REV-001', '4010')
  LOOP
    UPDATE accounts
    SET current_balance = COALESCE(r.opening_balance, 0) + COALESCE(
      (SELECT SUM(CASE WHEN r.is_debit_normal THEN jel.debit_amount - jel.credit_amount ELSE jel.credit_amount - jel.debit_amount END)
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       WHERE jel.account_id = r.id AND je.is_posted = true), 0)
    WHERE id = r.id;
  END LOOP;
END $$;

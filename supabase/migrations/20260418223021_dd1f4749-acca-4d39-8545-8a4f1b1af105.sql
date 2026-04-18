
-- ============================================================
-- PHASE 1: CFO-Grade Material Fixes
-- ============================================================

-- 1. FISCAL YEAR AUTO-POPULATION + PERIOD LOCK
CREATE OR REPLACE FUNCTION public.enforce_journal_fiscal_year()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_fy_id UUID; v_fy_closed BOOLEAN;
BEGIN
  IF NEW.fiscal_year_id IS NULL THEN
    SELECT id, is_closed INTO v_fy_id, v_fy_closed
    FROM public.fiscal_years
    WHERE organization_id = NEW.organization_id
      AND NEW.entry_date BETWEEN start_date AND end_date
    LIMIT 1;
    IF v_fy_id IS NOT NULL THEN
      NEW.fiscal_year_id := v_fy_id;
      IF v_fy_closed AND NEW.is_posted = true THEN
        RAISE EXCEPTION 'Cannot post journal entry into closed fiscal year (entry_date: %)', NEW.entry_date;
      END IF;
    END IF;
  ELSE
    SELECT is_closed INTO v_fy_closed FROM public.fiscal_years WHERE id = NEW.fiscal_year_id;
    IF v_fy_closed AND NEW.is_posted = true AND (TG_OP = 'INSERT' OR OLD.is_posted = false) THEN
      RAISE EXCEPTION 'Cannot post journal entry into closed fiscal year';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_fiscal_year ON public.journal_entries;
CREATE TRIGGER trg_enforce_fiscal_year
  BEFORE INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.enforce_journal_fiscal_year();

UPDATE public.journal_entries je
SET fiscal_year_id = fy.id
FROM public.fiscal_years fy
WHERE je.fiscal_year_id IS NULL
  AND fy.organization_id = je.organization_id
  AND je.entry_date BETWEEN fy.start_date AND fy.end_date;

-- 2. MERGE DUPLICATE CHART OF ACCOUNTS
DO $$
DECLARE
  v_org UUID := 'b1111111-1111-1111-1111-111111111111';
  v_old_cash UUID; v_new_cash UUID;
  v_old_rev  UUID; v_new_rev  UUID;
  v_old_dep  UUID; v_new_dep  UUID;
  v_old_tax  UUID; v_new_tax  UUID;
BEGIN
  SELECT id INTO v_old_cash FROM accounts WHERE organization_id=v_org AND account_number='1000' LIMIT 1;
  SELECT id INTO v_new_cash FROM accounts WHERE organization_id=v_org AND account_number='CASH-001' LIMIT 1;
  IF v_old_cash IS NOT NULL AND v_new_cash IS NOT NULL THEN
    UPDATE journal_entry_lines SET account_id = v_new_cash WHERE account_id = v_old_cash;
    UPDATE bank_accounts SET account_id = v_new_cash WHERE account_id = v_old_cash;
    UPDATE accounts
      SET current_balance = current_balance + COALESCE((SELECT current_balance FROM accounts WHERE id=v_old_cash),0),
          is_active = true
      WHERE id = v_new_cash;
    UPDATE accounts SET is_active=false, name = name || ' [MERGED]' WHERE id = v_old_cash;
  END IF;

  SELECT id INTO v_old_rev FROM accounts WHERE organization_id=v_org AND account_number='4010' LIMIT 1;
  SELECT id INTO v_new_rev FROM accounts WHERE organization_id=v_org AND account_number='REV-IPD-001' LIMIT 1;
  IF v_old_rev IS NOT NULL AND v_new_rev IS NOT NULL THEN
    UPDATE journal_entry_lines SET account_id = v_new_rev WHERE account_id = v_old_rev;
    UPDATE accounts
      SET current_balance = current_balance + COALESCE((SELECT current_balance FROM accounts WHERE id=v_old_rev),0)
      WHERE id = v_new_rev;
    UPDATE accounts SET is_active=false, name = name || ' [MERGED]' WHERE id = v_old_rev;
  ELSIF v_old_rev IS NOT NULL AND v_new_rev IS NULL THEN
    UPDATE accounts SET account_number='REV-IPD-001' WHERE id=v_old_rev;
  END IF;

  SELECT id INTO v_old_dep FROM accounts WHERE organization_id=v_org AND account_number='2400' LIMIT 1;
  SELECT id INTO v_new_dep FROM accounts WHERE organization_id=v_org AND account_number='LIA-DEP-001' LIMIT 1;
  IF v_old_dep IS NOT NULL AND v_new_dep IS NOT NULL THEN
    UPDATE journal_entry_lines SET account_id = v_new_dep WHERE account_id = v_old_dep;
    UPDATE accounts
      SET current_balance = current_balance + COALESCE((SELECT current_balance FROM accounts WHERE id=v_old_dep),0)
      WHERE id = v_new_dep;
    UPDATE accounts SET is_active=false, name = name || ' [MERGED]' WHERE id = v_old_dep;
  END IF;

  SELECT id INTO v_old_tax FROM accounts WHERE organization_id=v_org AND account_number='2200' LIMIT 1;
  SELECT id INTO v_new_tax FROM accounts WHERE organization_id=v_org AND account_number='TAX-VAT-001' LIMIT 1;
  IF v_new_tax IS NULL AND v_old_tax IS NOT NULL THEN
    UPDATE accounts SET account_number='TAX-VAT-001', name='Tax Payable (VAT/GST)' WHERE id=v_old_tax;
  ELSIF v_old_tax IS NOT NULL AND v_new_tax IS NOT NULL THEN
    UPDATE journal_entry_lines SET account_id = v_new_tax WHERE account_id = v_old_tax;
    UPDATE accounts
      SET current_balance = current_balance + COALESCE((SELECT current_balance FROM accounts WHERE id=v_old_tax),0)
      WHERE id = v_new_tax;
    UPDATE accounts SET is_active=false, name = name || ' [MERGED]' WHERE id = v_old_tax;
  END IF;
END $$;

UPDATE accounts SET is_active = false, name = name || ' [LEGACY]'
WHERE account_number IN ('1000','2200','2400','4010')
  AND is_active = true
  AND id NOT IN (SELECT account_id FROM journal_entry_lines WHERE account_id IS NOT NULL)
  AND EXISTS (
    SELECT 1 FROM accounts a2
    WHERE a2.organization_id = accounts.organization_id
      AND a2.account_number IN ('CASH-001','TAX-VAT-001','LIA-DEP-001','REV-IPD-001')
      AND a2.is_active = true
  );

-- 3. BACKFILL CANCELLED INVOICE REVERSALS
DO $$
DECLARE
  v_inv RECORD; v_orig_je UUID; v_new_je UUID; v_line RECORD; v_entry_number TEXT;
BEGIN
  FOR v_inv IN
    SELECT i.id, i.organization_id, i.branch_id, i.invoice_number
    FROM invoices i
    WHERE i.status = 'cancelled'
      AND EXISTS (SELECT 1 FROM journal_entries WHERE reference_type='invoice' AND reference_id=i.id)
      AND NOT EXISTS (SELECT 1 FROM journal_entries WHERE reference_type='invoice_cancellation' AND reference_id=i.id)
  LOOP
    SELECT id INTO v_orig_je FROM journal_entries WHERE reference_type='invoice' AND reference_id=v_inv.id LIMIT 1;
    v_entry_number := 'JE-CANC-BF-' || to_char(NOW(),'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::TEXT,4,'0');
    INSERT INTO journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (v_inv.organization_id, v_inv.branch_id, v_entry_number, CURRENT_DATE,
            'Backfill cancellation reversal: ' || v_inv.invoice_number, 'invoice_cancellation', v_inv.id, true)
    RETURNING id INTO v_new_je;
    FOR v_line IN SELECT account_id, description, debit_amount, credit_amount FROM journal_entry_lines WHERE journal_entry_id = v_orig_je
    LOOP
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (v_new_je, v_line.account_id, 'Reversal: ' || v_line.description, v_line.credit_amount, v_line.debit_amount);
    END LOOP;
    UPDATE journal_entries SET is_reversed = true, reversed_at = NOW(), reversal_entry_id = v_new_je
    WHERE id = v_orig_je;
  END LOOP;
END $$;

-- 4. BRANCH BACKFILL ON JOURNAL ENTRIES
UPDATE journal_entries je SET branch_id = i.branch_id
FROM invoices i WHERE je.branch_id IS NULL AND je.reference_type='invoice' AND je.reference_id = i.id AND i.branch_id IS NOT NULL;

UPDATE journal_entries je SET branch_id = e.branch_id
FROM expenses e WHERE je.branch_id IS NULL AND je.reference_type='expense' AND je.reference_id = e.id AND e.branch_id IS NOT NULL;

UPDATE journal_entries je SET branch_id = g.branch_id
FROM goods_received_notes g WHERE je.branch_id IS NULL AND je.reference_type='grn' AND je.reference_id = g.id AND g.branch_id IS NOT NULL;

UPDATE journal_entries je SET branch_id = vp.branch_id
FROM vendor_payments vp WHERE je.branch_id IS NULL AND je.reference_type='vendor_payment' AND je.reference_id = vp.id AND vp.branch_id IS NOT NULL;

UPDATE journal_entries je SET branch_id = pr.branch_id
FROM payroll_runs pr WHERE je.branch_id IS NULL AND je.reference_type='payroll' AND je.reference_id = pr.id AND pr.branch_id IS NOT NULL;

UPDATE journal_entries je SET branch_id = pd.branch_id
FROM patient_deposits pd WHERE je.branch_id IS NULL AND je.reference_type='patient_deposit' AND je.reference_id = pd.id AND pd.branch_id IS NOT NULL;

UPDATE journal_entries je SET branch_id = cn.branch_id
FROM credit_notes cn WHERE je.branch_id IS NULL AND je.reference_type='credit_note' AND je.reference_id = cn.id AND cn.branch_id IS NOT NULL;

UPDATE journal_entries je SET branch_id = s.branch_id
FROM surgeries s WHERE je.branch_id IS NULL AND je.reference_type='surgery' AND je.reference_id = s.id AND s.branch_id IS NOT NULL;

-- Payment-sourced JE: derive via payment -> invoice -> branch
UPDATE journal_entries je SET branch_id = i.branch_id
FROM payments p JOIN invoices i ON i.id = p.invoice_id
WHERE je.branch_id IS NULL AND je.reference_type='payment' AND je.reference_id = p.id AND i.branch_id IS NOT NULL;

-- Final fallback: default branch of organization
UPDATE journal_entries je
SET branch_id = (SELECT id FROM branches WHERE organization_id = je.organization_id ORDER BY created_at LIMIT 1)
WHERE je.branch_id IS NULL;

-- Soft enforcement trigger
CREATE OR REPLACE FUNCTION public.enforce_journal_branch()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.branch_id IS NULL THEN
    SELECT id INTO NEW.branch_id FROM public.branches WHERE organization_id = NEW.organization_id ORDER BY created_at LIMIT 1;
    IF NEW.branch_id IS NULL THEN
      RAISE EXCEPTION 'Cannot create journal entry: organization has no branches defined';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_journal_branch ON public.journal_entries;
CREATE TRIGGER trg_enforce_journal_branch
  BEFORE INSERT ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.enforce_journal_branch();

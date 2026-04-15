
-- Phase 4-5: Insurance AR Split + Line-Item Revenue Posting

-- Step 1: Replace the invoice journal trigger with granular line-item posting
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_journal_id UUID;
  v_ar_account_id UUID;
  v_ar_ins_account_id UUID;
  v_tax_account_id UUID;
  v_disc_account_id UUID;
  v_rev_account_id UUID;
  v_entry_number TEXT;
  v_item RECORD;
  v_category TEXT;
  v_item_rev_account_id UUID;
  v_insurance_portion NUMERIC := 0;
  v_patient_portion NUMERIC := 0;
  v_has_insurance BOOLEAN := FALSE;
  v_rev_accounts JSONB := '{}'::JSONB;
  v_rev_key TEXT;
  v_rev_total NUMERIC;
BEGIN
  -- Only fire on status change to a billable status
  IF NEW.status NOT IN ('issued', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;

  -- Idempotency: skip if journal already exists for this invoice
  IF EXISTS (
    SELECT 1 FROM journal_entries
    WHERE reference_id = NEW.id AND reference_type = 'invoice'
  ) THEN
    RETURN NEW;
  END IF;

  -- Skip zero-amount invoices
  IF COALESCE(NEW.total_amount, 0) = 0 THEN
    RETURN NEW;
  END IF;

  -- Resolve core accounts
  SELECT id INTO v_ar_account_id FROM accounts
    WHERE organization_id = NEW.organization_id AND account_number = 'AR-001' AND is_active = TRUE LIMIT 1;
  SELECT id INTO v_tax_account_id FROM accounts
    WHERE organization_id = NEW.organization_id AND account_number = '2200' AND is_active = TRUE LIMIT 1;
  SELECT id INTO v_disc_account_id FROM accounts
    WHERE organization_id = NEW.organization_id AND account_number = 'DISC-001' AND is_active = TRUE LIMIT 1;
  SELECT id INTO v_ar_ins_account_id FROM accounts
    WHERE organization_id = NEW.organization_id AND account_number = 'AR-INS-001' AND is_active = TRUE LIMIT 1;

  -- Fallback revenue account
  SELECT id INTO v_rev_account_id FROM accounts
    WHERE organization_id = NEW.organization_id AND account_number = 'REV-001' AND is_active = TRUE LIMIT 1;

  IF v_ar_account_id IS NULL OR v_rev_account_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if invoice has insurance payer
  IF NEW.insurance_id IS NOT NULL AND v_ar_ins_account_id IS NOT NULL THEN
    v_has_insurance := TRUE;
    v_insurance_portion := COALESCE(NEW.insurance_amount, 0);
    v_patient_portion := COALESCE(NEW.total_amount, 0) - v_insurance_portion;
    IF v_patient_portion < 0 THEN v_patient_portion := 0; END IF;
  END IF;

  -- Generate entry number
  v_entry_number := 'JE-INV-' || COALESCE(NEW.invoice_number, NEW.id::TEXT);

  -- Create journal entry
  INSERT INTO journal_entries (
    organization_id, branch_id, entry_date, posting_date,
    entry_number, reference_type, reference_id, description,
    is_posted, posted_at, posted_by, created_by,
    total_debit, total_credit
  ) VALUES (
    NEW.organization_id, NEW.branch_id, NEW.invoice_date, NEW.invoice_date,
    v_entry_number, 'invoice', NEW.id,
    'Invoice ' || COALESCE(NEW.invoice_number, '') || ' - Auto Posted',
    TRUE, NOW(), NEW.created_by, NEW.created_by,
    COALESCE(NEW.total_amount, 0), COALESCE(NEW.total_amount, 0)
  ) RETURNING id INTO v_journal_id;

  -- ===== DEBIT SIDE: Accounts Receivable =====
  IF v_has_insurance AND v_insurance_portion > 0 THEN
    -- Split AR: patient portion
    IF v_patient_portion > 0 THEN
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
      VALUES (v_journal_id, v_ar_account_id, v_patient_portion, 0, 'Patient Receivable - ' || COALESCE(NEW.invoice_number, ''));
    END IF;
    -- Insurance portion
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_ar_ins_account_id, v_insurance_portion, 0, 'Insurance Receivable - ' || COALESCE(NEW.invoice_number, ''));
  ELSE
    -- Full amount to patient AR
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_ar_account_id, COALESCE(NEW.total_amount, 0), 0, 'Receivable - ' || COALESCE(NEW.invoice_number, ''));
  END IF;

  -- ===== CREDIT SIDE: Revenue per line item =====
  -- Aggregate revenue by service category
  FOR v_item IN
    SELECT ii.total_price, COALESCE(st.category, 'other') AS cat
    FROM invoice_items ii
    LEFT JOIN service_types st ON st.id = ii.service_type_id
    WHERE ii.invoice_id = NEW.id
  LOOP
    v_category := v_item.cat;
    v_rev_key := v_category;
    IF v_rev_accounts ? v_rev_key THEN
      v_rev_accounts := jsonb_set(v_rev_accounts, ARRAY[v_rev_key], to_jsonb((v_rev_accounts->>v_rev_key)::NUMERIC + COALESCE(v_item.total_price, 0)));
    ELSE
      v_rev_accounts := jsonb_set(v_rev_accounts, ARRAY[v_rev_key], to_jsonb(COALESCE(v_item.total_price, 0)));
    END IF;
  END LOOP;

  -- Post each category's revenue to its mapped account
  FOR v_rev_key, v_rev_total IN SELECT key, value::NUMERIC FROM jsonb_each_text(v_rev_accounts)
  LOOP
    IF v_rev_total > 0 THEN
      -- Resolve category-specific revenue account
      v_item_rev_account_id := NULL;
      CASE v_rev_key
        WHEN 'consultation' THEN
          SELECT id INTO v_item_rev_account_id FROM accounts WHERE organization_id = NEW.organization_id AND account_number = 'REV-001' AND is_active = TRUE LIMIT 1;
        WHEN 'lab' THEN
          SELECT id INTO v_item_rev_account_id FROM accounts WHERE organization_id = NEW.organization_id AND account_number IN ('REV-LAB-001', '4030') AND is_active = TRUE LIMIT 1;
        WHEN 'radiology' THEN
          SELECT id INTO v_item_rev_account_id FROM accounts WHERE organization_id = NEW.organization_id AND account_number IN ('REV-RAD-001', '4040') AND is_active = TRUE LIMIT 1;
        WHEN 'pharmacy' THEN
          SELECT id INTO v_item_rev_account_id FROM accounts WHERE organization_id = NEW.organization_id AND account_number IN ('REV-PHARM-001', '4050') AND is_active = TRUE LIMIT 1;
        WHEN 'procedure', 'surgery' THEN
          SELECT id INTO v_item_rev_account_id FROM accounts WHERE organization_id = NEW.organization_id AND account_number IN ('REV-PROC-001', '4060') AND is_active = TRUE LIMIT 1;
        WHEN 'room' THEN
          SELECT id INTO v_item_rev_account_id FROM accounts WHERE organization_id = NEW.organization_id AND account_number IN ('REV-ROOM-001', '4070') AND is_active = TRUE LIMIT 1;
        WHEN 'ipd' THEN
          SELECT id INTO v_item_rev_account_id FROM accounts WHERE organization_id = NEW.organization_id AND account_number = '4010' AND is_active = TRUE LIMIT 1;
        ELSE
          v_item_rev_account_id := NULL;
      END CASE;

      -- Fallback to general revenue
      IF v_item_rev_account_id IS NULL THEN
        v_item_rev_account_id := v_rev_account_id;
      END IF;

      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
      VALUES (v_journal_id, v_item_rev_account_id, 0, v_rev_total, initcap(v_rev_key) || ' Revenue - ' || COALESCE(NEW.invoice_number, ''));
    END IF;
  END LOOP;

  -- If no items found, fallback to subtotal on general revenue
  IF NOT EXISTS (SELECT 1 FROM jsonb_each(v_rev_accounts)) THEN
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_rev_account_id, 0, COALESCE(NEW.subtotal, NEW.total_amount, 0), 'Revenue - ' || COALESCE(NEW.invoice_number, ''));
  END IF;

  -- ===== Tax Payable =====
  IF v_tax_account_id IS NOT NULL AND COALESCE(NEW.tax_amount, 0) > 0 THEN
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_tax_account_id, 0, NEW.tax_amount, 'Tax Payable - ' || COALESCE(NEW.invoice_number, ''));
  END IF;

  -- ===== Discount (contra-revenue, debit) =====
  IF v_disc_account_id IS NOT NULL AND COALESCE(NEW.discount_amount, 0) > 0 THEN
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_disc_account_id, NEW.discount_amount, 0, 'Discount Allowed - ' || COALESCE(NEW.invoice_number, ''));
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists (drop and recreate to be safe)
DROP TRIGGER IF EXISTS trg_post_invoice_to_journal ON invoices;
CREATE TRIGGER trg_post_invoice_to_journal
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION post_invoice_to_journal();

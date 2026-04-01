
-- 1. Recalculate balances for INV-001 and AP-001 (duplicates already deleted by prior migration)
UPDATE accounts SET current_balance = COALESCE(opening_balance, 0) + COALESCE((
  SELECT SUM(jel.debit_amount - jel.credit_amount)
  FROM journal_entry_lines jel
  JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE jel.account_id = accounts.id AND je.is_posted = true
), 0)
WHERE account_number IN ('INV-001', 'AP-001');

-- 2. Recreate trigger function with idempotency + NULL guards
CREATE OR REPLACE FUNCTION post_grn_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_total NUMERIC;
  v_inv_account_id UUID;
  v_ap_account_id UUID;
  v_je_id UUID;
  v_entry_number TEXT;
  v_seq INT;
BEGIN
  -- Only fire when status becomes 'accepted' or 'verified'
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('accepted', 'verified') THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status NOT IN ('accepted', 'verified') THEN
      RETURN NEW;
    END IF;
    IF OLD.status IN ('accepted', 'verified') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Idempotency: skip if journal entry already exists for this GRN
  IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type = 'grn' AND reference_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Guard against NULL organization_id
  IF NEW.organization_id IS NULL THEN
    RAISE WARNING 'GRN % has no organization_id, skipping journal posting', NEW.grn_number;
    RETURN NEW;
  END IF;

  -- Calculate total GRN value
  SELECT COALESCE(SUM(quantity_received * unit_price), 0) INTO v_total
  FROM grn_items WHERE grn_id = NEW.id;

  IF v_total <= 0 THEN
    RETURN NEW;
  END IF;

  -- Get or create accounts
  v_inv_account_id := get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'Asset');
  v_ap_account_id := get_or_create_default_account(NEW.organization_id, 'AP-001', 'Accounts Payable', 'Liability');

  -- Generate entry number
  v_seq := floor(random() * 9000 + 1000)::int;
  v_entry_number := 'JE-GRN-' || to_char(now(), 'YYMMDD') || '-' || v_seq::text;

  -- Create journal entry
  INSERT INTO journal_entries (
    entry_number, entry_date, reference_type, reference_id,
    description, organization_id, is_posted, created_by
  ) VALUES (
    v_entry_number, CURRENT_DATE, 'grn', NEW.id,
    'GRN: ' || COALESCE(NEW.grn_number, NEW.id::text),
    NEW.organization_id, true, NEW.received_by
  ) RETURNING id INTO v_je_id;

  -- DR Inventory Asset
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
  VALUES (v_je_id, v_inv_account_id, v_total, 0, 'Inventory received - ' || COALESCE(NEW.grn_number, ''));

  -- CR Accounts Payable
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
  VALUES (v_je_id, v_ap_account_id, 0, v_total, 'Vendor liability - ' || COALESCE(NEW.grn_number, ''));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate trigger
DROP TRIGGER IF EXISTS trg_post_grn_to_journal ON goods_received_notes;
CREATE TRIGGER trg_post_grn_to_journal
  AFTER INSERT OR UPDATE ON goods_received_notes
  FOR EACH ROW
  EXECUTE FUNCTION post_grn_to_journal();

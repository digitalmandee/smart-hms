
-- Step 1: Drop duplicate invoice trigger (keep trg_post_invoice_to_journal)
DROP TRIGGER IF EXISTS auto_post_invoice ON public.invoices;

-- Step 2: Add idempotency guard to vendor payment trigger function
CREATE OR REPLACE FUNCTION public.post_vendor_payment_to_journal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_journal_id uuid;
  v_org_id uuid;
  v_ap_account_id uuid;
  v_credit_account_id uuid;
  v_vendor_name text;
  v_bank_ledger_account_id uuid;
BEGIN
  -- Only fire when status changes to 'paid'
  IF NEW.status != 'paid' THEN
    RETURN NEW;
  END IF;
  
  -- Old status guard (only on UPDATE)
  IF TG_OP = 'UPDATE' AND OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- Idempotency guard: skip if JE already exists for this payment
  IF EXISTS (
    SELECT 1 FROM public.journal_entries
    WHERE reference_id = NEW.id AND reference_type = 'vendor_payment'
  ) THEN
    RETURN NEW;
  END IF;

  v_org_id := NEW.organization_id;

  -- Get vendor name
  SELECT name INTO v_vendor_name FROM public.vendors WHERE id = NEW.vendor_id;

  -- Get AP account
  SELECT id INTO v_ap_account_id
  FROM public.accounts
  WHERE organization_id = v_org_id
    AND account_number = 'AP-001'
    AND is_active = true
  LIMIT 1;

  -- Get credit account from bank_account's ledger link, or fall back to cash
  IF NEW.bank_account_id IS NOT NULL THEN
    SELECT ba.account_id INTO v_credit_account_id
    FROM public.bank_accounts ba
    WHERE ba.id = NEW.bank_account_id;
  END IF;

  IF v_credit_account_id IS NULL THEN
    -- Try payment method's ledger_account_id
    IF NEW.payment_method_id IS NOT NULL THEN
      SELECT pm.ledger_account_id INTO v_credit_account_id
      FROM public.payment_methods pm
      WHERE pm.id = NEW.payment_method_id;
    END IF;
  END IF;

  IF v_credit_account_id IS NULL THEN
    -- Fall back to CASH-001
    SELECT id INTO v_credit_account_id
    FROM public.accounts
    WHERE organization_id = v_org_id
      AND account_number = 'CASH-001'
      AND is_active = true
    LIMIT 1;
  END IF;

  -- Skip if we can't find both accounts
  IF v_ap_account_id IS NULL OR v_credit_account_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Create journal entry
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id,
    is_posted, posted_at
  ) VALUES (
    v_org_id, NEW.branch_id, '',
    NEW.payment_date,
    'Vendor payment to ' || COALESCE(v_vendor_name, 'Unknown') || ' - ' || NEW.payment_number,
    'vendor_payment', NEW.id,
    true, now()
  ) RETURNING id INTO v_journal_id;

  -- DR AP (reduce liability), CR Cash/Bank
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES
    (v_journal_id, v_ap_account_id, 'Payment to ' || COALESCE(v_vendor_name, 'Unknown'), NEW.amount, 0),
    (v_journal_id, v_credit_account_id, 'Payment to ' || COALESCE(v_vendor_name, 'Unknown'), 0, NEW.amount);

  -- Link journal entry to payment
  UPDATE public.vendor_payments SET journal_entry_id = v_journal_id WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Drop any existing vendor payment triggers and recreate single one
DROP TRIGGER IF EXISTS trg_post_vendor_payment_to_journal ON public.vendor_payments;
DROP TRIGGER IF EXISTS auto_post_vendor_payment ON public.vendor_payments;

CREATE TRIGGER trg_post_vendor_payment_to_journal
  AFTER INSERT OR UPDATE ON public.vendor_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.post_vendor_payment_to_journal();

-- Step 3: Create trigger to bridge medication_administration → ipd_charges
CREATE OR REPLACE FUNCTION public.bridge_medication_to_ipd_charges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_med_name text;
  v_med_price numeric := 0;
  v_medicine_id uuid;
  v_dosage text;
BEGIN
  -- Only create charge when medication is actually administered
  IF NEW.status != 'administered' THEN
    RETURN NEW;
  END IF;

  -- Idempotency: check if charge already exists for this administration
  IF EXISTS (
    SELECT 1 FROM public.ipd_charges
    WHERE admission_id = NEW.admission_id
      AND description LIKE '%[MedAdmin:' || NEW.id::text || ']%'
  ) THEN
    RETURN NEW;
  END IF;

  -- Get medication details
  SELECT m.medicine_name, m.medicine_id, m.dosage
  INTO v_med_name, v_medicine_id, v_dosage
  FROM public.ipd_medications m
  WHERE m.id = NEW.ipd_medication_id;

  -- Get unit price from medicine_inventory
  IF v_medicine_id IS NOT NULL THEN
    SELECT COALESCE(mi.sale_price, mi.unit_cost, 0) INTO v_med_price
    FROM public.medicine_inventory mi
    WHERE mi.medicine_id = v_medicine_id
    LIMIT 1;
  END IF;

  -- Only create charge if we have a price
  IF v_med_price > 0 THEN
    INSERT INTO public.ipd_charges (
      admission_id,
      charge_type,
      description,
      quantity,
      unit_price,
      total_amount,
      charge_date,
      added_by,
      is_billed
    ) VALUES (
      NEW.admission_id,
      'medication',
      COALESCE(v_med_name, 'Medication') || ' (' || COALESCE(NEW.dose_given, v_dosage, '') || ') [MedAdmin:' || NEW.id::text || ']',
      1,
      v_med_price,
      v_med_price,
      COALESCE(NEW.actual_time, NEW.scheduled_time)::date,
      NEW.administered_by,
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bridge_medication_to_ipd_charges
  AFTER INSERT OR UPDATE ON public.medication_administration
  FOR EACH ROW
  EXECUTE FUNCTION public.bridge_medication_to_ipd_charges();

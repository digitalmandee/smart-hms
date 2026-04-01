
-- Step 1: Update the trigger to route revenue based on invoice type
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_ar_account UUID;
  v_revenue_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_revenue_code TEXT;
  v_revenue_name TEXT;
BEGIN
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;
  IF COALESCE(NEW.total_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;

  -- Determine revenue account based on invoice number prefix
  IF NEW.invoice_number LIKE 'IPD-%' THEN
    v_revenue_code := '4010';
    v_revenue_name := 'IPD Revenue';
  ELSE
    v_revenue_code := 'REV-001';
    v_revenue_name := 'Service Revenue';
  END IF;

  v_ar_account := public.get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  v_revenue_account := public.get_or_create_default_account(NEW.organization_id, v_revenue_code, v_revenue_name, 'revenue');
  v_entry_number := 'JE-INV-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'Invoice: ' || NEW.invoice_number, 'invoice', NEW.id, true)
  RETURNING id INTO v_journal_id;
  
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ar_account, 'Invoice ' || NEW.invoice_number, NEW.total_amount, 0);
  
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_revenue_account, 'Revenue from ' || NEW.invoice_number, 0, NEW.total_amount);
  
  UPDATE public.accounts SET current_balance = current_balance + NEW.total_amount, updated_at = NOW() WHERE id = v_ar_account;
  UPDATE public.accounts SET current_balance = current_balance + NEW.total_amount, updated_at = NOW() WHERE id = v_revenue_account;
  
  RETURN NEW;
END;
$function$;

-- Step 2: Backfill - Move existing IPD invoice journal lines from REV-001 to 4010
DO $$
DECLARE
  v_org_id UUID;
  v_rev001_id UUID;
  v_ipd_rev_id UUID;
  v_total_moved NUMERIC := 0;
  r RECORD;
BEGIN
  -- Process each organization
  FOR v_org_id IN SELECT DISTINCT organization_id FROM invoices WHERE invoice_number LIKE 'IPD-%'
  LOOP
    -- Get REV-001 account for this org
    SELECT id INTO v_rev001_id FROM accounts WHERE account_number = 'REV-001' AND organization_id = v_org_id LIMIT 1;
    IF v_rev001_id IS NULL THEN CONTINUE; END IF;

    -- Get or create 4010 account for this org
    v_ipd_rev_id := public.get_or_create_default_account(v_org_id, '4010', 'IPD Revenue', 'revenue');

    -- Find all journal entry lines that credit REV-001 for IPD invoices
    v_total_moved := 0;
    FOR r IN
      SELECT jel.id, jel.credit_amount
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      JOIN invoices inv ON inv.id = je.reference_id
      WHERE je.reference_type = 'invoice'
        AND inv.invoice_number LIKE 'IPD-%'
        AND inv.organization_id = v_org_id
        AND jel.account_id = v_rev001_id
        AND jel.credit_amount > 0
    LOOP
      UPDATE journal_entry_lines SET account_id = v_ipd_rev_id WHERE id = r.id;
      v_total_moved := v_total_moved + r.credit_amount;
    END LOOP;

    -- Adjust balances: subtract from REV-001, add to 4010
    IF v_total_moved > 0 THEN
      UPDATE accounts SET current_balance = current_balance - v_total_moved, updated_at = NOW() WHERE id = v_rev001_id;
      UPDATE accounts SET current_balance = current_balance + v_total_moved, updated_at = NOW() WHERE id = v_ipd_rev_id;
    END IF;
  END LOOP;
END $$;

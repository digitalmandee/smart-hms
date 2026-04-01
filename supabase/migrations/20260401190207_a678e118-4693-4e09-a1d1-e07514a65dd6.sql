
-- Update the trigger to route revenue based on invoice prefix
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
  ELSIF NEW.invoice_number LIKE 'LAB-%' THEN
    v_revenue_code := '4030';
    v_revenue_name := 'Laboratory Revenue';
  ELSIF NEW.invoice_number LIKE 'DLY-%' THEN
    v_revenue_code := '4040';
    v_revenue_name := 'Dialysis Revenue';
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

-- Parent the new accounts under Ancillary Revenue (4140) if it exists
DO $$
DECLARE
  v_org RECORD;
  v_parent_id UUID;
  v_acct_id UUID;
BEGIN
  FOR v_org IN SELECT DISTINCT organization_id FROM accounts
  LOOP
    -- Find Ancillary Revenue parent
    SELECT id INTO v_parent_id FROM accounts 
    WHERE account_number = '4140' AND organization_id = v_org.organization_id LIMIT 1;
    
    IF v_parent_id IS NOT NULL THEN
      -- Update 4030 parent if it exists
      UPDATE accounts SET parent_account_id = v_parent_id 
      WHERE account_number = '4030' AND organization_id = v_org.organization_id AND parent_account_id IS NULL;
      
      -- Update 4040 parent if it exists
      UPDATE accounts SET parent_account_id = v_parent_id 
      WHERE account_number = '4040' AND organization_id = v_org.organization_id AND parent_account_id IS NULL;
    END IF;
  END LOOP;
END $$;

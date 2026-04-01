CREATE OR REPLACE FUNCTION public.post_patient_deposit_to_journal()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_cash_account UUID;
  v_deposit_liability_account UUID;
  v_ar_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_payment_method_account UUID;
BEGIN
  IF NEW.type = 'deposit' AND COALESCE(NEW.amount, 0) > 0 THEN
    v_payment_method_account := NULL;
    IF NEW.payment_method_id IS NOT NULL THEN
      SELECT ledger_account_id INTO v_payment_method_account
      FROM public.payment_methods WHERE id = NEW.payment_method_id;
    END IF;

    IF v_payment_method_account IS NOT NULL THEN
      v_cash_account := v_payment_method_account;
    ELSE
      v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
    END IF;

    v_deposit_liability_account := public.get_or_create_default_account(NEW.organization_id, 'LIA-DEP-001', 'Patient Deposits', 'liability');
    v_entry_number := 'JE-DEP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'Patient deposit received', 'patient_deposit', NEW.id, true)
    RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cash_account, 'Cash received - patient deposit', NEW.amount, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_deposit_liability_account, 'Patient deposit liability', 0, NEW.amount);

    UPDATE public.patient_deposits SET journal_entry_id = v_journal_id WHERE id = NEW.id;

  ELSIF NEW.type = 'applied' AND COALESCE(NEW.amount, 0) > 0 THEN
    v_deposit_liability_account := public.get_or_create_default_account(NEW.organization_id, 'LIA-DEP-001', 'Patient Deposits', 'liability');
    v_ar_account := public.get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
    v_entry_number := 'JE-DEPAPP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'Patient deposit applied to invoice', 'patient_deposit', NEW.id, true)
    RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_deposit_liability_account, 'Deposit applied - liability cleared', NEW.amount, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_ar_account, 'Deposit applied - AR cleared', 0, NEW.amount);

    UPDATE public.patient_deposits SET journal_entry_id = v_journal_id WHERE id = NEW.id;

  ELSIF NEW.type = 'refund' AND COALESCE(NEW.amount, 0) > 0 THEN
    v_payment_method_account := NULL;
    IF NEW.payment_method_id IS NOT NULL THEN
      SELECT ledger_account_id INTO v_payment_method_account
      FROM public.payment_methods WHERE id = NEW.payment_method_id;
    END IF;

    IF v_payment_method_account IS NOT NULL THEN
      v_cash_account := v_payment_method_account;
    ELSE
      v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
    END IF;

    v_deposit_liability_account := public.get_or_create_default_account(NEW.organization_id, 'LIA-DEP-001', 'Patient Deposits', 'liability');
    v_entry_number := 'JE-REF-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'Patient deposit refund', 'patient_deposit', NEW.id, true)
    RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_deposit_liability_account, 'Patient deposit refund', NEW.amount, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cash_account, 'Cash paid - deposit refund', 0, NEW.amount);

    UPDATE public.patient_deposits SET journal_entry_id = v_journal_id WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;
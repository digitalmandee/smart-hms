ALTER TABLE public.blood_camp_expenses
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS bank_account_id uuid REFERENCES public.bank_accounts(id);

CREATE OR REPLACE FUNCTION public.bb_camp_expense_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.payment_method NOT IN ('cash','bank') THEN RAISE EXCEPTION 'Invalid payment method'; END IF;
  IF NEW.payment_method = 'bank' AND NEW.bank_account_id IS NULL THEN RAISE EXCEPTION 'Choose the bank account that paid'; END IF;
  IF NEW.payment_method = 'cash' THEN NEW.bank_account_id := NULL; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_camp_expense_validate ON public.blood_camp_expenses;
CREATE TRIGGER trg_camp_expense_validate BEFORE INSERT OR UPDATE ON public.blood_camp_expenses FOR EACH ROW EXECUTE FUNCTION public.bb_camp_expense_validate();

CREATE OR REPLACE FUNCTION public.post_blood_camp_expense_to_journal()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_exp uuid; v_cr uuid; v_je uuid; v_branch uuid; v_camp text; v_label text;
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    IF TG_OP = 'DELETE' OR OLD.amount IS DISTINCT FROM NEW.amount OR OLD.category IS DISTINCT FROM NEW.category
       OR OLD.payment_method IS DISTINCT FROM NEW.payment_method OR OLD.bank_account_id IS DISTINCT FROM NEW.bank_account_id THEN
      PERFORM public.bb_camp_expense_reverse(OLD.id);
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  END IF;
  IF COALESCE(NEW.amount,0) <= 0 THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type='blood_camp_expense' AND reference_id=NEW.id AND is_reversed=false) THEN RETURN NEW; END IF;
  SELECT branch_id, COALESCE(camp_number, name) INTO v_branch, v_camp FROM blood_camps WHERE id = NEW.camp_id;
  v_exp := public.get_or_create_default_account(NEW.organization_id, 'EXP-BBCAMP-001', 'Blood Camp Expenses', 'expense');
  IF NEW.payment_method = 'bank' THEN
    SELECT account_id, 'Paid by bank transfer (' || bank_name || ')' INTO v_cr, v_label
      FROM bank_accounts WHERE id = NEW.bank_account_id AND organization_id = NEW.organization_id;
    IF v_cr IS NULL THEN
      v_cr := public.get_or_create_default_account(NEW.organization_id, '1010', 'Bank Account', 'asset');
      v_label := COALESCE(v_label, 'Paid by bank transfer');
    END IF;
  ELSE
    v_cr := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
    v_label := 'Paid in cash';
  END IF;
  INSERT INTO journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted, status, created_by)
  VALUES (NEW.organization_id, v_branch, 'JE-BCE-' || to_char(now(),'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::text,4,'0'),
          CURRENT_DATE, 'Blood camp ' || COALESCE(v_camp,'') || ' expense: ' || NEW.category, 'blood_camp_expense', NEW.id, true, 'posted', NEW.created_by)
  RETURNING id INTO v_je;
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount, branch_id) VALUES
    (v_je, v_exp, 'Camp expense (' || NEW.category || ')' || COALESCE(' - ' || NEW.notes,''), NEW.amount, 0, v_branch),
    (v_je, v_cr, v_label, 0, NEW.amount, v_branch);
  RETURN NEW;
END $function$;

-- Trigger: Auto-post payroll run to journal when status becomes 'completed'
CREATE OR REPLACE FUNCTION public.post_payroll_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_salary_expense_account UUID;
  v_cash_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_amount NUMERIC;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    v_amount := COALESCE(NEW.total_net, 0);
    IF v_amount <= 0 THEN RETURN NEW; END IF;

    v_salary_expense_account := public.get_or_create_default_account(NEW.organization_id, 'EXP-SAL-001', 'Salaries & Wages', 'expense');
    v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');

    v_entry_number := 'JE-PAY-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 
            'Payroll: ' || TO_CHAR(TO_DATE(NEW.month::TEXT, 'MM'), 'Month') || ' ' || NEW.year,
            'payroll', NEW.id, true)
    RETURNING id INTO v_journal_id;

    -- Debit: Salary Expense
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_salary_expense_account, 'Salary expense', v_amount, 0);

    -- Credit: Cash
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cash_account, 'Salary disbursement', 0, v_amount);
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger on payroll_runs
DROP TRIGGER IF EXISTS trg_post_payroll_to_journal ON public.payroll_runs;
CREATE TRIGGER trg_post_payroll_to_journal
  AFTER UPDATE ON public.payroll_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.post_payroll_to_journal();

-- Trigger: Auto-post expense to journal when created
CREATE OR REPLACE FUNCTION public.post_expense_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_expense_account UUID;
  v_cash_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_amount NUMERIC;
  v_category_name TEXT;
BEGIN
  v_amount := COALESCE(NEW.amount, 0);
  IF v_amount <= 0 THEN RETURN NEW; END IF;

  v_category_name := COALESCE(NEW.category, 'misc');

  -- Map category to expense account
  v_expense_account := CASE v_category_name
    WHEN 'petty_cash' THEN public.get_or_create_default_account(NEW.organization_id, 'EXP-PTY-001', 'Petty Cash Expense', 'expense')
    WHEN 'refund' THEN public.get_or_create_default_account(NEW.organization_id, 'EXP-REF-001', 'Refunds', 'expense')
    WHEN 'staff_advance' THEN public.get_or_create_default_account(NEW.organization_id, 'EXP-ADV-001', 'Staff Advances', 'expense')
    ELSE public.get_or_create_default_account(NEW.organization_id, 'EXP-MISC-001', 'Miscellaneous Expense', 'expense')
  END;

  v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');

  v_entry_number := 'JE-EXP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, COALESCE(NEW.expense_date, CURRENT_DATE),
          'Expense: ' || COALESCE(NEW.description, v_category_name),
          'expense', NEW.id, true)
  RETURNING id INTO v_journal_id;

  -- Debit: Expense Account
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_expense_account, COALESCE(NEW.description, 'Expense'), v_amount, 0);

  -- Credit: Cash
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_cash_account, 'Cash payment', 0, v_amount);

  RETURN NEW;
END;
$function$;

-- Create trigger on expenses
DROP TRIGGER IF EXISTS trg_post_expense_to_journal ON public.expenses;
CREATE TRIGGER trg_post_expense_to_journal
  AFTER INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.post_expense_to_journal();

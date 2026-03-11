
-- Fix expense trigger to use L4 posting account instead of header account 5200
CREATE OR REPLACE FUNCTION post_expense_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_number TEXT;
  v_journal_id UUID;
  v_cash_account_id UUID;
  v_expense_account_id UUID;
BEGIN
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  v_entry_number := 'JE-EXP-' || to_char(CURRENT_DATE, 'YYMMDD') || '-' || floor(random() * 10000)::text;

  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
          'Expense: ' || COALESCE(NEW.description, NEW.category::text),
          'expense', NEW.id, true)
  RETURNING id INTO v_journal_id;

  -- Use 1000 (Cash in Hand) - L4 posting account
  SELECT id INTO v_cash_account_id FROM accounts 
  WHERE organization_id = NEW.organization_id AND account_number = '1000' LIMIT 1;

  -- Use 5500 (Administrative Expenses) - L4 posting account, NOT header 5200
  SELECT id INTO v_expense_account_id FROM accounts 
  WHERE organization_id = NEW.organization_id AND account_number = '5500' LIMIT 1;

  IF v_expense_account_id IS NOT NULL AND v_cash_account_id IS NOT NULL THEN
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES 
      (v_journal_id, v_expense_account_id, NEW.amount, 0, 'Expense: ' || COALESCE(NEW.description, '')),
      (v_journal_id, v_cash_account_id, 0, NEW.amount, 'Cash payment for expense');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

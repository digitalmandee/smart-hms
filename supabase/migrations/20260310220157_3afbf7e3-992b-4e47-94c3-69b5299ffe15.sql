
-- Fix the expense trigger that references non-existent expense_date column
CREATE OR REPLACE FUNCTION post_expense_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_number TEXT;
  v_journal_id UUID;
  v_cash_account_id UUID;
  v_expense_account_id UUID;
  v_category_name TEXT;
BEGIN
  -- Only post for new expenses
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Generate entry number
  v_entry_number := 'JE-EXP-' || to_char(CURRENT_DATE, 'YYMMDD') || '-' || floor(random() * 10000)::text;

  -- Get category display name
  v_category_name := COALESCE(NEW.category, 'misc');

  -- Create journal entry (use created_at instead of expense_date)
  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
          'Expense: ' || COALESCE(NEW.description, v_category_name),
          'expense', NEW.id, true)
  RETURNING id INTO v_journal_id;

  -- Find cash account
  SELECT id INTO v_cash_account_id FROM accounts 
  WHERE organization_id = NEW.organization_id AND account_number = '1110' LIMIT 1;

  -- Find expense account
  SELECT id INTO v_expense_account_id FROM accounts 
  WHERE organization_id = NEW.organization_id AND account_number = '5200' LIMIT 1;

  -- Debit expense, credit cash
  IF v_expense_account_id IS NOT NULL AND v_cash_account_id IS NOT NULL THEN
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES 
      (v_journal_id, v_expense_account_id, NEW.amount, 0, 'Expense: ' || COALESCE(NEW.description, '')),
      (v_journal_id, v_cash_account_id, 0, NEW.amount, 'Cash payment for expense');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

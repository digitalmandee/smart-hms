-- ============================================
-- AUTO-POST INVOICES & PAYMENTS TO GENERAL LEDGER
-- ============================================

-- Helper function to find default accounts by code pattern
CREATE OR REPLACE FUNCTION public.get_or_create_default_account(
  p_organization_id UUID,
  p_account_code TEXT,
  p_account_name TEXT,
  p_account_type_category TEXT DEFAULT 'asset'
) RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
  v_account_type_id UUID;
BEGIN
  -- Try to find existing account by code
  SELECT id INTO v_account_id
  FROM public.accounts
  WHERE organization_id = p_organization_id
    AND account_number = p_account_code
  LIMIT 1;
  
  IF v_account_id IS NOT NULL THEN
    RETURN v_account_id;
  END IF;
  
  -- Get or create account type
  SELECT id INTO v_account_type_id
  FROM public.account_types
  WHERE organization_id = p_organization_id
    AND category = p_account_type_category
  LIMIT 1;
  
  -- If no account type, create one
  IF v_account_type_id IS NULL THEN
    INSERT INTO public.account_types (
      organization_id, code, name, category, is_debit_normal, is_system
    ) VALUES (
      p_organization_id, 
      UPPER(LEFT(p_account_type_category, 3)), 
      INITCAP(p_account_type_category),
      p_account_type_category,
      p_account_type_category IN ('asset', 'expense'),
      true
    )
    RETURNING id INTO v_account_type_id;
  END IF;
  
  -- Create the account
  INSERT INTO public.accounts (
    organization_id, account_number, name, account_type_id, is_system, is_active
  ) VALUES (
    p_organization_id, p_account_code, p_account_name, v_account_type_id, true, true
  )
  RETURNING id INTO v_account_id;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Post invoice to journal entry
-- ============================================
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_ar_account UUID;
  v_revenue_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
BEGIN
  -- Only post finalized invoices (not drafts)
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;
  
  -- Skip if amount is 0
  IF COALESCE(NEW.total_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;
  
  -- Get or create default accounts
  v_ar_account := public.get_or_create_default_account(
    NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset'
  );
  v_revenue_account := public.get_or_create_default_account(
    NEW.organization_id, 'REV-001', 'Service Revenue', 'revenue'
  );
  
  -- Generate entry number
  v_entry_number := 'JE-INV-' || to_char(NOW(), 'YYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Create journal entry
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, status, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'Invoice: ' || NEW.invoice_number, 'invoice', NEW.id, 'posted', true
  ) RETURNING id INTO v_journal_id;
  
  -- Debit: Accounts Receivable
  INSERT INTO public.journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_ar_account, 'Invoice ' || NEW.invoice_number, 
    NEW.total_amount, 0
  );
  
  -- Credit: Revenue
  INSERT INTO public.journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_revenue_account, 'Revenue from ' || NEW.invoice_number, 
    0, NEW.total_amount
  );
  
  -- Update account balances
  UPDATE public.accounts 
  SET current_balance = current_balance + NEW.total_amount,
      updated_at = NOW()
  WHERE id = v_ar_account;
  
  UPDATE public.accounts 
  SET current_balance = current_balance + NEW.total_amount,
      updated_at = NOW()
  WHERE id = v_revenue_account;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on invoices
DROP TRIGGER IF EXISTS auto_post_invoice ON public.invoices;
CREATE TRIGGER auto_post_invoice
AFTER INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.post_invoice_to_journal();

-- ============================================
-- TRIGGER: Post payment to journal entry
-- ============================================
CREATE OR REPLACE FUNCTION public.post_payment_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_cash_account UUID;
  v_ar_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_invoice RECORD;
BEGIN
  -- Skip if amount is 0
  IF COALESCE(NEW.amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;
  
  -- Get invoice details for organization_id
  SELECT * INTO v_invoice FROM public.invoices WHERE id = NEW.invoice_id;
  
  IF v_invoice IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get or create default accounts
  v_cash_account := public.get_or_create_default_account(
    v_invoice.organization_id, 'CASH-001', 'Cash in Hand', 'asset'
  );
  v_ar_account := public.get_or_create_default_account(
    v_invoice.organization_id, 'AR-001', 'Accounts Receivable', 'asset'
  );
  
  -- Generate entry number
  v_entry_number := 'JE-PAY-' || to_char(NOW(), 'YYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Create journal entry
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, status, is_posted
  ) VALUES (
    v_invoice.organization_id, v_invoice.branch_id, v_entry_number, CURRENT_DATE,
    'Payment for ' || v_invoice.invoice_number, 'payment', NEW.id, 'posted', true
  ) RETURNING id INTO v_journal_id;
  
  -- Debit: Cash/Bank
  INSERT INTO public.journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_cash_account, 'Payment received', NEW.amount, 0
  );
  
  -- Credit: Accounts Receivable
  INSERT INTO public.journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_ar_account, 'AR reduction', 0, NEW.amount
  );
  
  -- Update account balances
  UPDATE public.accounts 
  SET current_balance = current_balance + NEW.amount,
      updated_at = NOW()
  WHERE id = v_cash_account;
  
  UPDATE public.accounts 
  SET current_balance = current_balance - NEW.amount,
      updated_at = NOW()
  WHERE id = v_ar_account;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on payments
DROP TRIGGER IF EXISTS auto_post_payment ON public.payments;
CREATE TRIGGER auto_post_payment
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.post_payment_to_journal();

-- ============================================
-- TRIGGER: Post POS transaction to journal
-- ============================================
CREATE OR REPLACE FUNCTION public.post_pos_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_cash_account UUID;
  v_revenue_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
BEGIN
  -- Skip if amount is 0
  IF COALESCE(NEW.total_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;
  
  -- Get or create default accounts
  v_cash_account := public.get_or_create_default_account(
    NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset'
  );
  v_revenue_account := public.get_or_create_default_account(
    NEW.organization_id, 'REV-PHARM-001', 'Pharmacy Revenue', 'revenue'
  );
  
  -- Generate entry number
  v_entry_number := 'JE-POS-' || to_char(NOW(), 'YYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Create journal entry
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, status, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'POS Sale: ' || NEW.transaction_number, 'pos_transaction', NEW.id, 'posted', true
  ) RETURNING id INTO v_journal_id;
  
  -- Debit: Cash
  INSERT INTO public.journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_cash_account, 'POS Cash Sale', NEW.total_amount, 0
  );
  
  -- Credit: Pharmacy Revenue
  INSERT INTO public.journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_revenue_account, 'Pharmacy Sales', 0, NEW.total_amount
  );
  
  -- Update account balances
  UPDATE public.accounts 
  SET current_balance = current_balance + NEW.total_amount,
      updated_at = NOW()
  WHERE id = v_cash_account;
  
  UPDATE public.accounts 
  SET current_balance = current_balance + NEW.total_amount,
      updated_at = NOW()
  WHERE id = v_revenue_account;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on POS transactions
DROP TRIGGER IF EXISTS auto_post_pos_transaction ON public.pharmacy_pos_transactions;
CREATE TRIGGER auto_post_pos_transaction
AFTER INSERT ON public.pharmacy_pos_transactions
FOR EACH ROW
EXECUTE FUNCTION public.post_pos_to_journal();
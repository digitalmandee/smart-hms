-- Fix the post_invoice_to_journal trigger (remove status column reference)
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Create journal entry (without status column)
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'Invoice: ' || NEW.invoice_number, 'invoice', NEW.id, true
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
$function$;

-- Fix the post_payment_to_journal trigger similarly
CREATE OR REPLACE FUNCTION public.post_payment_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Create journal entry (without status column)
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, is_posted
  ) VALUES (
    v_invoice.organization_id, v_invoice.branch_id, v_entry_number, CURRENT_DATE,
    'Payment for ' || v_invoice.invoice_number, 'payment', NEW.id, true
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
$function$;

-- Fix the post_pos_to_journal trigger similarly
CREATE OR REPLACE FUNCTION public.post_pos_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Create journal entry (without status column)
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'POS Sale: ' || NEW.transaction_number, 'pos_transaction', NEW.id, true
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
$function$;

-- Fix the post_grn_to_journal trigger similarly
CREATE OR REPLACE FUNCTION public.post_grn_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_inventory_account UUID;
  v_ap_account UUID;
  v_vendor_ap_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_total_amount NUMERIC;
  v_grn_number TEXT;
  v_vendor_name TEXT;
BEGIN
  -- Only trigger when status changes to 'verified'
  IF NEW.status != 'verified' OR OLD.status = 'verified' THEN
    RETURN NEW;
  END IF;
  
  -- Calculate total from invoice_amount or sum of items
  v_total_amount := COALESCE(NEW.invoice_amount, (
    SELECT COALESCE(SUM(quantity_accepted * unit_cost), 0)
    FROM grn_items WHERE grn_id = NEW.id
  ));
  
  IF v_total_amount <= 0 THEN
    RETURN NEW;
  END IF;
  
  -- Get GRN number and vendor name
  v_grn_number := NEW.grn_number;
  SELECT name INTO v_vendor_name FROM vendors WHERE id = NEW.vendor_id;
  
  -- Get or create Inventory Asset account
  v_inventory_account := get_or_create_default_account(
    NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset'
  );
  
  -- Get or create default Accounts Payable account
  v_ap_account := get_or_create_default_account(
    NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability'
  );
  
  -- Check if vendor has a specific AP sub-account
  SELECT ledger_account_id INTO v_vendor_ap_account 
  FROM vendors WHERE id = NEW.vendor_id;
  
  -- Use vendor-specific account if available, otherwise use default AP
  IF v_vendor_ap_account IS NULL THEN
    v_vendor_ap_account := v_ap_account;
  END IF;
  
  -- Generate entry number
  v_entry_number := 'JE-GRN-' || to_char(NOW(), 'YYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Create journal entry (without status column)
  INSERT INTO journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'GRN: ' || v_grn_number || ' - ' || v_vendor_name, 
    'grn', NEW.id, true
  ) RETURNING id INTO v_journal_id;
  
  -- Debit: Inventory Asset
  INSERT INTO journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_inventory_account, 
    'Inventory from ' || v_grn_number, v_total_amount, 0
  );
  
  -- Credit: Accounts Payable
  INSERT INTO journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_vendor_ap_account, 
    'Payable to ' || v_vendor_name, 0, v_total_amount
  );
  
  -- Update account balances
  UPDATE accounts 
  SET current_balance = current_balance + v_total_amount
  WHERE id = v_inventory_account;
  
  UPDATE accounts 
  SET current_balance = current_balance + v_total_amount
  WHERE id = v_vendor_ap_account;
  
  RETURN NEW;
END;
$function$;
-- Migration 1: Remove redundant manual balance updates from invoice, payment, and POS triggers
-- The update_account_balance trigger on journal_entry_lines already handles balance recalculation

-- Fix post_invoice_to_journal: remove manual balance updates
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
  
  -- Removed manual balance updates - handled by update_account_balance trigger
  RETURN NEW;
END;
$function$;

-- Fix post_payment_to_journal: remove manual balance updates
CREATE OR REPLACE FUNCTION public.post_payment_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_target_account UUID;
  v_ar_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_invoice RECORD;
  v_payment_method_account UUID;
BEGIN
  IF COALESCE(NEW.amount, 0) <= 0 THEN RETURN NEW; END IF;
  SELECT * INTO v_invoice FROM public.invoices WHERE id = NEW.invoice_id;
  IF v_invoice IS NULL THEN RETURN NEW; END IF;
  IF NEW.payment_method_id IS NOT NULL THEN
    SELECT ledger_account_id INTO v_payment_method_account FROM public.payment_methods WHERE id = NEW.payment_method_id;
  END IF;
  IF v_payment_method_account IS NOT NULL THEN
    v_target_account := v_payment_method_account;
  ELSE
    v_target_account := public.get_or_create_default_account(v_invoice.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
  END IF;
  v_ar_account := public.get_or_create_default_account(v_invoice.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  v_entry_number := 'JE-PAY-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (v_invoice.organization_id, v_invoice.branch_id, v_entry_number, CURRENT_DATE, 'Payment for ' || v_invoice.invoice_number, 'payment', NEW.id, true)
  RETURNING id INTO v_journal_id;
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_target_account, 'Payment received', NEW.amount, 0);
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ar_account, 'AR reduction', 0, NEW.amount);
  -- Removed manual balance updates - handled by update_account_balance trigger
  RETURN NEW;
END;
$function$;

-- Fix post_pos_to_journal: remove manual balance updates + add COGS posting
CREATE OR REPLACE FUNCTION public.post_pos_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_cash_account UUID;
  v_revenue_account UUID;
  v_cogs_account UUID;
  v_inventory_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_total_cost NUMERIC;
BEGIN
  IF COALESCE(NEW.total_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;

  v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
  v_revenue_account := public.get_or_create_default_account(NEW.organization_id, 'REV-PHARM-001', 'Pharmacy Revenue', 'revenue');
  v_entry_number := 'JE-POS-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'POS Sale: ' || NEW.transaction_number, 'pos_transaction', NEW.id, true)
  RETURNING id INTO v_journal_id;

  -- DR Cash, CR Revenue (sale)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_cash_account, 'POS Cash Sale', NEW.total_amount, 0);
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_revenue_account, 'Pharmacy Sales', 0, NEW.total_amount);

  -- Calculate COGS from POS items cost_price
  SELECT COALESCE(SUM(pi.quantity * COALESCE(m.cost_price, 0)), 0)
  INTO v_total_cost
  FROM public.pharmacy_pos_items pi
  LEFT JOIN public.medicines m ON m.id = pi.medicine_id
  WHERE pi.transaction_id = NEW.id;

  -- Post COGS if there is cost
  IF v_total_cost > 0 THEN
    v_cogs_account := public.get_or_create_default_account(NEW.organization_id, 'EXP-COGS-001', 'Cost of Goods Sold', 'expense');
    v_inventory_account := public.get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');

    -- DR COGS (expense), CR Inventory Asset (reduce stock value)
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cogs_account, 'Cost of goods sold', v_total_cost, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_inventory_account, 'Inventory reduction', 0, v_total_cost);
  END IF;

  -- No manual balance updates - handled by update_account_balance trigger
  RETURN NEW;
END;
$function$;

-- Fix post_vendor_payment_to_journal: resolve payment method ledger account
CREATE OR REPLACE FUNCTION public.post_vendor_payment_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_ap_account UUID;
  v_cash_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_amount NUMERIC;
  v_vendor_name TEXT;
  v_payment_method_account UUID;
BEGIN
  v_amount := COALESCE(NEW.amount, 0);
  IF v_amount <= 0 THEN RETURN NEW; END IF;

  SELECT name INTO v_vendor_name FROM public.vendors WHERE id = NEW.vendor_id;

  v_ap_account := public.get_or_create_default_account(NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability');

  -- Resolve payment method ledger account if available
  IF NEW.payment_method_id IS NOT NULL THEN
    SELECT ledger_account_id INTO v_payment_method_account FROM public.payment_methods WHERE id = NEW.payment_method_id;
  END IF;

  IF v_payment_method_account IS NOT NULL THEN
    v_cash_account := v_payment_method_account;
  ELSE
    v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
  END IF;

  v_entry_number := 'JE-VP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, COALESCE(NEW.payment_date, CURRENT_DATE),
          'Vendor payment: ' || COALESCE(v_vendor_name, 'Unknown') || ' (' || NEW.payment_number || ')',
          'vendor_payment', NEW.id, true)
  RETURNING id INTO v_journal_id;

  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ap_account, 'Vendor payment - AP reduction', v_amount, 0);

  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_cash_account, 'Vendor payment - Cash', 0, v_amount);

  RETURN NEW;
END;
$function$;
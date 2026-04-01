
-- ============================================================
-- FIX 1: Invoice trigger — idempotency + remove manual balance
-- ============================================================
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ar_account UUID;
  v_revenue_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_revenue_code TEXT;
  v_revenue_name TEXT;
BEGIN
  -- Only post for active invoices
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;

  -- Idempotency guard: skip if journal entry already exists for this invoice
  IF EXISTS (
    SELECT 1 FROM public.journal_entries
    WHERE reference_type = 'invoice' AND reference_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Revenue routing by invoice prefix
  IF NEW.invoice_number LIKE 'IPD-%' THEN
    v_revenue_code := '4010'; v_revenue_name := 'IPD Revenue';
  ELSIF NEW.invoice_number LIKE 'LAB-%' THEN
    v_revenue_code := '4030'; v_revenue_name := 'Lab Revenue';
  ELSIF NEW.invoice_number LIKE 'DLY-%' THEN
    v_revenue_code := '4040'; v_revenue_name := 'Dialysis Revenue';
  ELSIF NEW.invoice_number LIKE 'ER-%' THEN
    v_revenue_code := '4020'; v_revenue_name := 'Emergency Revenue';
  ELSIF NEW.invoice_number LIKE 'IMG-%' THEN
    v_revenue_code := '4050'; v_revenue_name := 'Imaging Revenue';
  ELSE
    v_revenue_code := 'REV-001'; v_revenue_name := 'OPD Revenue';
  END IF;

  v_ar_account := public.get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  v_revenue_account := public.get_or_create_default_account(NEW.organization_id, v_revenue_code, v_revenue_name, 'revenue');

  v_entry_number := 'JE-INV-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date, description,
    reference_type, reference_id, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'Invoice: ' || NEW.invoice_number,
    'invoice', NEW.id, true
  ) RETURNING id INTO v_journal_id;

  -- Debit: AR
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ar_account, 'Accounts Receivable', NEW.total_amount, 0);

  -- Credit: Revenue
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_revenue_account, v_revenue_name, 0, NEW.total_amount);

  -- NO manual balance updates — handled by update_account_balance trigger

  RETURN NEW;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trg_post_invoice_to_journal ON public.invoices;
CREATE TRIGGER trg_post_invoice_to_journal
  AFTER INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.post_invoice_to_journal();


-- ============================================================
-- FIX 2: Expense trigger — category routing + payment method
-- ============================================================
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
  v_expense_code TEXT;
  v_expense_name TEXT;
  v_credit_account UUID;
BEGIN
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Idempotency guard
  IF EXISTS (
    SELECT 1 FROM public.journal_entries
    WHERE reference_type = 'expense' AND reference_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;

  -- Category-based expense account routing
  CASE NEW.category
    WHEN 'petty_cash' THEN
      v_expense_code := 'EXP-PETTY-001'; v_expense_name := 'Petty Cash Expenses';
    WHEN 'refund' THEN
      v_expense_code := 'EXP-REF-001'; v_expense_name := 'Refund Expenses';
    WHEN 'staff_advance' THEN
      v_expense_code := 'EXP-ADV-001'; v_expense_name := 'Staff Advance';
    ELSE
      v_expense_code := '5500'; v_expense_name := 'Administrative Expenses';
  END CASE;

  v_expense_account := public.get_or_create_default_account(NEW.organization_id, v_expense_code, v_expense_name, 'expense');

  -- Resolve credit account: payment method ledger or default Cash
  IF NEW.payment_method_id IS NOT NULL THEN
    SELECT ledger_account_id INTO v_credit_account
    FROM public.payment_methods
    WHERE id = NEW.payment_method_id AND ledger_account_id IS NOT NULL;
  END IF;

  IF v_credit_account IS NULL THEN
    v_credit_account := public.get_or_create_default_account(NEW.organization_id, '1000', 'Cash in Hand', 'asset');
  END IF;

  v_entry_number := 'JE-EXP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date, description,
    reference_type, reference_id, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'Expense: ' || COALESCE(NEW.description, NEW.expense_number),
    'expense', NEW.id, true
  ) RETURNING id INTO v_journal_id;

  -- Debit: Expense
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_expense_account, v_expense_name || ': ' || COALESCE(NEW.description, ''), NEW.amount, 0);

  -- Credit: Cash/Bank
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_credit_account, 'Expense payment', 0, NEW.amount);

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_post_expense_to_journal ON public.expenses;
CREATE TRIGGER trg_post_expense_to_journal
  AFTER INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.post_expense_to_journal();


-- ============================================================
-- FIX 3: GRN trigger — add branch_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.post_grn_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_inventory_account UUID;
  v_ap_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_total NUMERIC;
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN

    IF NEW.organization_id IS NULL THEN
      RAISE WARNING 'post_grn_to_journal: organization_id is NULL for GRN %, skipping', NEW.id;
      RETURN NEW;
    END IF;

    -- Idempotency guard
    IF EXISTS (
      SELECT 1 FROM public.journal_entries
      WHERE reference_type = 'grn' AND reference_id = NEW.id
    ) THEN
      RETURN NEW;
    END IF;

    SELECT COALESCE(SUM(COALESCE(quantity_received, 0) * COALESCE(unit_cost, 0)), 0)
    INTO v_total
    FROM public.grn_items
    WHERE grn_id = NEW.id;

    IF v_total <= 0 THEN RETURN NEW; END IF;

    v_inventory_account := public.get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');
    v_ap_account := public.get_or_create_default_account(NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability');

    v_entry_number := 'JE-GRN-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (
      organization_id, branch_id, entry_number, entry_date, description,
      reference_type, reference_id, is_posted
    ) VALUES (
      NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
      'GRN: ' || NEW.grn_number,
      'grn', NEW.id, true
    ) RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_inventory_account, 'Inventory received', v_total, 0);

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_ap_account, 'Payable to vendor', 0, v_total);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_post_grn_to_journal ON public.goods_received_notes;
CREATE TRIGGER trg_post_grn_to_journal
  AFTER UPDATE ON public.goods_received_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.post_grn_to_journal();


-- ============================================================
-- FIX 5: Recalculate all account balances to fix double-counting
-- ============================================================
UPDATE public.accounts a
SET current_balance = sub.new_balance, updated_at = now()
FROM (
  SELECT
    acc.id,
    acc.opening_balance + CASE
      WHEN at.is_debit_normal THEN COALESCE(totals.total_debit, 0) - COALESCE(totals.total_credit, 0)
      ELSE COALESCE(totals.total_credit, 0) - COALESCE(totals.total_debit, 0)
    END AS new_balance
  FROM public.accounts acc
  JOIN public.account_types at ON at.id = acc.account_type_id
  LEFT JOIN (
    SELECT jel.account_id,
      SUM(jel.debit_amount) AS total_debit,
      SUM(jel.credit_amount) AS total_credit
    FROM public.journal_entry_lines jel
    JOIN public.journal_entries je ON je.id = jel.journal_entry_id AND je.is_posted = true
    GROUP BY jel.account_id
  ) totals ON totals.account_id = acc.id
  WHERE acc.is_header = false
) sub
WHERE a.id = sub.id;

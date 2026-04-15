
-- =====================================================
-- PHASE 1: Fix GL Posting Integrity
-- PHASE 2: Add Traceability Columns
-- =====================================================

-- 1. Add 'invoice_cancellation' and 'write_off' to reference_type check
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_reference_type_check;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_reference_type_check
  CHECK (reference_type IS NULL OR reference_type = ANY (ARRAY[
    'invoice','payment','expense','payroll','pos_transaction',
    'patient_deposit','credit_note','grn','donation','vendor_payment',
    'stock_adjustment','shipment','manual','opening_balance',
    'cpv','crv','bpv','brv','surgery',
    'invoice_cancellation','write_off'
  ]));

-- 2. Add traceability columns to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.doctors(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS admission_id UUID REFERENCES public.admissions(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.appointments(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS department TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_doctor_id ON public.invoices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_admission_id ON public.invoices(admission_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON public.invoices(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_department ON public.invoices(department);

-- 3. Add payment_method_id to POS transactions
ALTER TABLE public.pharmacy_pos_transactions ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES public.payment_methods(id);

-- 4. Backfill appointment linkage from existing appointments table
UPDATE public.invoices i SET appointment_id = a.id
FROM public.appointments a
WHERE a.invoice_id = i.id AND i.appointment_id IS NULL;

-- =====================================================
-- 5. REFACTOR: post_invoice_to_journal — split tax/discount/revenue
-- =====================================================
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_ar_account UUID;
  v_revenue_account UUID;
  v_tax_account UUID;
  v_discount_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_revenue_code TEXT;
  v_revenue_name TEXT;
  v_subtotal NUMERIC;
  v_tax NUMERIC;
  v_discount NUMERIC;
  v_total NUMERIC;
BEGIN
  -- Only post for active invoices
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;

  -- Idempotency guard
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

  v_subtotal := COALESCE(NEW.subtotal, NEW.total_amount);
  v_tax := COALESCE(NEW.tax_amount, 0);
  v_discount := COALESCE(NEW.discount_amount, 0);
  v_total := COALESCE(NEW.total_amount, 0);

  -- If subtotal equals total and there's tax/discount, recalculate
  IF v_subtotal = v_total AND (v_tax > 0 OR v_discount > 0) THEN
    v_subtotal := v_total + v_discount - v_tax;
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

  -- DR: Accounts Receivable = total_amount (what customer owes)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ar_account, 'Accounts Receivable', v_total, 0);

  -- CR: Revenue = subtotal (gross revenue before tax/discount)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_revenue_account, v_revenue_name, 0, v_subtotal);

  -- CR: Tax Payable (if any)
  IF v_tax > 0 THEN
    v_tax_account := public.get_or_create_default_account(NEW.organization_id, '2200', 'Tax Payable', 'liability');
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_tax_account, 'VAT/Tax Payable', 0, v_tax);
  END IF;

  -- DR: Discounts Allowed (contra-revenue, if any)
  IF v_discount > 0 THEN
    v_discount_account := public.get_or_create_default_account(NEW.organization_id, 'DISC-001', 'Discounts Allowed', 'revenue');
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_discount_account, 'Discount Allowed', v_discount, 0);
  END IF;

  RETURN NEW;
END;
$function$;

-- =====================================================
-- 6. NEW: Invoice cancellation reversal trigger
-- =====================================================
CREATE OR REPLACE FUNCTION public.post_invoice_cancellation_reversal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_original_je_id UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_line RECORD;
BEGIN
  -- Only fire when status changes TO 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN

    -- Find original journal entry
    SELECT id INTO v_original_je_id
    FROM public.journal_entries
    WHERE reference_type = 'invoice' AND reference_id = NEW.id
    LIMIT 1;

    IF v_original_je_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Idempotency: check if reversal already exists
    IF EXISTS (
      SELECT 1 FROM public.journal_entries
      WHERE reference_type = 'invoice_cancellation' AND reference_id = NEW.id
    ) THEN
      RETURN NEW;
    END IF;

    v_entry_number := 'JE-CANC-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (
      organization_id, branch_id, entry_number, entry_date, description,
      reference_type, reference_id, is_posted
    ) VALUES (
      NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
      'Cancellation reversal: ' || NEW.invoice_number,
      'invoice_cancellation', NEW.id, true
    ) RETURNING id INTO v_journal_id;

    -- Reverse all lines: swap debit and credit
    FOR v_line IN
      SELECT account_id, description, debit_amount, credit_amount
      FROM public.journal_entry_lines
      WHERE journal_entry_id = v_original_je_id
    LOOP
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (v_journal_id, v_line.account_id, 'Reversal: ' || v_line.description, v_line.credit_amount, v_line.debit_amount);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_invoice_cancellation_reversal ON public.invoices;
CREATE TRIGGER trg_invoice_cancellation_reversal
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.post_invoice_cancellation_reversal();

-- =====================================================
-- 7. FIX: Credit note trigger — resolve original revenue account
-- =====================================================
CREATE OR REPLACE FUNCTION public.post_credit_note_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_revenue_account UUID;
  v_ar_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_original_revenue_account UUID;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN

    -- Try to find original invoice's revenue account from its journal entry
    IF NEW.invoice_id IS NOT NULL THEN
      SELECT jel.account_id INTO v_original_revenue_account
      FROM public.journal_entries je
      JOIN public.journal_entry_lines jel ON jel.journal_entry_id = je.id
      JOIN public.accounts a ON a.id = jel.account_id
      JOIN public.account_types at ON at.id = a.account_type_id
      WHERE je.reference_type = 'invoice' AND je.reference_id = NEW.invoice_id
        AND jel.credit_amount > 0
        AND at.category = 'revenue'
      ORDER BY jel.credit_amount DESC
      LIMIT 1;
    END IF;

    -- Fallback to OPD Revenue if not found
    v_revenue_account := COALESCE(
      v_original_revenue_account,
      public.get_or_create_default_account(NEW.organization_id, 'REV-001', 'Service Revenue', 'revenue')
    );

    v_ar_account := public.get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
    v_entry_number := 'JE-CN-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 
            'Credit Note: ' || NEW.credit_note_number || ' - ' || COALESCE(NEW.reason, 'Adjustment'),
            'credit_note', NEW.id, true)
    RETURNING id INTO v_journal_id;

    -- Debit Revenue (reduce), Credit AR (reduce)
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_revenue_account, 'Revenue reversal - ' || NEW.credit_note_number, NEW.total_amount, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_ar_account, 'AR adjustment - ' || NEW.credit_note_number, 0, NEW.total_amount);

    UPDATE public.credit_notes SET journal_entry_id = v_journal_id, updated_at = now() WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

-- =====================================================
-- 8. FIX: POS trigger — resolve payment method dynamically
-- =====================================================
CREATE OR REPLACE FUNCTION public.post_pos_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_debit_account UUID;
  v_revenue_account UUID;
  v_cogs_account UUID;
  v_inventory_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_total_cost NUMERIC;
  v_ledger_account_id UUID;
BEGIN
  IF COALESCE(NEW.total_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;

  -- Idempotency guard
  IF EXISTS (
    SELECT 1 FROM public.journal_entries
    WHERE reference_type = 'pos_transaction' AND reference_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  -- Resolve payment method: check if payment_method_id links to a ledger account
  IF NEW.payment_method_id IS NOT NULL THEN
    SELECT pm.ledger_account_id INTO v_ledger_account_id
    FROM public.payment_methods pm
    WHERE pm.id = NEW.payment_method_id AND pm.ledger_account_id IS NOT NULL;
  END IF;

  -- Use resolved account or default to Cash
  v_debit_account := COALESCE(
    v_ledger_account_id,
    public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset')
  );

  v_revenue_account := public.get_or_create_default_account(NEW.organization_id, 'REV-PHARM-001', 'Pharmacy Revenue', 'revenue');
  v_entry_number := 'JE-POS-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'POS Sale: ' || NEW.transaction_number, 'pos_transaction', NEW.id, true)
  RETURNING id INTO v_journal_id;

  -- DR Cash/Bank, CR Revenue
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_debit_account, 'POS Sale', NEW.total_amount, 0);
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_revenue_account, 'Pharmacy Sales', 0, NEW.total_amount);

  -- Calculate COGS
  SELECT COALESCE(SUM(pi.quantity * COALESCE(m.cost_price, 0)), 0)
  INTO v_total_cost
  FROM public.pharmacy_pos_items pi
  LEFT JOIN public.medicines m ON m.id = pi.medicine_id
  WHERE pi.transaction_id = NEW.id;

  IF v_total_cost > 0 THEN
    v_cogs_account := public.get_or_create_default_account(NEW.organization_id, 'EXP-COGS-001', 'Cost of Goods Sold', 'expense');
    v_inventory_account := public.get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cogs_account, 'Cost of goods sold', v_total_cost, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_inventory_account, 'Inventory reduction', 0, v_total_cost);
  END IF;

  RETURN NEW;
END;
$function$;

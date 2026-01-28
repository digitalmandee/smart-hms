-- Add ledger_account_id to payment_methods for proper journal mapping
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS ledger_account_id UUID REFERENCES accounts(id);

-- Create doctor_settlements table for settlement history and receipts
CREATE TABLE IF NOT EXISTS doctor_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  settlement_number TEXT UNIQUE,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  earning_ids UUID[] NOT NULL DEFAULT '{}',
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  settled_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on doctor_settlements
ALTER TABLE doctor_settlements ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctor_settlements
CREATE POLICY "Users can view settlements in their organization"
ON doctor_settlements FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users with payroll permission can create settlements"
ON doctor_settlements FOR INSERT
WITH CHECK (
  organization_id = public.get_user_organization_id() 
  AND public.has_permission('payroll.manage')
);

-- Generate settlement number trigger
CREATE OR REPLACE FUNCTION generate_settlement_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(settlement_number FROM 14) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM doctor_settlements
  WHERE organization_id = NEW.organization_id
    AND settlement_number LIKE 'SET-' || date_part || '-%';
  
  NEW.settlement_number := 'SET-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_settlement_number ON doctor_settlements;
CREATE TRIGGER trg_generate_settlement_number
BEFORE INSERT ON doctor_settlements
FOR EACH ROW
WHEN (NEW.settlement_number IS NULL)
EXECUTE FUNCTION generate_settlement_number();

-- Update post_payment_to_journal to use payment method's ledger account
CREATE OR REPLACE FUNCTION public.post_payment_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_target_account UUID;
  v_ar_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_invoice RECORD;
  v_payment_method_account UUID;
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
  
  -- Try to get ledger account from payment method
  IF NEW.payment_method_id IS NOT NULL THEN
    SELECT ledger_account_id INTO v_payment_method_account
    FROM public.payment_methods
    WHERE id = NEW.payment_method_id;
  END IF;
  
  -- Use payment method's ledger account if available, otherwise default to cash
  IF v_payment_method_account IS NOT NULL THEN
    v_target_account := v_payment_method_account;
  ELSE
    v_target_account := public.get_or_create_default_account(
      v_invoice.organization_id, 'CASH-001', 'Cash in Hand', 'asset'
    );
  END IF;
  
  v_ar_account := public.get_or_create_default_account(
    v_invoice.organization_id, 'AR-001', 'Accounts Receivable', 'asset'
  );
  
  -- Generate entry number
  v_entry_number := 'JE-PAY-' || to_char(NOW(), 'YYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Create journal entry
  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, is_posted
  ) VALUES (
    v_invoice.organization_id, v_invoice.branch_id, v_entry_number, CURRENT_DATE,
    'Payment for ' || v_invoice.invoice_number, 'payment', NEW.id, true
  ) RETURNING id INTO v_journal_id;
  
  -- Debit: Target Account (Cash/Bank/JazzCash/EasyPaisa based on payment method)
  INSERT INTO public.journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_target_account, 'Payment received', NEW.amount, 0
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
  WHERE id = v_target_account;
  
  UPDATE public.accounts 
  SET current_balance = current_balance - NEW.amount,
      updated_at = NOW()
  WHERE id = v_ar_account;
  
  RETURN NEW;
END;
$function$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_doctor_settlements_org_date 
ON doctor_settlements(organization_id, settlement_date DESC);

CREATE INDEX IF NOT EXISTS idx_doctor_settlements_doctor 
ON doctor_settlements(doctor_id);
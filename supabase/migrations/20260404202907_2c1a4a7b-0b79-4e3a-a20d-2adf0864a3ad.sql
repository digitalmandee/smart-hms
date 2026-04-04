
-- Add voucher columns to journal_entries
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS voucher_type TEXT DEFAULT 'JV' CHECK (voucher_type IN ('CPV','CRV','BPV','BRV','JV')),
  ADD COLUMN IF NOT EXISTS posting_date DATE,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR',
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(15,6) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES public.accounts(id),
  ADD COLUMN IF NOT EXISTS cheque_number TEXT,
  ADD COLUMN IF NOT EXISTS instrument_date DATE,
  ADD COLUMN IF NOT EXISTS instrument_reference TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft','posted','cancelled')),
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS external_reference TEXT;

-- Set posting_date to entry_date for existing rows
UPDATE public.journal_entries SET posting_date = entry_date WHERE posting_date IS NULL;

-- Set status based on is_posted for existing rows
UPDATE public.journal_entries SET status = CASE WHEN is_posted = true THEN 'posted' ELSE 'draft' END WHERE status = 'draft' AND is_posted = true;

-- Add branch_id to journal_entry_lines for cross-branch line tracking
ALTER TABLE public.journal_entry_lines
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Drop existing reference_type constraint if it exists, then re-add with new values
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_reference_type_check;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_reference_type_check
  CHECK (reference_type IS NULL OR reference_type IN (
    'manual','invoice','payment','expense','payroll','pos_transaction','pos_sale',
    'shipment','stock_adjustment','grn','vendor_payment','patient_deposit',
    'credit_note','donation','cpv','crv','bpv','brv'
  ));

-- Create voucher number generation function
CREATE OR REPLACE FUNCTION public.generate_voucher_number(p_voucher_type TEXT, p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_year TEXT;
  v_seq INT;
  v_prefix TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_prefix := p_voucher_type || '-' || v_year || '-';
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(entry_number FROM LENGTH(v_prefix) + 1) AS INT)
  ), 0) + 1
  INTO v_seq
  FROM public.journal_entries
  WHERE organization_id = p_org_id
    AND entry_number LIKE v_prefix || '%';
  
  RETURN v_prefix || LPAD(v_seq::TEXT, 5, '0');
END;
$$;

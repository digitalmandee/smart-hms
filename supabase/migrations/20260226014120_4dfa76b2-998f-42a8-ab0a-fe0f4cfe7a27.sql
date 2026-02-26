
-- =============================================
-- DONATION MANAGEMENT MODULE - Database Schema
-- =============================================

-- 1. financial_donors table
CREATE TABLE public.financial_donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  donor_number TEXT NOT NULL,
  donor_type TEXT NOT NULL DEFAULT 'individual',
  name TEXT NOT NULL,
  name_ar TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  cnic_passport TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_donated NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_donations_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. financial_donations table
CREATE TABLE public.financial_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  donor_id UUID NOT NULL REFERENCES public.financial_donors(id) ON DELETE CASCADE,
  donation_number TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  donation_type TEXT NOT NULL DEFAULT 'one_time',
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_reference TEXT,
  purpose TEXT NOT NULL DEFAULT 'general',
  purpose_detail TEXT,
  receipt_number TEXT,
  receipt_issued BOOLEAN NOT NULL DEFAULT false,
  receipt_issued_at TIMESTAMPTZ,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. donation_recurring_schedules table
CREATE TABLE public.donation_recurring_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.financial_donors(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  purpose TEXT DEFAULT 'general',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  next_due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_donation_id UUID REFERENCES public.financial_donations(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  total_collected NUMERIC(15,2) NOT NULL DEFAULT 0,
  installments_paid INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. donation_reminders table
CREATE TABLE public.donation_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.donation_recurring_schedules(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.financial_donors(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'upcoming',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_financial_donors_org ON public.financial_donors(organization_id);
CREATE INDEX idx_financial_donors_donor_number ON public.financial_donors(donor_number);
CREATE INDEX idx_financial_donations_org ON public.financial_donations(organization_id);
CREATE INDEX idx_financial_donations_donor ON public.financial_donations(donor_id);
CREATE INDEX idx_financial_donations_date ON public.financial_donations(donation_date);
CREATE INDEX idx_financial_donations_number ON public.financial_donations(donation_number);
CREATE INDEX idx_donation_recurring_org ON public.donation_recurring_schedules(organization_id);
CREATE INDEX idx_donation_recurring_donor ON public.donation_recurring_schedules(donor_id);
CREATE INDEX idx_donation_recurring_next_due ON public.donation_recurring_schedules(next_due_date);
CREATE INDEX idx_donation_reminders_org ON public.donation_reminders(organization_id);
CREATE INDEX idx_donation_reminders_schedule ON public.donation_reminders(schedule_id);

-- =============================================
-- AUTO-NUMBER TRIGGERS
-- =============================================

-- Generate financial donor number: FD-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION public.generate_financial_donor_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(donor_number FROM 13) AS INT)), 0) + 1
  INTO seq_num
  FROM public.financial_donors
  WHERE organization_id = NEW.organization_id
    AND donor_number LIKE 'FD-' || date_part || '-%';
  NEW.donor_number := 'FD-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_financial_donor_number
BEFORE INSERT ON public.financial_donors
FOR EACH ROW
EXECUTE FUNCTION public.generate_financial_donor_number();

-- Generate financial donation number: FDON-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION public.generate_financial_donation_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(donation_number FROM 15) AS INT)), 0) + 1
  INTO seq_num
  FROM public.financial_donations
  WHERE organization_id = NEW.organization_id
    AND donation_number LIKE 'FDON-' || date_part || '-%';
  NEW.donation_number := 'FDON-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_financial_donation_number
BEFORE INSERT ON public.financial_donations
FOR EACH ROW
EXECUTE FUNCTION public.generate_financial_donation_number();

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER update_financial_donors_updated_at
BEFORE UPDATE ON public.financial_donors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_donations_updated_at
BEFORE UPDATE ON public.financial_donations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donation_recurring_schedules_updated_at
BEFORE UPDATE ON public.donation_recurring_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- JOURNAL INTEGRATION TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.post_donation_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_donation_revenue_account UUID;
  v_cash_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_donor_name TEXT;
BEGIN
  -- Only post when status is 'received'
  IF NEW.status = 'received' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'received')) THEN
    IF COALESCE(NEW.amount, 0) <= 0 THEN RETURN NEW; END IF;

    SELECT name INTO v_donor_name FROM public.financial_donors WHERE id = NEW.donor_id;

    v_donation_revenue_account := public.get_or_create_default_account(NEW.organization_id, 'REV-DON-001', 'Donation Revenue', 'revenue');
    
    v_cash_account := CASE NEW.payment_method
      WHEN 'bank_transfer' THEN public.get_or_create_default_account(NEW.organization_id, '1010', 'Bank Account', 'asset')
      ELSE public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset')
    END;

    v_entry_number := 'JE-DON-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, NEW.donation_date,
            'Donation from ' || COALESCE(v_donor_name, 'Anonymous') || ' - ' || COALESCE(NEW.purpose, 'general'),
            'donation', NEW.id, true)
    RETURNING id INTO v_journal_id;

    -- Debit: Cash/Bank
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cash_account, 'Donation received', NEW.amount, 0);

    -- Credit: Donation Revenue
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_donation_revenue_account, 'Donation revenue', 0, NEW.amount);

    -- Update donor totals
    UPDATE public.financial_donors
    SET total_donated = total_donated + NEW.amount,
        total_donations_count = total_donations_count + 1
    WHERE id = NEW.donor_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_post_donation_to_journal
AFTER INSERT OR UPDATE ON public.financial_donations
FOR EACH ROW
EXECUTE FUNCTION public.post_donation_to_journal();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- financial_donors RLS
ALTER TABLE public.financial_donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view financial donors in their org"
ON public.financial_donors FOR SELECT
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert financial donors in their org"
ON public.financial_donors FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update financial donors in their org"
ON public.financial_donors FOR UPDATE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete financial donors in their org"
ON public.financial_donors FOR DELETE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- financial_donations RLS
ALTER TABLE public.financial_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view financial donations in their org"
ON public.financial_donations FOR SELECT
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert financial donations in their org"
ON public.financial_donations FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update financial donations in their org"
ON public.financial_donations FOR UPDATE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete financial donations in their org"
ON public.financial_donations FOR DELETE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- donation_recurring_schedules RLS
ALTER TABLE public.donation_recurring_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recurring schedules in their org"
ON public.donation_recurring_schedules FOR SELECT
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert recurring schedules in their org"
ON public.donation_recurring_schedules FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update recurring schedules in their org"
ON public.donation_recurring_schedules FOR UPDATE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete recurring schedules in their org"
ON public.donation_recurring_schedules FOR DELETE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- donation_reminders RLS
ALTER TABLE public.donation_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view donation reminders in their org"
ON public.donation_reminders FOR SELECT
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert donation reminders in their org"
ON public.donation_reminders FOR INSERT
TO authenticated
WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update donation reminders in their org"
ON public.donation_reminders FOR UPDATE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete donation reminders in their org"
ON public.donation_reminders FOR DELETE
TO authenticated
USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));


-- Credit Notes table
CREATE TABLE public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  credit_note_number TEXT,
  note_type TEXT NOT NULL DEFAULT 'credit',
  invoice_id UUID REFERENCES public.invoices(id),
  patient_id UUID REFERENCES public.patients(id),
  amount NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  zatca_document_type TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view credit notes in their org" ON public.credit_notes
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert credit notes in their org" ON public.credit_notes
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update credit notes in their org" ON public.credit_notes
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Credit Note number generator
CREATE OR REPLACE FUNCTION public.generate_credit_note_number()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
DECLARE
  date_part TEXT;
  seq_num INT;
  prefix TEXT;
BEGIN
  prefix := CASE WHEN NEW.note_type = 'debit' THEN 'DN' ELSE 'CN' END;
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(credit_note_number FROM LENGTH(prefix) + 2 + 8) AS INT)), 0) + 1
  INTO seq_num FROM public.credit_notes
  WHERE organization_id = NEW.organization_id
    AND credit_note_number LIKE prefix || '-' || date_part || '-%';
  NEW.credit_note_number := prefix || '-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_credit_note_number
  BEFORE INSERT ON public.credit_notes
  FOR EACH ROW WHEN (NEW.credit_note_number IS NULL)
  EXECUTE FUNCTION public.generate_credit_note_number();

-- Cost Centers table
CREATE TABLE public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cost centers in their org" ON public.cost_centers
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage cost centers in their org" ON public.cost_centers
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Add cost_center_id to journal_entry_lines
ALTER TABLE public.journal_entry_lines ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);

-- Fixed Assets table
CREATE TABLE public.fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  asset_code TEXT,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  location TEXT,
  purchase_date DATE NOT NULL,
  purchase_cost NUMERIC(12,2) NOT NULL,
  useful_life_months INTEGER NOT NULL,
  depreciation_method TEXT NOT NULL DEFAULT 'straight_line',
  salvage_value NUMERIC(12,2) DEFAULT 0,
  accumulated_depreciation NUMERIC(12,2) DEFAULT 0,
  net_book_value NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'active',
  disposed_date DATE,
  disposal_amount NUMERIC(12,2),
  disposal_journal_id UUID REFERENCES public.journal_entries(id),
  account_id UUID REFERENCES public.accounts(id),
  depreciation_account_id UUID REFERENCES public.accounts(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fixed assets in their org" ON public.fixed_assets
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage fixed assets in their org" ON public.fixed_assets
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Fixed asset code generator
CREATE OR REPLACE FUNCTION public.generate_fixed_asset_code()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
DECLARE
  seq_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(asset_code FROM 4) AS INT)), 0) + 1
  INTO seq_num FROM public.fixed_assets
  WHERE organization_id = NEW.organization_id;
  NEW.asset_code := 'FA-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_fixed_asset_code
  BEFORE INSERT ON public.fixed_assets
  FOR EACH ROW WHEN (NEW.asset_code IS NULL)
  EXECUTE FUNCTION public.generate_fixed_asset_code();

-- Patient Deposits table
CREATE TABLE public.patient_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'deposit',
  payment_method_id UUID REFERENCES public.payment_methods(id),
  billing_session_id UUID REFERENCES public.billing_sessions(id),
  invoice_id UUID REFERENCES public.invoices(id),
  reference_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patient deposits in their org" ON public.patient_deposits
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage patient deposits in their org" ON public.patient_deposits
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Auto-post patient deposit to journal
CREATE OR REPLACE FUNCTION public.post_patient_deposit_to_journal()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_cash_account UUID;
  v_deposit_liability_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
BEGIN
  IF NEW.type = 'deposit' AND COALESCE(NEW.amount, 0) > 0 THEN
    v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
    v_deposit_liability_account := public.get_or_create_default_account(NEW.organization_id, 'LIA-DEP-001', 'Patient Deposits', 'liability');
    v_entry_number := 'JE-DEP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'Patient deposit received', 'patient_deposit', NEW.id, true)
    RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cash_account, 'Cash received - patient deposit', NEW.amount, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_deposit_liability_account, 'Patient deposit liability', 0, NEW.amount);

    UPDATE public.patient_deposits SET journal_entry_id = v_journal_id WHERE id = NEW.id;
  ELSIF NEW.type = 'refund' AND COALESCE(NEW.amount, 0) > 0 THEN
    v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
    v_deposit_liability_account := public.get_or_create_default_account(NEW.organization_id, 'LIA-DEP-001', 'Patient Deposits', 'liability');
    v_entry_number := 'JE-REF-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'Patient deposit refund', 'patient_deposit', NEW.id, true)
    RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_deposit_liability_account, 'Patient deposit refund', NEW.amount, 0);
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_cash_account, 'Cash paid - deposit refund', 0, NEW.amount);

    UPDATE public.patient_deposits SET journal_entry_id = v_journal_id WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER post_patient_deposit_journal
  AFTER INSERT ON public.patient_deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.post_patient_deposit_to_journal();

-- Auto-post credit note to journal
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
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    v_revenue_account := public.get_or_create_default_account(NEW.organization_id, 'REV-001', 'Service Revenue', 'revenue');
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

CREATE TRIGGER post_credit_note_journal
  AFTER UPDATE ON public.credit_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.post_credit_note_to_journal();

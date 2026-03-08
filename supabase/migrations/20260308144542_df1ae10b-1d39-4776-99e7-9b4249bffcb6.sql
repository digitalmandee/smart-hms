
-- =============================================================
-- 1. FIX: Vendor Payment → Journal Entry trigger
-- =============================================================
CREATE OR REPLACE FUNCTION public.post_vendor_payment_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_ap_account UUID;
  v_cash_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_amount NUMERIC;
  v_vendor_name TEXT;
BEGIN
  v_amount := COALESCE(NEW.amount, 0);
  IF v_amount <= 0 THEN RETURN NEW; END IF;

  -- Get vendor name for description
  SELECT name INTO v_vendor_name FROM public.vendors WHERE id = NEW.vendor_id;

  v_ap_account := public.get_or_create_default_account(NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability');
  v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');

  v_entry_number := 'JE-VP-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, COALESCE(NEW.payment_date, CURRENT_DATE),
          'Vendor payment: ' || COALESCE(v_vendor_name, 'Unknown') || ' (' || NEW.payment_number || ')',
          'vendor_payment', NEW.id, true)
  RETURNING id INTO v_journal_id;

  -- Debit: Accounts Payable (reduce liability)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ap_account, 'Vendor payment - AP reduction', v_amount, 0);

  -- Credit: Cash (reduce asset)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_cash_account, 'Vendor payment - Cash', 0, v_amount);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_post_vendor_payment_to_journal
  AFTER INSERT ON public.vendor_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.post_vendor_payment_to_journal();

-- =============================================================
-- 2. DIALYSIS MODULE TABLES
-- =============================================================

-- Dialysis patient profile (extends patients table)
CREATE TABLE public.dialysis_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  dry_weight_kg NUMERIC(5,2),
  vascular_access_type TEXT CHECK (vascular_access_type IN ('av_fistula','av_graft','temporary_catheter','permanent_catheter')),
  access_location TEXT,
  access_date DATE,
  hepatitis_b_status TEXT CHECK (hepatitis_b_status IN ('positive','negative','unknown')),
  hepatitis_c_status TEXT CHECK (hepatitis_c_status IN ('positive','negative','unknown')),
  hiv_status TEXT CHECK (hiv_status IN ('positive','negative','unknown')),
  epo_protocol JSONB DEFAULT '{}',
  iron_protocol JSONB DEFAULT '{}',
  dialysis_frequency TEXT DEFAULT '3x_week',
  shift_preference TEXT CHECK (shift_preference IN ('morning','afternoon','evening')),
  schedule_pattern TEXT CHECK (schedule_pattern IN ('mwf','tts')),
  primary_nephrologist_id UUID REFERENCES public.doctors(id),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, organization_id)
);

ALTER TABLE public.dialysis_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dialysis patients in their org" ON public.dialysis_patients FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dialysis patients in their org" ON public.dialysis_patients FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Dialysis machines
CREATE TABLE public.dialysis_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  machine_number TEXT NOT NULL,
  serial_number TEXT,
  model TEXT,
  manufacturer TEXT,
  chair_number TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','in_use','maintenance','out_of_service')),
  last_disinfection_at TIMESTAMPTZ,
  next_maintenance_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dialysis_machines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dialysis machines in their org" ON public.dialysis_machines FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dialysis machines in their org" ON public.dialysis_machines FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Dialysis sessions
CREATE TABLE public.dialysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  dialysis_patient_id UUID NOT NULL REFERENCES public.dialysis_patients(id),
  machine_id UUID REFERENCES public.dialysis_machines(id),
  admission_id UUID REFERENCES public.admissions(id),
  appointment_id UUID REFERENCES public.appointments(id),
  session_number TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift TEXT CHECK (shift IN ('morning','afternoon','evening')),
  chair_number TEXT,
  -- Pre-dialysis
  pre_weight_kg NUMERIC(5,2),
  pre_bp_systolic INTEGER,
  pre_bp_diastolic INTEGER,
  pre_pulse INTEGER,
  pre_temperature NUMERIC(4,1),
  target_uf_ml INTEGER,
  -- Session parameters
  dialyzer_type TEXT,
  dialysate_flow_ml_min INTEGER DEFAULT 500,
  blood_flow_ml_min INTEGER DEFAULT 300,
  heparin_dose TEXT,
  duration_minutes INTEGER DEFAULT 240,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  -- Post-dialysis
  post_weight_kg NUMERIC(5,2),
  post_bp_systolic INTEGER,
  post_bp_diastolic INTEGER,
  post_pulse INTEGER,
  actual_uf_ml INTEGER,
  blood_loss_ml INTEGER DEFAULT 0,
  -- Clinical
  complications TEXT,
  nursing_notes TEXT,
  doctor_notes TEXT,
  attended_by UUID REFERENCES public.doctors(id),
  nurse_id UUID REFERENCES public.profiles(id),
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled','missed')),
  invoice_id UUID REFERENCES public.invoices(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dialysis_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dialysis sessions in their org" ON public.dialysis_sessions FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dialysis sessions in their org" ON public.dialysis_sessions FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Dialysis intra-session vitals (every 30 min)
CREATE TABLE public.dialysis_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.dialysis_sessions(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  minute_mark INTEGER,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  pulse INTEGER,
  temperature NUMERIC(4,1),
  blood_flow_rate INTEGER,
  uf_rate INTEGER,
  tmp NUMERIC(5,1),
  venous_pressure INTEGER,
  arterial_pressure INTEGER,
  conductivity NUMERIC(4,2),
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dialysis_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dialysis vitals via session org" ON public.dialysis_vitals FOR SELECT TO authenticated USING (session_id IN (SELECT id FROM public.dialysis_sessions WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Users can manage dialysis vitals via session org" ON public.dialysis_vitals FOR ALL TO authenticated USING (session_id IN (SELECT id FROM public.dialysis_sessions WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

-- Dialysis schedules (recurring)
CREATE TABLE public.dialysis_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  dialysis_patient_id UUID NOT NULL REFERENCES public.dialysis_patients(id),
  machine_id UUID REFERENCES public.dialysis_machines(id),
  pattern TEXT NOT NULL CHECK (pattern IN ('mwf','tts','custom')),
  shift TEXT NOT NULL CHECK (shift IN ('morning','afternoon','evening')),
  chair_number TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dialysis_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dialysis schedules in their org" ON public.dialysis_schedules FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dialysis schedules in their org" ON public.dialysis_schedules FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Session number generator
CREATE OR REPLACE FUNCTION public.generate_dialysis_session_number()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE date_part TEXT; seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(session_number FROM 14) AS INT)), 0) + 1
  INTO seq_num FROM public.dialysis_sessions
  WHERE organization_id = NEW.organization_id AND session_number LIKE 'DLY-' || date_part || '-%';
  NEW.session_number := 'DLY-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_dialysis_session_number
  BEFORE INSERT ON public.dialysis_sessions
  FOR EACH ROW WHEN (NEW.session_number IS NULL)
  EXECUTE FUNCTION public.generate_dialysis_session_number();

-- =============================================================
-- 3. DENTAL MODULE TABLES
-- =============================================================

-- Dental procedures catalog (CDT codes)
CREATE TABLE public.dental_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('preventive','restorative','endodontic','periodontic','prosthodontic','oral_surgery','orthodontic','diagnostic','other')),
  description TEXT,
  default_cost NUMERIC(10,2) DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dental_procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dental procedures in their org" ON public.dental_procedures FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dental procedures in their org" ON public.dental_procedures FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Dental charts (per-patient tooth map)
CREATE TABLE public.dental_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  tooth_number INTEGER NOT NULL CHECK (tooth_number BETWEEN 11 AND 48),
  condition TEXT DEFAULT 'healthy' CHECK (condition IN ('healthy','decayed','missing','restored','crown','implant','bridge','root_canal','fractured')),
  surfaces TEXT,
  notes TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, organization_id, tooth_number)
);

ALTER TABLE public.dental_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dental charts in their org" ON public.dental_charts FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dental charts in their org" ON public.dental_charts FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Dental treatments
CREATE TABLE public.dental_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID REFERENCES public.doctors(id),
  appointment_id UUID REFERENCES public.appointments(id),
  tooth_number INTEGER CHECK (tooth_number BETWEEN 11 AND 48),
  surface TEXT,
  procedure_id UUID REFERENCES public.dental_procedures(id),
  procedure_name TEXT,
  diagnosis TEXT,
  treatment_notes TEXT,
  cost NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  planned_date DATE,
  completed_date DATE,
  invoice_id UUID REFERENCES public.invoices(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dental_treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dental treatments in their org" ON public.dental_treatments FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dental treatments in their org" ON public.dental_treatments FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Dental images
CREATE TABLE public.dental_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  image_type TEXT CHECK (image_type IN ('periapical','opg','cbct','bitewing','cephalometric','other')),
  tooth_number INTEGER,
  image_url TEXT,
  findings TEXT,
  taken_by UUID REFERENCES public.profiles(id),
  taken_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dental_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dental images in their org" ON public.dental_images FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage dental images in their org" ON public.dental_images FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

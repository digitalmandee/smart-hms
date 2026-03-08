
-- Phase 2: HESN Public Health Reporting
CREATE TABLE public.hesn_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('communicable_disease', 'immunization', 'outbreak', 'adverse_event')),
  disease_code TEXT,
  disease_name TEXT NOT NULL,
  diagnosis_date DATE NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  outcome TEXT CHECK (outcome IN ('recovered', 'ongoing', 'deceased', 'unknown')),
  lab_confirmed BOOLEAN DEFAULT false,
  specimen_type TEXT,
  specimen_date DATE,
  vaccination_type TEXT,
  vaccination_dose_number INTEGER,
  vaccination_date DATE,
  hesn_reference_id TEXT,
  submission_status TEXT NOT NULL DEFAULT 'pending' CHECK (submission_status IN ('pending', 'submitted', 'accepted', 'rejected', 'error')),
  submission_response JSONB,
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.hesn_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hesn reports in their org" ON public.hesn_reports
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert hesn reports in their org" ON public.hesn_reports
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update hesn reports in their org" ON public.hesn_reports
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Phase 3: Tatmeen Drug Track & Trace
CREATE TABLE public.tatmeen_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receive', 'dispense', 'return', 'transfer', 'destroy')),
  gtin TEXT NOT NULL,
  serial_number TEXT,
  batch_number TEXT,
  expiry_date DATE,
  quantity INTEGER NOT NULL DEFAULT 1,
  pharmacy_item_id UUID,
  patient_id UUID REFERENCES public.patients(id),
  prescription_id UUID,
  tatmeen_reference_id TEXT,
  submission_status TEXT NOT NULL DEFAULT 'pending' CHECK (submission_status IN ('pending', 'submitted', 'accepted', 'rejected', 'error')),
  submission_response JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.tatmeen_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tatmeen transactions in their org" ON public.tatmeen_transactions
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert tatmeen transactions in their org" ON public.tatmeen_transactions
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Phase 4: Nafath fields on patients
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS nafath_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS nafath_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nafath_request_id TEXT;

-- Sehhaty sync log
CREATE TABLE public.sehhaty_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('appointment', 'lab_result', 'sick_leave', 'medical_report')),
  reference_id UUID,
  reference_type TEXT,
  sehhaty_reference_id TEXT,
  submission_status TEXT NOT NULL DEFAULT 'pending' CHECK (submission_status IN ('pending', 'submitted', 'delivered', 'error')),
  submission_response JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.sehhaty_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sehhaty logs in their org" ON public.sehhaty_sync_log
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert sehhaty logs in their org" ON public.sehhaty_sync_log
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- PDPL consent management
CREATE TABLE public.patient_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'data_sharing', 'marketing', 'research', 'telemedicine')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'revoked', 'expired')),
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  consent_text TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view consents in their org" ON public.patient_consents
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage consents in their org" ON public.patient_consents
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

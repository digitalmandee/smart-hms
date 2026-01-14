-- Create enums for Emergency Department
CREATE TYPE public.arrival_mode AS ENUM ('walk_in', 'ambulance', 'police', 'brought_by_family', 'referred');
CREATE TYPE public.er_status AS ENUM ('waiting', 'in_triage', 'in_treatment', 'admitted', 'discharged', 'transferred', 'expired', 'absconded', 'lama');
CREATE TYPE public.triage_level AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE public.ambulance_status AS ENUM ('incoming', 'arrived', 'cancelled');
CREATE TYPE public.er_treatment_type AS ENUM ('medication', 'procedure', 'investigation', 'intervention', 'note');

-- Emergency Registrations table
CREATE TABLE public.emergency_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  patient_id UUID REFERENCES public.patients(id),
  er_number TEXT NOT NULL,
  arrival_mode public.arrival_mode NOT NULL DEFAULT 'walk_in',
  arrival_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  triage_level public.triage_level,
  triage_time TIMESTAMPTZ,
  triaged_by UUID REFERENCES public.profiles(id),
  chief_complaint TEXT,
  mechanism_of_injury TEXT,
  is_trauma BOOLEAN DEFAULT false,
  is_mlc BOOLEAN DEFAULT false,
  police_station TEXT,
  fir_number TEXT,
  brought_by_name TEXT,
  brought_by_phone TEXT,
  brought_by_relation TEXT,
  vitals JSONB,
  status public.er_status NOT NULL DEFAULT 'waiting',
  assigned_doctor_id UUID REFERENCES public.doctors(id),
  assigned_zone TEXT,
  admission_id UUID REFERENCES public.admissions(id),
  disposition_time TIMESTAMPTZ,
  disposition_notes TEXT,
  unknown_patient_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Ambulance Alerts table
CREATE TABLE public.ambulance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  ambulance_id TEXT,
  eta_minutes INT,
  patient_count INT DEFAULT 1,
  condition_summary TEXT,
  caller_name TEXT,
  caller_phone TEXT,
  priority INT DEFAULT 2,
  prehospital_care TEXT,
  status public.ambulance_status NOT NULL DEFAULT 'incoming',
  arrival_time TIMESTAMPTZ,
  linked_er_id UUID REFERENCES public.emergency_registrations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Trauma Assessments table
CREATE TABLE public.trauma_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  er_id UUID NOT NULL REFERENCES public.emergency_registrations(id) ON DELETE CASCADE,
  assessment_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  assessed_by UUID REFERENCES public.profiles(id),
  mechanism TEXT,
  gcs_eye INT CHECK (gcs_eye >= 1 AND gcs_eye <= 4),
  gcs_verbal INT CHECK (gcs_verbal >= 1 AND gcs_verbal <= 5),
  gcs_motor INT CHECK (gcs_motor >= 1 AND gcs_motor <= 6),
  gcs_total INT CHECK (gcs_total >= 3 AND gcs_total <= 15),
  injuries JSONB,
  rts_score DECIMAL(4,2),
  iss_score INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ER Treatments table
CREATE TABLE public.er_treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  er_id UUID NOT NULL REFERENCES public.emergency_registrations(id) ON DELETE CASCADE,
  treatment_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  treatment_type public.er_treatment_type NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ER number generation function
CREATE OR REPLACE FUNCTION public.generate_er_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  year_part TEXT;
  seq_num INT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(er_number FROM 9) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.emergency_registrations
  WHERE organization_id = NEW.organization_id
    AND er_number LIKE 'ER-' || year_part || '-%';
  
  NEW.er_number := 'ER-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

-- Create trigger for ER number generation
CREATE TRIGGER generate_er_number_trigger
BEFORE INSERT ON public.emergency_registrations
FOR EACH ROW
WHEN (NEW.er_number IS NULL OR NEW.er_number = '')
EXECUTE FUNCTION public.generate_er_number();

-- Create indexes
CREATE INDEX idx_emergency_registrations_org ON public.emergency_registrations(organization_id);
CREATE INDEX idx_emergency_registrations_branch ON public.emergency_registrations(branch_id);
CREATE INDEX idx_emergency_registrations_patient ON public.emergency_registrations(patient_id);
CREATE INDEX idx_emergency_registrations_status ON public.emergency_registrations(status);
CREATE INDEX idx_emergency_registrations_triage ON public.emergency_registrations(triage_level);
CREATE INDEX idx_emergency_registrations_arrival ON public.emergency_registrations(arrival_time);
CREATE INDEX idx_ambulance_alerts_status ON public.ambulance_alerts(status);
CREATE INDEX idx_ambulance_alerts_branch ON public.ambulance_alerts(branch_id);

-- Enable RLS
ALTER TABLE public.emergency_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trauma_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.er_treatments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_registrations
CREATE POLICY "Users can view emergency registrations in their organization"
ON public.emergency_registrations FOR SELECT
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can create emergency registrations in their organization"
ON public.emergency_registrations FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update emergency registrations in their organization"
ON public.emergency_registrations FOR UPDATE
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- RLS Policies for ambulance_alerts
CREATE POLICY "Users can view ambulance alerts in their organization"
ON public.ambulance_alerts FOR SELECT
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can create ambulance alerts in their organization"
ON public.ambulance_alerts FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update ambulance alerts in their organization"
ON public.ambulance_alerts FOR UPDATE
USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- RLS Policies for trauma_assessments
CREATE POLICY "Users can view trauma assessments for their org ER cases"
ON public.trauma_assessments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.emergency_registrations er 
  WHERE er.id = er_id AND (er.organization_id = public.get_user_organization_id() OR public.is_super_admin())
));

CREATE POLICY "Users can create trauma assessments for their org ER cases"
ON public.trauma_assessments FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.emergency_registrations er 
  WHERE er.id = er_id AND (er.organization_id = public.get_user_organization_id() OR public.is_super_admin())
));

-- RLS Policies for er_treatments
CREATE POLICY "Users can view ER treatments for their org ER cases"
ON public.er_treatments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.emergency_registrations er 
  WHERE er.id = er_id AND (er.organization_id = public.get_user_organization_id() OR public.is_super_admin())
));

CREATE POLICY "Users can create ER treatments for their org ER cases"
ON public.er_treatments FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.emergency_registrations er 
  WHERE er.id = er_id AND (er.organization_id = public.get_user_organization_id() OR public.is_super_admin())
));

-- Enable realtime for ER tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_alerts;

-- Update triggers for updated_at
CREATE TRIGGER update_emergency_registrations_updated_at
BEFORE UPDATE ON public.emergency_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambulance_alerts_updated_at
BEFORE UPDATE ON public.ambulance_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
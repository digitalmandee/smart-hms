-- Birth Records Table - Baby Birth Registration
CREATE TABLE public.birth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  mother_patient_id UUID NOT NULL REFERENCES public.patients(id),
  baby_patient_id UUID REFERENCES public.patients(id),
  admission_id UUID REFERENCES public.admissions(id),
  
  -- Birth Details
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  delivery_type TEXT CHECK (delivery_type IN ('normal', 'cesarean', 'assisted', 'vacuum', 'forceps')),
  place_of_birth TEXT DEFAULT 'hospital',
  birth_weight_grams INTEGER,
  birth_length_cm DECIMAL(5,2),
  head_circumference_cm DECIMAL(5,2),
  chest_circumference_cm DECIMAL(5,2),
  gender TEXT CHECK (gender IN ('male', 'female', 'ambiguous')),
  
  -- APGAR Scores
  apgar_1min INTEGER CHECK (apgar_1min >= 0 AND apgar_1min <= 10),
  apgar_5min INTEGER CHECK (apgar_5min >= 0 AND apgar_5min <= 10),
  apgar_10min INTEGER CHECK (apgar_10min >= 0 AND apgar_10min <= 10),
  
  -- Complications & Status
  complications JSONB DEFAULT '[]',
  resuscitation_required BOOLEAN DEFAULT FALSE,
  nicu_admission BOOLEAN DEFAULT FALSE,
  condition_at_birth TEXT,
  
  -- Father Details
  father_name TEXT,
  father_cnic TEXT,
  father_occupation TEXT,
  father_address TEXT,
  
  -- Delivery Staff
  delivered_by UUID REFERENCES public.doctors(id),
  attended_by JSONB DEFAULT '[]',
  
  -- Certificate Details
  certificate_number TEXT UNIQUE,
  certificate_issued_at TIMESTAMPTZ,
  certificate_issued_by UUID REFERENCES public.profiles(id),
  
  -- Vaccinations at Birth
  bcg_given BOOLEAN DEFAULT FALSE,
  opv0_given BOOLEAN DEFAULT FALSE,
  hep_b_given BOOLEAN DEFAULT FALSE,
  vitamin_k_given BOOLEAN DEFAULT FALSE,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Death Records Table
CREATE TABLE public.death_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  admission_id UUID REFERENCES public.admissions(id),
  
  -- Death Details
  death_date DATE NOT NULL,
  death_time TIME NOT NULL,
  place_of_death TEXT DEFAULT 'hospital',
  
  -- Cause of Death (ICD-10 compatible chain)
  immediate_cause TEXT,
  immediate_cause_interval TEXT,
  antecedent_cause TEXT,
  antecedent_cause_interval TEXT,
  underlying_cause TEXT,
  underlying_cause_interval TEXT,
  contributing_conditions TEXT,
  
  -- Classification
  manner_of_death TEXT CHECK (manner_of_death IN ('natural', 'accident', 'suicide', 'homicide', 'pending', 'undetermined')),
  is_mlc BOOLEAN DEFAULT FALSE,
  mlc_number TEXT,
  autopsy_performed BOOLEAN DEFAULT FALSE,
  autopsy_findings TEXT,
  
  -- Certification
  certifying_physician_id UUID REFERENCES public.doctors(id),
  certificate_number TEXT UNIQUE,
  certificate_issued_at TIMESTAMPTZ,
  
  -- Body Handling
  body_condition TEXT,
  body_released_to TEXT,
  body_released_relation TEXT,
  body_released_cnic TEXT,
  body_released_at TIMESTAMPTZ,
  body_released_by UUID REFERENCES public.profiles(id),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Medical Certificates Table
CREATE TABLE public.medical_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('fitness', 'sick_leave', 'disability', 'vaccination', 'medical_report', 'medical_legal', 'age_verification')),
  certificate_number TEXT UNIQUE,
  
  -- General Details
  purpose TEXT,
  valid_from DATE,
  valid_to DATE,
  findings TEXT,
  recommendations TEXT,
  restrictions TEXT,
  
  -- For Sick Leave
  leave_from DATE,
  leave_to DATE,
  leave_days INTEGER,
  diagnosis TEXT,
  
  -- For Fitness
  fitness_status TEXT CHECK (fitness_status IN ('fit', 'unfit', 'fit_with_restrictions', 'temporarily_unfit')),
  job_type TEXT,
  employer_name TEXT,
  
  -- For Disability
  disability_percentage INTEGER,
  disability_type TEXT,
  
  -- Issuing
  issued_by UUID REFERENCES public.doctors(id),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Print Tracking
  print_count INTEGER DEFAULT 0,
  last_printed_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANC Records Table (Antenatal Care)
CREATE TABLE public.anc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  
  -- Pregnancy Details
  pregnancy_id UUID, -- Groups all visits for one pregnancy
  lmp_date DATE, -- Last Menstrual Period
  edd_date DATE, -- Estimated Due Date
  gravida INTEGER, -- Total pregnancies
  para INTEGER, -- Live births
  abortion INTEGER, -- Miscarriages/abortions
  living INTEGER, -- Living children
  
  -- Risk Assessment
  risk_category TEXT CHECK (risk_category IN ('low', 'moderate', 'high')),
  risk_factors JSONB DEFAULT '[]',
  
  -- Visit Details
  visit_number INTEGER,
  visit_date DATE NOT NULL,
  visit_type TEXT CHECK (visit_type IN ('booking', 'routine', 'emergency', 'referred')),
  gestational_age_weeks INTEGER,
  gestational_age_days INTEGER,
  
  -- Measurements
  weight_kg DECIMAL(5,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  fundal_height_cm DECIMAL(5,2),
  fetal_heart_rate INTEGER,
  fetal_movements TEXT,
  presentation TEXT CHECK (presentation IN ('cephalic', 'breech', 'transverse', 'unstable', 'not_applicable')),
  lie TEXT,
  engagement TEXT,
  
  -- Edema Assessment
  edema TEXT CHECK (edema IN ('none', 'mild', 'moderate', 'severe')),
  edema_location TEXT,
  
  -- Investigations
  hemoglobin DECIMAL(4,1),
  blood_group TEXT,
  rh_factor TEXT,
  urine_protein TEXT,
  urine_sugar TEXT,
  urine_albumin TEXT,
  hiv_status TEXT,
  vdrl_status TEXT,
  hbsag_status TEXT,
  blood_sugar_fasting DECIMAL(5,2),
  blood_sugar_random DECIMAL(5,2),
  
  -- Ultrasound
  ultrasound_done BOOLEAN DEFAULT FALSE,
  ultrasound_findings TEXT,
  ultrasound_edd DATE,
  
  -- Supplements & Vaccinations
  iron_folic_given BOOLEAN DEFAULT FALSE,
  calcium_given BOOLEAN DEFAULT FALSE,
  tt1_given BOOLEAN DEFAULT FALSE,
  tt1_date DATE,
  tt2_given BOOLEAN DEFAULT FALSE,
  tt2_date DATE,
  
  -- Advice & Follow-up
  advice TEXT,
  danger_signs_explained BOOLEAN DEFAULT FALSE,
  birth_plan_discussed BOOLEAN DEFAULT FALSE,
  next_visit_date DATE,
  referred_to TEXT,
  referral_reason TEXT,
  
  notes TEXT,
  attended_by UUID REFERENCES public.doctors(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- MLC Records Table (Medico-Legal Cases)
CREATE TABLE public.mlc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  emergency_registration_id UUID REFERENCES public.emergency_registrations(id),
  
  mlc_number TEXT UNIQUE NOT NULL,
  
  -- Incident Details
  incident_date DATE,
  incident_time TIME,
  incident_place TEXT,
  incident_description TEXT,
  
  -- Case Classification
  case_type TEXT CHECK (case_type IN ('assault', 'road_accident', 'fall', 'burns', 'poisoning', 'sexual_assault', 'animal_bite', 'firearm', 'stab_wound', 'industrial', 'drowning', 'electrocution', 'hanging', 'other')),
  brought_by TEXT CHECK (brought_by IN ('police', 'self', 'relative', 'ambulance', 'passerby', 'other')),
  brought_by_name TEXT,
  brought_by_relation TEXT,
  brought_by_cnic TEXT,
  brought_by_phone TEXT,
  
  -- Police Information
  police_station TEXT,
  police_officer_name TEXT,
  police_officer_rank TEXT,
  fir_number TEXT,
  fir_date DATE,
  dd_number TEXT,
  
  -- Patient Condition on Arrival
  arrival_time TIMESTAMPTZ,
  conscious_level TEXT CHECK (conscious_level IN ('conscious', 'semiconscious', 'unconscious')),
  oriented BOOLEAN,
  general_condition TEXT CHECK (general_condition IN ('stable', 'unstable', 'critical', 'dead_on_arrival')),
  alcohol_intoxication BOOLEAN DEFAULT FALSE,
  drug_intoxication BOOLEAN DEFAULT FALSE,
  
  -- Examination
  injuries_description TEXT,
  injury_details JSONB DEFAULT '[]', -- Array of { location, type, size, color, age_of_injury }
  
  -- Medical Opinion
  nature_of_injuries TEXT CHECK (nature_of_injuries IN ('simple', 'grievous', 'dangerous_to_life')),
  probable_weapon TEXT,
  probable_cause TEXT,
  age_of_injuries TEXT,
  medical_opinion TEXT,
  
  -- Evidence Collection
  samples_collected JSONB DEFAULT '[]', -- Array of { type, quantity, sealed, label }
  clothing_preserved BOOLEAN DEFAULT FALSE,
  clothing_description TEXT,
  photographs_taken BOOLEAN DEFAULT FALSE,
  photograph_count INTEGER,
  
  -- Evidence Handover
  evidence_handed_to TEXT,
  evidence_receiver_name TEXT,
  evidence_receiver_designation TEXT,
  evidence_handed_at TIMESTAMPTZ,
  evidence_receipt_number TEXT,
  
  -- Outcome
  treatment_given TEXT,
  disposition TEXT CHECK (disposition IN ('discharged', 'admitted', 'referred', 'lama', 'absconded', 'expired')),
  referred_to TEXT,
  
  examined_by UUID REFERENCES public.doctors(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Generate Birth Certificate Number
CREATE OR REPLACE FUNCTION public.generate_birth_certificate_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  seq_num INT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(certificate_number FROM 9) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.birth_records
  WHERE organization_id = NEW.organization_id
    AND certificate_number LIKE 'BC-' || year_part || '-%';
  
  NEW.certificate_number := 'BC-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_birth_certificate_number
  BEFORE INSERT ON public.birth_records
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_birth_certificate_number();

-- Generate Death Certificate Number
CREATE OR REPLACE FUNCTION public.generate_death_certificate_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  seq_num INT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(certificate_number FROM 9) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.death_records
  WHERE organization_id = NEW.organization_id
    AND certificate_number LIKE 'DC-' || year_part || '-%';
  
  NEW.certificate_number := 'DC-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_death_certificate_number
  BEFORE INSERT ON public.death_records
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_death_certificate_number();

-- Generate Medical Certificate Number
CREATE OR REPLACE FUNCTION public.generate_medical_certificate_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  date_part TEXT;
  seq_num INT;
BEGIN
  prefix := CASE NEW.certificate_type
    WHEN 'fitness' THEN 'FC'
    WHEN 'sick_leave' THEN 'SL'
    WHEN 'disability' THEN 'DC'
    WHEN 'vaccination' THEN 'VC'
    WHEN 'medical_report' THEN 'MR'
    WHEN 'medical_legal' THEN 'ML'
    WHEN 'age_verification' THEN 'AV'
    ELSE 'MC'
  END;
  
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(certificate_number FROM LENGTH(prefix) + 9) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.medical_certificates
  WHERE organization_id = NEW.organization_id
    AND certificate_number LIKE prefix || '-' || date_part || '-%';
  
  NEW.certificate_number := prefix || '-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_medical_certificate_number
  BEFORE INSERT ON public.medical_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_medical_certificate_number();

-- Generate MLC Number
CREATE OR REPLACE FUNCTION public.generate_mlc_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  seq_num INT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(mlc_number FROM 10) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.mlc_records
  WHERE organization_id = NEW.organization_id
    AND mlc_number LIKE 'MLC-' || year_part || '-%';
  
  NEW.mlc_number := 'MLC-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_mlc_number
  BEFORE INSERT ON public.mlc_records
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_mlc_number();

-- Enable RLS on all new tables
ALTER TABLE public.birth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for birth_records
CREATE POLICY "birth_records_org_isolation" ON public.birth_records
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- RLS Policies for death_records
CREATE POLICY "death_records_org_isolation" ON public.death_records
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- RLS Policies for medical_certificates
CREATE POLICY "medical_certificates_org_isolation" ON public.medical_certificates
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- RLS Policies for anc_records
CREATE POLICY "anc_records_org_isolation" ON public.anc_records
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- RLS Policies for mlc_records
CREATE POLICY "mlc_records_org_isolation" ON public.mlc_records
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- Indexes for performance
CREATE INDEX idx_birth_records_org ON public.birth_records(organization_id);
CREATE INDEX idx_birth_records_mother ON public.birth_records(mother_patient_id);
CREATE INDEX idx_birth_records_baby ON public.birth_records(baby_patient_id);
CREATE INDEX idx_birth_records_date ON public.birth_records(birth_date);

CREATE INDEX idx_death_records_org ON public.death_records(organization_id);
CREATE INDEX idx_death_records_patient ON public.death_records(patient_id);
CREATE INDEX idx_death_records_date ON public.death_records(death_date);

CREATE INDEX idx_medical_certificates_org ON public.medical_certificates(organization_id);
CREATE INDEX idx_medical_certificates_patient ON public.medical_certificates(patient_id);
CREATE INDEX idx_medical_certificates_type ON public.medical_certificates(certificate_type);

CREATE INDEX idx_anc_records_org ON public.anc_records(organization_id);
CREATE INDEX idx_anc_records_patient ON public.anc_records(patient_id);
CREATE INDEX idx_anc_records_pregnancy ON public.anc_records(pregnancy_id);
CREATE INDEX idx_anc_records_visit_date ON public.anc_records(visit_date);

CREATE INDEX idx_mlc_records_org ON public.mlc_records(organization_id);
CREATE INDEX idx_mlc_records_patient ON public.mlc_records(patient_id);
CREATE INDEX idx_mlc_records_er ON public.mlc_records(emergency_registration_id);

-- Update triggers
CREATE TRIGGER update_birth_records_updated_at
  BEFORE UPDATE ON public.birth_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_death_records_updated_at
  BEFORE UPDATE ON public.death_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_certificates_updated_at
  BEFORE UPDATE ON public.medical_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anc_records_updated_at
  BEFORE UPDATE ON public.anc_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mlc_records_updated_at
  BEFORE UPDATE ON public.mlc_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
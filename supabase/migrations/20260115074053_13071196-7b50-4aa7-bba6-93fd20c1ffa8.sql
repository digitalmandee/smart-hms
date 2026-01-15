-- Blood Bank Module: Complete Database Schema
-- =============================================

-- 1. ENUMS
-- --------

-- Blood group types
CREATE TYPE public.blood_group_type AS ENUM (
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
);

-- Donor status
CREATE TYPE public.donor_status AS ENUM (
  'active', 'inactive', 'deferred', 'permanently_deferred'
);

-- Donation status
CREATE TYPE public.donation_status AS ENUM (
  'screening', 'collecting', 'processing', 'completed', 'rejected'
);

-- Blood component types
CREATE TYPE public.blood_component_type AS ENUM (
  'whole_blood', 'packed_rbc', 'fresh_frozen_plasma', 'platelet_concentrate', 'cryoprecipitate', 'granulocytes'
);

-- Blood unit status
CREATE TYPE public.blood_unit_status AS ENUM (
  'quarantine', 'available', 'reserved', 'cross_matched', 'issued', 'transfused', 'discarded', 'expired'
);

-- Blood request status
CREATE TYPE public.blood_request_status AS ENUM (
  'pending', 'processing', 'cross_matching', 'ready', 'issued', 'completed', 'cancelled'
);

-- Blood request priority
CREATE TYPE public.blood_request_priority AS ENUM (
  'routine', 'urgent', 'emergency'
);

-- Cross-match result
CREATE TYPE public.cross_match_result AS ENUM (
  'compatible', 'incompatible', 'pending'
);

-- Transfusion status
CREATE TYPE public.transfusion_status AS ENUM (
  'scheduled', 'in_progress', 'completed', 'stopped', 'cancelled'
);

-- Reaction severity
CREATE TYPE public.reaction_severity AS ENUM (
  'mild', 'moderate', 'severe', 'fatal'
);


-- 2. TABLES
-- ---------

-- Blood Donors
CREATE TABLE public.blood_donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  donor_number TEXT NOT NULL UNIQUE,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  blood_group public.blood_group_type NOT NULL,
  
  -- Contact
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  
  -- Medical Screening
  weight_kg NUMERIC(5,2),
  hemoglobin_level NUMERIC(4,1),
  blood_pressure TEXT,
  pulse_rate INTEGER,
  
  -- Status & History
  status public.donor_status NOT NULL DEFAULT 'active',
  deferral_reason TEXT,
  deferral_until DATE,
  last_donation_date DATE,
  total_donations INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Blood Donations
CREATE TABLE public.blood_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  donation_number TEXT NOT NULL UNIQUE,
  donor_id UUID NOT NULL REFERENCES public.blood_donors(id),
  
  -- Donation Details
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  donation_time TIME NOT NULL,
  donation_type TEXT DEFAULT 'whole_blood', -- whole_blood, apheresis
  bag_number TEXT,
  volume_ml INTEGER DEFAULT 450,
  
  -- Pre-donation Screening
  hemoglobin_level NUMERIC(4,1),
  blood_pressure TEXT,
  pulse_rate INTEGER,
  temperature NUMERIC(4,1),
  screening_passed BOOLEAN DEFAULT false,
  screening_notes TEXT,
  
  -- Status
  status public.donation_status NOT NULL DEFAULT 'screening',
  rejection_reason TEXT,
  
  -- Processing
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  collected_by UUID REFERENCES public.profiles(id)
);

-- Blood Inventory (Units in stock)
CREATE TABLE public.blood_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  unit_number TEXT NOT NULL UNIQUE,
  
  -- Source
  donation_id UUID REFERENCES public.blood_donations(id),
  blood_group public.blood_group_type NOT NULL,
  component_type public.blood_component_type NOT NULL DEFAULT 'whole_blood',
  
  -- Unit Details
  volume_ml INTEGER NOT NULL,
  collection_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  storage_location TEXT,
  
  -- Status
  status public.blood_unit_status NOT NULL DEFAULT 'quarantine',
  reserved_for_request_id UUID,
  
  -- Testing
  hiv_tested BOOLEAN DEFAULT false,
  hbsag_tested BOOLEAN DEFAULT false,
  hcv_tested BOOLEAN DEFAULT false,
  vdrl_tested BOOLEAN DEFAULT false,
  malaria_tested BOOLEAN DEFAULT false,
  all_tests_negative BOOLEAN DEFAULT false,
  tested_at TIMESTAMPTZ,
  tested_by UUID REFERENCES public.profiles(id),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blood Requests
CREATE TABLE public.blood_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  request_number TEXT NOT NULL UNIQUE,
  
  -- Patient & Requester
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  requesting_department TEXT,
  
  -- Request Details
  blood_group public.blood_group_type NOT NULL,
  component_type public.blood_component_type NOT NULL DEFAULT 'whole_blood',
  units_requested INTEGER NOT NULL DEFAULT 1,
  units_issued INTEGER DEFAULT 0,
  
  -- Priority & Timing
  priority public.blood_request_priority NOT NULL DEFAULT 'routine',
  required_by TIMESTAMPTZ,
  
  -- Clinical Info
  clinical_indication TEXT,
  diagnosis TEXT,
  hemoglobin_level NUMERIC(4,1),
  
  -- Status
  status public.blood_request_status NOT NULL DEFAULT 'pending',
  
  -- Processing
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  issued_at TIMESTAMPTZ,
  issued_by UUID REFERENCES public.profiles(id),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cross-Match Tests
CREATE TABLE public.cross_match_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  request_id UUID NOT NULL REFERENCES public.blood_requests(id),
  unit_id UUID NOT NULL REFERENCES public.blood_inventory(id),
  
  -- Test Details
  test_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  tested_by UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Results
  major_cross_match public.cross_match_result NOT NULL DEFAULT 'pending',
  minor_cross_match public.cross_match_result DEFAULT 'pending',
  antibody_screen public.cross_match_result DEFAULT 'pending',
  overall_result public.cross_match_result NOT NULL DEFAULT 'pending',
  
  -- Validity
  valid_until TIMESTAMPTZ,
  is_valid BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blood Transfusions
CREATE TABLE public.blood_transfusions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  transfusion_number TEXT NOT NULL UNIQUE,
  
  -- Links
  request_id UUID NOT NULL REFERENCES public.blood_requests(id),
  unit_id UUID NOT NULL REFERENCES public.blood_inventory(id),
  cross_match_id UUID REFERENCES public.cross_match_tests(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  
  -- Administration
  administered_by UUID REFERENCES public.profiles(id),
  verified_by UUID REFERENCES public.profiles(id),
  
  -- Timing
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  
  -- Pre-transfusion Vitals
  pre_temp NUMERIC(4,1),
  pre_pulse INTEGER,
  pre_bp TEXT,
  pre_resp_rate INTEGER,
  
  -- Post-transfusion Vitals
  post_temp NUMERIC(4,1),
  post_pulse INTEGER,
  post_bp TEXT,
  post_resp_rate INTEGER,
  
  -- Status
  status public.transfusion_status NOT NULL DEFAULT 'scheduled',
  stop_reason TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transfusion Reactions
CREATE TABLE public.transfusion_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  transfusion_id UUID NOT NULL REFERENCES public.blood_transfusions(id),
  
  -- Reaction Details
  reaction_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  reaction_type TEXT NOT NULL,
  severity public.reaction_severity NOT NULL,
  
  -- Symptoms
  symptoms JSONB,
  vitals_at_reaction JSONB,
  
  -- Action Taken
  transfusion_stopped BOOLEAN DEFAULT true,
  actions_taken TEXT,
  medications_given JSONB,
  
  -- Outcome
  outcome TEXT,
  patient_stable BOOLEAN,
  
  -- Investigation
  investigated_by UUID REFERENCES public.profiles(id),
  investigation_notes TEXT,
  root_cause TEXT,
  
  -- Metadata
  reported_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);


-- 3. AUTO-GENERATE NUMBER FUNCTIONS & TRIGGERS
-- --------------------------------------------

-- Generate Donor Number
CREATE OR REPLACE FUNCTION public.generate_donor_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(donor_number FROM 13) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.blood_donors
  WHERE organization_id = NEW.organization_id
    AND donor_number LIKE 'DN-' || date_part || '-%';
  
  NEW.donor_number := 'DN-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_donor_number
  BEFORE INSERT ON public.blood_donors
  FOR EACH ROW
  WHEN (NEW.donor_number IS NULL OR NEW.donor_number = '')
  EXECUTE FUNCTION public.generate_donor_number();

-- Generate Donation Number
CREATE OR REPLACE FUNCTION public.generate_donation_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(donation_number FROM 14) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.blood_donations
  WHERE organization_id = NEW.organization_id
    AND donation_number LIKE 'DON-' || date_part || '-%';
  
  NEW.donation_number := 'DON-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_donation_number
  BEFORE INSERT ON public.blood_donations
  FOR EACH ROW
  WHEN (NEW.donation_number IS NULL OR NEW.donation_number = '')
  EXECUTE FUNCTION public.generate_donation_number();

-- Generate Blood Unit Number
CREATE OR REPLACE FUNCTION public.generate_unit_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(unit_number FROM 13) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.blood_inventory
  WHERE organization_id = NEW.organization_id
    AND unit_number LIKE 'BU-' || date_part || '-%';
  
  NEW.unit_number := 'BU-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_unit_number
  BEFORE INSERT ON public.blood_inventory
  FOR EACH ROW
  WHEN (NEW.unit_number IS NULL OR NEW.unit_number = '')
  EXECUTE FUNCTION public.generate_unit_number();

-- Generate Blood Request Number
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(request_number FROM 13) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.blood_requests
  WHERE organization_id = NEW.organization_id
    AND request_number LIKE 'BR-' || date_part || '-%';
  
  NEW.request_number := 'BR-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_request_number
  BEFORE INSERT ON public.blood_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
  EXECUTE FUNCTION public.generate_request_number();

-- Generate Transfusion Number
CREATE OR REPLACE FUNCTION public.generate_transfusion_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(transfusion_number FROM 13) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.blood_transfusions
  WHERE organization_id = NEW.organization_id
    AND transfusion_number LIKE 'TF-' || date_part || '-%';
  
  NEW.transfusion_number := 'TF-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_transfusion_number
  BEFORE INSERT ON public.blood_transfusions
  FOR EACH ROW
  WHEN (NEW.transfusion_number IS NULL OR NEW.transfusion_number = '')
  EXECUTE FUNCTION public.generate_transfusion_number();


-- 4. ROW LEVEL SECURITY
-- ---------------------

ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_match_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_transfusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfusion_reactions ENABLE ROW LEVEL SECURITY;

-- Blood Donors Policies
CREATE POLICY "blood_donors_select" ON public.blood_donors
  FOR SELECT USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_donors_insert" ON public.blood_donors
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_donors_update" ON public.blood_donors
  FOR UPDATE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_donors_delete" ON public.blood_donors
  FOR DELETE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

-- Blood Donations Policies
CREATE POLICY "blood_donations_select" ON public.blood_donations
  FOR SELECT USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_donations_insert" ON public.blood_donations
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_donations_update" ON public.blood_donations
  FOR UPDATE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_donations_delete" ON public.blood_donations
  FOR DELETE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

-- Blood Inventory Policies
CREATE POLICY "blood_inventory_select" ON public.blood_inventory
  FOR SELECT USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_inventory_insert" ON public.blood_inventory
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_inventory_update" ON public.blood_inventory
  FOR UPDATE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_inventory_delete" ON public.blood_inventory
  FOR DELETE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

-- Blood Requests Policies
CREATE POLICY "blood_requests_select" ON public.blood_requests
  FOR SELECT USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_requests_insert" ON public.blood_requests
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_requests_update" ON public.blood_requests
  FOR UPDATE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_requests_delete" ON public.blood_requests
  FOR DELETE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

-- Cross-Match Tests Policies
CREATE POLICY "cross_match_tests_select" ON public.cross_match_tests
  FOR SELECT USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "cross_match_tests_insert" ON public.cross_match_tests
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "cross_match_tests_update" ON public.cross_match_tests
  FOR UPDATE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "cross_match_tests_delete" ON public.cross_match_tests
  FOR DELETE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

-- Blood Transfusions Policies
CREATE POLICY "blood_transfusions_select" ON public.blood_transfusions
  FOR SELECT USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_transfusions_insert" ON public.blood_transfusions
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_transfusions_update" ON public.blood_transfusions
  FOR UPDATE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "blood_transfusions_delete" ON public.blood_transfusions
  FOR DELETE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

-- Transfusion Reactions Policies
CREATE POLICY "transfusion_reactions_select" ON public.transfusion_reactions
  FOR SELECT USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "transfusion_reactions_insert" ON public.transfusion_reactions
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "transfusion_reactions_update" ON public.transfusion_reactions
  FOR UPDATE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "transfusion_reactions_delete" ON public.transfusion_reactions
  FOR DELETE USING (
    public.is_super_admin() OR organization_id = public.get_user_organization_id()
  );


-- 5. INDEXES
-- ----------

CREATE INDEX idx_blood_donors_org ON public.blood_donors(organization_id);
CREATE INDEX idx_blood_donors_blood_group ON public.blood_donors(blood_group);
CREATE INDEX idx_blood_donors_status ON public.blood_donors(status);

CREATE INDEX idx_blood_donations_org ON public.blood_donations(organization_id);
CREATE INDEX idx_blood_donations_donor ON public.blood_donations(donor_id);
CREATE INDEX idx_blood_donations_date ON public.blood_donations(donation_date);
CREATE INDEX idx_blood_donations_status ON public.blood_donations(status);

CREATE INDEX idx_blood_inventory_org ON public.blood_inventory(organization_id);
CREATE INDEX idx_blood_inventory_blood_group ON public.blood_inventory(blood_group);
CREATE INDEX idx_blood_inventory_status ON public.blood_inventory(status);
CREATE INDEX idx_blood_inventory_expiry ON public.blood_inventory(expiry_date);
CREATE INDEX idx_blood_inventory_component ON public.blood_inventory(component_type);

CREATE INDEX idx_blood_requests_org ON public.blood_requests(organization_id);
CREATE INDEX idx_blood_requests_patient ON public.blood_requests(patient_id);
CREATE INDEX idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX idx_blood_requests_priority ON public.blood_requests(priority);

CREATE INDEX idx_cross_match_tests_request ON public.cross_match_tests(request_id);
CREATE INDEX idx_cross_match_tests_unit ON public.cross_match_tests(unit_id);

CREATE INDEX idx_blood_transfusions_org ON public.blood_transfusions(organization_id);
CREATE INDEX idx_blood_transfusions_patient ON public.blood_transfusions(patient_id);
CREATE INDEX idx_blood_transfusions_status ON public.blood_transfusions(status);

CREATE INDEX idx_transfusion_reactions_transfusion ON public.transfusion_reactions(transfusion_id);


-- 6. UPDATE TRIGGERS
-- ------------------

CREATE TRIGGER update_blood_donors_updated_at
  BEFORE UPDATE ON public.blood_donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_donations_updated_at
  BEFORE UPDATE ON public.blood_donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_inventory_updated_at
  BEFORE UPDATE ON public.blood_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_transfusions_updated_at
  BEFORE UPDATE ON public.blood_transfusions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
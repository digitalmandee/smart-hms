
-- =============================================
-- PHASE 2: IPD (INPATIENT) MANAGEMENT MODULE
-- =============================================

-- 1. New Enums for IPD Module
CREATE TYPE admission_status AS ENUM ('admitted', 'discharged', 'transferred', 'expired', 'lama', 'absconded');
CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance', 'blocked', 'housekeeping');
CREATE TYPE ward_type AS ENUM ('general', 'semi_private', 'private', 'deluxe', 'vip', 'icu', 'nicu', 'picu', 'ccu', 'isolation', 'emergency', 'maternity', 'pediatric', 'surgical');
CREATE TYPE admission_type AS ENUM ('emergency', 'elective', 'transfer', 'referral', 'direct');
CREATE TYPE discharge_type AS ENUM ('normal', 'against_advice', 'transfer', 'expired', 'absconded', 'referred');
CREATE TYPE diet_type AS ENUM ('normal', 'soft', 'liquid', 'clear_liquid', 'npo', 'diabetic', 'low_salt', 'low_fat', 'high_protein', 'renal', 'cardiac', 'tube_feeding', 'parenteral');
CREATE TYPE medication_route AS ENUM ('oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'sublingual', 'rectal', 'transdermal', 'ophthalmic', 'otic', 'nasal');
CREATE TYPE medication_admin_status AS ENUM ('pending', 'given', 'missed', 'refused', 'held', 'discontinued');
CREATE TYPE nursing_note_type AS ENUM ('admission', 'assessment', 'progress', 'intervention', 'handover', 'discharge', 'incident', 'procedure');

-- 2. Wards Table
CREATE TABLE public.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  ward_type ward_type DEFAULT 'general',
  floor TEXT,
  building TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  total_beds INTEGER DEFAULT 0,
  nurse_in_charge_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  charge_per_day NUMERIC(12,2) DEFAULT 0,
  facilities JSONB DEFAULT '[]',
  contact_extension TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 3. Beds Table
CREATE TABLE public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  bed_type TEXT DEFAULT 'standard',
  status bed_status DEFAULT 'available',
  current_admission_id UUID,
  features JSONB DEFAULT '[]',
  notes TEXT,
  position_row INTEGER,
  position_col INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ward_id, bed_number)
);

-- 4. Admissions Table
CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  admission_number TEXT NOT NULL,
  admission_date DATE NOT NULL,
  admission_time TIME NOT NULL,
  admission_type admission_type DEFAULT 'direct',
  
  -- Source
  emergency_case_id UUID,
  consultation_id UUID REFERENCES public.consultations(id),
  
  -- Doctors
  referring_doctor_id UUID REFERENCES public.doctors(id),
  admitting_doctor_id UUID REFERENCES public.doctors(id),
  attending_doctor_id UUID REFERENCES public.doctors(id),
  
  -- Bed Assignment
  bed_id UUID REFERENCES public.beds(id),
  ward_id UUID REFERENCES public.wards(id),
  
  -- Clinical
  diagnosis_on_admission TEXT,
  chief_complaint TEXT,
  history_of_present_illness TEXT,
  clinical_notes TEXT,
  
  -- Status
  status admission_status DEFAULT 'admitted',
  
  -- Dates
  expected_discharge_date DATE,
  actual_discharge_date DATE,
  discharge_time TIME,
  
  -- Discharge Details
  discharge_type discharge_type,
  discharge_summary TEXT,
  condition_at_discharge TEXT,
  discharge_diagnosis TEXT,
  discharge_instructions TEXT,
  follow_up_date DATE,
  follow_up_instructions TEXT,
  
  -- Billing
  estimated_cost NUMERIC(14,2),
  deposit_amount NUMERIC(14,2) DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  discharged_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, admission_number)
);

-- Add foreign key for current_admission_id in beds
ALTER TABLE public.beds 
ADD CONSTRAINT beds_current_admission_id_fkey 
FOREIGN KEY (current_admission_id) REFERENCES public.admissions(id) ON DELETE SET NULL;

-- 5. Bed Transfers Table
CREATE TABLE public.bed_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  from_bed_id UUID REFERENCES public.beds(id),
  to_bed_id UUID NOT NULL REFERENCES public.beds(id),
  from_ward_id UUID REFERENCES public.wards(id),
  to_ward_id UUID NOT NULL REFERENCES public.wards(id),
  transfer_reason TEXT,
  ordered_by UUID REFERENCES public.profiles(id),
  transferred_by UUID REFERENCES public.profiles(id),
  transferred_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Daily Rounds Table
CREATE TABLE public.daily_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  round_date DATE NOT NULL,
  round_time TIME NOT NULL,
  
  -- Assessment
  findings TEXT,
  diagnosis_update TEXT,
  condition_status TEXT,
  
  -- Vitals
  vitals JSONB DEFAULT '{}',
  
  -- Orders
  instructions TEXT,
  diet_orders TEXT,
  activity_orders TEXT,
  
  -- Flags
  medications_changed BOOLEAN DEFAULT false,
  critical_notes TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. IPD Vitals Table (more frequent than rounds)
CREATE TABLE public.ipd_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  
  -- Vitals
  temperature NUMERIC(4,1),
  pulse INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation NUMERIC(4,1),
  blood_sugar NUMERIC(5,1),
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  
  -- I/O
  intake_ml NUMERIC(6,1),
  output_ml NUMERIC(6,1),
  intake_type TEXT,
  output_type TEXT,
  
  -- Pain & Consciousness
  pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
  consciousness_level TEXT,
  gcs_score INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Nursing Care Plans
CREATE TABLE public.nursing_care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  nurse_id UUID NOT NULL REFERENCES public.profiles(id),
  
  problem TEXT NOT NULL,
  goal TEXT,
  interventions TEXT,
  evaluation TEXT,
  
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  status TEXT DEFAULT 'active',
  
  priority TEXT DEFAULT 'medium',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Nursing Notes
CREATE TABLE public.nursing_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  nurse_id UUID NOT NULL REFERENCES public.profiles(id),
  
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note_time TIME NOT NULL DEFAULT CURRENT_TIME,
  note_type nursing_note_type DEFAULT 'progress',
  
  -- SOAPIE Format
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  intervention TEXT,
  evaluation TEXT,
  
  -- Quick Fields
  vitals JSONB DEFAULT '{}',
  pain_score INTEGER,
  fall_risk_score INTEGER,
  pressure_ulcer_risk INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. IPD Medications (prescribed during admission)
CREATE TABLE public.ipd_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES public.prescriptions(id),
  
  medicine_id UUID REFERENCES public.medicines(id),
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  route medication_route DEFAULT 'oral',
  frequency TEXT,
  
  start_date DATE NOT NULL,
  end_date DATE,
  
  timing_schedule JSONB DEFAULT '[]',
  special_instructions TEXT,
  
  is_prn BOOLEAN DEFAULT false,
  prn_indication TEXT,
  
  is_active BOOLEAN DEFAULT true,
  discontinued_by UUID REFERENCES public.profiles(id),
  discontinued_at TIMESTAMPTZ,
  discontinue_reason TEXT,
  
  prescribed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Medication Administration Records (eMAR)
CREATE TABLE public.medication_administration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipd_medication_id UUID NOT NULL REFERENCES public.ipd_medications(id) ON DELETE CASCADE,
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  
  scheduled_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ,
  
  dose_given TEXT,
  route medication_route,
  
  status medication_admin_status DEFAULT 'pending',
  
  administered_by UUID REFERENCES public.profiles(id),
  witnessed_by UUID REFERENCES public.profiles(id),
  
  site TEXT,
  notes TEXT,
  reason_not_given TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Diet Charts
CREATE TABLE public.diet_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  
  diet_type diet_type DEFAULT 'normal',
  custom_diet TEXT,
  
  calories_target INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fat_target INTEGER,
  fluid_restriction_ml INTEGER,
  
  special_instructions TEXT,
  allergies TEXT,
  restrictions TEXT,
  preferences TEXT,
  
  meal_timings JSONB DEFAULT '{}',
  
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  
  prescribed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Discharge Summaries (detailed)
CREATE TABLE public.discharge_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Clinical Summary
  admission_diagnosis TEXT,
  discharge_diagnosis TEXT,
  hospital_course TEXT,
  
  -- Procedures & Investigations
  procedures_performed JSONB DEFAULT '[]',
  investigations_summary JSONB DEFAULT '[]',
  significant_findings TEXT,
  
  -- Condition
  condition_at_admission TEXT,
  condition_at_discharge TEXT,
  
  -- Medications
  medications_on_discharge JSONB DEFAULT '[]',
  medications_stopped JSONB DEFAULT '[]',
  
  -- Instructions
  follow_up_instructions TEXT,
  diet_instructions TEXT,
  activity_instructions TEXT,
  warning_signs TEXT,
  
  -- Follow-up
  follow_up_appointments JSONB DEFAULT '[]',
  referrals JSONB DEFAULT '[]',
  
  -- Prepared by
  prepared_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Patient Companions/Attendants
CREATE TABLE public.patient_attendants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  national_id TEXT,
  address TEXT,
  
  pass_number TEXT,
  pass_issued_at TIMESTAMPTZ,
  pass_valid_until TIMESTAMPTZ,
  
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. IPD Charges (daily charges, services)
CREATE TABLE public.ipd_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
  
  charge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  charge_type TEXT NOT NULL,
  service_type_id UUID REFERENCES public.service_types(id),
  
  description TEXT NOT NULL,
  quantity NUMERIC(8,2) DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  
  is_billed BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES public.invoices(id),
  
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipd_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipd_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_administration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipd_charges ENABLE ROW LEVEL SECURITY;

-- Wards policies
CREATE POLICY "Users can view wards in their org" ON public.wards
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage wards" ON public.wards
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('ipd.wards.manage')));

-- Beds policies
CREATE POLICY "View beds" ON public.beds
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.wards w WHERE w.id = ward_id AND w.organization_id = get_user_organization_id()));

CREATE POLICY "Manage beds" ON public.beds
  FOR ALL USING (EXISTS (SELECT 1 FROM public.wards w WHERE w.id = ward_id AND w.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.beds.manage')));

-- Admissions policies
CREATE POLICY "Users can view admissions in their org" ON public.admissions
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Staff can manage admissions" ON public.admissions
  FOR ALL USING (organization_id = get_user_organization_id() AND (is_super_admin() OR has_permission('ipd.admissions.create') OR has_permission('ipd.admissions.edit')));

-- Bed transfers policies
CREATE POLICY "View bed transfers" ON public.bed_transfers
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Manage bed transfers" ON public.bed_transfers
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.beds.manage')));

-- Daily rounds policies
CREATE POLICY "View daily rounds" ON public.daily_rounds
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Doctors can manage daily rounds" ON public.daily_rounds
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.rounds.manage')));

-- IPD vitals policies
CREATE POLICY "View ipd vitals" ON public.ipd_vitals
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Nurses can manage ipd vitals" ON public.ipd_vitals
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.vitals.manage')));

-- Nursing care plans policies
CREATE POLICY "View nursing care plans" ON public.nursing_care_plans
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Nurses can manage care plans" ON public.nursing_care_plans
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.nursing.manage')));

-- Nursing notes policies
CREATE POLICY "View nursing notes" ON public.nursing_notes
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Nurses can manage nursing notes" ON public.nursing_notes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.nursing.manage')));

-- IPD medications policies
CREATE POLICY "View ipd medications" ON public.ipd_medications
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Doctors can manage ipd medications" ON public.ipd_medications
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.medications.manage')));

-- Medication administration policies
CREATE POLICY "View medication administration" ON public.medication_administration
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Nurses can manage medication administration" ON public.medication_administration
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.emar.manage')));

-- Diet charts policies
CREATE POLICY "View diet charts" ON public.diet_charts
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Staff can manage diet charts" ON public.diet_charts
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.diet.manage')));

-- Discharge summaries policies
CREATE POLICY "View discharge summaries" ON public.discharge_summaries
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Doctors can manage discharge summaries" ON public.discharge_summaries
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.discharge.manage')));

-- Patient attendants policies
CREATE POLICY "View patient attendants" ON public.patient_attendants
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Staff can manage patient attendants" ON public.patient_attendants
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.admissions.edit')));

-- IPD charges policies
CREATE POLICY "View ipd charges" ON public.ipd_charges
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()));

CREATE POLICY "Staff can manage ipd charges" ON public.ipd_charges
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admissions a WHERE a.id = admission_id AND a.organization_id = get_user_organization_id()) AND (is_super_admin() OR has_permission('ipd.charges.manage')));

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_wards_updated_at
  BEFORE UPDATE ON public.wards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beds_updated_at
  BEFORE UPDATE ON public.beds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admissions_updated_at
  BEFORE UPDATE ON public.admissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nursing_care_plans_updated_at
  BEFORE UPDATE ON public.nursing_care_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discharge_summaries_updated_at
  BEFORE UPDATE ON public.discharge_summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ADMISSION NUMBER GENERATOR
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_admission_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  date_part TEXT;
  seq_num INT;
BEGIN
  prefix := 'ADM';
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(admission_number FROM LENGTH(prefix) + 9) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.admissions
  WHERE organization_id = NEW.organization_id
    AND admission_number LIKE prefix || '-' || date_part || '-%';
  
  NEW.admission_number := prefix || '-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_admission_number_trigger
  BEFORE INSERT ON public.admissions
  FOR EACH ROW
  WHEN (NEW.admission_number IS NULL OR NEW.admission_number = '')
  EXECUTE FUNCTION public.generate_admission_number();

-- =============================================
-- INSERT IPD PERMISSIONS
-- =============================================

INSERT INTO public.permissions (code, name, module, description) VALUES
('ipd.view', 'View IPD Module', 'ipd', 'Access to IPD module'),
('ipd.dashboard', 'IPD Dashboard', 'ipd', 'View IPD dashboard'),
('ipd.admissions.view', 'View Admissions', 'ipd', 'View admission list'),
('ipd.admissions.create', 'Create Admissions', 'ipd', 'Create new admissions'),
('ipd.admissions.edit', 'Edit Admissions', 'ipd', 'Edit admission details'),
('ipd.wards.view', 'View Wards', 'ipd', 'View ward list'),
('ipd.wards.manage', 'Manage Wards', 'ipd', 'Manage wards'),
('ipd.beds.view', 'View Beds', 'ipd', 'View bed status'),
('ipd.beds.manage', 'Manage Beds', 'ipd', 'Manage bed assignments'),
('ipd.rounds.view', 'View Rounds', 'ipd', 'View daily rounds'),
('ipd.rounds.manage', 'Manage Rounds', 'ipd', 'Record daily rounds'),
('ipd.vitals.view', 'View IPD Vitals', 'ipd', 'View patient vitals'),
('ipd.vitals.manage', 'Manage IPD Vitals', 'ipd', 'Record patient vitals'),
('ipd.nursing.view', 'View Nursing', 'ipd', 'View nursing notes'),
('ipd.nursing.manage', 'Manage Nursing', 'ipd', 'Manage nursing documentation'),
('ipd.medications.view', 'View IPD Medications', 'ipd', 'View IPD medications'),
('ipd.medications.manage', 'Manage IPD Medications', 'ipd', 'Manage IPD medications'),
('ipd.emar.view', 'View eMAR', 'ipd', 'View medication administration'),
('ipd.emar.manage', 'Manage eMAR', 'ipd', 'Administer medications'),
('ipd.diet.view', 'View Diet Charts', 'ipd', 'View diet charts'),
('ipd.diet.manage', 'Manage Diet Charts', 'ipd', 'Manage diet orders'),
('ipd.discharge.view', 'View Discharge', 'ipd', 'View discharge summaries'),
('ipd.discharge.manage', 'Manage Discharge', 'ipd', 'Process discharges'),
('ipd.charges.view', 'View IPD Charges', 'ipd', 'View IPD billing'),
('ipd.charges.manage', 'Manage IPD Charges', 'ipd', 'Manage IPD charges'),
('ipd.reports.view', 'IPD Reports', 'ipd', 'View IPD reports')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- INSERT IPD MENU ITEMS
-- =============================================

-- Parent IPD Menu
INSERT INTO public.menu_items (code, name, icon, path, sort_order, required_permission, required_module, is_active) VALUES
('ipd', 'Inpatient (IPD)', 'BedDouble', NULL, 25, 'ipd.view', 'ipd', true);

-- Get parent ID for submenus
DO $$
DECLARE
  ipd_parent_id UUID;
  adm_parent_id UUID;
  bed_parent_id UUID;
  care_parent_id UUID;
  discharge_parent_id UUID;
  setup_parent_id UUID;
BEGIN
  SELECT id INTO ipd_parent_id FROM public.menu_items WHERE code = 'ipd';
  
  -- IPD Dashboard
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.dashboard', 'IPD Dashboard', 'LayoutDashboard', '/app/ipd', 1, 'ipd.dashboard', true);
  
  -- Admissions Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.admissions', 'Admissions', 'UserPlus', NULL, 2, 'ipd.admissions.view', true)
  RETURNING id INTO adm_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (adm_parent_id, 'ipd.admissions.new', 'New Admission', 'Plus', '/app/ipd/admissions/new', 1, 'ipd.admissions.create', true),
  (adm_parent_id, 'ipd.admissions.active', 'Active Admissions', 'Users', '/app/ipd/admissions', 2, 'ipd.admissions.view', true),
  (adm_parent_id, 'ipd.admissions.history', 'Admission History', 'History', '/app/ipd/admissions/history', 3, 'ipd.admissions.view', true);
  
  -- Bed Management Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.beds', 'Bed Management', 'BedDouble', NULL, 3, 'ipd.beds.view', true)
  RETURNING id INTO bed_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (bed_parent_id, 'ipd.beds.map', 'Bed Map', 'LayoutGrid', '/app/ipd/beds', 1, 'ipd.beds.view', true),
  (bed_parent_id, 'ipd.beds.wards', 'Ward View', 'Building', '/app/ipd/beds/wards', 2, 'ipd.wards.view', true),
  (bed_parent_id, 'ipd.beds.housekeeping', 'Housekeeping', 'Sparkles', '/app/ipd/beds/housekeeping', 3, 'ipd.beds.manage', true),
  (bed_parent_id, 'ipd.beds.transfers', 'Bed Transfers', 'ArrowLeftRight', '/app/ipd/beds/transfers', 4, 'ipd.beds.manage', true);
  
  -- Patient Care Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.care', 'Patient Care', 'HeartPulse', NULL, 4, 'ipd.vitals.view', true)
  RETURNING id INTO care_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (care_parent_id, 'ipd.care.rounds', 'Daily Rounds', 'Stethoscope', '/app/ipd/care/rounds', 1, 'ipd.rounds.view', true),
  (care_parent_id, 'ipd.care.vitals', 'Vitals Chart', 'Activity', '/app/ipd/care/vitals', 2, 'ipd.vitals.view', true),
  (care_parent_id, 'ipd.care.nursing', 'Nursing Notes', 'FileText', '/app/ipd/care/nursing', 3, 'ipd.nursing.view', true),
  (care_parent_id, 'ipd.care.medications', 'Medication Chart', 'Pill', '/app/ipd/care/medications', 4, 'ipd.medications.view', true),
  (care_parent_id, 'ipd.care.emar', 'eMAR', 'ClipboardCheck', '/app/ipd/care/emar', 5, 'ipd.emar.view', true),
  (care_parent_id, 'ipd.care.diet', 'Diet Management', 'UtensilsCrossed', '/app/ipd/care/diet', 6, 'ipd.diet.view', true),
  (care_parent_id, 'ipd.care.plans', 'Care Plans', 'ClipboardList', '/app/ipd/care/plans', 7, 'ipd.nursing.view', true);
  
  -- Discharge Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.discharge', 'Discharge', 'DoorOpen', NULL, 5, 'ipd.discharge.view', true)
  RETURNING id INTO discharge_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (discharge_parent_id, 'ipd.discharge.pending', 'Pending Discharge', 'Clock', '/app/ipd/discharge', 1, 'ipd.discharge.view', true),
  (discharge_parent_id, 'ipd.discharge.summaries', 'Discharge Summaries', 'FileText', '/app/ipd/discharge/summaries', 2, 'ipd.discharge.view', true),
  (discharge_parent_id, 'ipd.discharge.billing', 'Final Billing', 'Receipt', '/app/ipd/discharge/billing', 3, 'ipd.charges.view', true);
  
  -- IPD Billing
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.charges', 'IPD Billing', 'IndianRupee', '/app/ipd/charges', 6, 'ipd.charges.view', true);
  
  -- Reports
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.reports', 'Reports', 'BarChart3', '/app/ipd/reports', 7, 'ipd.reports.view', true);
  
  -- IPD Setup Submenu
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (ipd_parent_id, 'ipd.setup', 'IPD Setup', 'Settings2', NULL, 8, 'ipd.wards.manage', true)
  RETURNING id INTO setup_parent_id;
  
  INSERT INTO public.menu_items (parent_id, code, name, icon, path, sort_order, required_permission, is_active) VALUES
  (setup_parent_id, 'ipd.setup.wards', 'Wards', 'Building2', '/app/ipd/setup/wards', 1, 'ipd.wards.manage', true),
  (setup_parent_id, 'ipd.setup.beds', 'Beds', 'BedDouble', '/app/ipd/setup/beds', 2, 'ipd.beds.manage', true),
  (setup_parent_id, 'ipd.setup.diet_types', 'Diet Types', 'Apple', '/app/ipd/setup/diet-types', 3, 'ipd.diet.manage', true);
END $$;

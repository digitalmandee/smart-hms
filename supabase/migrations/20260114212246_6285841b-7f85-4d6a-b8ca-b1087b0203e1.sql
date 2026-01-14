-- =============================================================================
-- OPERATION THEATRE (OT) MANAGEMENT MODULE
-- =============================================================================

-- 1. ENUMS
-- -----------------------------------------------------------------------------

-- Surgery status
CREATE TYPE public.surgery_status AS ENUM (
  'scheduled',
  'pre_op',
  'in_progress', 
  'completed',
  'cancelled',
  'postponed'
);

-- OT Room status
CREATE TYPE public.ot_room_status AS ENUM (
  'available',
  'occupied',
  'cleaning',
  'maintenance',
  'reserved'
);

-- Surgery priority
CREATE TYPE public.surgery_priority AS ENUM (
  'emergency',
  'urgent',
  'elective'
);

-- Anesthesia type
CREATE TYPE public.anesthesia_type AS ENUM (
  'general',
  'spinal',
  'epidural',
  'local',
  'regional',
  'sedation',
  'combined'
);

-- ASA Physical Status Classification
CREATE TYPE public.asa_class AS ENUM (
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI'
);

-- Surgery team role
CREATE TYPE public.surgery_team_role AS ENUM (
  'lead_surgeon',
  'assistant_surgeon',
  'anesthetist',
  'scrub_nurse',
  'circulating_nurse',
  'technician'
);

-- =============================================================================
-- 2. CORE TABLES
-- =============================================================================

-- OT Rooms
CREATE TABLE public.ot_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  floor VARCHAR(20),
  status public.ot_room_status NOT NULL DEFAULT 'available',
  room_type VARCHAR(50), -- general, cardiac, neuro, orthopedic, etc.
  equipment JSONB DEFAULT '[]', -- array of available equipment
  features JSONB DEFAULT '{}', -- laminar flow, c-arm, etc.
  capacity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, branch_id, room_number)
);

-- Surgeries (Main scheduling table)
CREATE TABLE public.surgeries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  surgery_number VARCHAR(50) NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  admission_id UUID REFERENCES public.admissions(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  ot_room_id UUID REFERENCES public.ot_rooms(id) ON DELETE SET NULL,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME,
  estimated_duration_minutes INTEGER DEFAULT 60,
  
  -- Actual timings
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  
  -- Surgery details
  procedure_name VARCHAR(500) NOT NULL,
  procedure_code VARCHAR(50),
  procedure_type VARCHAR(100), -- laparoscopic, open, robotic, etc.
  diagnosis VARCHAR(500),
  laterality VARCHAR(20), -- left, right, bilateral, not applicable
  
  -- Surgeons
  lead_surgeon_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  
  -- Status and priority
  status public.surgery_status NOT NULL DEFAULT 'scheduled',
  priority public.surgery_priority NOT NULL DEFAULT 'elective',
  
  -- Cancellation/postponement
  cancellation_reason TEXT,
  postponement_reason TEXT,
  rescheduled_from UUID REFERENCES public.surgeries(id),
  
  -- Consent and documentation
  consent_signed BOOLEAN DEFAULT false,
  consent_signed_at TIMESTAMPTZ,
  consent_document_url TEXT,
  
  -- Pre-op requirements
  npo_from TIMESTAMPTZ, -- nothing by mouth from
  special_requirements TEXT,
  equipment_needed JSONB DEFAULT '[]',
  blood_reservation JSONB, -- blood group, units reserved
  
  -- Post-op
  post_op_destination VARCHAR(50), -- ward, icu, pacu, discharge
  post_op_instructions TEXT,
  
  -- Billing
  estimated_cost NUMERIC(12,2),
  is_billable BOOLEAN DEFAULT true,
  invoice_id UUID,
  
  -- Audit
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, surgery_number)
);

-- Surgery Team Members
CREATE TABLE public.surgery_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  nurse_id UUID REFERENCES public.nurses(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  role public.surgery_team_role NOT NULL,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT team_member_check CHECK (
    doctor_id IS NOT NULL OR nurse_id IS NOT NULL OR employee_id IS NOT NULL
  )
);

-- Pre-Operative Assessments
CREATE TABLE public.pre_op_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  assessed_by UUID NOT NULL REFERENCES public.profiles(id),
  assessment_date TIMESTAMPTZ DEFAULT now(),
  
  -- ASA Classification
  asa_class public.asa_class,
  asa_notes TEXT,
  
  -- Medical history review
  medical_history_reviewed BOOLEAN DEFAULT false,
  allergies TEXT,
  current_medications JSONB DEFAULT '[]',
  relevant_conditions JSONB DEFAULT '[]',
  
  -- Vital signs
  vitals JSONB, -- bp, hr, temp, spo2, weight, height
  
  -- Investigations
  investigations JSONB DEFAULT '[]', -- lab tests, imaging with results
  investigations_cleared BOOLEAN DEFAULT false,
  
  -- Clearances
  medical_clearance JSONB, -- status, doctor, date, notes
  cardiac_clearance JSONB,
  anesthesia_clearance JSONB,
  other_clearances JSONB DEFAULT '[]',
  
  -- Risk assessment
  airway_assessment JSONB, -- mallampati, thyromental distance, etc.
  cardiac_risk_score VARCHAR(50), -- RCRI score
  surgical_risk_notes TEXT,
  
  -- Pre-op orders
  pre_op_orders JSONB DEFAULT '[]', -- medications, preparations
  
  -- Checklist items
  fasting_confirmed BOOLEAN DEFAULT false,
  consent_verified BOOLEAN DEFAULT false,
  site_marked BOOLEAN DEFAULT false,
  blood_arranged BOOLEAN DEFAULT false,
  jewelry_removed BOOLEAN DEFAULT false,
  dentures_removed BOOLEAN DEFAULT false,
  
  -- Final clearance
  is_cleared_for_surgery BOOLEAN DEFAULT false,
  clearance_notes TEXT,
  cleared_by UUID REFERENCES public.profiles(id),
  cleared_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Surgical Safety Checklist (WHO)
CREATE TABLE public.surgical_safety_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE UNIQUE,
  
  -- Sign In (Before induction of anesthesia)
  sign_in_completed BOOLEAN DEFAULT false,
  sign_in_time TIMESTAMPTZ,
  sign_in_by UUID REFERENCES public.profiles(id),
  sign_in_data JSONB, -- patient identity, site marked, consent, anesthesia check, pulse oximeter, allergies, airway, blood loss risk
  
  -- Time Out (Before skin incision)
  time_out_completed BOOLEAN DEFAULT false,
  time_out_time TIMESTAMPTZ,
  time_out_by UUID REFERENCES public.profiles(id),
  time_out_data JSONB, -- team intro, patient/site/procedure confirm, antibiotic given, imaging displayed, anticipated events
  
  -- Sign Out (Before patient leaves OR)
  sign_out_completed BOOLEAN DEFAULT false,
  sign_out_time TIMESTAMPTZ,
  sign_out_by UUID REFERENCES public.profiles(id),
  sign_out_data JSONB, -- procedure recorded, counts correct, specimen labeled, equipment issues, recovery concerns
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Anesthesia Records
CREATE TABLE public.anesthesia_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  anesthetist_id UUID NOT NULL REFERENCES public.doctors(id),
  
  -- Pre-anesthesia
  pre_anesthesia_assessment JSONB,
  anesthesia_plan TEXT,
  anesthesia_type public.anesthesia_type NOT NULL,
  
  -- Timing
  anesthesia_start_time TIMESTAMPTZ,
  induction_time TIMESTAMPTZ,
  intubation_time TIMESTAMPTZ,
  extubation_time TIMESTAMPTZ,
  anesthesia_end_time TIMESTAMPTZ,
  
  -- Airway management
  airway_device VARCHAR(50), -- ETT, LMA, mask, etc.
  airway_size VARCHAR(20),
  intubation_grade VARCHAR(10), -- Cormack-Lehane grade
  intubation_attempts INTEGER,
  airway_complications TEXT,
  
  -- Medications
  induction_agents JSONB DEFAULT '[]', -- drug, dose, time
  maintenance_agents JSONB DEFAULT '[]',
  muscle_relaxants JSONB DEFAULT '[]',
  analgesics JSONB DEFAULT '[]',
  reversal_agents JSONB DEFAULT '[]',
  other_medications JSONB DEFAULT '[]',
  
  -- IV access and lines
  iv_access JSONB DEFAULT '[]', -- site, gauge, time
  arterial_line JSONB,
  central_line JSONB,
  other_access JSONB DEFAULT '[]',
  
  -- Fluids
  fluid_input JSONB DEFAULT '[]', -- type, volume, time
  blood_products JSONB DEFAULT '[]', -- product, units, time
  total_input_ml INTEGER,
  urine_output_ml INTEGER,
  blood_loss_ml INTEGER,
  
  -- Vitals log (time-series data)
  vitals_log JSONB DEFAULT '[]', -- timestamp, bp, hr, spo2, etco2, temp, etc.
  
  -- Complications
  intra_op_events JSONB DEFAULT '[]', -- hypotension, bradycardia, etc.
  complications TEXT,
  
  -- Post-anesthesia
  recovery_score INTEGER, -- Aldrete score at handover
  handover_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Intra-Operative Notes
CREATE TABLE public.intra_op_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  documented_by UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Procedure details
  procedure_performed TEXT NOT NULL,
  approach VARCHAR(100), -- open, laparoscopic, robotic, etc.
  position VARCHAR(100), -- supine, prone, lateral, etc.
  skin_prep VARCHAR(100),
  draping VARCHAR(100),
  
  -- Incision
  incision_type VARCHAR(100),
  incision_time TIMESTAMPTZ,
  closure_time TIMESTAMPTZ,
  
  -- Findings
  intra_op_findings TEXT,
  pathology_findings TEXT,
  
  -- Procedure steps
  procedure_steps JSONB DEFAULT '[]', -- step-by-step documentation
  
  -- Specimens
  specimens JSONB DEFAULT '[]', -- type, site, sent for (histopath, culture, etc.)
  
  -- Implants/devices
  implants JSONB DEFAULT '[]', -- device, serial number, manufacturer
  
  -- Counts
  sponge_count_correct BOOLEAN DEFAULT true,
  instrument_count_correct BOOLEAN DEFAULT true,
  needle_count_correct BOOLEAN DEFAULT true,
  count_notes TEXT,
  
  -- Complications
  complications TEXT,
  blood_loss_ml INTEGER,
  
  -- Drains and catheters
  drains JSONB DEFAULT '[]', -- type, site, size
  catheters JSONB DEFAULT '[]',
  
  -- Closure
  closure_details TEXT,
  dressing_type VARCHAR(100),
  
  -- Images
  op_images JSONB DEFAULT '[]', -- url, description, timestamp
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post-Operative Recovery (PACU)
CREATE TABLE public.post_op_recovery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
  
  -- PACU admission
  pacu_arrival_time TIMESTAMPTZ NOT NULL,
  pacu_nurse_id UUID REFERENCES public.nurses(id),
  handover_from UUID REFERENCES public.profiles(id),
  handover_notes TEXT,
  
  -- Vitals monitoring (time-series)
  vitals_log JSONB DEFAULT '[]', -- timestamp, bp, hr, spo2, rr, temp
  
  -- Pain management
  pain_scores JSONB DEFAULT '[]', -- timestamp, score (0-10), location, intervention
  pain_management JSONB DEFAULT '[]', -- medications given
  
  -- Aldrete scoring
  aldrete_scores JSONB DEFAULT '[]', -- timestamp, activity, respiration, circulation, consciousness, spo2, total
  
  -- Complications
  complications JSONB DEFAULT '[]', -- type, time, intervention, outcome
  nausea_vomiting BOOLEAN DEFAULT false,
  shivering BOOLEAN DEFAULT false,
  emergence_delirium BOOLEAN DEFAULT false,
  
  -- Fluids and output
  fluid_intake_ml INTEGER DEFAULT 0,
  urine_output_ml INTEGER DEFAULT 0,
  drain_output_ml INTEGER DEFAULT 0,
  
  -- Orders and interventions
  nursing_interventions JSONB DEFAULT '[]',
  medications_given JSONB DEFAULT '[]',
  
  -- Discharge from PACU
  discharge_criteria_met BOOLEAN DEFAULT false,
  final_aldrete_score INTEGER,
  discharge_time TIMESTAMPTZ,
  discharged_by UUID REFERENCES public.profiles(id),
  discharge_destination VARCHAR(50), -- ward, icu, home
  discharge_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================

CREATE INDEX idx_ot_rooms_org ON public.ot_rooms(organization_id);
CREATE INDEX idx_ot_rooms_branch ON public.ot_rooms(branch_id);
CREATE INDEX idx_ot_rooms_status ON public.ot_rooms(status);

CREATE INDEX idx_surgeries_org ON public.surgeries(organization_id);
CREATE INDEX idx_surgeries_branch ON public.surgeries(branch_id);
CREATE INDEX idx_surgeries_patient ON public.surgeries(patient_id);
CREATE INDEX idx_surgeries_date ON public.surgeries(scheduled_date);
CREATE INDEX idx_surgeries_status ON public.surgeries(status);
CREATE INDEX idx_surgeries_surgeon ON public.surgeries(lead_surgeon_id);
CREATE INDEX idx_surgeries_room ON public.surgeries(ot_room_id);
CREATE INDEX idx_surgeries_admission ON public.surgeries(admission_id);

CREATE INDEX idx_surgery_team_surgery ON public.surgery_team_members(surgery_id);
CREATE INDEX idx_surgery_team_doctor ON public.surgery_team_members(doctor_id);

CREATE INDEX idx_pre_op_surgery ON public.pre_op_assessments(surgery_id);
CREATE INDEX idx_safety_checklist_surgery ON public.surgical_safety_checklists(surgery_id);
CREATE INDEX idx_anesthesia_surgery ON public.anesthesia_records(surgery_id);
CREATE INDEX idx_intra_op_surgery ON public.intra_op_notes(surgery_id);
CREATE INDEX idx_post_op_surgery ON public.post_op_recovery(surgery_id);

-- =============================================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE TRIGGER update_ot_rooms_updated_at
  BEFORE UPDATE ON public.ot_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surgeries_updated_at
  BEFORE UPDATE ON public.surgeries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pre_op_assessments_updated_at
  BEFORE UPDATE ON public.pre_op_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surgical_safety_checklists_updated_at
  BEFORE UPDATE ON public.surgical_safety_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anesthesia_records_updated_at
  BEFORE UPDATE ON public.anesthesia_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intra_op_notes_updated_at
  BEFORE UPDATE ON public.intra_op_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_op_recovery_updated_at
  BEFORE UPDATE ON public.post_op_recovery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.ot_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_op_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgical_safety_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anesthesia_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intra_op_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_op_recovery ENABLE ROW LEVEL SECURITY;

-- OT Rooms policies
CREATE POLICY "Users can view OT rooms in their organization" ON public.ot_rooms
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage OT rooms in their organization" ON public.ot_rooms
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Surgeries policies
CREATE POLICY "Users can view surgeries in their organization" ON public.surgeries
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage surgeries in their organization" ON public.surgeries
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Surgery team policies
CREATE POLICY "Users can view surgery team in their org surgeries" ON public.surgery_team_members
  FOR SELECT USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage surgery team in their org surgeries" ON public.surgery_team_members
  FOR ALL USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Pre-op assessments policies
CREATE POLICY "Users can view pre-op assessments in their org" ON public.pre_op_assessments
  FOR SELECT USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage pre-op assessments in their org" ON public.pre_op_assessments
  FOR ALL USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Surgical safety checklist policies
CREATE POLICY "Users can view safety checklists in their org" ON public.surgical_safety_checklists
  FOR SELECT USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage safety checklists in their org" ON public.surgical_safety_checklists
  FOR ALL USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Anesthesia records policies
CREATE POLICY "Users can view anesthesia records in their org" ON public.anesthesia_records
  FOR SELECT USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage anesthesia records in their org" ON public.anesthesia_records
  FOR ALL USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Intra-op notes policies
CREATE POLICY "Users can view intra-op notes in their org" ON public.intra_op_notes
  FOR SELECT USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage intra-op notes in their org" ON public.intra_op_notes
  FOR ALL USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Post-op recovery policies
CREATE POLICY "Users can view post-op recovery in their org" ON public.post_op_recovery
  FOR SELECT USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage post-op recovery in their org" ON public.post_op_recovery
  FOR ALL USING (
    surgery_id IN (
      SELECT id FROM public.surgeries WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- =============================================================================
-- 6. HELPER FUNCTIONS
-- =============================================================================

-- Generate surgery number
CREATE OR REPLACE FUNCTION public.generate_surgery_number(org_id UUID, branch_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  branch_code TEXT;
  today_count INTEGER;
  surgery_num TEXT;
BEGIN
  -- Get branch code
  SELECT code INTO branch_code FROM public.branches WHERE id = branch_id;
  
  -- Count today's surgeries
  SELECT COUNT(*) + 1 INTO today_count
  FROM public.surgeries
  WHERE organization_id = org_id
    AND scheduled_date = CURRENT_DATE;
  
  -- Generate number: SURG-BRANCHCODE-YYYYMMDD-XXXX
  surgery_num := 'SURG-' || COALESCE(branch_code, 'XX') || '-' || 
                 TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                 LPAD(today_count::TEXT, 4, '0');
  
  RETURN surgery_num;
END;
$$;

-- Update OT room status based on surgery
CREATE OR REPLACE FUNCTION public.update_ot_room_on_surgery_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When surgery starts, mark room as occupied
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' AND NEW.ot_room_id IS NOT NULL THEN
    UPDATE public.ot_rooms SET status = 'occupied' WHERE id = NEW.ot_room_id;
  END IF;
  
  -- When surgery completes, mark room as cleaning
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' AND NEW.ot_room_id IS NOT NULL THEN
    UPDATE public.ot_rooms SET status = 'cleaning' WHERE id = NEW.ot_room_id;
  END IF;
  
  -- When surgery is cancelled, free up the room
  IF NEW.status = 'cancelled' AND OLD.status IN ('scheduled', 'pre_op') AND NEW.ot_room_id IS NOT NULL THEN
    UPDATE public.ot_rooms SET status = 'available' WHERE id = NEW.ot_room_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ot_room_on_surgery_change
  AFTER UPDATE ON public.surgeries
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_ot_room_on_surgery_change();

-- =============================================================================
-- 7. MENU ITEMS FOR OT MODULE
-- =============================================================================

-- Insert parent menu item
INSERT INTO public.menu_items (code, name, icon, path, sort_order, is_active)
VALUES ('ot', 'Operation Theatre', 'Scissors', NULL, 9, true)
ON CONFLICT (code) DO NOTHING;

-- Insert child menu items
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 
  'ot.dashboard', 'OT Dashboard', 'LayoutDashboard', '/app/ot', id, 1, true
FROM public.menu_items WHERE code = 'ot'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 
  'ot.schedule', 'Surgery Schedule', 'CalendarClock', '/app/ot/schedule', id, 2, true
FROM public.menu_items WHERE code = 'ot'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 
  'ot.surgeries', 'Surgeries', 'Scissors', '/app/ot/surgeries', id, 3, true
FROM public.menu_items WHERE code = 'ot'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 
  'ot.rooms', 'OT Rooms', 'Building2', '/app/ot/rooms', id, 4, true
FROM public.menu_items WHERE code = 'ot'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 
  'ot.pacu', 'Recovery (PACU)', 'HeartPulse', '/app/ot/pacu', id, 5, true
FROM public.menu_items WHERE code = 'ot'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 
  'ot.reports', 'OT Reports', 'BarChart3', '/app/ot/reports', id, 6, true
FROM public.menu_items WHERE code = 'ot'
ON CONFLICT (code) DO NOTHING;
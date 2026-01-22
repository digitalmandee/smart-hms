-- =====================================================
-- PHASE 1: OT CONFIGURATION TABLES (100% Dynamic System)
-- =====================================================

-- 1. Surgery Priority Configuration
CREATE TABLE config_surgery_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  requires_immediate_attention BOOLEAN DEFAULT false,
  max_wait_hours INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE config_surgery_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org surgery priorities" ON config_surgery_priorities
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage surgery priorities" ON config_surgery_priorities
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 2. Anesthesia Types Configuration
CREATE TABLE config_anesthesia_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requires_intubation BOOLEAN DEFAULT false,
  typical_duration_minutes INTEGER,
  monitoring_level TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE config_anesthesia_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org anesthesia types" ON config_anesthesia_types
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage anesthesia types" ON config_anesthesia_types
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 3. Airway Devices Configuration
CREATE TABLE config_airway_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sizes_available JSONB DEFAULT '[]'::jsonb,
  is_invasive BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE config_airway_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org airway devices" ON config_airway_devices
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage airway devices" ON config_airway_devices
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 4. OT Team Roles Configuration
CREATE TABLE config_ot_team_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('surgeon', 'anesthesia', 'nursing', 'technician', 'support')),
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE config_ot_team_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org ot team roles" ON config_ot_team_roles
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage ot team roles" ON config_ot_team_roles
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 5. Surgical Procedure Catalog
CREATE TABLE config_surgical_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  specialization_id UUID REFERENCES specializations(id),
  typical_duration_minutes INTEGER,
  requires_general_anesthesia BOOLEAN DEFAULT false,
  typical_blood_requirement TEXT,
  equipment_checklist JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE config_surgical_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org surgical procedures" ON config_surgical_procedures
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage surgical procedures" ON config_surgical_procedures
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 6. Surgical Positions Configuration
CREATE TABLE config_surgical_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  precautions TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE config_surgical_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org surgical positions" ON config_surgical_positions
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage surgical positions" ON config_surgical_positions
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 7. ASA Classification Configuration
CREATE TABLE config_asa_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_level TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_level TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, class_level)
);

ALTER TABLE config_asa_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org asa classes" ON config_asa_classes
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage asa classes" ON config_asa_classes
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 8. WHO Checklist Items Configuration
CREATE TABLE config_who_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('sign_in', 'time_out', 'sign_out')),
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, phase, item_key)
);

ALTER TABLE config_who_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org who checklist items" ON config_who_checklist_items
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage who checklist items" ON config_who_checklist_items
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- PHASE 2: DOCTOR CATEGORY SYSTEM
-- =====================================================

-- Add category column to specializations
ALTER TABLE specializations 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'consultant' 
CHECK (category IN ('surgeon', 'consultant', 'anesthesia', 'radiologist', 'pathologist'));

-- Add description column if missing
ALTER TABLE specializations 
ADD COLUMN IF NOT EXISTS description TEXT;

-- =====================================================
-- PHASE 3: PRE-ANESTHESIA ASSESSMENT TABLE
-- =====================================================

CREATE TABLE pre_anesthesia_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assessed_by UUID REFERENCES doctors(id),
  assessment_date TIMESTAMPTZ DEFAULT now(),
  
  -- Airway Assessment
  mallampati_score TEXT,
  mouth_opening TEXT,
  thyromental_distance TEXT,
  neck_mobility TEXT,
  dental_status TEXT,
  airway_notes TEXT,
  predicted_difficult_airway BOOLEAN DEFAULT false,
  
  -- NPO Status
  npo_verified BOOLEAN DEFAULT false,
  last_solid_food TIMESTAMPTZ,
  last_clear_fluid TIMESTAMPTZ,
  npo_notes TEXT,
  
  -- Previous Anesthesia History
  previous_anesthesia BOOLEAN DEFAULT false,
  previous_anesthesia_type TEXT,
  previous_complications BOOLEAN DEFAULT false,
  previous_complications_details TEXT,
  family_anesthesia_complications BOOLEAN DEFAULT false,
  family_complications_details TEXT,
  
  -- Current Medications
  current_medications JSONB DEFAULT '[]'::jsonb,
  anticoagulant_status TEXT,
  last_anticoagulant_dose TIMESTAMPTZ,
  
  -- Allergies
  known_allergies JSONB DEFAULT '[]'::jsonb,
  latex_allergy BOOLEAN DEFAULT false,
  
  -- Vital Signs at Assessment
  blood_pressure TEXT,
  heart_rate INTEGER,
  spo2 INTEGER,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  bmi DECIMAL(4,1),
  
  -- Lab Review
  hemoglobin DECIMAL(4,1),
  platelets INTEGER,
  inr DECIMAL(3,2),
  creatinine DECIMAL(4,2),
  blood_sugar DECIMAL(5,1),
  ecg_findings TEXT,
  chest_xray_findings TEXT,
  
  -- Anesthesia Plan
  planned_anesthesia_type_id UUID REFERENCES config_anesthesia_types(id),
  planned_airway_device_id UUID REFERENCES config_airway_devices(id),
  planned_position_id UUID REFERENCES config_surgical_positions(id),
  asa_class_id UUID REFERENCES config_asa_classes(id),
  special_considerations TEXT,
  
  -- Risk Assessment
  cardiac_risk_score TEXT,
  pulmonary_risk_score TEXT,
  overall_risk TEXT,
  
  -- Consent
  consent_obtained BOOLEAN DEFAULT false,
  consent_obtained_at TIMESTAMPTZ,
  consent_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cleared', 'not_cleared')),
  clearance_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pre_anesthesia_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org pre-anesthesia assessments" ON pre_anesthesia_assessments
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Clinicians can manage pre-anesthesia assessments" ON pre_anesthesia_assessments
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- PHASE 4: ENHANCE SURGERIES TABLE
-- =====================================================

-- Add anesthetist selection at booking time
ALTER TABLE surgeries
ADD COLUMN IF NOT EXISTS anesthetist_id UUID REFERENCES doctors(id),
ADD COLUMN IF NOT EXISTS assistant_surgeon_id UUID REFERENCES doctors(id),
ADD COLUMN IF NOT EXISTS priority_id UUID REFERENCES config_surgery_priorities(id),
ADD COLUMN IF NOT EXISTS procedure_id UUID REFERENCES config_surgical_procedures(id);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_config_surgery_priorities_org ON config_surgery_priorities(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_anesthesia_types_org ON config_anesthesia_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_airway_devices_org ON config_airway_devices(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_ot_team_roles_org ON config_ot_team_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_surgical_procedures_org ON config_surgical_procedures(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_surgical_positions_org ON config_surgical_positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_asa_classes_org ON config_asa_classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_config_who_checklist_items_org ON config_who_checklist_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_pre_anesthesia_assessments_surgery ON pre_anesthesia_assessments(surgery_id);
CREATE INDEX IF NOT EXISTS idx_specializations_category ON specializations(category);
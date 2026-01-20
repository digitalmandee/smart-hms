-- Migration: Create clinical config tables, add menu items, and seed data

-- Phase 1: Create clinical configuration tables

-- 1.1 Create config_symptoms table
CREATE TABLE IF NOT EXISTS config_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 Create config_dosage_frequencies table
CREATE TABLE IF NOT EXISTS config_dosage_frequencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.3 Create config_duration_options table
CREATE TABLE IF NOT EXISTS config_duration_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  days_equivalent INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Create config_instructions table
CREATE TABLE IF NOT EXISTS config_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.5 Create config_lab_panels table
CREATE TABLE IF NOT EXISTS config_lab_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tests JSONB DEFAULT '[]'::jsonb,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 2: Enable RLS on all tables

ALTER TABLE config_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_dosage_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_duration_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_lab_panels ENABLE ROW LEVEL SECURITY;

-- Phase 3: Create RLS policies for each table

-- config_symptoms policies
CREATE POLICY "Users can view their org symptoms" ON config_symptoms
  FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can insert their org symptoms" ON config_symptoms
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
CREATE POLICY "Users can update their org symptoms" ON config_symptoms
  FOR UPDATE USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can delete their org symptoms" ON config_symptoms
  FOR DELETE USING (organization_id = get_user_organization_id());

-- config_dosage_frequencies policies
CREATE POLICY "Users can view their org frequencies" ON config_dosage_frequencies
  FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can insert their org frequencies" ON config_dosage_frequencies
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
CREATE POLICY "Users can update their org frequencies" ON config_dosage_frequencies
  FOR UPDATE USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can delete their org frequencies" ON config_dosage_frequencies
  FOR DELETE USING (organization_id = get_user_organization_id());

-- config_duration_options policies
CREATE POLICY "Users can view their org durations" ON config_duration_options
  FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can insert their org durations" ON config_duration_options
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
CREATE POLICY "Users can update their org durations" ON config_duration_options
  FOR UPDATE USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can delete their org durations" ON config_duration_options
  FOR DELETE USING (organization_id = get_user_organization_id());

-- config_instructions policies
CREATE POLICY "Users can view their org instructions" ON config_instructions
  FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can insert their org instructions" ON config_instructions
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
CREATE POLICY "Users can update their org instructions" ON config_instructions
  FOR UPDATE USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can delete their org instructions" ON config_instructions
  FOR DELETE USING (organization_id = get_user_organization_id());

-- config_lab_panels policies
CREATE POLICY "Users can view their org lab panels" ON config_lab_panels
  FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can insert their org lab panels" ON config_lab_panels
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
CREATE POLICY "Users can update their org lab panels" ON config_lab_panels
  FOR UPDATE USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can delete their org lab panels" ON config_lab_panels
  FOR DELETE USING (organization_id = get_user_organization_id());

-- Phase 4: Add missing menu items to Settings submenu
INSERT INTO menu_items (id, name, code, path, icon, parent_id, sort_order, is_active, required_permission)
VALUES
  (gen_random_uuid(), 'Patient Config', 'settings-patient-config', '/app/settings/patient-config', 'UserCog', '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc', 23, true, 'settings.manage'),
  (gen_random_uuid(), 'HR Config', 'settings-hr-config', '/app/settings/hr-config', 'HeartHandshake', '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc', 24, true, 'settings.manage'),
  (gen_random_uuid(), 'IPD Config', 'settings-ipd-config', '/app/settings/ipd-config', 'BedDouble', '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc', 27, true, 'settings.manage')
ON CONFLICT (code) DO NOTHING;

-- Phase 5: Seed clinical configuration tables for all organizations
DO $$
DECLARE
  org RECORD;
BEGIN
  FOR org IN SELECT id FROM organizations LOOP
    
    -- Seed Common Symptoms (15 records)
    INSERT INTO config_symptoms (organization_id, name, category, sort_order, is_active)
    VALUES
      (org.id, 'Fever', 'General', 1, true),
      (org.id, 'Headache', 'General', 2, true),
      (org.id, 'Cough', 'Respiratory', 3, true),
      (org.id, 'Cold', 'Respiratory', 4, true),
      (org.id, 'Body Pain', 'General', 5, true),
      (org.id, 'Fatigue', 'General', 6, true),
      (org.id, 'Nausea', 'GI', 7, true),
      (org.id, 'Vomiting', 'GI', 8, true),
      (org.id, 'Diarrhea', 'GI', 9, true),
      (org.id, 'Abdominal Pain', 'GI', 10, true),
      (org.id, 'Chest Pain', 'Cardiac', 11, true),
      (org.id, 'Shortness of Breath', 'Respiratory', 12, true),
      (org.id, 'Dizziness', 'Neurological', 13, true),
      (org.id, 'Sore Throat', 'ENT', 14, true),
      (org.id, 'Joint Pain', 'Musculoskeletal', 15, true);
    
    -- Seed Dosage Frequencies (10 records)
    INSERT INTO config_dosage_frequencies (organization_id, code, label, sort_order, is_active)
    VALUES
      (org.id, '1-0-0', 'Once Daily - Morning (OD)', 1, true),
      (org.id, '0-0-1', 'Once Daily - Night (OD)', 2, true),
      (org.id, '1-0-1', 'Twice Daily (BD)', 3, true),
      (org.id, '1-1-1', 'Three Times Daily (TDS)', 4, true),
      (org.id, '1-1-1-1', 'Four Times Daily (QID)', 5, true),
      (org.id, 'HS', 'At Bedtime (HS)', 6, true),
      (org.id, 'SOS', 'As Needed (SOS)', 7, true),
      (org.id, 'STAT', 'Immediately (STAT)', 8, true),
      (org.id, 'AC', 'Before Meals (AC)', 9, true),
      (org.id, 'PC', 'After Meals (PC)', 10, true);
    
    -- Seed Duration Options (12 records)
    INSERT INTO config_duration_options (organization_id, value, label, days_equivalent, sort_order, is_active)
    VALUES
      (org.id, '3 days', '3 Days', 3, 1, true),
      (org.id, '5 days', '5 Days', 5, 2, true),
      (org.id, '7 days', '7 Days', 7, 3, true),
      (org.id, '10 days', '10 Days', 10, 4, true),
      (org.id, '14 days', '14 Days', 14, 5, true),
      (org.id, '21 days', '21 Days', 21, 6, true),
      (org.id, '1 month', '1 Month', 30, 7, true),
      (org.id, '2 months', '2 Months', 60, 8, true),
      (org.id, '3 months', '3 Months', 90, 9, true),
      (org.id, '6 months', '6 Months', 180, 10, true),
      (org.id, '1 year', '1 Year', 365, 11, true),
      (org.id, 'Continuous', 'Lifelong', NULL, 12, true);
    
    -- Seed Prescription Instructions (12 records)
    INSERT INTO config_instructions (organization_id, text, sort_order, is_active)
    VALUES
      (org.id, 'Take before meals', 1, true),
      (org.id, 'Take after meals', 2, true),
      (org.id, 'Take with food', 3, true),
      (org.id, 'Take on empty stomach', 4, true),
      (org.id, 'Take with plenty of water', 5, true),
      (org.id, 'Avoid alcohol', 6, true),
      (org.id, 'Avoid dairy products', 7, true),
      (org.id, 'Apply externally only', 8, true),
      (org.id, 'Do not crush or chew', 9, true),
      (org.id, 'Keep refrigerated', 10, true),
      (org.id, 'Shake well before use', 11, true),
      (org.id, 'Avoid direct sunlight', 12, true);
    
    -- Seed Lab Panels (8 records)
    INSERT INTO config_lab_panels (organization_id, name, description, tests, sort_order, is_active)
    VALUES
      (org.id, 'CBC', 'Complete Blood Count', '[{"test_name": "Hemoglobin", "test_category": "Hematology"}, {"test_name": "WBC Count", "test_category": "Hematology"}, {"test_name": "Platelet Count", "test_category": "Hematology"}]'::jsonb, 1, true),
      (org.id, 'LFT', 'Liver Function Test', '[{"test_name": "SGPT/ALT", "test_category": "Biochemistry"}, {"test_name": "SGOT/AST", "test_category": "Biochemistry"}, {"test_name": "Bilirubin", "test_category": "Biochemistry"}]'::jsonb, 2, true),
      (org.id, 'RFT', 'Renal Function Test', '[{"test_name": "Creatinine", "test_category": "Biochemistry"}, {"test_name": "Urea", "test_category": "Biochemistry"}, {"test_name": "Uric Acid", "test_category": "Biochemistry"}]'::jsonb, 3, true),
      (org.id, 'Lipid Profile', 'Complete Lipid Panel', '[{"test_name": "Total Cholesterol", "test_category": "Biochemistry"}, {"test_name": "Triglycerides", "test_category": "Biochemistry"}, {"test_name": "HDL", "test_category": "Biochemistry"}, {"test_name": "LDL", "test_category": "Biochemistry"}]'::jsonb, 4, true),
      (org.id, 'Thyroid Profile', 'Thyroid Function Test', '[{"test_name": "TSH", "test_category": "Endocrine"}, {"test_name": "T3", "test_category": "Endocrine"}, {"test_name": "T4", "test_category": "Endocrine"}]'::jsonb, 5, true),
      (org.id, 'Blood Sugar', 'Blood Glucose Tests', '[{"test_name": "Fasting Blood Sugar", "test_category": "Biochemistry"}, {"test_name": "Random Blood Sugar", "test_category": "Biochemistry"}]'::jsonb, 6, true),
      (org.id, 'HbA1c', 'Glycated Hemoglobin', '[{"test_name": "HbA1c", "test_category": "Biochemistry"}]'::jsonb, 7, true),
      (org.id, 'Urine RE', 'Urine Routine Examination', '[{"test_name": "Urine Complete Examination", "test_category": "Pathology"}]'::jsonb, 8, true);
    
  END LOOP;
END $$;
-- Create specializations table (organization-scoped)
CREATE TABLE IF NOT EXISTS specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create qualifications table (organization-scoped)
CREATE TABLE IF NOT EXISTS qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, abbreviation)
);

-- Create appointment types config table
CREATE TABLE IF NOT EXISTS config_appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_fee_applicable BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Enable RLS
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_appointment_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for specializations
CREATE POLICY "Users can view specializations in their organization"
  ON specializations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage specializations in their organization"
  ON specializations FOR ALL
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- RLS policies for qualifications
CREATE POLICY "Users can view qualifications in their organization"
  ON qualifications FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage qualifications in their organization"
  ON qualifications FOR ALL
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- RLS policies for config_appointment_types
CREATE POLICY "Users can view appointment types in their organization"
  ON config_appointment_types FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage appointment types in their organization"
  ON config_appointment_types FOR ALL
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Seed data for all organizations
DO $$
DECLARE
  org RECORD;
BEGIN
  FOR org IN SELECT id FROM organizations LOOP
    -- Seed Specializations (18 records)
    INSERT INTO specializations (organization_id, name, code, display_order) VALUES
      (org.id, 'General Medicine', 'GEN', 0),
      (org.id, 'Cardiology', 'CARD', 1),
      (org.id, 'Dermatology', 'DERM', 2),
      (org.id, 'ENT', 'ENT', 3),
      (org.id, 'Gastroenterology', 'GAST', 4),
      (org.id, 'General Surgery', 'SURG', 5),
      (org.id, 'Gynecology', 'GYNE', 6),
      (org.id, 'Nephrology', 'NEPH', 7),
      (org.id, 'Neurology', 'NEUR', 8),
      (org.id, 'Oncology', 'ONCO', 9),
      (org.id, 'Ophthalmology', 'OPHT', 10),
      (org.id, 'Orthopedics', 'ORTH', 11),
      (org.id, 'Pediatrics', 'PEDI', 12),
      (org.id, 'Psychiatry', 'PSYC', 13),
      (org.id, 'Pulmonology', 'PULM', 14),
      (org.id, 'Radiology', 'RADI', 15),
      (org.id, 'Urology', 'UROL', 16),
      (org.id, 'Other', 'OTHR', 17)
    ON CONFLICT (organization_id, name) DO NOTHING;

    -- Seed Qualifications (12 records)
    INSERT INTO qualifications (organization_id, name, abbreviation) VALUES
      (org.id, 'Bachelor of Medicine, Bachelor of Surgery', 'MBBS'),
      (org.id, 'Doctor of Medicine', 'MD'),
      (org.id, 'Fellow of College of Physicians and Surgeons', 'FCPS'),
      (org.id, 'Member of Royal College of Physicians', 'MRCP'),
      (org.id, 'Fellow of Royal College of Surgeons', 'FRCS'),
      (org.id, 'Master of Surgery', 'MS'),
      (org.id, 'Diplomate of National Board', 'DNB'),
      (org.id, 'Doctorate of Medicine - Super Specialty', 'DM'),
      (org.id, 'Master of Chirurgiae', 'MCh'),
      (org.id, 'Doctor of Philosophy', 'PhD'),
      (org.id, 'Fellow of American College of Surgeons', 'FACS'),
      (org.id, 'Other', 'Other')
    ON CONFLICT (organization_id, abbreviation) DO NOTHING;

    -- Seed Appointment Types (6 records)
    INSERT INTO config_appointment_types (organization_id, code, name, description, sort_order) VALUES
      (org.id, 'new_consultation', 'New Consultation', 'First-time consultation with doctor', 0),
      (org.id, 'follow_up', 'Follow-up', 'Follow-up appointment for existing condition', 1),
      (org.id, 'urgent', 'Urgent/Priority', 'Priority consultation for urgent cases', 2),
      (org.id, 'emergency', 'Emergency', 'Emergency medical consultation', 3),
      (org.id, 'home_visit', 'Home Visit', 'Doctor visit at patient home', 4),
      (org.id, 'telemedicine', 'Telemedicine', 'Online/video consultation', 5)
    ON CONFLICT (organization_id, code) DO NOTHING;
  END LOOP;
END $$;
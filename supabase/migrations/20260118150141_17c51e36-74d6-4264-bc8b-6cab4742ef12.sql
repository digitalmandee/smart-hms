-- Add facility_type and billing_workflow to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS 
  facility_type TEXT DEFAULT 'hospital' 
  CHECK (facility_type IN ('hospital', 'clinic', 'diagnostic_center', 'pharmacy'));

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS 
  billing_workflow TEXT DEFAULT 'post_visit' 
  CHECK (billing_workflow IN ('post_visit', 'pre_visit'));

-- Add consultation fees to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS followup_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS emergency_fee NUMERIC(10,2) DEFAULT 0;

-- Create doctor fee schedule for detailed fee configuration
CREATE TABLE IF NOT EXISTS doctor_fee_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('new', 'followup', 'urgent', 'emergency', 'home_visit')),
  fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, appointment_type)
);

-- Enable RLS on doctor_fee_schedule
ALTER TABLE doctor_fee_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctor_fee_schedule
CREATE POLICY "Users can view doctor fees in their organization"
  ON doctor_fee_schedule FOR SELECT
  USING (organization_id = get_user_organization_id() OR is_super_admin());

CREATE POLICY "Users can manage doctor fees in their organization"
  ON doctor_fee_schedule FOR ALL
  USING (organization_id = get_user_organization_id() OR is_super_admin());

-- Create available_modules reference table
CREATE TABLE IF NOT EXISTS available_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT DEFAULT 'core',
  is_hospital_only BOOLEAN DEFAULT false,
  is_core BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Seed available modules
INSERT INTO available_modules (code, name, description, icon, category, is_hospital_only, is_core, sort_order)
VALUES
  ('patients', 'Patients', 'Patient registration and management', 'Users', 'core', false, true, 1),
  ('appointments', 'Appointments', 'Appointment scheduling and queue', 'Calendar', 'core', false, true, 2),
  ('opd', 'OPD / Consultations', 'Outpatient consultations', 'Stethoscope', 'clinical', false, true, 3),
  ('ipd', 'IPD / Admissions', 'Inpatient admissions and wards', 'Bed', 'clinical', true, false, 4),
  ('pharmacy', 'Pharmacy', 'Pharmacy inventory and dispensing', 'Pill', 'ancillary', false, false, 5),
  ('pharmacy_pos', 'Pharmacy POS', 'Point of sale for pharmacy', 'ShoppingCart', 'ancillary', false, false, 6),
  ('lab', 'Laboratory', 'Lab orders and results', 'FlaskConical', 'ancillary', false, false, 7),
  ('radiology', 'Radiology', 'Imaging and radiology', 'Scan', 'ancillary', true, false, 8),
  ('billing', 'Billing', 'Invoices and payments', 'CreditCard', 'finance', false, true, 9),
  ('hr', 'HR / Employees', 'Staff and payroll management', 'Users', 'admin', false, false, 10),
  ('accounts', 'Accounts', 'Financial accounting', 'Calculator', 'finance', false, false, 11),
  ('emergency', 'Emergency', 'ER and triage', 'Siren', 'clinical', true, false, 12),
  ('ot', 'Operation Theatre', 'Surgery scheduling', 'Scissors', 'clinical', true, false, 13),
  ('blood_bank', 'Blood Bank', 'Blood donation and inventory', 'Droplet', 'ancillary', true, false, 14),
  ('reports', 'Reports', 'Analytics and reports', 'BarChart', 'admin', false, true, 15),
  ('settings', 'Settings', 'System configuration', 'Settings', 'admin', false, true, 16)
ON CONFLICT (code) DO NOTHING;

-- Populate organization_modules for existing organizations
INSERT INTO organization_modules (organization_id, module_code, is_enabled)
SELECT o.id, m.code, 
  CASE 
    WHEN o.facility_type = 'clinic' AND m.is_hospital_only THEN false
    WHEN o.facility_type = 'pharmacy' AND m.code NOT IN ('pharmacy', 'pharmacy_pos', 'billing', 'reports', 'settings') THEN false
    ELSE true
  END
FROM organizations o
CROSS JOIN available_modules m
ON CONFLICT (organization_id, module_code) DO NOTHING;

-- Add POS mode setting to organization_settings
INSERT INTO organization_settings (organization_id, setting_key, setting_value)
SELECT id, 'pos_mode', 'integrated'
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM organization_settings os 
  WHERE os.organization_id = organizations.id 
  AND os.setting_key = 'pos_mode'
)
ON CONFLICT (organization_id, setting_key) DO NOTHING;
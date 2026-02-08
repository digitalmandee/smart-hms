-- ============================================
-- Multi-OPD Department Management System
-- ============================================

-- Create OPD Departments table
CREATE TABLE IF NOT EXISTS opd_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  rooms VARCHAR(100),
  color VARCHAR(10) DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  head_doctor_id UUID REFERENCES doctors(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, branch_id, code)
);

-- Create junction table for OPD department specializations
CREATE TABLE IF NOT EXISTS opd_department_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opd_department_id UUID NOT NULL REFERENCES opd_departments(id) ON DELETE CASCADE,
  specialization_id UUID NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(opd_department_id, specialization_id)
);

-- Add opd_department_id to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS opd_department_id UUID REFERENCES opd_departments(id);

-- Add opd_department_id to billing_sessions table
ALTER TABLE billing_sessions ADD COLUMN IF NOT EXISTS opd_department_id UUID REFERENCES opd_departments(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opd_departments_org_branch ON opd_departments(organization_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_opd_departments_active ON opd_departments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_opd_dept_specs_dept ON opd_department_specializations(opd_department_id);
CREATE INDEX IF NOT EXISTS idx_opd_dept_specs_spec ON opd_department_specializations(specialization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_opd_dept ON appointments(opd_department_id);
CREATE INDEX IF NOT EXISTS idx_billing_sessions_opd_dept ON billing_sessions(opd_department_id);

-- Enable RLS
ALTER TABLE opd_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opd_department_specializations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opd_departments
CREATE POLICY "opd_departments_select_org" ON opd_departments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "opd_departments_insert_org" ON opd_departments
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "opd_departments_update_org" ON opd_departments
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "opd_departments_delete_org" ON opd_departments
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for opd_department_specializations
CREATE POLICY "opd_dept_specs_select" ON opd_department_specializations
  FOR SELECT USING (
    opd_department_id IN (
      SELECT id FROM opd_departments WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "opd_dept_specs_insert" ON opd_department_specializations
  FOR INSERT WITH CHECK (
    opd_department_id IN (
      SELECT id FROM opd_departments WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "opd_dept_specs_delete" ON opd_department_specializations
  FOR DELETE USING (
    opd_department_id IN (
      SELECT id FROM opd_departments WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Function to generate OPD token with department prefix
CREATE OR REPLACE FUNCTION generate_opd_token(
  p_opd_department_id UUID,
  p_appointment_date DATE,
  p_branch_id UUID
)
RETURNS TABLE (token_number INTEGER, token_display TEXT) AS $$
DECLARE
  v_dept_code TEXT;
  v_next_token INTEGER;
BEGIN
  -- Get department code
  SELECT code INTO v_dept_code
  FROM opd_departments
  WHERE id = p_opd_department_id;
  
  -- Get next token number for this department + date
  SELECT COALESCE(MAX(a.token_number), 0) + 1 INTO v_next_token
  FROM appointments a
  WHERE a.opd_department_id = p_opd_department_id
    AND a.appointment_date = p_appointment_date;
  
  RETURN QUERY SELECT v_next_token, v_dept_code || '-' || LPAD(v_next_token::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find OPD department by specialization
CREATE OR REPLACE FUNCTION find_opd_department_by_specialization(
  p_specialization_id UUID,
  p_branch_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_dept_id UUID;
BEGIN
  SELECT od.id INTO v_dept_id
  FROM opd_departments od
  JOIN opd_department_specializations ods ON od.id = ods.opd_department_id
  WHERE ods.specialization_id = p_specialization_id
    AND od.branch_id = p_branch_id
    AND od.is_active = true
  LIMIT 1;
  
  RETURN v_dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
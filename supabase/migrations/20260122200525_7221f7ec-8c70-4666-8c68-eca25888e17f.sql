-- Create surgery_requests table for tracking surgery recommendations
CREATE TABLE surgery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID REFERENCES branches(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  
  -- Request details
  procedure_name VARCHAR NOT NULL,
  diagnosis VARCHAR,
  priority VARCHAR DEFAULT 'elective' CHECK (priority IN ('elective', 'urgent', 'emergency')),
  recommended_by UUID REFERENCES doctors(id),
  recommended_date DATE DEFAULT CURRENT_DATE,
  clinical_notes TEXT,
  preferred_date_from DATE,
  preferred_date_to DATE,
  estimated_duration_minutes INTEGER,
  
  -- Workflow status
  request_status VARCHAR DEFAULT 'pending' CHECK (request_status IN (
    'pending',
    'ot_availability_checked',
    'admission_required',
    'admitted',
    'scheduled',
    'completed',
    'cancelled'
  )),
  
  -- Linking
  consultation_id UUID REFERENCES consultations(id),
  admission_id UUID REFERENCES admissions(id),
  surgery_id UUID REFERENCES surgeries(id),
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT
);

-- Enable RLS
ALTER TABLE surgery_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view surgery requests in their organization"
  ON surgery_requests FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create surgery requests in their organization"
  ON surgery_requests FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update surgery requests in their organization"
  ON surgery_requests FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_surgery_requests_org ON surgery_requests(organization_id);
CREATE INDEX idx_surgery_requests_patient ON surgery_requests(patient_id);
CREATE INDEX idx_surgery_requests_status ON surgery_requests(request_status);
CREATE INDEX idx_surgery_requests_branch ON surgery_requests(branch_id);
CREATE INDEX idx_surgery_requests_doctor ON surgery_requests(recommended_by);

-- Updated at trigger
CREATE TRIGGER update_surgery_requests_updated_at
  BEFORE UPDATE ON surgery_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
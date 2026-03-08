-- Add ZATCA Phase 2 columns to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS zatca_invoice_hash TEXT,
ADD COLUMN IF NOT EXISTS zatca_xml TEXT,
ADD COLUMN IF NOT EXISTS zatca_clearance_status TEXT,
ADD COLUMN IF NOT EXISTS zatca_clearance_response JSONB;

-- Create Wasfaty prescriptions table for e-prescription integration
CREATE TABLE IF NOT EXISTS wasfaty_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  prescription_id UUID REFERENCES prescriptions(id),
  consultation_id UUID REFERENCES consultations(id),
  doctor_id UUID REFERENCES doctors(id),
  
  -- Wasfaty identifiers
  wasfaty_prescription_id TEXT,
  wasfaty_status TEXT DEFAULT 'draft',
  
  -- Prescription data
  medications JSONB NOT NULL DEFAULT '[]',
  diagnosis_codes TEXT[],
  
  -- Submission tracking
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES profiles(id),
  response_data JSONB,
  error_message TEXT,
  
  -- Dispensing
  dispensed_at TIMESTAMPTZ,
  dispensing_pharmacy TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wasfaty_prescriptions_org ON wasfaty_prescriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_wasfaty_prescriptions_patient ON wasfaty_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_wasfaty_prescriptions_status ON wasfaty_prescriptions(wasfaty_status);

-- Enable RLS
ALTER TABLE wasfaty_prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for wasfaty_prescriptions
CREATE POLICY "Users can view their org wasfaty prescriptions"
ON wasfaty_prescriptions FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert wasfaty prescriptions"
ON wasfaty_prescriptions FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their org wasfaty prescriptions"
ON wasfaty_prescriptions FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- Add Wasfaty configuration to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS wasfaty_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wasfaty_facility_id TEXT,
ADD COLUMN IF NOT EXISTS wasfaty_api_key_encrypted TEXT;
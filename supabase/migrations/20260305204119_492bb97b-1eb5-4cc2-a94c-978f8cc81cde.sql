
-- Add NPHIES fields to insurance_claims
ALTER TABLE insurance_claims 
  ADD COLUMN IF NOT EXISTS nphies_claim_id TEXT,
  ADD COLUMN IF NOT EXISTS nphies_status TEXT,
  ADD COLUMN IF NOT EXISTS nphies_response JSONB;

-- Eligibility verification log
CREATE TABLE IF NOT EXISTS nphies_eligibility_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_insurance_id UUID REFERENCES patient_insurance(id),
  checked_at TIMESTAMPTZ DEFAULT now(),
  checked_by UUID REFERENCES auth.users(id),
  eligible BOOLEAN,
  status TEXT,
  coverage_start DATE,
  coverage_end DATE,
  plan_name TEXT,
  copay NUMERIC,
  deductible NUMERIC,
  benefits JSONB,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nphies_eligibility_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org eligibility logs"
  ON nphies_eligibility_logs FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own org eligibility logs"
  ON nphies_eligibility_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Add verification fields to patient_insurance
ALTER TABLE patient_insurance
  ADD COLUMN IF NOT EXISTS nphies_eligible BOOLEAN,
  ADD COLUMN IF NOT EXISTS nphies_last_checked TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nphies_coverage_end DATE;

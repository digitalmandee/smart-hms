-- Add fee fields to doctors table for patient-facing charges
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS default_surgery_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS ipd_visit_fee DECIMAL(10,2);

-- Add IPD visit share percent to doctor_compensation_plans
ALTER TABLE doctor_compensation_plans 
ADD COLUMN IF NOT EXISTS ipd_visit_share_percent DECIMAL(5,2) DEFAULT 50;

-- Add comments for clarity
COMMENT ON COLUMN doctors.consultation_fee IS 'Patient-facing OPD consultation fee (what patient pays)';
COMMENT ON COLUMN doctors.default_surgery_fee IS 'Default surgery fee charged to patients';
COMMENT ON COLUMN doctors.ipd_visit_fee IS 'Per-visit fee for IPD patient rounds';
COMMENT ON COLUMN doctor_compensation_plans.consultation_share_percent IS 'Doctor share percentage of consultation_fee';
COMMENT ON COLUMN doctor_compensation_plans.surgery_share_percent IS 'Doctor share percentage of surgery charges';
COMMENT ON COLUMN doctor_compensation_plans.ipd_visit_share_percent IS 'Doctor share percentage of IPD visit fees';
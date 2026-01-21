-- Add patient_id to blood_donors table for linking donors to patient profiles
ALTER TABLE blood_donors 
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_blood_donors_patient_id ON blood_donors(patient_id);

-- Add comment for clarity
COMMENT ON COLUMN blood_donors.patient_id IS 'Optional link to patient record if donor is also a registered patient';
-- Add emergency type to appointment_type enum
ALTER TYPE appointment_type ADD VALUE IF NOT EXISTS 'emergency';

-- Add priority column for queue ordering (0 = Normal, 1 = Urgent, 2 = Emergency)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add check_in_vitals column to store vitals recorded during check-in
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS check_in_vitals JSONB DEFAULT NULL;

-- Add check_in_by and check_in_at columns to track who checked in the patient
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS check_in_by UUID REFERENCES profiles(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMP WITH TIME ZONE;

-- Create index for priority-based queue ordering
CREATE INDEX IF NOT EXISTS idx_appointments_priority_date ON appointments(appointment_date, priority DESC, token_number);
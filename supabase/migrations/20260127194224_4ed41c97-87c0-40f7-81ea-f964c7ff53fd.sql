-- Add waiver tracking columns to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS waived_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS waiver_reason TEXT,
ADD COLUMN IF NOT EXISTS waived_at TIMESTAMPTZ;

-- Add index for waiver queries
CREATE INDEX IF NOT EXISTS idx_appointments_waived_by ON appointments(waived_by) WHERE waived_by IS NOT NULL;

-- Add comments
COMMENT ON COLUMN appointments.waived_by IS 'Profile ID of person who authorized fee waiver';
COMMENT ON COLUMN appointments.waiver_reason IS 'Reason for waiving consultation fee';
COMMENT ON COLUMN appointments.waived_at IS 'Timestamp when fee was waived';
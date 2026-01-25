-- Add outcome tracking columns to surgeries table
ALTER TABLE public.surgeries 
ADD COLUMN IF NOT EXISTS outcome TEXT,
ADD COLUMN IF NOT EXISTS outcome_notes TEXT,
ADD COLUMN IF NOT EXISTS outcome_recorded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS outcome_recorded_by UUID REFERENCES auth.users(id);

-- Add comment for clarity
COMMENT ON COLUMN public.surgeries.outcome IS 'Surgery outcome: successful, failed, or unknown (pending)';
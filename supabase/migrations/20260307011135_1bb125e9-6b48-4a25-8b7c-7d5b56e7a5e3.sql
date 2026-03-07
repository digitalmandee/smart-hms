ALTER TABLE public.insurance_claims 
ADD COLUMN IF NOT EXISTS denial_reasons jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS resubmission_count integer DEFAULT 0;
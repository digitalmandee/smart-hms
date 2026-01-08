-- Create marital status enum
CREATE TYPE public.marital_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'other');

-- Add new columns to patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS marital_status public.marital_status,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS number_of_children integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS religion text,
ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Pakistan',
ADD COLUMN IF NOT EXISTS referred_by text,
ADD COLUMN IF NOT EXISTS referral_details text,
ADD COLUMN IF NOT EXISTS insurance_provider text,
ADD COLUMN IF NOT EXISTS insurance_id text,
ADD COLUMN IF NOT EXISTS emergency_contact_relation text,
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'Urdu',
ADD COLUMN IF NOT EXISTS father_husband_name text,
ADD COLUMN IF NOT EXISTS secondary_phone text,
ADD COLUMN IF NOT EXISTS passport_number text;

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_patients_national_id ON public.patients(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_insurance_id ON public.patients(insurance_id) WHERE insurance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone) WHERE phone IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.patients.marital_status IS 'Patient marital status';
COMMENT ON COLUMN public.patients.father_husband_name IS 'Father or husband name for identification';
COMMENT ON COLUMN public.patients.emergency_contact_relation IS 'Relationship of emergency contact to patient';
COMMENT ON COLUMN public.patients.preferred_language IS 'Preferred language for communication';
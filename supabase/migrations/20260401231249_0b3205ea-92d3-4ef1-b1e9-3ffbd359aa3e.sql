
-- Add 'child' to gender enum
ALTER TYPE public.gender ADD VALUE IF NOT EXISTS 'child';

-- Add guardian columns to patients
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS guardian_relation TEXT;

-- Add procedure columns to admissions
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS primary_procedure_id UUID REFERENCES public.service_types(id);
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS procedure_charges NUMERIC DEFAULT 0;

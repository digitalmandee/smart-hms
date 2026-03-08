
-- Phase 1: Expand medical_code_type enum
ALTER TYPE public.medical_code_type ADD VALUE IF NOT EXISTS 'achi';
ALTER TYPE public.medical_code_type ADD VALUE IF NOT EXISTS 'sbs';
ALTER TYPE public.medical_code_type ADD VALUE IF NOT EXISTS 'snomed';
ALTER TYPE public.medical_code_type ADD VALUE IF NOT EXISTS 'loinc';

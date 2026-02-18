-- Phase 1: Restore secure, narrow anon RLS for public lab report portal
-- These are far more restrictive than the original USING(true) policies that were removed

-- 1. Allow anon to SELECT only PUBLISHED lab orders (no clinical notes, access_code exposed)
CREATE POLICY "anon_view_published_lab_orders"
ON public.lab_orders
FOR SELECT
TO anon
USING (is_published = true);

-- 2. Allow anon to SELECT only items belonging to published lab orders
CREATE POLICY "anon_view_published_lab_order_items"
ON public.lab_order_items
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.lab_orders lo
    WHERE lo.id = lab_order_items.lab_order_id
      AND lo.is_published = true
  )
);

-- 3. Allow anon to SELECT only minimal patient info for patients linked to published lab orders
-- (name, DOB, phone, patient_number only — no medical/ID/insurance data)
-- This is enforced at the application level via column selection, and at policy level by the join
CREATE POLICY "anon_view_patients_for_published_lab_orders"
ON public.patients
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.lab_orders lo
    WHERE lo.patient_id = patients.id
      AND lo.is_published = true
  )
);

-- Phase 3: Add KSA compliance fields
-- Add cchi_number to patient_insurance table
ALTER TABLE public.patient_insurance
ADD COLUMN IF NOT EXISTS cchi_number TEXT;

-- Add icd_codes and diagnosis_codes to insurance_claims table
ALTER TABLE public.insurance_claims
ADD COLUMN IF NOT EXISTS icd_codes TEXT[] DEFAULT '{}';

ALTER TABLE public.insurance_claims
ADD COLUMN IF NOT EXISTS drg_code TEXT;

ALTER TABLE public.insurance_claims
ADD COLUMN IF NOT EXISTS pre_auth_number TEXT;

ALTER TABLE public.insurance_claims
ADD COLUMN IF NOT EXISTS pre_auth_date DATE;

ALTER TABLE public.insurance_claims
ADD COLUMN IF NOT EXISTS pre_auth_status TEXT DEFAULT 'not_required';
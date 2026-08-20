ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_facility_type_check;
ALTER TABLE public.organizations ADD CONSTRAINT organizations_facility_type_check
  CHECK (facility_type = ANY (ARRAY['hospital'::text, 'clinic'::text, 'diagnostic_center'::text, 'pharmacy'::text, 'warehouse'::text, 'thalassemia_center'::text]));
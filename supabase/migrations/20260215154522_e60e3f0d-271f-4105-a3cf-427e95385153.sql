
-- Fix 1: Enable RLS on radiology_device_catalog and lab_analyzer_catalog
-- These are global reference catalogs, so SELECT is allowed for all authenticated users
-- but modifications should be restricted to super admins

ALTER TABLE public.radiology_device_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view radiology device catalog"
  ON public.radiology_device_catalog FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super admins can manage radiology device catalog"
  ON public.radiology_device_catalog FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

ALTER TABLE public.lab_analyzer_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lab analyzer catalog"
  ON public.lab_analyzer_catalog FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super admins can manage lab analyzer catalog"
  ON public.lab_analyzer_catalog FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Fix 2: Make patient-photos bucket private and restrict storage policies to org scope

UPDATE storage.buckets SET public = false WHERE id = 'patient-photos';

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload patient photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update patient photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete patient photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view patient photos" ON storage.objects;

-- Create org-scoped policies
CREATE POLICY "Users can view photos for their org patients"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'patient-photos' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.patients WHERE organization_id = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can upload photos for their org patients"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'patient-photos' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.patients WHERE organization_id = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can update photos for their org patients"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'patient-photos' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.patients WHERE organization_id = public.get_user_organization_id()
    )
  );

CREATE POLICY "Users can delete photos for their org patients"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'patient-photos' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.patients WHERE organization_id = public.get_user_organization_id()
    )
  );

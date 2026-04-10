
-- ============================================
-- Finding 1: Radiology-images org-scoping
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view radiology images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update radiology images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete radiology images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload radiology images" ON storage.objects;

CREATE POLICY "Org members can view radiology images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

CREATE POLICY "Org members can upload radiology images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

CREATE POLICY "Org members can update radiology images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

CREATE POLICY "Org members can delete radiology images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'radiology-images' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

-- ============================================
-- Finding 2: Vendor-documents org-scoping
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read vendor documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete vendor documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vendor documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update vendor documents" ON storage.objects;

CREATE POLICY "Org members can read vendor documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vendor-documents' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

CREATE POLICY "Org members can upload vendor documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vendor-documents' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

CREATE POLICY "Org members can update vendor documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'vendor-documents' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

CREATE POLICY "Org members can delete vendor documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vendor-documents' AND (storage.foldername(name))[1] = public.get_user_organization_id()::text);

-- ============================================
-- Finding 3: Kiosk password hash exposure
-- ============================================
DROP POLICY IF EXISTS "Public can view active kiosks" ON public.kiosk_configs;

CREATE OR REPLACE FUNCTION public.get_active_kiosk_by_username(p_username text)
RETURNS TABLE(id uuid, kiosk_name text, organization_id uuid, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT k.id, k.name::text, k.organization_id, k.is_active
  FROM kiosk_configs k
  WHERE k.kiosk_username = p_username AND k.is_active = true
  LIMIT 1;
$$;

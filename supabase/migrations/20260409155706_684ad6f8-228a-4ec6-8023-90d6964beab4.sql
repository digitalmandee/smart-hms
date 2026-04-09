
-- ============================================================
-- HIPAA PHASE 1: STOP ACTIVE PHI DATA LEAKS
-- ============================================================

-- ============ 1. MAKE STORAGE BUCKETS PRIVATE ============

-- Make dental-images private
UPDATE storage.buckets SET public = false WHERE id = 'dental-images';

-- Make claim-attachments private
UPDATE storage.buckets SET public = false WHERE id = 'claim-attachments';

-- Drop overly permissive storage policies for dental-images
DROP POLICY IF EXISTS "Authenticated users can upload dental images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view dental images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete dental images" ON storage.objects;
DROP POLICY IF EXISTS "Dental images are publicly accessible" ON storage.objects;

-- Drop overly permissive storage policies for claim-attachments
DROP POLICY IF EXISTS "Authenticated users can upload claim attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view claim attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete claim attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view claim attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage claim attachment files" ON storage.objects;

-- Create org-scoped storage policies for dental-images
CREATE POLICY "Org members can view dental images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dental-images'
  AND (storage.foldername(name))[1] IN (
    SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Org members can upload dental images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dental-images'
  AND (storage.foldername(name))[1] IN (
    SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Org members can delete dental images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dental-images'
  AND (storage.foldername(name))[1] IN (
    SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
);

-- Create org-scoped storage policies for claim-attachments
CREATE POLICY "Org members can view claim attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'claim-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Org members can upload claim attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'claim-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Org members can delete claim attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'claim-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT p.organization_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
);

-- ============ 2. DROP ANONYMOUS LAB RESULT POLICIES ============

DROP POLICY IF EXISTS "anon_view_published_lab_orders" ON public.lab_orders;
DROP POLICY IF EXISTS "anon_view_published_lab_order_items" ON public.lab_order_items;

-- ============ 3. FIX CROSS-TENANT RLS (USING(true) → org-scoped) ============

-- Helper function to get user's org
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- 3a. assets
DROP POLICY IF EXISTS "Users can manage assets" ON public.assets;

CREATE POLICY "Org members can view assets"
ON public.assets FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can insert assets"
ON public.assets FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can update assets"
ON public.assets FOR UPDATE
TO authenticated
USING (organization_id = public.get_user_organization_id())
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can delete assets"
ON public.assets FOR DELETE
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- 3b. maintenance_records
DROP POLICY IF EXISTS "Users can manage maintenance records" ON public.maintenance_records;

CREATE POLICY "Org members can view maintenance records"
ON public.maintenance_records FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can insert maintenance records"
ON public.maintenance_records FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can update maintenance records"
ON public.maintenance_records FOR UPDATE
TO authenticated
USING (organization_id = public.get_user_organization_id())
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can delete maintenance records"
ON public.maintenance_records FOR DELETE
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- 3c. housekeeping_tasks
DROP POLICY IF EXISTS "Users can manage housekeeping tasks" ON public.housekeeping_tasks;

CREATE POLICY "Org members can view housekeeping tasks"
ON public.housekeeping_tasks FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can insert housekeeping tasks"
ON public.housekeeping_tasks FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can update housekeeping tasks"
ON public.housekeeping_tasks FOR UPDATE
TO authenticated
USING (organization_id = public.get_user_organization_id())
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can delete housekeeping tasks"
ON public.housekeeping_tasks FOR DELETE
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- 3d. housekeeping_inspections
DROP POLICY IF EXISTS "Users can manage housekeeping inspections" ON public.housekeeping_inspections;

CREATE POLICY "Org members can view housekeeping inspections"
ON public.housekeeping_inspections FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can insert housekeeping inspections"
ON public.housekeeping_inspections FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can update housekeeping inspections"
ON public.housekeeping_inspections FOR UPDATE
TO authenticated
USING (organization_id = public.get_user_organization_id())
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can delete housekeeping inspections"
ON public.housekeeping_inspections FOR DELETE
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- 3e. claim_attachments (join through insurance_claims for org check)
DROP POLICY IF EXISTS "Users can manage claim attachments" ON public.claim_attachments;

CREATE POLICY "Org members can view claim attachments"
ON public.claim_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.insurance_claims ic
    WHERE ic.id = claim_attachments.claim_id
    AND ic.organization_id = public.get_user_organization_id()
  )
);

CREATE POLICY "Org members can insert claim attachments"
ON public.claim_attachments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.insurance_claims ic
    WHERE ic.id = claim_attachments.claim_id
    AND ic.organization_id = public.get_user_organization_id()
  )
);

CREATE POLICY "Org members can update claim attachments"
ON public.claim_attachments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.insurance_claims ic
    WHERE ic.id = claim_attachments.claim_id
    AND ic.organization_id = public.get_user_organization_id()
  )
);

CREATE POLICY "Org members can delete claim attachments"
ON public.claim_attachments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.insurance_claims ic
    WHERE ic.id = claim_attachments.claim_id
    AND ic.organization_id = public.get_user_organization_id()
  )
);

-- ============ 4. KIOSK SECURITY ============

-- Drop anonymous kiosk_configs policy
DROP POLICY IF EXISTS "Kiosk configs are viewable by everyone" ON public.kiosk_configs;
DROP POLICY IF EXISTS "Anyone can view kiosk configs" ON public.kiosk_configs;
DROP POLICY IF EXISTS "Public can view active kiosk configs" ON public.kiosk_configs;

-- Create authenticated-only kiosk_configs access
CREATE POLICY "Org members can view kiosk configs"
ON public.kiosk_configs FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Drop public kiosk_sessions policies
DROP POLICY IF EXISTS "Kiosk sessions can be read with valid token" ON public.kiosk_sessions;
DROP POLICY IF EXISTS "Kiosk sessions can be updated with valid token" ON public.kiosk_sessions;
DROP POLICY IF EXISTS "Kiosk sessions can be created by anyone" ON public.kiosk_sessions;

-- Create org-scoped kiosk_sessions policies
CREATE POLICY "Org members can view kiosk sessions"
ON public.kiosk_sessions FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can insert kiosk sessions"
ON public.kiosk_sessions FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Org members can update kiosk sessions"
ON public.kiosk_sessions FOR UPDATE
TO authenticated
USING (organization_id = public.get_user_organization_id());

-- Drop public kiosk_token_logs insert policy
DROP POLICY IF EXISTS "Token logs can be inserted by anyone (for kiosk use)" ON public.kiosk_token_logs;

CREATE POLICY "Org members can insert kiosk token logs"
ON public.kiosk_token_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kiosk_sessions ks
    WHERE ks.id = kiosk_token_logs.session_id
    AND ks.organization_id = public.get_user_organization_id()
  )
);

-- ============ 5. ORGANIZATION DATA — RESTRICT ANON ACCESS ============

DROP POLICY IF EXISTS "anon_read_org_for_campaigns" ON public.organizations;

-- Only expose name and logo for public campaigns (using a security definer view instead)
-- For now, remove anon access entirely — campaigns can use an edge function
-- Authenticated users still have their existing org-scoped policies

-- ============ 6. NOTIFICATION LOGS — RESTRICT ANON INSERT ============

DROP POLICY IF EXISTS "System can insert notification logs" ON public.notification_logs;

CREATE POLICY "Authenticated users can insert notification logs"
ON public.notification_logs FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.get_user_organization_id());

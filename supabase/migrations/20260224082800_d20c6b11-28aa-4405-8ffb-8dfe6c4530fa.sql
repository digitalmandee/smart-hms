
-- Phase 1a: Create a security-definer function for anon patient access (limited to id, first_name, last_name)
CREATE OR REPLACE FUNCTION public.get_patient_for_published_lab_order(p_patient_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.first_name, p.last_name
  FROM public.patients p
  WHERE p.id = p_patient_id
    AND EXISTS (
      SELECT 1 FROM public.lab_orders lo
      WHERE lo.patient_id = p.id AND lo.is_published = true
    );
$$;

-- Drop the overly permissive anon policy on patients
DROP POLICY IF EXISTS "anon_view_patients_for_published_lab_orders" ON public.patients;

-- Phase 1c: Fix kiosk_sessions UPDATE policy - scope to organization
DROP POLICY IF EXISTS "Kiosk sessions can be updated" ON public.kiosk_sessions;
CREATE POLICY "Kiosk sessions can be updated by org members"
  ON public.kiosk_sessions
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
    OR
    -- Allow session token-based updates (for kiosk auth flow via security definer functions)
    EXISTS (
      SELECT 1 FROM public.kiosk_configs kc
      WHERE kc.id = kiosk_sessions.kiosk_id AND kc.is_active = true
    )
  );

-- Phase 1c: Fix kiosk_token_logs INSERT policy - scope to organization
DROP POLICY IF EXISTS "Kiosk token logs can be inserted" ON public.kiosk_token_logs;
CREATE POLICY "Kiosk token logs can be inserted by org members"
  ON public.kiosk_token_logs
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Phase 1c: Fix notification_logs INSERT policy - scope to organization
DROP POLICY IF EXISTS "Anyone can insert notification logs" ON public.notification_logs;
CREATE POLICY "Org members can insert notification logs"
  ON public.notification_logs
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Phase 1d: Fix mutable search_path on update_item_vendor_mapping_timestamp
CREATE OR REPLACE FUNCTION public.update_item_vendor_mapping_timestamp()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

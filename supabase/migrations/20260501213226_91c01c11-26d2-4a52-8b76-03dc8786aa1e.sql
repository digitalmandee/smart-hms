CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  is_required boolean NOT NULL DEFAULT false,
  enrolled_at timestamptz,
  last_verified_at timestamptz,
  required_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  required_at timestamptz,
  grace_period_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_org ON public.user_mfa_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_required ON public.user_mfa_settings(is_required) WHERE is_required = true;

CREATE TABLE IF NOT EXISTS public.user_mfa_recovery_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_mfa_recovery_codes_unique UNIQUE (user_id, code_hash)
);

CREATE INDEX IF NOT EXISTS idx_user_mfa_recovery_codes_user ON public.user_mfa_recovery_codes(user_id);

CREATE TRIGGER trg_user_mfa_settings_updated_at
BEFORE UPDATE ON public.user_mfa_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_admin_for(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      _org_id IS NOT NULL
      AND (
        public.has_role(auth.uid(), 'org_admin'::app_role)
        OR public.has_role(auth.uid(), 'branch_admin'::app_role)
      )
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.organization_id = _org_id
      )
    )
$$;

CREATE POLICY "users read own mfa settings"
ON public.user_mfa_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_org_admin_for(organization_id));

CREATE POLICY "admins insert mfa settings"
ON public.user_mfa_settings FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin_for(organization_id));

CREATE POLICY "admins update mfa settings"
ON public.user_mfa_settings FOR UPDATE
TO authenticated
USING (public.is_org_admin_for(organization_id))
WITH CHECK (public.is_org_admin_for(organization_id));

CREATE POLICY "users self update enrollment"
ON public.user_mfa_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users see own recovery codes"
ON public.user_mfa_recovery_codes FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_mfa_settings s
    WHERE s.user_id = user_mfa_recovery_codes.user_id
      AND public.is_org_admin_for(s.organization_id)
  )
);

REVOKE SELECT (code_hash) ON public.user_mfa_recovery_codes FROM authenticated, anon;
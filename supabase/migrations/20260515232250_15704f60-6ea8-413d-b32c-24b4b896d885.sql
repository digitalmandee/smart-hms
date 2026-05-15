CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  provider public.payment_gateway_provider NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  mode text NOT NULL DEFAULT 'test' CHECK (mode IN ('test','live')),
  public_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pgs_org_provider
  ON public.payment_gateway_settings (organization_id, provider);

ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pgs_select_same_org" ON public.payment_gateway_settings;
CREATE POLICY "pgs_select_same_org"
ON public.payment_gateway_settings
FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization_id());

DROP POLICY IF EXISTS "pgs_admin_write" ON public.payment_gateway_settings;
CREATE POLICY "pgs_admin_write"
ON public.payment_gateway_settings
FOR ALL
TO authenticated
USING (
  organization_id = public.get_user_organization_id()
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'org_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'branch_admin'::public.app_role)
  )
)
WITH CHECK (
  organization_id = public.get_user_organization_id()
  AND (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'org_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'branch_admin'::public.app_role)
  )
);

CREATE TRIGGER trg_pgs_updated_at
BEFORE UPDATE ON public.payment_gateway_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
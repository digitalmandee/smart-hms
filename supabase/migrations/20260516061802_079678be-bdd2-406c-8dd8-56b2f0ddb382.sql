ALTER TABLE public.fhir_resource_cache
  ADD COLUMN IF NOT EXISTS patient_id uuid,
  ADD COLUMN IF NOT EXISTS source_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_fhir_resource_cache_patient
  ON public.fhir_resource_cache (patient_id);

CREATE TABLE IF NOT EXISTS public.fhir_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  client_id text NOT NULL UNIQUE,
  client_secret_hash text NOT NULL,
  display_name text NOT NULL,
  scopes text NOT NULL DEFAULT 'system/*.read',
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fhir_clients_org ON public.fhir_clients (organization_id);
ALTER TABLE public.fhir_clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fhir_clients' AND policyname='fhir_clients_admin_select') THEN
    CREATE POLICY "fhir_clients_admin_select" ON public.fhir_clients
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'super_admin'::app_role)
        OR (public.has_role(auth.uid(), 'org_admin'::app_role)
            AND organization_id = public.get_user_organization_id())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fhir_clients' AND policyname='fhir_clients_admin_insert') THEN
    CREATE POLICY "fhir_clients_admin_insert" ON public.fhir_clients
      FOR INSERT TO authenticated
      WITH CHECK (
        public.has_role(auth.uid(), 'super_admin'::app_role)
        OR (public.has_role(auth.uid(), 'org_admin'::app_role)
            AND organization_id = public.get_user_organization_id())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fhir_clients' AND policyname='fhir_clients_admin_update') THEN
    CREATE POLICY "fhir_clients_admin_update" ON public.fhir_clients
      FOR UPDATE TO authenticated
      USING (
        public.has_role(auth.uid(), 'super_admin'::app_role)
        OR (public.has_role(auth.uid(), 'org_admin'::app_role)
            AND organization_id = public.get_user_organization_id())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fhir_clients' AND policyname='fhir_clients_admin_delete') THEN
    CREATE POLICY "fhir_clients_admin_delete" ON public.fhir_clients
      FOR DELETE TO authenticated
      USING (
        public.has_role(auth.uid(), 'super_admin'::app_role)
        OR (public.has_role(auth.uid(), 'org_admin'::app_role)
            AND organization_id = public.get_user_organization_id())
      );
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_fhir_clients_updated_at ON public.fhir_clients;
CREATE TRIGGER trg_fhir_clients_updated_at
  BEFORE UPDATE ON public.fhir_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
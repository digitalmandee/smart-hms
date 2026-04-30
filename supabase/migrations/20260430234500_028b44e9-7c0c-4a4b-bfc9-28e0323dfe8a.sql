
-- =========================================================================
-- Phase 2 — Self-hosted error monitoring tables
-- =========================================================================

CREATE TABLE public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id uuid,
  user_id uuid,
  user_role text,
  route text,
  message text NOT NULL,
  stack_hash text,            -- SHA-256 of normalized stack, for grouping
  stack_excerpt text,         -- top 500 chars only, no PII
  user_agent text,
  url text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);
CREATE INDEX idx_client_errors_org_time ON public.client_errors(organization_id, occurred_at DESC);
CREATE INDEX idx_client_errors_hash ON public.client_errors(stack_hash);

ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

-- Anyone signed in can write their own error
CREATE POLICY client_errors_insert_authed
  ON public.client_errors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can view errors in their org
CREATE POLICY client_errors_select_admin
  ON public.client_errors FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_organization_id()
      AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'branch_admin'))
    )
  );

CREATE POLICY client_errors_update_admin
  ON public.client_errors FOR UPDATE TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_organization_id()
      AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'branch_admin'))
    )
  );

-- ---------- Edge function errors -----------------------------------------

CREATE TABLE public.edge_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  integration text,           -- e.g. 'nphies', 'zatca', 'wasfaty'
  organization_id uuid,
  branch_id uuid,
  user_id uuid,
  status_code int,
  message text NOT NULL,
  stack_excerpt text,
  request_path text,
  request_method text,
  context jsonb,              -- arbitrary structured context, no PII
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_edge_errors_func_time ON public.edge_errors(function_name, occurred_at DESC);
CREATE INDEX idx_edge_errors_integration_time ON public.edge_errors(integration, occurred_at DESC);
CREATE INDEX idx_edge_errors_org_time ON public.edge_errors(organization_id, occurred_at DESC);

ALTER TABLE public.edge_errors ENABLE ROW LEVEL SECURITY;

-- Edge functions write via service role (bypasses RLS). No insert policy needed for users.
CREATE POLICY edge_errors_select_admin
  ON public.edge_errors FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR (
      organization_id = public.get_user_organization_id()
      AND (public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'branch_admin'))
    )
  );

-- =========================================================================
-- Phase 3 — Gateway reliability infrastructure
-- =========================================================================

CREATE TABLE public.gateway_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway text NOT NULL,            -- 'nphies' | 'zatca' | 'wasfaty' | 'tatmeen' | 'nafath' | 'sehhaty' | 'hesn'
  request_hash text NOT NULL,       -- SHA-256 of (org_id + endpoint + canonical body)
  organization_id uuid,
  response_status int,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  CONSTRAINT gateway_idempotency_unique UNIQUE (gateway, request_hash)
);
CREATE INDEX idx_gateway_idempotency_expiry ON public.gateway_idempotency(expires_at);

ALTER TABLE public.gateway_idempotency ENABLE ROW LEVEL SECURITY;
-- Edge functions only (service role bypasses). No user policy needed.

CREATE TABLE public.gateway_circuit_state (
  gateway text PRIMARY KEY,
  organization_id uuid,
  state text NOT NULL DEFAULT 'closed' CHECK (state IN ('closed', 'open', 'half_open')),
  consecutive_failures int NOT NULL DEFAULT 0,
  last_failure_at timestamptz,
  opened_at timestamptz,
  next_retry_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gateway_circuit_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_circuit_select_authed
  ON public.gateway_circuit_state FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- =========================================================================
-- Phase 5 — Clinical safety
-- =========================================================================

CREATE TABLE public.drug_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_a text NOT NULL,             -- generic name, lower-case
  drug_b text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('contraindicated','major','moderate','minor')),
  description text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT drug_interactions_unique UNIQUE (drug_a, drug_b)
);
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY drug_interactions_read ON public.drug_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY drug_interactions_admin_write ON public.drug_interactions FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE TABLE public.medicine_safety_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  generic_name text NOT NULL,
  allergy_class text,                -- e.g. 'penicillin', 'sulfa', 'nsaid'
  max_daily_dose_mg numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_med_safety_org_generic ON public.medicine_safety_limits(organization_id, generic_name);
ALTER TABLE public.medicine_safety_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY med_safety_read ON public.medicine_safety_limits FOR SELECT TO authenticated
  USING (organization_id IS NULL OR organization_id = public.get_user_organization_id());
CREATE POLICY med_safety_admin_write ON public.medicine_safety_limits FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'org_admin'))
  WITH CHECK (public.is_super_admin() OR public.has_role(auth.uid(), 'org_admin'));

CREATE TABLE public.lab_critical_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  test_name text NOT NULL,           -- canonical; matched case-insensitively
  unit text,
  low_critical numeric,
  high_critical numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lab_critical_org_test ON public.lab_critical_values(organization_id, lower(test_name));
ALTER TABLE public.lab_critical_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY lab_crit_read ON public.lab_critical_values FOR SELECT TO authenticated
  USING (organization_id IS NULL OR organization_id = public.get_user_organization_id());
CREATE POLICY lab_crit_admin_write ON public.lab_critical_values FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'org_admin'))
  WITH CHECK (public.is_super_admin() OR public.has_role(auth.uid(), 'org_admin'));

CREATE TABLE public.clinical_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid,
  alert_type text NOT NULL CHECK (alert_type IN ('allergy_override','critical_lab','drug_interaction','dose_ceiling')),
  severity text NOT NULL CHECK (severity IN ('info','warning','critical')),
  message text NOT NULL,
  context jsonb,
  source_table text,
  source_id uuid,
  assigned_to uuid,                  -- doctor / nurse user_id
  created_by uuid,
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  acknowledged_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_clinical_alerts_patient_open ON public.clinical_alerts(patient_id) WHERE acknowledged_at IS NULL;
CREATE INDEX idx_clinical_alerts_assigned_open ON public.clinical_alerts(assigned_to) WHERE acknowledged_at IS NULL;

ALTER TABLE public.clinical_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY clinical_alerts_read ON public.clinical_alerts FOR SELECT TO authenticated
  USING (organization_id = public.get_user_organization_id());
CREATE POLICY clinical_alerts_insert ON public.clinical_alerts FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());
CREATE POLICY clinical_alerts_update ON public.clinical_alerts FOR UPDATE TO authenticated
  USING (organization_id = public.get_user_organization_id());

-- =========================================================================
-- Periodic cleanup of expired idempotency keys
-- =========================================================================
CREATE OR REPLACE FUNCTION public.cleanup_gateway_idempotency()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.gateway_idempotency WHERE expires_at < now();
$$;
REVOKE ALL ON FUNCTION public.cleanup_gateway_idempotency() FROM PUBLIC, anon, authenticated;


-- =========================================================================
-- WAVE 1 — Mobile Health & Outreach (KSA-compliant) — Foundational Schema
-- =========================================================================

DO $$ BEGIN CREATE TYPE public.mobile_unit_status AS ENUM ('active','inactive','maintenance','retired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.mobile_route_status AS ENUM ('planned','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.telemed_session_status AS ENUM ('scheduled','waiting','in_progress','completed','cancelled','no_show'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.home_visit_status AS ENUM ('scheduled','en_route','arrived','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.immunization_status AS ENUM ('due','given','missed','contraindicated','refused'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_gateway_provider AS ENUM ('mada','stcpay','hyperpay','tap','manual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_gateway_status AS ENUM ('initiated','pending','succeeded','failed','refunded','partial_refund','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.sync_outbox_status AS ENUM ('pending','processing','applied','conflict','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mobile_unit_crew'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'home_health_nurse'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'telemed_doctor'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'patient'; EXCEPTION WHEN others THEN NULL; END $$;

-- ---------- Clinic on Wheels ----------
CREATE TABLE public.mobile_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, branch_id uuid,
  unit_code text NOT NULL, unit_name text NOT NULL, vehicle_plate text,
  capacity integer DEFAULT 30,
  capabilities text[] DEFAULT ARRAY['opd','vaccination']::text[],
  status mobile_unit_status NOT NULL DEFAULT 'active',
  home_branch_id uuid, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, unit_code)
);
CREATE TABLE public.mobile_unit_crew (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_unit_id uuid NOT NULL REFERENCES public.mobile_units(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, role_on_unit text NOT NULL, is_lead boolean NOT NULL DEFAULT false,
  assigned_from date NOT NULL DEFAULT current_date, assigned_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.mobile_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  mobile_unit_id uuid NOT NULL REFERENCES public.mobile_units(id) ON DELETE CASCADE,
  route_code text NOT NULL, route_date date NOT NULL,
  status mobile_route_status NOT NULL DEFAULT 'planned',
  start_time timestamptz, end_time timestamptz,
  total_stops integer DEFAULT 0, total_visits integer DEFAULT 0,
  total_revenue numeric(14,2) DEFAULT 0,
  notes text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, route_code)
);
CREATE TABLE public.mobile_route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.mobile_routes(id) ON DELETE CASCADE,
  sequence integer NOT NULL, location_name text NOT NULL, address text,
  latitude numeric(10,7), longitude numeric(10,7),
  scheduled_at timestamptz, arrived_at timestamptz, departed_at timestamptz,
  visits_count integer DEFAULT 0, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.mobile_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  route_id uuid NOT NULL REFERENCES public.mobile_routes(id) ON DELETE CASCADE,
  stop_id uuid REFERENCES public.mobile_route_stops(id) ON DELETE SET NULL,
  patient_id uuid, visit_number text, chief_complaint text, vitals jsonb,
  diagnosis text, prescription_id uuid, invoice_id uuid,
  amount_collected numeric(12,2) DEFAULT 0, payment_method text,
  client_uuid uuid UNIQUE, synced_at timestamptz, created_offline boolean NOT NULL DEFAULT false,
  created_by uuid, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mobile_visits_org ON public.mobile_visits(organization_id);
CREATE INDEX idx_mobile_visits_route ON public.mobile_visits(route_id);
CREATE INDEX idx_mobile_routes_date ON public.mobile_routes(organization_id, route_date);

-- ---------- Telemedicine ----------
CREATE TABLE public.telemedicine_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, branch_id uuid,
  patient_id uuid NOT NULL, doctor_id uuid NOT NULL, appointment_id uuid,
  scheduled_at timestamptz NOT NULL, started_at timestamptz, ended_at timestamptz,
  duration_seconds integer,
  status telemed_session_status NOT NULL DEFAULT 'scheduled',
  room_name text NOT NULL, room_provider text NOT NULL DEFAULT 'livekit',
  invoice_id uuid, amount numeric(12,2),
  recording_enabled boolean NOT NULL DEFAULT false, recording_url text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.telemedicine_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.telemedicine_sessions(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL, consent_type text NOT NULL, granted boolean NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(), ip_address inet, user_agent text
);
CREATE INDEX idx_telemed_org ON public.telemedicine_sessions(organization_id);
CREATE INDEX idx_telemed_patient ON public.telemedicine_sessions(patient_id);
CREATE INDEX idx_telemed_doctor ON public.telemedicine_sessions(doctor_id);

-- ---------- Home Healthcare ----------
CREATE TABLE public.care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, patient_id uuid NOT NULL,
  plan_code text NOT NULL, title text NOT NULL,
  start_date date NOT NULL, end_date date, frequency text,
  status text NOT NULL DEFAULT 'active', created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, plan_code)
);
CREATE TABLE public.care_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES public.care_plans(id) ON DELETE CASCADE,
  task_type text NOT NULL, description text, scheduled_dates date[],
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.home_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, patient_id uuid NOT NULL,
  care_plan_id uuid REFERENCES public.care_plans(id) ON DELETE SET NULL,
  visit_number text NOT NULL, scheduled_at timestamptz NOT NULL,
  nurse_id uuid, status home_visit_status NOT NULL DEFAULT 'scheduled',
  checkin_at timestamptz, checkin_lat numeric(10,7), checkin_lng numeric(10,7),
  checkout_at timestamptz, checkout_lat numeric(10,7), checkout_lng numeric(10,7),
  vitals jsonb, notes text, invoice_id uuid, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, visit_number)
);
CREATE TABLE public.home_visit_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_visit_id uuid NOT NULL REFERENCES public.home_visits(id) ON DELETE CASCADE,
  task_type text NOT NULL, description text,
  completed boolean NOT NULL DEFAULT false, completed_at timestamptz, result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_home_visits_org ON public.home_visits(organization_id);
CREATE INDEX idx_home_visits_nurse ON public.home_visits(nurse_id);

-- ---------- Vaccination Registry ----------
CREATE TABLE public.immunization_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid, region_code text NOT NULL DEFAULT 'KSA',
  vaccine_code text NOT NULL, vaccine_name text NOT NULL,
  dose_number integer NOT NULL,
  age_months_min integer NOT NULL, age_months_max integer,
  is_mandatory boolean NOT NULL DEFAULT true, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (region_code, vaccine_code, dose_number)
);
CREATE TABLE public.vaccine_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, vaccine_code text NOT NULL,
  lot_number text NOT NULL, manufacturer text, expiry_date date NOT NULL,
  quantity_received integer NOT NULL DEFAULT 0,
  quantity_remaining integer NOT NULL DEFAULT 0,
  cold_chain_ok boolean NOT NULL DEFAULT true, recalled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, vaccine_code, lot_number)
);
CREATE TABLE public.cold_chain_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  vaccine_lot_id uuid REFERENCES public.vaccine_lots(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  temperature_c numeric(5,2) NOT NULL, in_range boolean NOT NULL,
  recorded_by uuid, notes text
);
CREATE TABLE public.immunizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, patient_id uuid NOT NULL,
  vaccine_code text NOT NULL, dose_number integer NOT NULL,
  status immunization_status NOT NULL DEFAULT 'due',
  due_date date, given_date date, given_by uuid,
  vaccine_lot_id uuid REFERENCES public.vaccine_lots(id) ON DELETE SET NULL,
  site text, route text, reaction_notes text, certificate_url text,
  mobile_visit_id uuid REFERENCES public.mobile_visits(id) ON DELETE SET NULL,
  home_visit_id uuid REFERENCES public.home_visits(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_immunizations_patient ON public.immunizations(patient_id);
CREATE INDEX idx_immunizations_org_status ON public.immunizations(organization_id, status);

-- ---------- Patient Portal ----------
CREATE TABLE public.patient_portal_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL UNIQUE, user_id uuid NOT NULL UNIQUE,
  nafath_verified boolean NOT NULL DEFAULT false,
  nafath_verified_at timestamptz,
  preferred_language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.patient_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL, user_id uuid NOT NULL,
  device_type text NOT NULL, device_token text NOT NULL,
  device_name text, last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_token)
);

-- ---------- Payment Gateway ----------
CREATE TABLE public.payment_gateway_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, branch_id uuid,
  patient_id uuid, invoice_id uuid,
  provider payment_gateway_provider NOT NULL,
  status payment_gateway_status NOT NULL DEFAULT 'initiated',
  amount numeric(12,2) NOT NULL, currency text NOT NULL DEFAULT 'SAR',
  provider_ref text, checkout_url text, raw_response jsonb,
  initiated_by uuid, initiated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz, failure_reason text,
  UNIQUE (provider, provider_ref)
);
CREATE TABLE public.payment_gateway_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.payment_gateway_transactions(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL, reason text, provider_ref text,
  status payment_gateway_status NOT NULL DEFAULT 'initiated',
  created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
);
CREATE INDEX idx_pg_tx_invoice ON public.payment_gateway_transactions(invoice_id);
CREATE INDEX idx_pg_tx_org_status ON public.payment_gateway_transactions(organization_id, status);

-- ---------- FHIR ----------
CREATE TABLE public.fhir_resource_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  resource_type text NOT NULL, resource_id text NOT NULL, version_id text,
  last_updated timestamptz NOT NULL DEFAULT now(), resource jsonb NOT NULL,
  UNIQUE (organization_id, resource_type, resource_id)
);
CREATE TABLE public.fhir_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, resource_type text NOT NULL,
  criteria text NOT NULL, endpoint_url text NOT NULL,
  active boolean NOT NULL DEFAULT true, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fhir_cache_lookup ON public.fhir_resource_cache(organization_id, resource_type, resource_id);

-- ---------- Offline Sync ----------
CREATE TABLE public.sync_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, client_uuid uuid NOT NULL UNIQUE,
  device_id text NOT NULL, user_id uuid NOT NULL,
  entity_type text NOT NULL, operation text NOT NULL, payload jsonb NOT NULL,
  client_created_at timestamptz NOT NULL,
  status sync_outbox_status NOT NULL DEFAULT 'pending',
  applied_at timestamptz, applied_record_id uuid,
  error_message text, retries integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.sync_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbox_id uuid NOT NULL REFERENCES public.sync_outbox(id) ON DELETE CASCADE,
  conflict_type text NOT NULL, server_record jsonb, client_record jsonb,
  resolved boolean NOT NULL DEFAULT false, resolved_by uuid, resolved_at timestamptz,
  resolution text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sync_outbox_status ON public.sync_outbox(organization_id, status);

-- ---------- updated_at triggers ----------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $f$
BEGIN NEW.updated_at = now(); RETURN NEW; END $f$;

CREATE TRIGGER trg_mobile_units_updated BEFORE UPDATE ON public.mobile_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mobile_routes_updated BEFORE UPDATE ON public.mobile_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_telemed_sessions_updated BEFORE UPDATE ON public.telemedicine_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_care_plans_updated BEFORE UPDATE ON public.care_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_home_visits_updated BEFORE UPDATE ON public.home_visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_immunizations_updated BEFORE UPDATE ON public.immunizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_accounts_updated BEFORE UPDATE ON public.patient_portal_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Helpers (security definer) ----------
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(),'super_admin')
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.organization_id = _org_id);
$$;

CREATE OR REPLACE FUNCTION public.user_owns_patient(_patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.patient_portal_accounts ppa WHERE ppa.patient_id = _patient_id AND ppa.user_id = auth.uid());
$$;

-- ---------- Enable RLS ----------
ALTER TABLE public.mobile_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_unit_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_visit_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunization_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_chain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_portal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fhir_resource_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fhir_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_conflicts ENABLE ROW LEVEL SECURITY;

-- ---------- Org-scoped RLS via DO loop ----------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'mobile_units','mobile_routes','mobile_visits','telemedicine_sessions',
    'care_plans','home_visits','vaccine_lots','cold_chain_logs','immunizations',
    'payment_gateway_transactions','fhir_resource_cache','fhir_subscriptions','sync_outbox'
  ] LOOP
    EXECUTE format($p$CREATE POLICY "org_select_%I" ON public.%I FOR SELECT TO authenticated USING (public.user_belongs_to_org(organization_id));$p$, t,t);
    EXECUTE format($p$CREATE POLICY "org_insert_%I" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(organization_id));$p$, t,t);
    EXECUTE format($p$CREATE POLICY "org_update_%I" ON public.%I FOR UPDATE TO authenticated USING (public.user_belongs_to_org(organization_id)) WITH CHECK (public.user_belongs_to_org(organization_id));$p$, t,t);
    EXECUTE format($p$CREATE POLICY "org_delete_%I" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'));$p$, t,t);
  END LOOP;
END $$;

-- ---------- Child-table RLS (inherit via parent) ----------
CREATE POLICY "crew_sel" ON public.mobile_unit_crew FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mobile_units mu WHERE mu.id = mobile_unit_id AND public.user_belongs_to_org(mu.organization_id)));
CREATE POLICY "crew_all" ON public.mobile_unit_crew FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mobile_units mu WHERE mu.id = mobile_unit_id AND public.user_belongs_to_org(mu.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mobile_units mu WHERE mu.id = mobile_unit_id AND public.user_belongs_to_org(mu.organization_id)));

CREATE POLICY "stops_sel" ON public.mobile_route_stops FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mobile_routes r WHERE r.id = route_id AND public.user_belongs_to_org(r.organization_id)));
CREATE POLICY "stops_all" ON public.mobile_route_stops FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mobile_routes r WHERE r.id = route_id AND public.user_belongs_to_org(r.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mobile_routes r WHERE r.id = route_id AND public.user_belongs_to_org(r.organization_id)));

CREATE POLICY "consents_sel" ON public.telemedicine_consents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.telemedicine_sessions s WHERE s.id = session_id AND public.user_belongs_to_org(s.organization_id))
         OR public.user_owns_patient(patient_id));
CREATE POLICY "consents_ins" ON public.telemedicine_consents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.telemedicine_sessions s WHERE s.id = session_id AND public.user_belongs_to_org(s.organization_id))
              OR public.user_owns_patient(patient_id));

CREATE POLICY "plan_items_sel" ON public.care_plan_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.care_plans p WHERE p.id = care_plan_id AND public.user_belongs_to_org(p.organization_id)));
CREATE POLICY "plan_items_all" ON public.care_plan_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.care_plans p WHERE p.id = care_plan_id AND public.user_belongs_to_org(p.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.care_plans p WHERE p.id = care_plan_id AND public.user_belongs_to_org(p.organization_id)));

CREATE POLICY "visit_tasks_sel" ON public.home_visit_tasks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.home_visits v WHERE v.id = home_visit_id AND public.user_belongs_to_org(v.organization_id)));
CREATE POLICY "visit_tasks_all" ON public.home_visit_tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.home_visits v WHERE v.id = home_visit_id AND public.user_belongs_to_org(v.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.home_visits v WHERE v.id = home_visit_id AND public.user_belongs_to_org(v.organization_id)));

CREATE POLICY "refunds_sel" ON public.payment_gateway_refunds FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.payment_gateway_transactions t WHERE t.id = transaction_id AND public.user_belongs_to_org(t.organization_id)));
CREATE POLICY "refunds_all" ON public.payment_gateway_refunds FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.payment_gateway_transactions t WHERE t.id = transaction_id AND public.user_belongs_to_org(t.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.payment_gateway_transactions t WHERE t.id = transaction_id AND public.user_belongs_to_org(t.organization_id)));

CREATE POLICY "conflicts_sel" ON public.sync_conflicts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sync_outbox o WHERE o.id = outbox_id AND public.user_belongs_to_org(o.organization_id)));
CREATE POLICY "conflicts_all" ON public.sync_conflicts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sync_outbox o WHERE o.id = outbox_id AND public.user_belongs_to_org(o.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sync_outbox o WHERE o.id = outbox_id AND public.user_belongs_to_org(o.organization_id)));

-- ---------- Patient-facing tables ----------
CREATE POLICY "portal_self_sel" ON public.patient_portal_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'receptionist'));
CREATE POLICY "portal_self_upd" ON public.patient_portal_accounts FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "portal_admin_ins" ON public.patient_portal_accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'receptionist') OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "devices_self_all" ON public.patient_devices FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Vaccination schedule catalog
CREATE POLICY "schedules_read" ON public.immunization_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedules_admin_all" ON public.immunization_schedules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'org_admin'));

-- ---------- Seed: KSA EPI schedule ----------
INSERT INTO public.immunization_schedules (region_code, vaccine_code, vaccine_name, dose_number, age_months_min, age_months_max, is_mandatory) VALUES
  ('KSA','BCG','Bacillus Calmette-Guerin',1,0,1,true),
  ('KSA','HEPB','Hepatitis B',1,0,1,true),
  ('KSA','HEPB','Hepatitis B',2,2,3,true),
  ('KSA','HEPB','Hepatitis B',3,6,7,true),
  ('KSA','OPV','Oral Polio',1,2,3,true),
  ('KSA','OPV','Oral Polio',2,4,5,true),
  ('KSA','OPV','Oral Polio',3,6,7,true),
  ('KSA','DTaP','Diphtheria/Tetanus/Pertussis',1,2,3,true),
  ('KSA','DTaP','Diphtheria/Tetanus/Pertussis',2,4,5,true),
  ('KSA','DTaP','Diphtheria/Tetanus/Pertussis',3,6,7,true),
  ('KSA','HIB','Haemophilus Influenzae B',1,2,3,true),
  ('KSA','PCV','Pneumococcal Conjugate',1,2,3,true),
  ('KSA','ROTA','Rotavirus',1,2,3,true),
  ('KSA','MCV','Meningococcal',1,9,10,true),
  ('KSA','MMR','Measles/Mumps/Rubella',1,12,13,true),
  ('KSA','VARI','Varicella',1,12,13,true)
ON CONFLICT (region_code, vaccine_code, dose_number) DO NOTHING;

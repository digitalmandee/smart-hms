
-- =============================================================
-- HIPAA Phase 3 Migration
-- =============================================================

-- 1. Breach type enum
CREATE TYPE public.hipaa_breach_type AS ENUM (
  'unauthorized_access', 'loss', 'theft', 'improper_disposal', 'hacking', 'other'
);

CREATE TYPE public.hipaa_breach_status AS ENUM (
  'open', 'investigating', 'contained', 'resolved', 'closed'
);

CREATE TYPE public.hipaa_notification_status AS ENUM (
  'pending', 'notified_individuals', 'notified_hhs', 'closed'
);

CREATE TYPE public.hipaa_risk_level AS ENUM ('low', 'medium', 'high');

CREATE TYPE public.hipaa_training_type AS ENUM (
  'initial', 'annual_refresher', 'breach_response', 'phi_handling'
);

CREATE TYPE public.hipaa_training_status AS ENUM (
  'completed', 'expired', 'due_soon'
);

CREATE TYPE public.baa_status AS ENUM (
  'active', 'expired', 'pending_renewal', 'terminated'
);

-- =============================================================
-- Table 1: hipaa_breach_incidents
-- =============================================================
CREATE TABLE public.hipaa_breach_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  incident_date DATE NOT NULL,
  discovery_date DATE NOT NULL,
  notification_deadline DATE GENERATED ALWAYS AS (discovery_date + INTERVAL '60 days') STORED,
  breach_type public.hipaa_breach_type NOT NULL DEFAULT 'other',
  phi_types_involved JSONB DEFAULT '[]'::jsonb,
  individuals_affected_count INTEGER DEFAULT 0,
  description TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  risk_assessment public.hipaa_risk_level DEFAULT 'medium',
  notification_status public.hipaa_notification_status DEFAULT 'pending',
  notified_individuals_date DATE,
  notified_hhs_date DATE,
  reported_by UUID REFERENCES public.profiles(id),
  investigated_by UUID REFERENCES public.profiles(id),
  status public.hipaa_breach_status DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hipaa_breach_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view breach incidents in their org"
  ON public.hipaa_breach_incidents FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create breach incidents in their org"
  ON public.hipaa_breach_incidents FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update breach incidents in their org"
  ON public.hipaa_breach_incidents FOR UPDATE
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE TRIGGER update_hipaa_breach_incidents_updated_at
  BEFORE UPDATE ON public.hipaa_breach_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- Table 2: hipaa_training_records
-- =============================================================
CREATE TABLE public.hipaa_training_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  training_type public.hipaa_training_type NOT NULL DEFAULT 'initial',
  training_date DATE NOT NULL,
  expiry_date DATE GENERATED ALWAYS AS (training_date + INTERVAL '1 year') STORED,
  status public.hipaa_training_status NOT NULL DEFAULT 'completed',
  acknowledged_at TIMESTAMPTZ,
  trainer_name TEXT,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hipaa_training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training records in their org"
  ON public.hipaa_training_records FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create training records in their org"
  ON public.hipaa_training_records FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update training records in their org"
  ON public.hipaa_training_records FOR UPDATE
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE TRIGGER update_hipaa_training_records_updated_at
  BEFORE UPDATE ON public.hipaa_training_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- Table 3: business_associate_agreements
-- =============================================================
CREATE TABLE public.business_associate_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  vendor_contact TEXT,
  vendor_email TEXT,
  service_description TEXT,
  agreement_date DATE NOT NULL,
  expiry_date DATE,
  renewal_date DATE,
  status public.baa_status NOT NULL DEFAULT 'active',
  document_url TEXT,
  phi_categories JSONB DEFAULT '[]'::jsonb,
  reviewed_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_associate_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view BAAs in their org"
  ON public.business_associate_agreements FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create BAAs in their org"
  ON public.business_associate_agreements FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update BAAs in their org"
  ON public.business_associate_agreements FOR UPDATE
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE TRIGGER update_baa_updated_at
  BEFORE UPDATE ON public.business_associate_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

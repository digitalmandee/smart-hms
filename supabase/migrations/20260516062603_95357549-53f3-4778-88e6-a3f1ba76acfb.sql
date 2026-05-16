CREATE TABLE IF NOT EXISTS public.sehhaty_vaccination_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  sehhaty_certificate_id text NOT NULL,
  certificate_number text,
  vaccine_name text,
  dose_number int,
  administered_date date,
  issued_at timestamptz,
  payload jsonb,
  pulled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_sehhaty_vacc_cert ON public.sehhaty_vaccination_certificates (sehhaty_certificate_id);
CREATE INDEX IF NOT EXISTS idx_sehhaty_vacc_cert_patient ON public.sehhaty_vaccination_certificates (patient_id);
ALTER TABLE public.sehhaty_vaccination_certificates ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.sehhaty_sick_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  sehhaty_sickleave_id text NOT NULL,
  start_date date,
  end_date date,
  days_count int,
  reason text,
  issuing_doctor_name text,
  issuing_facility text,
  payload jsonb,
  pulled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_sehhaty_sickleave ON public.sehhaty_sick_leaves (sehhaty_sickleave_id);
CREATE INDEX IF NOT EXISTS idx_sehhaty_sickleave_patient ON public.sehhaty_sick_leaves (patient_id);
ALTER TABLE public.sehhaty_sick_leaves ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.sehhaty_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  sehhaty_referral_id text NOT NULL,
  referring_facility text,
  receiving_facility text,
  specialty text,
  status text,
  referral_date date,
  payload jsonb,
  pulled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_sehhaty_referral ON public.sehhaty_referrals (sehhaty_referral_id);
CREATE INDEX IF NOT EXISTS idx_sehhaty_referral_patient ON public.sehhaty_referrals (patient_id);
ALTER TABLE public.sehhaty_referrals ENABLE ROW LEVEL SECURITY;

-- RLS: org members can read; writes are service-role only
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['sehhaty_vaccination_certificates','sehhaty_sick_leaves','sehhaty_referrals']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_org_select') THEN
      EXECUTE format($p$CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
        USING (public.has_role(auth.uid(),'super_admin'::app_role)
               OR organization_id = public.get_user_organization_id())$p$, t||'_org_select', t);
    END IF;
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS trg_sehhaty_vacc_cert_updated_at ON public.sehhaty_vaccination_certificates;
CREATE TRIGGER trg_sehhaty_vacc_cert_updated_at BEFORE UPDATE ON public.sehhaty_vaccination_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_sehhaty_sickleave_updated_at ON public.sehhaty_sick_leaves;
CREATE TRIGGER trg_sehhaty_sickleave_updated_at BEFORE UPDATE ON public.sehhaty_sick_leaves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_sehhaty_referral_updated_at ON public.sehhaty_referrals;
CREATE TRIGGER trg_sehhaty_referral_updated_at BEFORE UPDATE ON public.sehhaty_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
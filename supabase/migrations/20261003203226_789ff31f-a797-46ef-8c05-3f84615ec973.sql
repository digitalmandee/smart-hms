
CREATE TABLE IF NOT EXISTS public.thalassemia_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid NOT NULL,
  diagnosis_type text NOT NULL DEFAULT 'major',
  diagnosis_date date,
  blood_group text,
  phenotype text,
  baseline_hb numeric,
  target_pre_hb numeric DEFAULT 9.5,
  weight_kg numeric,
  splenectomy boolean NOT NULL DEFAULT false,
  transfusion_interval_days int NOT NULL DEFAULT 21,
  chelation_drug text,
  next_due_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, patient_id)
);
CREATE TABLE IF NOT EXISTS public.thalassemia_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid NOT NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  chair_no text,
  status text NOT NULL DEFAULT 'scheduled',
  pre_hb numeric,
  post_hb numeric,
  units_given int DEFAULT 0,
  volume_ml numeric,
  weight_kg numeric,
  ml_per_kg numeric,
  transfusion_id uuid,
  reaction text,
  charge_amount numeric DEFAULT 0,
  sponsor_covered numeric DEFAULT 0,
  sponsorship_id uuid,
  notes text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.chelation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  drug text NOT NULL,
  dose text,
  compliance_pct int,
  side_effects text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.thalassemia_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  reading_date date NOT NULL DEFAULT CURRENT_DATE,
  ferritin numeric,
  hb numeric,
  alt numeric,
  creatinine numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.patient_sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  donor_id uuid,
  sponsor_name text NOT NULL,
  fund_type text NOT NULL DEFAULT 'zakat',
  coverage_pct int NOT NULL DEFAULT 100,
  monthly_cap numeric,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['thalassemia_profiles','thalassemia_visits','chelation_records','thalassemia_monitoring','patient_sponsorships'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "org members manage %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "org members manage %s" ON public.%I FOR ALL TO authenticated USING (organization_id = public.get_user_organization_id()) WITH CHECK (organization_id = public.get_user_organization_id())', t, t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_patient ON public.%I(organization_id, patient_id)', t, t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

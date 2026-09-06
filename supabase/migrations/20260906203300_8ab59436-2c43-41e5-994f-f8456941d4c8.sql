-- 1. Extend dental_charts
ALTER TABLE public.dental_charts
  ADD COLUMN IF NOT EXISTS dentition text NOT NULL DEFAULT 'permanent',
  ADD COLUMN IF NOT EXISTS mobility integer,
  ADD COLUMN IF NOT EXISTS is_treatment_planned boolean NOT NULL DEFAULT false;

-- 2. Per-surface conditions
CREATE TABLE IF NOT EXISTS public.dental_tooth_surfaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  tooth_number integer NOT NULL,
  surface text NOT NULL,
  condition text NOT NULL DEFAULT 'healthy',
  notes text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dental_tooth_surfaces_unique UNIQUE (organization_id, patient_id, tooth_number, surface)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_tooth_surfaces TO authenticated;
GRANT ALL ON public.dental_tooth_surfaces TO service_role;
ALTER TABLE public.dental_tooth_surfaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage tooth surfaces in their org" ON public.dental_tooth_surfaces
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()));

-- 3. Chart history
CREATE TABLE IF NOT EXISTS public.dental_chart_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  tooth_number integer NOT NULL,
  surface text,
  previous_condition text,
  new_condition text NOT NULL,
  notes text,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dental_chart_history_patient ON public.dental_chart_history (patient_id, changed_at DESC);
GRANT SELECT, INSERT ON public.dental_chart_history TO authenticated;
GRANT ALL ON public.dental_chart_history TO service_role;
ALTER TABLE public.dental_chart_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view chart history in their org" ON public.dental_chart_history
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Users can add chart history in their org" ON public.dental_chart_history
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()));

-- 4. Periodontal charting
CREATE TABLE IF NOT EXISTS public.dental_perio_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  tooth_number integer NOT NULL,
  site text NOT NULL,
  pocket_depth integer,
  recession integer,
  bleeding boolean NOT NULL DEFAULT false,
  suppuration boolean NOT NULL DEFAULT false,
  plaque boolean NOT NULL DEFAULT false,
  mobility integer,
  furcation integer,
  measured_by uuid,
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dental_perio_unique UNIQUE (organization_id, patient_id, tooth_number, site)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_perio_charts TO authenticated;
GRANT ALL ON public.dental_perio_charts TO service_role;
ALTER TABLE public.dental_perio_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage perio charts in their org" ON public.dental_perio_charts
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()));

-- 5. Treatment plans
CREATE TABLE IF NOT EXISTS public.dental_treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid NOT NULL,
  doctor_id uuid,
  title text NOT NULL DEFAULT 'Treatment Plan',
  status text NOT NULL DEFAULT 'draft',
  total_cost numeric NOT NULL DEFAULT 0,
  notes text,
  accepted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_treatment_plans TO authenticated;
GRANT ALL ON public.dental_treatment_plans TO service_role;
ALTER TABLE public.dental_treatment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage dental plans in their org" ON public.dental_treatment_plans
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.dental_treatment_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.dental_treatment_plans(id) ON DELETE CASCADE,
  tooth_number integer,
  surfaces text,
  procedure_id uuid,
  procedure_name text NOT NULL,
  phase integer NOT NULL DEFAULT 1,
  cost numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planned',
  treatment_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dental_plan_items_plan ON public.dental_treatment_plan_items (plan_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_treatment_plan_items TO authenticated;
GRANT ALL ON public.dental_treatment_plan_items TO service_role;
ALTER TABLE public.dental_treatment_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage dental plan items in their org" ON public.dental_treatment_plan_items
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT profiles.organization_id FROM profiles WHERE profiles.id = auth.uid()));

-- 6. updated_at triggers
CREATE TRIGGER trg_dental_tooth_surfaces_updated BEFORE UPDATE ON public.dental_tooth_surfaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dental_perio_updated BEFORE UPDATE ON public.dental_perio_charts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dental_plans_updated BEFORE UPDATE ON public.dental_treatment_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dental_plan_items_updated BEFORE UPDATE ON public.dental_treatment_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
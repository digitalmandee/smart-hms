
CREATE TABLE IF NOT EXISTS public.lab_critical_value_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  branch_id uuid,
  lab_order_id uuid REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  lab_order_item_id uuid REFERENCES public.lab_order_items(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  test_name text NOT NULL,
  result_value text,
  unit text,
  low_critical numeric,
  high_critical numeric,
  severity text NOT NULL DEFAULT 'critical',
  notified_to_name text,
  notified_to_role text,
  notified_to_phone text,
  notification_channel text,
  notes text,
  notified_at timestamptz NOT NULL DEFAULT now(),
  notified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at timestamptz,
  acknowledged_by_name text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lcvn_org_status ON public.lab_critical_value_notifications(organization_id, status, notified_at DESC);
CREATE INDEX IF NOT EXISTS idx_lcvn_order ON public.lab_critical_value_notifications(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lcvn_patient ON public.lab_critical_value_notifications(patient_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_critical_value_notifications TO authenticated;
GRANT ALL ON public.lab_critical_value_notifications TO service_role;

ALTER TABLE public.lab_critical_value_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read critical notifications in their org"
  ON public.lab_critical_value_notifications FOR SELECT
  TO authenticated
  USING (
    organization_id IS NULL
    OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated users can insert critical notifications in their org"
  ON public.lab_critical_value_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NULL
    OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated users can update critical notifications in their org"
  ON public.lab_critical_value_notifications FOR UPDATE
  TO authenticated
  USING (
    organization_id IS NULL
    OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE TRIGGER trg_lcvn_updated_at
  BEFORE UPDATE ON public.lab_critical_value_notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.blood_donor_recall_candidates AS
SELECT
  d.id                AS donor_id,
  d.organization_id,
  d.branch_id,
  d.donor_number,
  d.first_name,
  d.last_name,
  d.phone,
  d.email,
  d.blood_group,
  d.last_donation_date,
  d.total_donations,
  d.status,
  CASE
    WHEN d.last_donation_date IS NULL THEN NULL
    ELSE (d.last_donation_date + 56)
  END                 AS eligible_from,
  CASE
    WHEN d.last_donation_date IS NULL THEN 9999
    ELSE GREATEST(0, CURRENT_DATE - (d.last_donation_date + 56))
  END                 AS days_since_eligible,
  inv.available_units,
  inv.low_stock
FROM public.blood_donors d
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE bi.status = 'available')::int   AS available_units,
    (COUNT(*) FILTER (WHERE bi.status = 'available') < 5)  AS low_stock
  FROM public.blood_inventory bi
  WHERE bi.blood_group = d.blood_group
    AND (bi.organization_id = d.organization_id OR bi.organization_id IS NULL)
) inv ON true
WHERE d.status = 'active'
  AND (d.deferral_until IS NULL OR d.deferral_until <= CURRENT_DATE)
  AND (d.last_donation_date IS NULL OR (d.last_donation_date + 56) <= CURRENT_DATE);

GRANT SELECT ON public.blood_donor_recall_candidates TO authenticated;
GRANT SELECT ON public.blood_donor_recall_candidates TO service_role;

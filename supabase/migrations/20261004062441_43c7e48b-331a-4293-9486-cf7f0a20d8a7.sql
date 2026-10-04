ALTER TABLE public.patient_portal_accounts
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS organization_id uuid,
  ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE UNIQUE INDEX IF NOT EXISTS patient_portal_accounts_patient_uidx ON public.patient_portal_accounts(patient_id);

CREATE OR REPLACE FUNCTION public.user_owns_patient(_patient_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.patient_portal_accounts ppa
    WHERE ppa.patient_id = _patient_id AND ppa.user_id = auth.uid() AND ppa.is_active);
$$;

DROP POLICY IF EXISTS portal_self_select_lab_order_items ON public.lab_order_items;
CREATE POLICY portal_self_select_lab_order_items ON public.lab_order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.lab_orders lo WHERE lo.id = lab_order_id AND lo.is_published = true AND public.user_owns_patient(lo.patient_id)));

DROP POLICY IF EXISTS portal_self_select_invoice_items ON public.invoice_items;
CREATE POLICY portal_self_select_invoice_items ON public.invoice_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.user_owns_patient(i.patient_id)));

DROP POLICY IF EXISTS portal_self_select_payments ON public.payments;
CREATE POLICY portal_self_select_payments ON public.payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.user_owns_patient(i.patient_id)));

CREATE OR REPLACE FUNCTION public.portal_touch_login()
 RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ UPDATE public.patient_portal_accounts SET last_login_at = now() WHERE user_id = auth.uid(); $$;
REVOKE ALL ON FUNCTION public.portal_touch_login() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_touch_login() TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='invoices') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
  END IF;
END $$;
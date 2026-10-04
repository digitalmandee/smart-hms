CREATE TABLE public.blood_camp_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES public.blood_camps(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL DEFAULT public.get_user_organization_id(),
  category text NOT NULL DEFAULT 'other',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_camp_expenses TO authenticated;
GRANT ALL ON public.blood_camp_expenses TO service_role;
ALTER TABLE public.blood_camp_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage camp expenses" ON public.blood_camp_expenses FOR ALL TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());
CREATE INDEX idx_blood_camp_expenses_camp ON public.blood_camp_expenses(camp_id);

CREATE OR REPLACE FUNCTION public.bb_camp_expense_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE _st text; _cid uuid;
BEGIN
  _cid := COALESCE(NEW.camp_id, OLD.camp_id);
  SELECT status INTO _st FROM public.blood_camps WHERE id = _cid;
  IF _st = 'received' AND NOT (public.has_role(auth.uid(),'org_admin') OR public.has_role(auth.uid(),'super_admin')) THEN
    RAISE EXCEPTION 'Camp is received; expenses are locked';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  IF NEW.amount < 0 THEN RAISE EXCEPTION 'Amount cannot be negative'; END IF;
  NEW.updated_at = now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_camp_expense_guard BEFORE INSERT OR UPDATE OR DELETE ON public.blood_camp_expenses
  FOR EACH ROW EXECUTE FUNCTION public.bb_camp_expense_guard();
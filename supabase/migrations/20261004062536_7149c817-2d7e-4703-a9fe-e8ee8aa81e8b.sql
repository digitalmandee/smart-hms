DROP FUNCTION IF EXISTS public.portal_touch_login();

CREATE OR REPLACE FUNCTION public.guard_portal_account_self_update()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.user_id = auth.uid() THEN
    NEW.patient_id := OLD.patient_id;
    NEW.user_id := OLD.user_id;
    NEW.is_active := OLD.is_active;
    NEW.organization_id := OLD.organization_id;
    NEW.created_by := OLD.created_by;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_portal_account_self_update ON public.patient_portal_accounts;
CREATE TRIGGER trg_guard_portal_account_self_update BEFORE UPDATE ON public.patient_portal_accounts
FOR EACH ROW EXECUTE FUNCTION public.guard_portal_account_self_update();
CREATE TABLE IF NOT EXISTS public.whatsapp_message_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  recipient_phone text NOT NULL,
  template_name text NOT NULL,
  language_code text NOT NULL DEFAULT 'en',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued',
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_log_patient ON public.whatsapp_message_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_status ON public.whatsapp_message_log(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_created ON public.whatsapp_message_log(created_at DESC);

ALTER TABLE public.whatsapp_message_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_message_log' AND policyname = 'whatsapp_log_admin_select') THEN
    CREATE POLICY "whatsapp_log_admin_select" ON public.whatsapp_message_log
      FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'org_admin') OR public.has_role(auth.uid(), 'branch_admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_message_log' AND policyname = 'whatsapp_log_portal_self') THEN
    CREATE POLICY "whatsapp_log_portal_self" ON public.whatsapp_message_log
      FOR SELECT TO authenticated
      USING (patient_id IS NOT NULL AND public.user_owns_patient(patient_id));
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_whatsapp_log_updated_at ON public.whatsapp_message_log;
CREATE TRIGGER trg_whatsapp_log_updated_at
  BEFORE UPDATE ON public.whatsapp_message_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification(
  p_patient_id uuid,
  p_template text,
  p_payload jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone text;
  v_lang text;
BEGIN
  SELECT phone, COALESCE(preferred_language, 'en') INTO v_phone, v_lang
  FROM public.patients WHERE id = p_patient_id;
  IF v_phone IS NULL OR v_phone = '' THEN RETURN; END IF;
  INSERT INTO public.whatsapp_message_log (patient_id, recipient_phone, template_name, language_code, payload, status)
  VALUES (p_patient_id, v_phone, p_template, v_lang, p_payload, 'queued');
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_whatsapp_lab_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.patient_id IS NOT NULL THEN
    PERFORM public.enqueue_whatsapp_notification(NEW.patient_id, 'lab_result_ready',
      jsonb_build_object('order_id', NEW.id, 'test_name', NEW.test_name));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatsapp_lab_completed ON public.lab_orders;
CREATE TRIGGER trg_whatsapp_lab_completed
  AFTER UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.trg_whatsapp_lab_completed();

CREATE OR REPLACE FUNCTION public.trg_whatsapp_appointment_booked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.patient_id IS NOT NULL THEN
    PERFORM public.enqueue_whatsapp_notification(NEW.patient_id, 'appointment_booked',
      jsonb_build_object('appointment_id', NEW.id, 'date', NEW.appointment_date, 'time', NEW.appointment_time));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatsapp_appointment_booked ON public.appointments;
CREATE TRIGGER trg_whatsapp_appointment_booked
  AFTER INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.trg_whatsapp_appointment_booked();

CREATE OR REPLACE FUNCTION public.trg_whatsapp_immunization_given()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.patient_id IS NOT NULL THEN
    PERFORM public.enqueue_whatsapp_notification(NEW.patient_id, 'immunization_recorded',
      jsonb_build_object('immunization_id', NEW.id, 'vaccine', NEW.vaccine_name, 'date', NEW.administered_at));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatsapp_immunization_given ON public.immunizations;
CREATE TRIGGER trg_whatsapp_immunization_given
  AFTER INSERT ON public.immunizations
  FOR EACH ROW EXECUTE FUNCTION public.trg_whatsapp_immunization_given();
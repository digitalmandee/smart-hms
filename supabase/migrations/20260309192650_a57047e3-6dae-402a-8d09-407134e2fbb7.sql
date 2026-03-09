
-- Fix: Add trigger on appointments INSERT to auto-link paid invoices (handles race condition)
CREATE OR REPLACE FUNCTION public.sync_appointment_payment_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If appointment already has invoice_id and paid status, nothing to do
  IF NEW.invoice_id IS NOT NULL AND NEW.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- Check if there's a paid invoice for this patient on the same date (±1 day for timezone)
  UPDATE public.appointments
  SET invoice_id = i.id, payment_status = 'paid'
  FROM public.invoices i
  WHERE appointments.id = NEW.id
    AND i.patient_id = NEW.patient_id
    AND i.status = 'paid'
    AND ABS(NEW.appointment_date::date - i.invoice_date::date) <= 1
    AND appointments.invoice_id IS NULL
    AND appointments.payment_status = 'pending';

  RETURN NEW;
END;
$function$;

-- Create trigger on appointments INSERT
DROP TRIGGER IF EXISTS trg_sync_appointment_payment_on_insert ON public.appointments;
CREATE TRIGGER trg_sync_appointment_payment_on_insert
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_appointment_payment_on_insert();

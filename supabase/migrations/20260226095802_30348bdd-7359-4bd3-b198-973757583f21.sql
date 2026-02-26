
-- Trigger: Auto-sync appointments.payment_status when linked invoice is paid
CREATE OR REPLACE FUNCTION public.sync_appointment_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When invoice status changes to 'paid', update linked appointment
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE public.appointments 
    SET payment_status = 'paid'
    WHERE invoice_id = NEW.id 
      AND payment_status != 'paid';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_appointment_payment_on_invoice_paid
AFTER UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.sync_appointment_payment_status();

-- Also fix any currently stale data: update appointments whose linked invoice is already paid
UPDATE public.appointments a
SET payment_status = 'paid'
FROM public.invoices i
WHERE a.invoice_id = i.id
  AND i.status = 'paid'
  AND a.payment_status != 'paid';

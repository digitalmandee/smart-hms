
-- Fix existing stale data: link paid invoices to appointments by patient+date match
UPDATE public.appointments a
SET payment_status = 'paid', 
    invoice_id = sub.invoice_id
FROM (
  SELECT DISTINCT ON (a2.id) a2.id as appt_id, i.id as invoice_id
  FROM public.appointments a2
  JOIN public.invoices i ON i.patient_id = a2.patient_id AND i.invoice_date = a2.appointment_date AND i.status = 'paid'
  WHERE a2.payment_status = 'pending' AND a2.invoice_id IS NULL
  ORDER BY a2.id, i.created_at DESC
) sub
WHERE a.id = sub.appt_id;

-- Also update the existing trigger to handle the fallback patient+date match
CREATE OR REPLACE FUNCTION public.sync_appointment_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- First: update appointments directly linked via invoice_id
    UPDATE public.appointments 
    SET payment_status = 'paid'
    WHERE invoice_id = NEW.id 
      AND payment_status != 'paid';
    
    -- Second: fallback — find appointments for same patient+date with no invoice linked
    UPDATE public.appointments
    SET payment_status = 'paid', invoice_id = NEW.id
    WHERE patient_id = NEW.patient_id
      AND appointment_date = NEW.invoice_date
      AND invoice_id IS NULL
      AND payment_status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

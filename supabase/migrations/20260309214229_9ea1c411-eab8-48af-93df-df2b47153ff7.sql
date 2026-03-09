CREATE OR REPLACE FUNCTION public.sync_appointment_payment_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Only update appointments that are explicitly linked to this invoice
    UPDATE public.appointments 
    SET payment_status = 'paid'
    WHERE invoice_id = NEW.id 
      AND payment_status != 'paid';
  END IF;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.generate_imaging_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
  prefix TEXT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  prefix := 'IMG-' || date_part || '-';
  
  PERFORM pg_advisory_xact_lock(
    hashtext('imaging_order_' || NEW.organization_id::text || date_part)
  );
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.imaging_orders
  WHERE organization_id = NEW.organization_id
    AND order_number LIKE prefix || '%';
  
  NEW.order_number := prefix || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;
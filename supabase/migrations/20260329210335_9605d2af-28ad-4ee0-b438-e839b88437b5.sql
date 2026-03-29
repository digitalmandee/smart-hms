CREATE OR REPLACE FUNCTION public.generate_imaging_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  PERFORM pg_advisory_xact_lock(hashtext('imaging_order_' || NEW.organization_id::text || date_part));
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 5 + LENGTH(date_part)) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM public.imaging_orders
  WHERE organization_id = NEW.organization_id
    AND order_number LIKE 'IMG-' || date_part || '-%';
  
  NEW.order_number := 'IMG-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;
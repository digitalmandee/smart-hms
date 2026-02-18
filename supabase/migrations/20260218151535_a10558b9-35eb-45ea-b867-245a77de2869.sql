-- Fix create_lab_order_from_invoice - last remaining function without search_path
CREATE OR REPLACE FUNCTION public.create_lab_order_from_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_has_lab_items BOOLEAN;
  v_order_number TEXT;
  v_lab_order_id UUID;
  v_date_part TEXT;
  v_seq_num INT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.lab_orders WHERE invoice_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.invoice_items ii
    JOIN public.service_types st ON st.id = ii.service_type_id
    WHERE ii.invoice_id = NEW.id AND st.category = 'lab'
  ) INTO v_has_lab_items;

  IF NOT v_has_lab_items THEN
    RETURN NEW;
  END IF;

  v_date_part := TO_CHAR(NOW(), 'YYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5 + LENGTH(v_date_part)) AS INT)), 0) + 1
  INTO v_seq_num
  FROM public.lab_orders
  WHERE order_number LIKE 'LO-' || v_date_part || '-%';
  v_order_number := 'LO-' || v_date_part || '-' || LPAD(v_seq_num::TEXT, 4, '0');

  INSERT INTO public.lab_orders (
    order_number, patient_id, branch_id, invoice_id, payment_status, status, priority, clinical_notes
  )
  VALUES (
    v_order_number, NEW.patient_id, NEW.branch_id, NEW.id,
    CASE WHEN NEW.status = 'paid' THEN 'paid' ELSE 'pending' END,
    'ordered', 'routine', 'Auto-created from Invoice ' || NEW.invoice_number
  )
  RETURNING id INTO v_lab_order_id;

  INSERT INTO public.lab_order_items (lab_order_id, service_type_id, test_name, test_category, status)
  SELECT v_lab_order_id, ii.service_type_id, COALESCE(ii.description, st.name), 'lab', 'pending'
  FROM public.invoice_items ii
  JOIN public.service_types st ON st.id = ii.service_type_id
  WHERE ii.invoice_id = NEW.id AND st.category = 'lab';

  RETURN NEW;
END;
$function$;

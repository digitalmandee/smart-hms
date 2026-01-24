-- =====================================================
-- COMPREHENSIVE INVOICE-TO-DEPARTMENT ORDER TRIGGERS
-- Ensures lab/imaging orders are always created from invoices
-- and payment statuses stay in sync
-- =====================================================

-- Function: Create lab order from invoice with lab items
CREATE OR REPLACE FUNCTION public.create_lab_order_from_invoice()
RETURNS trigger AS $$
DECLARE
  v_has_lab_items BOOLEAN;
  v_order_number TEXT;
  v_lab_order_id UUID;
  v_date_part TEXT;
  v_seq_num INT;
BEGIN
  -- Check if invoice already has a linked lab order
  IF EXISTS (SELECT 1 FROM public.lab_orders WHERE invoice_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Check if invoice has lab items
  SELECT EXISTS (
    SELECT 1 FROM public.invoice_items ii
    JOIN public.service_types st ON st.id = ii.service_type_id
    WHERE ii.invoice_id = NEW.id AND st.category = 'lab'
  ) INTO v_has_lab_items;

  IF NOT v_has_lab_items THEN
    RETURN NEW;
  END IF;

  -- Generate order number (same pattern as existing trigger)
  v_date_part := TO_CHAR(NOW(), 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 5 + LENGTH(v_date_part)) AS INT)
  ), 0) + 1
  INTO v_seq_num
  FROM public.lab_orders
  WHERE order_number LIKE 'LO-' || v_date_part || '-%';
  
  v_order_number := 'LO-' || v_date_part || '-' || LPAD(v_seq_num::TEXT, 4, '0');

  -- Create lab order (no organization_id in lab_orders table)
  INSERT INTO public.lab_orders (
    order_number, patient_id, branch_id,
    invoice_id, payment_status, status, priority, clinical_notes
  )
  VALUES (
    v_order_number,
    NEW.patient_id,
    NEW.branch_id,
    NEW.id,
    CASE WHEN NEW.status = 'paid' THEN 'paid' ELSE 'pending' END,
    'ordered',
    'routine',
    'Auto-created from Invoice ' || NEW.invoice_number
  )
  RETURNING id INTO v_lab_order_id;

  -- Create lab order items from invoice lab items
  INSERT INTO public.lab_order_items (lab_order_id, service_type_id, test_name, test_category, status)
  SELECT 
    v_lab_order_id,
    ii.service_type_id,
    COALESCE(ii.description, st.name),
    'lab',
    'pending'
  FROM public.invoice_items ii
  JOIN public.service_types st ON st.id = ii.service_type_id
  WHERE ii.invoice_id = NEW.id AND st.category = 'lab';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Sync payment status to lab/imaging orders when invoice is paid
CREATE OR REPLACE FUNCTION public.sync_department_order_payment_status()
RETURNS trigger AS $$
BEGIN
  -- Only run when status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Update lab orders linked to this invoice
    UPDATE public.lab_orders 
    SET payment_status = 'paid' 
    WHERE invoice_id = NEW.id AND payment_status != 'paid';
    
    -- Update imaging orders linked to this invoice
    UPDATE public.imaging_orders 
    SET payment_status = 'paid' 
    WHERE invoice_id = NEW.id AND payment_status != 'paid';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto lab order creation on invoice insert
DROP TRIGGER IF EXISTS trg_create_lab_order_on_invoice ON public.invoices;
CREATE TRIGGER trg_create_lab_order_on_invoice
  AFTER INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lab_order_from_invoice();

-- Create trigger for payment status sync on invoice update
DROP TRIGGER IF EXISTS trg_sync_payment_on_invoice_update ON public.invoices;
CREATE TRIGGER trg_sync_payment_on_invoice_update
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_department_order_payment_status();

-- =====================================================
-- DATA REPAIR: Create missing lab orders for existing invoices
-- =====================================================

-- Fix existing lab order payment status for invoice INV-20260123-560
UPDATE public.lab_orders 
SET payment_status = 'paid' 
WHERE id = '770e875b-e818-456c-9866-6de8a3d0daeb';

-- Create lab orders for invoices that have lab items but no linked lab order
DO $$
DECLARE
  v_invoice RECORD;
  v_order_number TEXT;
  v_lab_order_id UUID;
  v_date_part TEXT;
  v_seq_num INT;
BEGIN
  -- Find all invoices with lab items but no lab order
  FOR v_invoice IN 
    SELECT DISTINCT i.id, i.patient_id, i.branch_id, i.invoice_number, i.status
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    JOIN service_types st ON st.id = ii.service_type_id
    WHERE st.category = 'lab'
      AND NOT EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.invoice_id = i.id)
      AND i.status != 'cancelled'
  LOOP
    -- Generate order number
    v_date_part := TO_CHAR(NOW(), 'YYMMDD');
    
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(order_number FROM 5 + LENGTH(v_date_part)) AS INT)
    ), 0) + 1
    INTO v_seq_num
    FROM lab_orders
    WHERE order_number LIKE 'LO-' || v_date_part || '-%';
    
    v_order_number := 'LO-' || v_date_part || '-' || LPAD(v_seq_num::TEXT, 4, '0');
    
    -- Create lab order (no organization_id column)
    INSERT INTO lab_orders (
      order_number, patient_id, branch_id,
      invoice_id, payment_status, status, priority, clinical_notes
    )
    VALUES (
      v_order_number,
      v_invoice.patient_id,
      v_invoice.branch_id,
      v_invoice.id,
      CASE WHEN v_invoice.status = 'paid' THEN 'paid' ELSE 'pending' END,
      'ordered',
      'routine',
      'Auto-created from Invoice ' || v_invoice.invoice_number
    )
    RETURNING id INTO v_lab_order_id;
    
    -- Create lab order items
    INSERT INTO lab_order_items (lab_order_id, service_type_id, test_name, test_category, status)
    SELECT 
      v_lab_order_id,
      ii.service_type_id,
      COALESCE(ii.description, st.name),
      'lab',
      'pending'
    FROM invoice_items ii
    JOIN service_types st ON st.id = ii.service_type_id
    WHERE ii.invoice_id = v_invoice.id AND st.category = 'lab';
    
    RAISE NOTICE 'Created lab order % for invoice %', v_order_number, v_invoice.invoice_number;
  END LOOP;
END $$;
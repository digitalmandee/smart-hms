-- 1. Trigger-only / internal functions: nobody calls them directly
REVOKE EXECUTE ON FUNCTION public.enforce_fiscal_year_lock() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_fiscal_year_lock_on_lines() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_whatsapp_appointment_booked() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_whatsapp_immunization_given() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_whatsapp_lab_completed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_whatsapp_notification(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;

-- 2. Staff-only: remove anonymous access
REVOKE EXECUTE ON FUNCTION public.gl_coverage_report(date, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gl_period_lock_status(date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gl_trial_balance_health(date, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.hash_kiosk_password(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_kiosk_username(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gl_coverage_report(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gl_period_lock_status(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gl_trial_balance_health(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hash_kiosk_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_kiosk_username(text, uuid) TO authenticated;

-- 3. Lab order -> real invoice (runs with caller's rights, so RLS applies)
CREATE OR REPLACE FUNCTION public.create_lab_order_invoice(p_lab_order_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_org uuid;
  v_total numeric;
  v_inv uuid;
BEGIN
  SELECT * INTO v_order FROM lab_orders WHERE id = p_lab_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lab order not found'; END IF;
  IF v_order.invoice_id IS NOT NULL THEN RETURN v_order.invoice_id; END IF;

  SELECT organization_id INTO v_org FROM branches WHERE id = v_order.branch_id;

  SELECT COALESCE(SUM(COALESCE(st.default_price,0)),0) INTO v_total
  FROM lab_order_items li LEFT JOIN service_types st ON st.id = li.service_type_id
  WHERE li.lab_order_id = p_lab_order_id;

  INSERT INTO invoices (invoice_number, patient_id, branch_id, organization_id, subtotal,
    discount_amount, tax_amount, total_amount, paid_amount, balance_amount, status, notes, created_by)
  VALUES ('LAB-' || to_char(now(),'YYYYMMDD') || '-' || lpad((floor(random()*100000))::text,5,'0'),
    v_order.patient_id, v_order.branch_id, v_org, v_total, 0, 0, v_total, 0, v_total,
    CASE WHEN v_total = 0 THEN 'paid'::invoice_status ELSE 'pending'::invoice_status END,
    'Lab Order ' || v_order.order_number, auth.uid())
  RETURNING id INTO v_inv;

  -- link first so the invoice trigger never spawns a duplicate lab order
  UPDATE lab_orders SET invoice_id = v_inv,
    payment_status = CASE WHEN v_total = 0 THEN 'paid' ELSE payment_status END
  WHERE id = p_lab_order_id;

  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, discount_percent, total_price, service_type_id)
  SELECT v_inv, li.test_name, 1, COALESCE(st.default_price,0), 0, COALESCE(st.default_price,0), li.service_type_id
  FROM lab_order_items li LEFT JOIN service_types st ON st.id = li.service_type_id
  WHERE li.lab_order_id = p_lab_order_id;

  RETURN v_inv;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_lab_order_invoice(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_lab_order_invoice(uuid) TO authenticated;

-- 4. Payment status follows invoice: paid / partial / pending
CREATE OR REPLACE FUNCTION public.sync_department_order_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE v_status text;
BEGIN
  IF NEW.status = 'paid' OR COALESCE(NEW.balance_amount,1) <= 0 AND COALESCE(NEW.total_amount,0) > 0 THEN
    v_status := 'paid';
  ELSIF COALESCE(NEW.paid_amount,0) > 0 THEN
    v_status := 'partial';
  ELSE
    RETURN NEW;
  END IF;

  UPDATE public.lab_orders SET payment_status = v_status
  WHERE invoice_id = NEW.id AND payment_status IS DISTINCT FROM v_status AND payment_status <> 'waived';
  UPDATE public.imaging_orders SET payment_status = v_status
  WHERE invoice_id = NEW.id AND payment_status IS DISTINCT FROM v_status AND payment_status <> 'waived';
  RETURN NEW;
END;
$$;
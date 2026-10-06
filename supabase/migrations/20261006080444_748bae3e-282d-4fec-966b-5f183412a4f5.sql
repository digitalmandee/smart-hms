CREATE OR REPLACE FUNCTION public.issue_blood_units(_request_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE r record; u record; v_needed int; v_issued int := 0; v_invoice uuid; v_total numeric := 0;
  v_price numeric; v_label text; v_tx uuid; v_cm uuid; v_inv_no text;
BEGIN
  SELECT * INTO r FROM blood_requests WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF r.status IN ('completed','cancelled') THEN RAISE EXCEPTION 'Request is %', r.status; END IF;
  v_needed := r.units_requested - COALESCE(r.units_issued, 0);
  IF v_needed <= 0 THEN RAISE EXCEPTION 'All requested units already issued'; END IF;

  FOR u IN SELECT * FROM blood_inventory
     WHERE reserved_for_request_id = _request_id AND status IN ('cross_matched','reserved')
       AND expiry_date >= CURRENT_DATE
     ORDER BY expiry_date ASC, collection_date ASC LIMIT v_needed FOR UPDATE
  LOOP
    IF u.invoice_id IS NOT NULL THEN CONTINUE; END IF;
    IF v_invoice IS NULL AND r.patient_id IS NOT NULL THEN
      v_inv_no := 'BB-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*100000))::int::text, 5, '0');
      INSERT INTO invoices (organization_id, branch_id, patient_id, invoice_number, invoice_date, subtotal, total_amount,
        paid_amount, balance_amount, status, department, notes, created_by)
      VALUES (r.organization_id, r.branch_id, r.patient_id, v_inv_no, CURRENT_DATE, 0, 0, 0, 0, 'draft', 'Blood Bank',
        'Blood request ' || r.request_number, auth.uid())
      RETURNING id INTO v_invoice;
    END IF;

    v_label := CASE u.component_type
      WHEN 'whole_blood' THEN 'Whole Blood' WHEN 'packed_rbc' THEN 'Packed Red Cells'
      WHEN 'fresh_frozen_plasma' THEN 'Fresh Frozen Plasma' WHEN 'platelet_concentrate' THEN 'Platelets'
      WHEN 'cryoprecipitate' THEN 'Cryoprecipitate' ELSE 'Granulocytes' END;
    SELECT default_price INTO v_price FROM service_types
      WHERE organization_id = r.organization_id AND is_active IS NOT FALSE AND name = 'Blood Bank - ' || v_label
      LIMIT 1;
    v_price := COALESCE(v_price, 0);

    SELECT id INTO v_cm FROM cross_match_tests WHERE unit_id = u.id AND request_id = _request_id AND overall_result = 'compatible' ORDER BY test_date DESC LIMIT 1;
    INSERT INTO blood_transfusions (organization_id, branch_id, request_id, unit_id, cross_match_id, patient_id,
      scheduled_at, status, transfusion_number, invoice_id)
    VALUES (r.organization_id, r.branch_id, _request_id, u.id, v_cm, r.patient_id, now(), 'scheduled', '', v_invoice)
    RETURNING id INTO v_tx;

    UPDATE blood_inventory SET status = 'issued', invoice_id = v_invoice WHERE id = u.id;

    IF v_invoice IS NOT NULL THEN
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
      VALUES (v_invoice, 'BB-' || v_label || ' (' || u.blood_group::text || ') unit ' || u.unit_number, 1, v_price, v_price);
      v_total := v_total + v_price;
    END IF;
    v_issued := v_issued + 1;
  END LOOP;

  IF v_issued = 0 THEN RAISE EXCEPTION 'NO_MATCHED_UNITS: cross-match compatible units first'; END IF;

  IF v_invoice IS NOT NULL THEN
    UPDATE invoices SET subtotal = v_total, total_amount = v_total, balance_amount = v_total,
      status = CASE WHEN v_total > 0 THEN 'pending'::invoice_status ELSE 'paid'::invoice_status END
      WHERE id = v_invoice;
  END IF;

  UPDATE blood_requests SET units_issued = COALESCE(units_issued,0) + v_issued,
    status = CASE WHEN COALESCE(units_issued,0) + v_issued >= units_requested THEN 'issued'::blood_request_status ELSE status END,
    issued_at = now(), issued_by = auth.uid() WHERE id = _request_id;

  RETURN jsonb_build_object('issued', v_issued, 'invoice_id', v_invoice, 'total', v_total);
END $function$;
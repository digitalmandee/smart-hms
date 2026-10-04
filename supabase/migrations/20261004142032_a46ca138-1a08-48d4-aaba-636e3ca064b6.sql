
-- 1. Shelf-life reference
CREATE TABLE IF NOT EXISTS public.blood_component_shelf_life (
  component_type public.blood_component_type PRIMARY KEY,
  shelf_days integer NOT NULL,
  default_volume_ml integer NOT NULL,
  storage text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blood_component_shelf_life TO authenticated;
GRANT ALL ON public.blood_component_shelf_life TO service_role;
ALTER TABLE public.blood_component_shelf_life ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read shelf life" ON public.blood_component_shelf_life FOR SELECT TO authenticated USING (true);
INSERT INTO public.blood_component_shelf_life VALUES
 ('whole_blood',35,450,'2-6 C', now()),
 ('packed_rbc',42,250,'2-6 C', now()),
 ('fresh_frozen_plasma',365,200,'-18 C or colder', now()),
 ('platelet_concentrate',5,50,'20-24 C with agitation', now()),
 ('cryoprecipitate',365,15,'-18 C or colder', now()),
 ('granulocytes',1,200,'20-24 C', now())
ON CONFLICT (component_type) DO NOTHING;

-- 2. New columns
ALTER TABLE public.blood_donations
  ADD COLUMN IF NOT EXISTS questionnaire jsonb,
  ADD COLUMN IF NOT EXISTS eligibility_passed boolean,
  ADD COLUMN IF NOT EXISTS eligibility_reasons text[],
  ADD COLUMN IF NOT EXISTS screening_result jsonb,
  ADD COLUMN IF NOT EXISTS testing_status text,
  ADD COLUMN IF NOT EXISTS components_prepared boolean NOT NULL DEFAULT false;
ALTER TABLE public.blood_inventory
  ADD COLUMN IF NOT EXISTS discard_reason text,
  ADD COLUMN IF NOT EXISTS discarded_by uuid,
  ADD COLUMN IF NOT EXISTS discarded_at timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_id uuid;
ALTER TABLE public.blood_transfusions
  ADD COLUMN IF NOT EXISTS mid_temp numeric,
  ADD COLUMN IF NOT EXISTS mid_pulse integer,
  ADD COLUMN IF NOT EXISTS mid_bp text,
  ADD COLUMN IF NOT EXISTS mid_resp_rate integer,
  ADD COLUMN IF NOT EXISTS mid_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_id uuid;

-- 3. Eligibility check
CREATE OR REPLACE FUNCTION public.check_donor_eligibility(
  _donor_id uuid, _hemoglobin numeric DEFAULT NULL, _weight numeric DEFAULT NULL,
  _donation_type text DEFAULT 'whole_blood', _answers jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
DECLARE
  d record; v_reasons text[] := '{}'; v_age int; v_gap int; v_hb numeric; v_wt numeric; v_defer int := 0;
BEGIN
  SELECT * INTO d FROM blood_donors WHERE id = _donor_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('eligible', false, 'reasons', ARRAY['donor_not_found'], 'defer_days', 0); END IF;
  IF d.status = 'permanently_deferred' THEN v_reasons := v_reasons || 'permanently_deferred'; END IF;
  IF d.deferral_until IS NOT NULL AND d.deferral_until > CURRENT_DATE THEN v_reasons := v_reasons || 'deferred_until'; END IF;
  IF d.date_of_birth IS NOT NULL THEN
    v_age := date_part('year', age(CURRENT_DATE, d.date_of_birth));
    IF v_age < 18 OR v_age > 60 THEN v_reasons := v_reasons || 'age'; END IF;
  END IF;
  v_wt := COALESCE(_weight, d.weight_kg);
  IF v_wt IS NOT NULL AND v_wt < 50 THEN v_reasons := v_reasons || 'weight'; v_defer := GREATEST(v_defer, 90); END IF;
  v_hb := COALESCE(_hemoglobin, d.hemoglobin_level);
  IF v_hb IS NOT NULL AND v_hb < 12.5 THEN v_reasons := v_reasons || 'hemoglobin'; v_defer := GREATEST(v_defer, 90); END IF;
  v_gap := CASE WHEN _donation_type IN ('double_rbc','apheresis_rbc') THEN 112 ELSE 56 END;
  IF d.last_donation_date IS NOT NULL AND d.last_donation_date + v_gap > CURRENT_DATE THEN v_reasons := v_reasons || 'interval'; END IF;
  IF COALESCE((_answers->>'feeling_well')::boolean, true) = false THEN v_reasons := v_reasons || 'not_well'; v_defer := GREATEST(v_defer, 7); END IF;
  IF COALESCE((_answers->>'recent_illness')::boolean, false) THEN v_reasons := v_reasons || 'recent_illness'; v_defer := GREATEST(v_defer, 14); END IF;
  IF COALESCE((_answers->>'antibiotics')::boolean, false) THEN v_reasons := v_reasons || 'antibiotics'; v_defer := GREATEST(v_defer, 7); END IF;
  IF COALESCE((_answers->>'malaria_travel')::boolean, false) THEN v_reasons := v_reasons || 'malaria_travel'; v_defer := GREATEST(v_defer, 90); END IF;
  IF COALESCE((_answers->>'tattoo_piercing')::boolean, false) THEN v_reasons := v_reasons || 'tattoo_piercing'; v_defer := GREATEST(v_defer, 180); END IF;
  IF COALESCE((_answers->>'pregnancy')::boolean, false) THEN v_reasons := v_reasons || 'pregnancy'; v_defer := GREATEST(v_defer, 180); END IF;
  IF COALESCE((_answers->>'recent_surgery')::boolean, false) THEN v_reasons := v_reasons || 'recent_surgery'; v_defer := GREATEST(v_defer, 180); END IF;
  IF COALESCE((_answers->>'high_risk')::boolean, false) THEN v_reasons := v_reasons || 'high_risk'; v_defer := GREATEST(v_defer, 365); END IF;
  RETURN jsonb_build_object('eligible', cardinality(v_reasons) = 0, 'reasons', v_reasons, 'defer_days', v_defer);
END $$;
GRANT EXECUTE ON FUNCTION public.check_donor_eligibility(uuid, numeric, numeric, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.defer_blood_donor(_donor_id uuid, _reason text, _days integer)
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  UPDATE blood_donors SET status = 'deferred', deferral_reason = _reason,
    deferral_until = CURRENT_DATE + GREATEST(_days, 1) WHERE id = _donor_id;
$$;
GRANT EXECUTE ON FUNCTION public.defer_blood_donor(uuid, text, integer) TO authenticated;

-- Safety net: donations for ineligible donors are rejected
CREATE OR REPLACE FUNCTION public.enforce_donor_eligibility()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  r := check_donor_eligibility(NEW.donor_id, NEW.hemoglobin_level, NULL, COALESCE(NEW.donation_type,'whole_blood'), COALESCE(NEW.questionnaire,'{}'::jsonb));
  NEW.eligibility_passed := (r->>'eligible')::boolean;
  NEW.eligibility_reasons := ARRAY(SELECT jsonb_array_elements_text(r->'reasons'));
  IF NOT NEW.eligibility_passed AND NEW.status <> 'rejected' THEN
    RAISE EXCEPTION 'DONOR_NOT_ELIGIBLE: %', array_to_string(NEW.eligibility_reasons, ', ');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_enforce_donor_eligibility ON public.blood_donations;
CREATE TRIGGER trg_enforce_donor_eligibility BEFORE INSERT ON public.blood_donations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_donor_eligibility();

-- Donor stats on completion
CREATE OR REPLACE FUNCTION public.update_donor_on_donation_complete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    UPDATE blood_donors SET last_donation_date = NEW.donation_date,
      total_donations = COALESCE(total_donations,0) + 1 WHERE id = NEW.donor_id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_update_donor_on_donation ON public.blood_donations;
CREATE TRIGGER trg_update_donor_on_donation AFTER UPDATE ON public.blood_donations
  FOR EACH ROW EXECUTE FUNCTION public.update_donor_on_donation_complete();

-- 4. Component split
CREATE OR REPLACE FUNCTION public.split_blood_donation(_donation_id uuid, _components public.blood_component_type[])
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE dn record; c public.blood_component_type; s record; n int := 0; v_date date;
BEGIN
  SELECT bd.*, d.blood_group INTO dn FROM blood_donations bd JOIN blood_donors d ON d.id = bd.donor_id WHERE bd.id = _donation_id FOR UPDATE OF bd;
  IF NOT FOUND THEN RAISE EXCEPTION 'Donation not found'; END IF;
  IF dn.components_prepared THEN RETURN 0; END IF;
  IF _components IS NULL OR cardinality(_components) = 0 THEN _components := ARRAY['whole_blood']::public.blood_component_type[]; END IF;
  v_date := COALESCE(dn.donation_date, CURRENT_DATE);
  FOREACH c IN ARRAY _components LOOP
    SELECT * INTO s FROM blood_component_shelf_life WHERE component_type = c;
    INSERT INTO blood_inventory (organization_id, branch_id, donation_id, blood_group, component_type, volume_ml,
      collection_date, expiry_date, status, unit_number)
    VALUES (dn.organization_id, dn.branch_id, dn.id, dn.blood_group, c,
      COALESCE(s.default_volume_ml, 450), v_date, v_date + COALESCE(s.shelf_days, 35), 'quarantine', '');
    n := n + 1;
  END LOOP;
  UPDATE blood_donations SET components_prepared = true WHERE id = _donation_id;
  RETURN n;
END $$;
GRANT EXECUTE ON FUNCTION public.split_blood_donation(uuid, public.blood_component_type[]) TO authenticated;

-- 5. Cross-match holds the bag
CREATE OR REPLACE FUNCTION public.sync_unit_on_cross_match()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_req record; v_held int;
BEGIN
  IF NEW.unit_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.overall_result = 'compatible' THEN
    UPDATE blood_inventory SET status = 'cross_matched', reserved_for_request_id = NEW.request_id
      WHERE id = NEW.unit_id AND status IN ('available','reserved');
    SELECT * INTO v_req FROM blood_requests WHERE id = NEW.request_id;
    SELECT count(*) INTO v_held FROM blood_inventory WHERE reserved_for_request_id = NEW.request_id AND status IN ('cross_matched','reserved');
    IF v_req.status IN ('pending','processing','cross_matching') AND v_held >= GREATEST(v_req.units_requested - COALESCE(v_req.units_issued,0), 1) THEN
      UPDATE blood_requests SET status = 'ready' WHERE id = NEW.request_id;
    ELSIF v_req.status IN ('pending','processing') THEN
      UPDATE blood_requests SET status = 'cross_matching' WHERE id = NEW.request_id;
    END IF;
  ELSIF NEW.overall_result = 'incompatible' THEN
    UPDATE blood_inventory SET status = 'available', reserved_for_request_id = NULL
      WHERE id = NEW.unit_id AND reserved_for_request_id = NEW.request_id AND status IN ('cross_matched','reserved');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_unit_on_cross_match ON public.cross_match_tests;
CREATE TRIGGER trg_sync_unit_on_cross_match AFTER INSERT OR UPDATE OF overall_result ON public.cross_match_tests
  FOR EACH ROW EXECUTE FUNCTION public.sync_unit_on_cross_match();

-- 6. Atomic issue with billing
CREATE OR REPLACE FUNCTION public.issue_blood_units(_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
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
      WHEN 'fresh_frozen_plasma' THEN 'Fresh Frozen Plasma' WHEN 'platelet_concentrate' THEN 'Platelet'
      WHEN 'cryoprecipitate' THEN 'Cryoprecipitate' ELSE 'Granulocytes' END;
    SELECT default_price INTO v_price FROM service_types
      WHERE organization_id = r.organization_id AND is_active IS NOT FALSE AND name ILIKE '%' || v_label || '%'
      ORDER BY (category::text ILIKE '%blood%') DESC LIMIT 1;
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
    status = 'issued', issued_at = now(), issued_by = auth.uid() WHERE id = _request_id;

  RETURN jsonb_build_object('issued', v_issued, 'invoice_id', v_invoice, 'total', v_total);
END $$;
GRANT EXECUTE ON FUNCTION public.issue_blood_units(uuid) TO authenticated;

-- 7. Transfusion status -> unit, request, thalassemia
CREATE OR REPLACE FUNCTION public.sync_on_transfusion_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_open int; v_req record;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  IF NEW.status = 'in_progress' THEN
    UPDATE blood_inventory SET status = 'issued' WHERE id = NEW.unit_id AND status IN ('cross_matched','reserved','available');
  ELSIF NEW.status = 'completed' THEN
    UPDATE blood_inventory SET status = 'transfused' WHERE id = NEW.unit_id;
    IF NEW.patient_id IS NOT NULL
       AND EXISTS (SELECT 1 FROM thalassemia_profiles WHERE patient_id = NEW.patient_id)
       AND NOT EXISTS (SELECT 1 FROM thalassemia_visits WHERE transfusion_id = NEW.id) THEN
      INSERT INTO thalassemia_visits (organization_id, branch_id, patient_id, visit_date, status, units_given, transfusion_id, notes)
      VALUES (NEW.organization_id, NEW.branch_id, NEW.patient_id, COALESCE(NEW.completed_at, now())::date, 'completed', 1, NEW.id,
        'From Blood Bank transfusion ' || NEW.transfusion_number);
    END IF;
  ELSIF NEW.status = 'stopped' THEN
    UPDATE blood_inventory SET status = 'discarded', discard_reason = 'transfusion_reaction', discarded_at = now(), discarded_by = auth.uid()
      WHERE id = NEW.unit_id;
  END IF;
  IF NEW.status IN ('completed','stopped','cancelled') AND NEW.request_id IS NOT NULL THEN
    SELECT * INTO v_req FROM blood_requests WHERE id = NEW.request_id;
    SELECT count(*) INTO v_open FROM blood_transfusions WHERE request_id = NEW.request_id AND status IN ('scheduled','in_progress');
    IF v_open = 0 AND COALESCE(v_req.units_issued,0) >= v_req.units_requested AND v_req.status = 'issued' THEN
      UPDATE blood_requests SET status = 'completed' WHERE id = NEW.request_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_on_transfusion_status ON public.blood_transfusions;
CREATE TRIGGER trg_sync_on_transfusion_status AFTER UPDATE OF status ON public.blood_transfusions
  FOR EACH ROW EXECUTE FUNCTION public.sync_on_transfusion_status();

-- 8. Reaction stops transfusion and alerts the doctor
CREATE OR REPLACE FUNCTION public.on_transfusion_reaction()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE t record;
BEGIN
  SELECT * INTO t FROM blood_transfusions WHERE id = NEW.transfusion_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF t.status IN ('scheduled','in_progress') THEN
    UPDATE blood_transfusions SET status = 'stopped', stopped_at = now(),
      stop_reason = 'Reaction: ' || COALESCE(NEW.reaction_type,'unspecified') WHERE id = t.id;
  END IF;
  INSERT INTO clinical_alerts (organization_id, branch_id, patient_id, alert_type, severity, message, context, source_table, source_id, created_by)
  VALUES (t.organization_id, t.branch_id, t.patient_id, 'transfusion_reaction',
    CASE WHEN NEW.severity::text IN ('severe','life_threatening','fatal') THEN 'critical' ELSE 'high' END,
    'Transfusion reaction (' || COALESCE(NEW.reaction_type,'') || ') on ' || COALESCE(t.transfusion_number,''),
    jsonb_build_object('severity', NEW.severity, 'transfusion_id', t.id), 'transfusion_reactions', NEW.id, NEW.reported_by);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_on_transfusion_reaction ON public.transfusion_reactions;
CREATE TRIGGER trg_on_transfusion_reaction AFTER INSERT ON public.transfusion_reactions
  FOR EACH ROW EXECUTE FUNCTION public.on_transfusion_reaction();

-- 9. Daily expiry
CREATE OR REPLACE FUNCTION public.expire_blood_units()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  UPDATE blood_inventory SET status = 'expired', discard_reason = 'expired', discarded_at = now()
   WHERE expiry_date < CURRENT_DATE AND status IN ('quarantine','available','reserved','cross_matched');
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.expire_blood_units() FROM PUBLIC, anon, authenticated;
SELECT cron.unschedule('expire-blood-units') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-blood-units');
SELECT cron.schedule('expire-blood-units', '15 0 * * *', 'SELECT public.expire_blood_units()');
SELECT public.expire_blood_units();

-- 10. Recall view: no cross-hospital match
CREATE OR REPLACE VIEW public.blood_donor_recall_candidates WITH (security_invoker = true) AS
 SELECT d.id AS donor_id, d.organization_id, d.branch_id, d.donor_number, d.first_name, d.last_name, d.phone, d.email,
    d.blood_group, d.last_donation_date, d.total_donations, d.status,
    CASE WHEN d.last_donation_date IS NULL THEN NULL::date ELSE d.last_donation_date + 56 END AS eligible_from,
    CASE WHEN d.last_donation_date IS NULL THEN 9999 ELSE GREATEST(0, CURRENT_DATE - (d.last_donation_date + 56)) END AS days_since_eligible,
    inv.available_units, inv.low_stock
   FROM blood_donors d
     LEFT JOIN LATERAL ( SELECT (count(*) FILTER (WHERE bi.status = 'available'))::integer AS available_units,
            count(*) FILTER (WHERE bi.status = 'available') < 5 AS low_stock
           FROM blood_inventory bi
          WHERE bi.blood_group = d.blood_group AND bi.organization_id = d.organization_id) inv ON true
  WHERE d.status = 'active' AND (d.deferral_until IS NULL OR d.deferral_until <= CURRENT_DATE)
    AND (d.last_donation_date IS NULL OR d.last_donation_date + 56 <= CURRENT_DATE);

-- 11. Route BB- invoices to Blood Bank revenue
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  v_journal_id UUID; v_entry_number TEXT; v_revenue_account_id UUID; v_ar_account_id UUID; v_tax_account_id UUID;
  v_discount_account_id UUID; v_insurance_ar_account_id UUID; v_net_revenue NUMERIC; v_patient_ar NUMERIC;
  v_insurance_ar NUMERIC; v_description TEXT; v_department TEXT;
BEGIN
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN RETURN NEW; END IF;
  IF COALESCE(NEW.total_amount, 0) = 0 THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_id = NEW.id AND reference_type = 'invoice') THEN RETURN NEW; END IF;

  v_department := CASE
    WHEN NEW.invoice_number LIKE 'IPD-%' THEN 'IPD'
    WHEN NEW.invoice_number LIKE 'LAB-%' THEN 'Laboratory'
    WHEN NEW.invoice_number LIKE 'RAD-%' THEN 'Radiology'
    WHEN NEW.invoice_number LIKE 'PHARM-%' THEN 'Pharmacy'
    WHEN NEW.invoice_number LIKE 'ER-%' THEN 'Emergency'
    WHEN NEW.invoice_number LIKE 'BB-%' THEN 'Blood Bank'
    ELSE 'OPD' END;

  v_revenue_account_id := get_or_create_default_account(NEW.organization_id,
    CASE v_department WHEN 'IPD' THEN 'IPD-REV-001' WHEN 'Laboratory' THEN 'LAB-REV-001' WHEN 'Radiology' THEN 'RAD-REV-001'
      WHEN 'Pharmacy' THEN 'PHARM-REV-001' WHEN 'Emergency' THEN 'ER-REV-001' WHEN 'Blood Bank' THEN 'BB-REV-001' ELSE 'OPD-REV-001' END,
    CASE v_department WHEN 'IPD' THEN 'IPD Revenue' WHEN 'Laboratory' THEN 'Laboratory Revenue' WHEN 'Radiology' THEN 'Radiology Revenue'
      WHEN 'Pharmacy' THEN 'Pharmacy Revenue' WHEN 'Emergency' THEN 'Emergency Revenue' WHEN 'Blood Bank' THEN 'Blood Bank Revenue' ELSE 'OPD Revenue' END,
    'revenue');

  v_ar_account_id := get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  v_net_revenue := COALESCE(NEW.subtotal, NEW.total_amount) - COALESCE(NEW.discount_amount, 0);
  v_insurance_ar := COALESCE(NEW.insurance_amount, 0);
  v_patient_ar := NEW.total_amount - v_insurance_ar;
  v_entry_number := 'JE-INV-' || SUBSTRING(NEW.id::text, 1, 8);
  v_description := 'Invoice ' || COALESCE(NEW.invoice_number, NEW.id::text) || ' - ' || v_department;

  INSERT INTO journal_entries (organization_id, branch_id, entry_number, entry_date, description,
    reference_type, reference_id, is_posted, posted_at, status, created_by)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, COALESCE(NEW.invoice_date, CURRENT_DATE),
    v_description, 'invoice', NEW.id, true, now(), 'posted', COALESCE(NEW.created_by, auth.uid()))
  RETURNING id INTO v_journal_id;

  IF v_patient_ar > 0 THEN
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_ar_account_id, v_patient_ar, 0, 'Patient AR - ' || COALESCE(NEW.invoice_number, ''));
  END IF;
  IF v_insurance_ar > 0 THEN
    v_insurance_ar_account_id := get_or_create_default_account(NEW.organization_id, 'AR-INS-001', 'Insurance Receivables', 'asset');
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_insurance_ar_account_id, v_insurance_ar, 0, 'Insurance AR - ' || COALESCE(NEW.invoice_number, ''));
  END IF;
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
  VALUES (v_journal_id, v_revenue_account_id, 0, v_net_revenue, v_department || ' Revenue - ' || COALESCE(NEW.invoice_number, ''));
  IF COALESCE(NEW.tax_amount, 0) > 0 THEN
    v_tax_account_id := get_or_create_default_account(NEW.organization_id, 'TAX-PAY-001', 'Tax Payable', 'liability');
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_tax_account_id, 0, NEW.tax_amount, 'Tax - ' || COALESCE(NEW.invoice_number, ''));
  END IF;
  IF COALESCE(NEW.discount_amount, 0) > 0 THEN
    v_discount_account_id := get_or_create_default_account(NEW.organization_id, 'DISC-001', 'Discounts Allowed', 'expense');
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_discount_account_id, NEW.discount_amount, 0, 'Discount - ' || COALESCE(NEW.invoice_number, ''));
  END IF;
  RETURN NEW;
END;
$function$;

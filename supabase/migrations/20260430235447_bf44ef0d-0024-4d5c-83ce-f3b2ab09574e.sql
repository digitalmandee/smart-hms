
-- =====================================================================
-- Phase 5: Clinical Safety Triggers
-- =====================================================================

-- Helper: case-insensitive allergy check
CREATE OR REPLACE FUNCTION public.check_drug_allergy(
  p_patient_id uuid,
  p_drug_name text
) RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allergies text;
  v_token text;
BEGIN
  IF p_patient_id IS NULL OR p_drug_name IS NULL OR length(trim(p_drug_name)) = 0 THEN
    RETURN false;
  END IF;

  SELECT COALESCE(allergies, '') INTO v_allergies
  FROM public.patients WHERE id = p_patient_id;

  IF v_allergies IS NULL OR length(trim(v_allergies)) = 0 THEN
    RETURN false;
  END IF;

  -- Match if any comma/semicolon-delimited allergy token appears in drug name (or vice-versa)
  FOR v_token IN
    SELECT trim(t) FROM unnest(regexp_split_to_array(v_allergies, '[,;]+')) AS t
  LOOP
    IF length(v_token) >= 3 AND (
      lower(p_drug_name) LIKE '%' || lower(v_token) || '%'
      OR lower(v_token) LIKE '%' || lower(p_drug_name) || '%'
    ) THEN
      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_drug_allergy(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_drug_allergy(uuid, text) TO authenticated;

-- Allergy hard-stop trigger for medications table
CREATE OR REPLACE FUNCTION public.trg_block_allergic_medication()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_drug_name text;
BEGIN
  v_drug_name := COALESCE(NEW.medication_name, NEW.drug_name, NEW.name);

  IF NEW.patient_id IS NOT NULL AND v_drug_name IS NOT NULL THEN
    IF public.check_drug_allergy(NEW.patient_id, v_drug_name) THEN
      -- Log the alert
      INSERT INTO public.clinical_alerts (
        patient_id, alert_type, severity, message, source_table, source_id, created_at
      ) VALUES (
        NEW.patient_id, 'allergy_block', 'critical',
        'Blocked prescription of ' || v_drug_name || ' due to recorded patient allergy.',
        TG_TABLE_NAME, NEW.id, now()
      );
      RAISE EXCEPTION 'ALLERGY_HARD_STOP: Patient is allergic to %, prescription blocked.', v_drug_name
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trg_block_allergic_medication() FROM PUBLIC, anon, authenticated;

-- Attach to medications table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='medications') THEN
    DROP TRIGGER IF EXISTS clinical_allergy_hard_stop ON public.medications;
    -- Only attach if expected columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='medications' AND column_name='patient_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='medications'
                     AND column_name IN ('medication_name','drug_name','name')) THEN
      EXECUTE 'CREATE TRIGGER clinical_allergy_hard_stop
        BEFORE INSERT OR UPDATE ON public.medications
        FOR EACH ROW EXECUTE FUNCTION public.trg_block_allergic_medication()';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='prescription_items') THEN
    DROP TRIGGER IF EXISTS clinical_allergy_hard_stop ON public.prescription_items;
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='prescription_items' AND column_name='patient_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='prescription_items'
                     AND column_name IN ('medication_name','drug_name','name')) THEN
      EXECUTE 'CREATE TRIGGER clinical_allergy_hard_stop
        BEFORE INSERT OR UPDATE ON public.prescription_items
        FOR EACH ROW EXECUTE FUNCTION public.trg_block_allergic_medication()';
    END IF;
  END IF;
END $$;

-- =====================================================================
-- Critical lab value alerting
-- =====================================================================
CREATE OR REPLACE FUNCTION public.trg_critical_lab_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_value numeric;
  v_low numeric;
  v_high numeric;
  v_critical boolean := false;
  v_msg text;
BEGIN
  -- Only proceed if numeric value parseable
  BEGIN
    v_value := NEW.result_value::numeric;
  EXCEPTION WHEN others THEN
    RETURN NEW;
  END;

  v_low := NULLIF(NEW.reference_range_low, '')::numeric;
  v_high := NULLIF(NEW.reference_range_high, '')::numeric;

  IF v_low IS NOT NULL AND v_value < v_low * 0.5 THEN
    v_critical := true;
    v_msg := 'CRITICAL LOW: ' || COALESCE(NEW.test_name, 'lab') || ' = ' || v_value::text
             || ' (ref low ' || v_low::text || ')';
  ELSIF v_high IS NOT NULL AND v_value > v_high * 2.0 THEN
    v_critical := true;
    v_msg := 'CRITICAL HIGH: ' || COALESCE(NEW.test_name, 'lab') || ' = ' || v_value::text
             || ' (ref high ' || v_high::text || ')';
  END IF;

  IF v_critical THEN
    INSERT INTO public.clinical_alerts (
      patient_id, alert_type, severity, message, source_table, source_id, created_at
    ) VALUES (
      NEW.patient_id, 'critical_lab_value', 'critical', v_msg, 'lab_results', NEW.id, now()
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trg_critical_lab_alert() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='lab_results') THEN
    -- Verify columns we depend on
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='lab_results' AND column_name='result_value')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='lab_results' AND column_name='patient_id') THEN
      DROP TRIGGER IF EXISTS clinical_critical_lab_alert ON public.lab_results;
      EXECUTE 'CREATE TRIGGER clinical_critical_lab_alert
        AFTER INSERT OR UPDATE OF result_value ON public.lab_results
        FOR EACH ROW EXECUTE FUNCTION public.trg_critical_lab_alert()';
    END IF;
  END IF;
END $$;

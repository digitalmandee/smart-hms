
CREATE OR REPLACE FUNCTION public.auto_create_doctor_earnings()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
  item RECORD;
  comp_plan RECORD;
  share_pct NUMERIC;
  v_source_type TEXT;
  v_doctor_id UUID;
  v_doctor_share NUMERIC;
  v_hospital_share NUMERIC;
BEGIN
  SELECT * INTO inv FROM public.invoices WHERE id = NEW.invoice_id;
  IF NOT FOUND OR inv.status != 'paid' THEN RETURN NEW; END IF;

  FOR item IN SELECT * FROM public.invoice_items WHERE invoice_id = NEW.invoice_id
  LOOP
    v_doctor_id := item.doctor_id;
    IF v_doctor_id IS NULL THEN
      SELECT a.doctor_id INTO v_doctor_id FROM public.appointments a
      WHERE a.invoice_id = inv.id AND a.doctor_id IS NOT NULL LIMIT 1;
    END IF;
    IF v_doctor_id IS NULL THEN CONTINUE; END IF;

    v_source_type := NULL;
    IF item.description ILIKE '%consultation%' THEN
      v_source_type := 'consultation';
    ELSIF item.description ILIKE ANY(ARRAY['%lab%','%test%','%pathology%','%blood test%','%urine test%','%culture%','%biopsy%']) THEN
      v_source_type := 'lab_referral';
    ELSIF item.description ILIKE ANY(ARRAY['%radiology%','%imaging%','%x-ray%','%xray%','%ultrasound%','%ct scan%','%mri%','%echo%','%mammograph%']) THEN
      v_source_type := 'radiology_referral';
    ELSIF item.description ILIKE '%procedure%' THEN
      v_source_type := 'procedure';
    ELSIF item.description ILIKE ANY(ARRAY['%surgery%','%operation%','%surgical%']) THEN
      v_source_type := 'surgery';
    END IF;

    IF v_source_type IS NULL THEN CONTINUE; END IF;

    SELECT * INTO comp_plan FROM public.doctor_compensation_plans
    WHERE doctor_id = v_doctor_id AND is_active = true LIMIT 1;

    share_pct := 0;
    IF FOUND THEN
      share_pct := CASE v_source_type
        WHEN 'consultation' THEN COALESCE(comp_plan.consultation_share_percent, 0)
        WHEN 'lab_referral' THEN COALESCE(comp_plan.lab_referral_percent, 0)
        WHEN 'radiology_referral' THEN COALESCE(comp_plan.radiology_referral_percent, 0)
        WHEN 'procedure' THEN COALESCE(comp_plan.procedure_share_percent, 0)
        WHEN 'surgery' THEN COALESCE(comp_plan.surgery_share_percent, 0)
        ELSE 0
      END;
    END IF;

    v_doctor_share := ROUND((item.total * share_pct / 100), 2);
    v_hospital_share := item.total - v_doctor_share;

    IF NOT EXISTS (
      SELECT 1 FROM public.doctor_earnings
      WHERE source_id = inv.id::text AND doctor_id = v_doctor_id AND source_type = v_source_type
    ) THEN
      INSERT INTO public.doctor_earnings (
        doctor_id, organization_id, earning_date, source_type, source_id,
        reference_number, patient_id, gross_amount, doctor_share_percent,
        doctor_share_amount, hospital_share_amount, is_paid, notes
      ) VALUES (
        v_doctor_id, inv.organization_id, CURRENT_DATE, v_source_type, inv.id::text,
        inv.invoice_number, inv.patient_id, item.total, share_pct,
        v_doctor_share, v_hospital_share, false,
        'Auto-generated from invoice ' || inv.invoice_number || ' - ' || item.description
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

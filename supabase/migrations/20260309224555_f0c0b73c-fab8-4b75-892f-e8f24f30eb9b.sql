-- Fix: source_id is UUID, not text
CREATE OR REPLACE FUNCTION public.auto_create_doctor_earnings()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
  item RECORD;
  comp_plan RECORD;
  share_pct NUMERIC;
  share_amt NUMERIC;
  hosp_amt NUMERIC;
  v_doctor_id UUID;
BEGIN
  SELECT * INTO inv FROM public.invoices WHERE id = NEW.invoice_id;
  IF NOT FOUND OR inv.status != 'paid' THEN
    RETURN NEW;
  END IF;

  FOR item IN 
    SELECT * FROM public.invoice_items WHERE invoice_id = NEW.invoice_id
  LOOP
    v_doctor_id := item.doctor_id;

    IF v_doctor_id IS NULL THEN
      SELECT a.doctor_id INTO v_doctor_id
      FROM public.appointments a
      WHERE a.invoice_id = inv.id AND a.doctor_id IS NOT NULL
      LIMIT 1;
    END IF;

    IF v_doctor_id IS NULL THEN CONTINUE; END IF;
    IF item.description NOT ILIKE '%consultation%' THEN CONTINUE; END IF;

    SELECT * INTO comp_plan 
    FROM public.doctor_compensation_plans 
    WHERE doctor_id = v_doctor_id AND is_active = true LIMIT 1;

    IF FOUND THEN
      share_pct := COALESCE(comp_plan.consultation_share_percent, 0);
    ELSE
      share_pct := 0;
    END IF;

    share_amt := ROUND(COALESCE(item.total_price, 0) * share_pct / 100, 2);
    hosp_amt := COALESCE(item.total_price, 0) - share_amt;

    IF NOT EXISTS (
      SELECT 1 FROM public.doctor_earnings WHERE source_id = inv.id AND doctor_id = v_doctor_id
    ) THEN
      INSERT INTO public.doctor_earnings (
        organization_id, doctor_id, compensation_plan_id,
        earning_date, source_type, source_id, source_reference,
        patient_id, gross_amount, doctor_share_percent,
        doctor_share_amount, hospital_share_amount
      ) VALUES (
        inv.organization_id, v_doctor_id, comp_plan.id,
        CURRENT_DATE, 'consultation', inv.id, inv.invoice_number,
        inv.patient_id, COALESCE(item.total_price, 0), share_pct,
        share_amt, hosp_amt
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
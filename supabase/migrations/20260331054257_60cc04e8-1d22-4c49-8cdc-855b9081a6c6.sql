
-- Step 1: Drop the payment-based trigger (race condition)
DROP TRIGGER IF EXISTS trg_auto_create_doctor_earnings ON public.payments;

-- Step 2: Drop the old consultation-only trigger on invoices
DROP TRIGGER IF EXISTS trg_post_consultation_earning ON public.invoices;

-- Step 3: Drop old functions
DROP FUNCTION IF EXISTS public.auto_create_doctor_earnings();
DROP FUNCTION IF EXISTS public.post_consultation_earning();

-- Step 4: Create unified function on invoice status change
CREATE OR REPLACE FUNCTION public.unified_doctor_earnings_on_invoice_paid()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  comp_plan RECORD;
  share_pct NUMERIC;
  v_source_type TEXT;
  v_doctor_id UUID;
  v_doctor_share NUMERIC;
  v_hospital_share NUMERIC;
BEGIN
  -- Only fire when status changes to 'paid'
  IF NEW.status != 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  FOR item IN SELECT * FROM public.invoice_items WHERE invoice_id = NEW.id
  LOOP
    -- Resolve doctor: item-level first, then appointment fallback
    v_doctor_id := item.doctor_id;
    IF v_doctor_id IS NULL THEN
      SELECT a.doctor_id INTO v_doctor_id
      FROM public.appointments a
      WHERE a.invoice_id = NEW.id AND a.doctor_id IS NOT NULL
      LIMIT 1;
    END IF;
    IF v_doctor_id IS NULL THEN CONTINUE; END IF;

    -- Classify source type from description
    v_source_type := NULL;
    IF item.description ILIKE '%consultation%' THEN
      v_source_type := 'consultation';
    ELSIF item.description ILIKE ANY(ARRAY['%lab%','%test%','%pathology%','%blood test%','%urine test%','%culture%','%biopsy%','%cbc%','%hba1c%']) THEN
      v_source_type := 'lab_referral';
    ELSIF item.description ILIKE ANY(ARRAY['%radiology%','%imaging%','%x-ray%','%xray%','%ultrasound%','%ct scan%','%mri%','%echo%','%mammograph%']) THEN
      v_source_type := 'radiology_referral';
    ELSIF item.description ILIKE '%procedure%' THEN
      v_source_type := 'procedure';
    ELSIF item.description ILIKE ANY(ARRAY['%surgery%','%operation%','%surgical%']) THEN
      v_source_type := 'surgery';
    END IF;

    IF v_source_type IS NULL THEN CONTINUE; END IF;

    -- Get compensation plan
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

    v_doctor_share := ROUND((item.total_price * share_pct / 100), 2);
    v_hospital_share := item.total_price - v_doctor_share;

    -- Duplicate protection per invoice + doctor + source_type
    IF NOT EXISTS (
      SELECT 1 FROM public.doctor_earnings
      WHERE source_id = NEW.id::text AND doctor_id = v_doctor_id AND source_type = v_source_type
    ) THEN
      INSERT INTO public.doctor_earnings (
        doctor_id, organization_id, earning_date, source_type, source_id,
        source_reference, patient_id, gross_amount, doctor_share_percent,
        doctor_share_amount, hospital_share_amount, is_paid, notes
      ) VALUES (
        v_doctor_id, NEW.organization_id, CURRENT_DATE, v_source_type, NEW.id::text,
        NEW.invoice_number, NEW.patient_id, item.total_price, share_pct,
        v_doctor_share, v_hospital_share, false,
        'Auto-generated from invoice ' || NEW.invoice_number || ' - ' || item.description
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Step 5: Create the unified trigger on invoices
CREATE TRIGGER trg_unified_doctor_earnings
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.unified_doctor_earnings_on_invoice_paid();

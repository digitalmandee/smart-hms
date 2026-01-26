-- =============================================
-- FIX OPD CONSULTATION EARNING TRIGGER
-- =============================================
-- The original trigger was incorrectly referencing invoices.appointment_id
-- This fix looks up doctor via the consultations table based on patient and date

CREATE OR REPLACE FUNCTION public.post_consultation_earning()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_item RECORD;
  v_consultation RECORD;
  v_plan RECORD;
  v_share_percent DECIMAL;
  v_share_amount DECIMAL;
BEGIN
  -- Only trigger when status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Find consultation items in this invoice
    FOR v_item IN 
      SELECT ii.total_price, ii.service_type_id
      FROM invoice_items ii
      JOIN service_types st ON st.id = ii.service_type_id
      WHERE ii.invoice_id = NEW.id 
        AND st.category = 'consultation'
    LOOP
      -- Find doctor from consultations table via patient and invoice date
      SELECT c.id, c.doctor_id INTO v_consultation
      FROM consultations c
      WHERE c.patient_id = NEW.patient_id
        AND c.created_at::date = NEW.invoice_date
        AND c.doctor_id IS NOT NULL
      ORDER BY c.created_at DESC
      LIMIT 1;
      
      IF v_consultation.doctor_id IS NOT NULL THEN
        -- Get doctor's compensation plan
        SELECT * INTO v_plan 
        FROM doctor_compensation_plans 
        WHERE doctor_id = v_consultation.doctor_id 
          AND is_active = true 
        LIMIT 1;
        
        v_share_percent := COALESCE(v_plan.consultation_share_percent, 50);
        v_share_amount := v_item.total_price * (v_share_percent / 100);
        
        -- Skip if already posted for this invoice and doctor
        IF NOT EXISTS (
          SELECT 1 FROM doctor_earnings 
          WHERE source_id = NEW.id 
            AND source_type = 'consultation'
            AND doctor_id = v_consultation.doctor_id
        ) THEN
          INSERT INTO doctor_earnings (
            organization_id, doctor_id, compensation_plan_id,
            earning_date, source_type, source_id, source_reference,
            patient_id, gross_amount, doctor_share_percent, 
            doctor_share_amount, hospital_share_amount
          ) VALUES (
            NEW.organization_id, v_consultation.doctor_id, v_plan.id,
            CURRENT_DATE, 'consultation', NEW.id, NEW.invoice_number,
            NEW.patient_id, v_item.total_price, v_share_percent, 
            v_share_amount, v_item.total_price - v_share_amount
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================
-- ADD DOCTOR_ID TO IPD_CHARGES FOR VISIT TRACKING
-- =============================================
ALTER TABLE ipd_charges ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id);

-- Add comment for clarity
COMMENT ON COLUMN ipd_charges.doctor_id IS 'Doctor who performed this IPD service (for visit charges)';

-- =============================================
-- CREATE IPD VISIT EARNING TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.post_ipd_visit_earning()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admission RECORD;
  v_plan RECORD;
  v_share_percent DECIMAL;
  v_share_amount DECIMAL;
BEGIN
  -- Only for consultation/visit type charges with a doctor_id
  IF NEW.charge_type IN ('consultation', 'doctor_visit', 'visit') AND NEW.doctor_id IS NOT NULL THEN
    -- Get admission details for org_id and patient_id
    SELECT organization_id, patient_id INTO v_admission
    FROM admissions WHERE id = NEW.admission_id;
    
    IF v_admission.organization_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get compensation plan
    SELECT * INTO v_plan 
    FROM doctor_compensation_plans 
    WHERE doctor_id = NEW.doctor_id AND is_active = true 
    LIMIT 1;
    
    -- Use ipd_visit_share_percent if available, fallback to consultation_share_percent
    v_share_percent := COALESCE(v_plan.ipd_visit_share_percent, v_plan.consultation_share_percent, 50);
    v_share_amount := NEW.total_amount * (v_share_percent / 100);
    
    -- Skip if already posted for this charge
    IF NOT EXISTS (
      SELECT 1 FROM doctor_earnings 
      WHERE source_id = NEW.id 
        AND source_type = 'ipd_visit'
    ) THEN
      INSERT INTO doctor_earnings (
        organization_id, doctor_id, compensation_plan_id,
        earning_date, source_type, source_id, source_reference,
        patient_id, gross_amount, doctor_share_percent, 
        doctor_share_amount, hospital_share_amount
      ) VALUES (
        v_admission.organization_id, NEW.doctor_id, v_plan.id,
        NEW.charge_date, 'ipd_visit', NEW.id, 'IPD Visit',
        v_admission.patient_id, NEW.total_amount, v_share_percent, 
        v_share_amount, NEW.total_amount - v_share_amount
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for IPD visits
DROP TRIGGER IF EXISTS trg_post_ipd_visit_earning ON ipd_charges;
CREATE TRIGGER trg_post_ipd_visit_earning
AFTER INSERT ON ipd_charges
FOR EACH ROW
EXECUTE FUNCTION post_ipd_visit_earning();
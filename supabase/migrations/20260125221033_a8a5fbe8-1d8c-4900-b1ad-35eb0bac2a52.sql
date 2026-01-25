-- Re-create the wallet automation triggers (fixes partial failure from first migration)

-- ===========================================
-- Trigger: Auto-credit earnings on consultation invoice payment
-- ===========================================
CREATE OR REPLACE FUNCTION public.post_consultation_earning()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_item RECORD;
  v_doctor_id UUID;
  v_plan RECORD;
  v_share_percent DECIMAL;
  v_share_amount DECIMAL;
BEGIN
  -- Only trigger when status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Find consultation items and their linked doctor via appointment
    FOR v_item IN 
      SELECT ii.total_price, a.doctor_id
      FROM invoice_items ii
      JOIN service_types st ON st.id = ii.service_type_id
      LEFT JOIN appointments a ON a.id = NEW.appointment_id
      WHERE ii.invoice_id = NEW.id 
        AND st.category = 'consultation'
        AND a.doctor_id IS NOT NULL
    LOOP
      -- Get doctor's compensation plan
      SELECT * INTO v_plan 
      FROM doctor_compensation_plans 
      WHERE doctor_id = v_item.doctor_id 
        AND is_active = true 
        AND effective_from <= CURRENT_DATE
        AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
      LIMIT 1;
      
      -- Default to 50% if no plan exists
      v_share_percent := COALESCE(v_plan.consultation_share_percent, 50);
      v_share_amount := v_item.total_price * (v_share_percent / 100);
      
      -- Skip if already posted for this invoice
      IF NOT EXISTS (
        SELECT 1 FROM doctor_earnings 
        WHERE source_id = NEW.id 
          AND source_type = 'consultation'
          AND doctor_id = v_item.doctor_id
      ) THEN
        -- Insert earning record
        INSERT INTO doctor_earnings (
          organization_id, doctor_id, compensation_plan_id,
          earning_date, source_type, source_id, source_reference,
          patient_id, gross_amount, doctor_share_percent, 
          doctor_share_amount, hospital_share_amount
        ) VALUES (
          NEW.organization_id, v_item.doctor_id, v_plan.id,
          CURRENT_DATE, 'consultation', NEW.id, NEW.invoice_number,
          NEW.patient_id, v_item.total_price, v_share_percent, 
          v_share_amount, v_item.total_price - v_share_amount
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for consultation earnings
DROP TRIGGER IF EXISTS trg_post_consultation_earning ON invoices;
CREATE TRIGGER trg_post_consultation_earning
AFTER UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION public.post_consultation_earning();

-- ===========================================
-- Trigger: Auto-credit earnings on surgery completion
-- ===========================================
CREATE OR REPLACE FUNCTION public.post_surgery_earnings()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_team_member RECORD;
  v_charges JSONB;
  v_plan RECORD;
  v_gross_amount DECIMAL;
  v_share_percent DECIMAL;
  v_share_amount DECIMAL;
  v_doctor_record_id UUID;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    v_charges := COALESCE(NEW.surgery_charges, '{}'::jsonb);
    
    -- Process each team member (lead surgeon, anesthetist, assistant surgeons)
    FOR v_team_member IN 
      SELECT stm.*, stm.role as team_role, p.id as profile_id
      FROM surgery_team_members stm
      JOIN profiles p ON p.id = stm.user_id
      WHERE stm.surgery_id = NEW.id
        AND stm.role IN ('lead_surgeon', 'anesthetist', 'assistant_surgeon')
        AND stm.confirmation_status = 'accepted'
    LOOP
      -- Find the doctor record for this profile
      SELECT id INTO v_doctor_record_id
      FROM doctors
      WHERE profile_id = v_team_member.profile_id
      LIMIT 1;
      
      -- Skip if no doctor record found
      IF v_doctor_record_id IS NULL THEN
        CONTINUE;
      END IF;
      
      -- Get compensation plan for this doctor
      SELECT * INTO v_plan 
      FROM doctor_compensation_plans 
      WHERE doctor_id = v_doctor_record_id 
        AND is_active = true 
      LIMIT 1;
      
      -- Determine gross amount and share based on role
      CASE v_team_member.team_role
        WHEN 'lead_surgeon' THEN
          v_gross_amount := COALESCE((v_charges->>'surgeon_fee')::decimal, 0);
          v_share_percent := COALESCE(v_plan.surgery_share_percent, 50);
        WHEN 'anesthetist' THEN
          v_gross_amount := COALESCE((v_charges->>'anesthesia_fee')::decimal, 0);
          v_share_percent := COALESCE(v_plan.anesthesia_share_percent, COALESCE(v_plan.procedure_share_percent, 50));
        WHEN 'assistant_surgeon' THEN
          -- Assistant surgeons get 20% of the surgeon fee pool
          v_gross_amount := COALESCE((v_charges->>'surgeon_fee')::decimal, 0) * 0.2;
          v_share_percent := COALESCE(v_plan.surgery_share_percent, 50);
        ELSE
          v_gross_amount := 0;
          v_share_percent := 0;
      END CASE;
      
      IF v_gross_amount > 0 THEN
        v_share_amount := v_gross_amount * (v_share_percent / 100);
        
        -- Skip if already posted for this surgery and role
        IF NOT EXISTS (
          SELECT 1 FROM doctor_earnings 
          WHERE source_id = NEW.id 
            AND source_type = 'surgery'
            AND doctor_id = v_doctor_record_id
            AND notes LIKE '%' || v_team_member.team_role || '%'
        ) THEN
          INSERT INTO doctor_earnings (
            organization_id, doctor_id, compensation_plan_id,
            earning_date, source_type, source_id, source_reference,
            patient_id, gross_amount, doctor_share_percent, 
            doctor_share_amount, hospital_share_amount, notes
          ) VALUES (
            NEW.organization_id, v_doctor_record_id, v_plan.id,
            CURRENT_DATE, 'surgery', NEW.id, NEW.surgery_number,
            NEW.patient_id, v_gross_amount, v_share_percent, 
            v_share_amount, v_gross_amount - v_share_amount,
            'Role: ' || v_team_member.team_role
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for surgery earnings
DROP TRIGGER IF EXISTS trg_post_surgery_earnings ON surgeries;
CREATE TRIGGER trg_post_surgery_earnings
AFTER UPDATE ON surgeries
FOR EACH ROW
EXECUTE FUNCTION public.post_surgery_earnings();
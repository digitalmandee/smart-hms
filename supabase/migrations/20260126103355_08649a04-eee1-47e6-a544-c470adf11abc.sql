-- Fix post_surgery_earnings function to use correct column name (staff_id instead of user_id)
CREATE OR REPLACE FUNCTION public.post_surgery_earnings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Use staff_id instead of user_id (correct column name)
    FOR v_team_member IN 
      SELECT stm.*, stm.role as team_role, p.id as profile_id
      FROM surgery_team_members stm
      JOIN profiles p ON p.id = stm.staff_id
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
$function$;
-- Add doctor_id column to invoice_items table
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.doctors(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_doctor_id ON public.invoice_items(doctor_id);

-- Update the post_consultation_earning trigger to use direct doctor_id from invoice_items
CREATE OR REPLACE FUNCTION public.post_consultation_earning()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_item RECORD;
  v_plan RECORD;
  v_share_percent DECIMAL;
  v_share_amount DECIMAL;
BEGIN
  -- Only trigger when status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Find consultation items in this invoice that have a doctor_id
    FOR v_item IN 
      SELECT ii.total_price, ii.doctor_id
      FROM invoice_items ii
      JOIN service_types st ON st.id = ii.service_type_id
      WHERE ii.invoice_id = NEW.id 
        AND st.category = 'consultation'
        AND ii.doctor_id IS NOT NULL
    LOOP
      -- Get doctor's compensation plan
      SELECT * INTO v_plan 
      FROM doctor_compensation_plans 
      WHERE doctor_id = v_item.doctor_id 
        AND is_active = true 
      LIMIT 1;
      
      v_share_percent := COALESCE(v_plan.consultation_share_percent, 50);
      v_share_amount := v_item.total_price * (v_share_percent / 100);
      
      -- Skip if already posted for this invoice and doctor
      IF NOT EXISTS (
        SELECT 1 FROM doctor_earnings 
        WHERE source_id = NEW.id 
          AND source_type = 'consultation'
          AND doctor_id = v_item.doctor_id
      ) THEN
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
    
    -- Fallback: If no doctor_id in invoice items, try the old method via consultations table
    IF NOT EXISTS (
      SELECT 1 FROM invoice_items ii
      JOIN service_types st ON st.id = ii.service_type_id
      WHERE ii.invoice_id = NEW.id 
        AND st.category = 'consultation'
        AND ii.doctor_id IS NOT NULL
    ) THEN
      -- Old fallback logic for backwards compatibility
      FOR v_item IN 
        SELECT ii.total_price, ii.service_type_id
        FROM invoice_items ii
        JOIN service_types st ON st.id = ii.service_type_id
        WHERE ii.invoice_id = NEW.id 
          AND st.category = 'consultation'
      LOOP
        DECLARE
          v_consultation RECORD;
        BEGIN
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
        END;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
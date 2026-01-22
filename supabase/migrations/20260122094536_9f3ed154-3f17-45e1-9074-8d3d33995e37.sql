-- Phase 1: Delete orphan lab_test_templates (NULL organization_id from seed data)
DELETE FROM lab_test_templates 
WHERE organization_id IS NULL;

-- Phase 2: Sync lab_test_templates prices from linked service_types
UPDATE lab_test_templates lt
SET price = st.default_price
FROM service_types st
WHERE lt.service_type_id = st.id
  AND COALESCE(lt.price, 0) != COALESCE(st.default_price, 0);

-- Phase 3: Update trigger function to sync is_active status as well
CREATE OR REPLACE FUNCTION sync_service_type_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync to imaging_procedures (radiology)
  IF NEW.category = 'radiology' THEN
    UPDATE imaging_procedures 
    SET base_price = NEW.default_price,
        is_active = NEW.is_active
    WHERE service_type_id = NEW.id;
  END IF;
  
  -- Sync to ipd_bed_types (room charges)
  IF NEW.category = 'room' THEN
    UPDATE ipd_bed_types 
    SET daily_rate = NEW.default_price,
        is_active = NEW.is_active
    WHERE service_type_id = NEW.id;
  END IF;
  
  -- Sync to lab_test_templates (lab tests)
  IF NEW.category = 'lab' THEN
    UPDATE lab_test_templates 
    SET price = NEW.default_price
    WHERE service_type_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
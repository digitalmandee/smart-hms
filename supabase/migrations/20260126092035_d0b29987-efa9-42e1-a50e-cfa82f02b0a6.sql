-- Create sync trigger: when compensation plan base_salary changes, update employee_salaries
CREATE OR REPLACE FUNCTION sync_doctor_base_salary_to_employee()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id UUID;
  v_org_id UUID;
BEGIN
  -- Get employee_id from doctors table
  SELECT employee_id INTO v_employee_id
  FROM doctors
  WHERE id = NEW.doctor_id;
  
  -- Skip if doctor has no employee link
  IF v_employee_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- When compensation plan base_salary is set, update employee_salaries
  IF NEW.base_salary IS NOT NULL AND NEW.base_salary > 0 THEN
    -- Check if employee has a current salary record
    IF EXISTS (
      SELECT 1 FROM employee_salaries 
      WHERE employee_id = v_employee_id AND is_current = true
    ) THEN
      -- Update existing current salary (no updated_at column exists)
      UPDATE employee_salaries
      SET basic_salary = NEW.base_salary
      WHERE employee_id = v_employee_id
        AND is_current = true;
    ELSE
      -- Get organization_id for insert
      SELECT organization_id INTO v_org_id FROM doctors WHERE id = NEW.doctor_id;
      
      -- Create new salary record from compensation plan
      INSERT INTO employee_salaries (
        employee_id, basic_salary, effective_from, is_current
      )
      VALUES (
        v_employee_id,
        NEW.base_salary,
        COALESCE(NEW.effective_from, CURRENT_DATE),
        true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS trg_sync_doctor_compensation_salary ON doctor_compensation_plans;
CREATE TRIGGER trg_sync_doctor_compensation_salary
AFTER INSERT OR UPDATE OF base_salary ON doctor_compensation_plans
FOR EACH ROW EXECUTE FUNCTION sync_doctor_base_salary_to_employee();

-- Seed missing compensation plans for doctors who have employee_salaries but no plans
INSERT INTO doctor_compensation_plans (
  organization_id, doctor_id, plan_type, base_salary,
  consultation_share_percent, procedure_share_percent, surgery_share_percent,
  effective_from, is_active
)
SELECT 
  d.organization_id,
  d.id,
  'hybrid',
  COALESCE(es.basic_salary, 0),
  50, -- Default consultation share
  40, -- Default procedure share
  50, -- Default surgery share
  CURRENT_DATE,
  true
FROM doctors d
JOIN employees e ON e.id = d.employee_id
LEFT JOIN employee_salaries es ON es.employee_id = e.id AND es.is_current = true
LEFT JOIN doctor_compensation_plans dcp ON dcp.doctor_id = d.id AND dcp.is_active = true
WHERE dcp.id IS NULL
  AND d.employee_id IS NOT NULL
ON CONFLICT DO NOTHING;
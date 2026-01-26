-- Link doctor record to the existing employee and fix employee name to match profile
-- This is a data fix, not a schema change

-- First update the employee name to match the profile name
UPDATE employees 
SET first_name = 'Ayesha', 
    last_name = 'Nawaz'
WHERE id = '0d54f875-d2fd-4178-adc6-09c9860bf768'
  AND profile_id = '1fbdf4c6-08ce-404a-a287-abb85d0ba49f';

-- Link the doctor record to the employee
UPDATE doctors 
SET employee_id = '0d54f875-d2fd-4178-adc6-09c9860bf768'
WHERE id = 'd1111111-1111-1111-1111-111111111111'
  AND employee_id IS NULL;
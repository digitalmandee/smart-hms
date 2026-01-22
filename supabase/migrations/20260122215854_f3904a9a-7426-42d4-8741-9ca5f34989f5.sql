-- =====================================================
-- SEED HR DATA: Employee Categories, Salary Structures, and Salary Records
-- =====================================================

-- 1. INSERT EMPLOYEE CATEGORIES for all organizations that have employees
INSERT INTO employee_categories (organization_id, name, code, color, default_working_hours, overtime_eligible, requires_license, is_active)
SELECT 
  org.id as organization_id,
  cat.name,
  cat.code,
  cat.color,
  cat.default_working_hours,
  cat.overtime_eligible,
  cat.requires_license,
  true
FROM (
  SELECT DISTINCT organization_id as id FROM employees
) org
CROSS JOIN (
  VALUES 
    ('Doctor', 'DOC', '#3B82F6', 8.0, false, true),
    ('Nurse', 'NRS', '#10B981', 8.0, true, true),
    ('Lab Technician', 'LAB', '#8B5CF6', 8.0, true, true),
    ('Pharmacist', 'PHR', '#F59E0B', 8.0, true, true),
    ('Radiology Technician', 'RAD', '#EC4899', 8.0, true, true),
    ('Administrative', 'ADM', '#6B7280', 8.0, true, false),
    ('Support Staff', 'SUP', '#78716C', 8.0, true, false),
    ('Finance', 'FIN', '#14B8A6', 8.0, false, false),
    ('HR', 'HRM', '#F97316', 8.0, false, false),
    ('Paramedical', 'PAR', '#06B6D4', 8.0, true, true)
) AS cat(name, code, color, default_working_hours, overtime_eligible, requires_license)
ON CONFLICT DO NOTHING;

-- 2. INSERT SALARY STRUCTURES for all organizations that have employees
INSERT INTO salary_structures (organization_id, name, description, base_salary_min, base_salary_max, components, is_active)
SELECT 
  org.id as organization_id,
  ss.name,
  ss.description,
  ss.base_salary_min,
  ss.base_salary_max,
  ss.components::jsonb,
  true
FROM (
  SELECT DISTINCT organization_id as id FROM employees
) org
CROSS JOIN (
  VALUES 
    ('Doctor Basic', 'Basic salary structure for doctors', 100000, 500000, '{"basic_percent": 50, "hra_percent": 20, "medical_percent": 10, "conveyance_percent": 10, "special_percent": 10}'),
    ('Nurse Basic', 'Basic salary structure for nursing staff', 30000, 80000, '{"basic_percent": 50, "hra_percent": 20, "medical_percent": 10, "conveyance_percent": 10, "special_percent": 10}'),
    ('Staff Basic', 'Basic salary structure for general staff', 20000, 60000, '{"basic_percent": 50, "hra_percent": 20, "medical_percent": 10, "conveyance_percent": 10, "special_percent": 10}'),
    ('Admin Basic', 'Basic salary structure for admin staff', 25000, 70000, '{"basic_percent": 50, "hra_percent": 20, "medical_percent": 10, "conveyance_percent": 10, "special_percent": 10}')
) AS ss(name, description, base_salary_min, base_salary_max, components)
ON CONFLICT DO NOTHING;

-- 3. UPDATE EMPLOYEES: Assign categories based on department name
UPDATE employees e
SET category_id = ec.id
FROM employee_categories ec, departments d
WHERE e.department_id = d.id
  AND e.organization_id = ec.organization_id
  AND e.category_id IS NULL
  AND (
    (LOWER(d.name) LIKE '%nurs%' AND ec.code = 'NRS') OR
    (LOWER(d.name) LIKE '%lab%' AND ec.code = 'LAB') OR
    (LOWER(d.name) LIKE '%pharm%' AND ec.code = 'PHR') OR
    (LOWER(d.name) LIKE '%radiol%' AND ec.code = 'RAD') OR
    (LOWER(d.name) LIKE '%admin%' AND ec.code = 'ADM') OR
    (LOWER(d.name) LIKE '%finance%' AND ec.code = 'FIN') OR
    (LOWER(d.name) LIKE '%account%' AND ec.code = 'FIN') OR
    (LOWER(d.name) LIKE '%human resource%' AND ec.code = 'HRM') OR
    (LOWER(d.name) LIKE '%hr%' AND ec.code = 'HRM') OR
    (LOWER(d.name) LIKE '%support%' AND ec.code = 'SUP') OR
    (LOWER(d.name) LIKE '%housekeep%' AND ec.code = 'SUP') OR
    (LOWER(d.name) LIKE '%opd%' AND ec.code = 'ADM') OR
    (LOWER(d.name) LIKE '%front%' AND ec.code = 'ADM') OR
    (LOWER(d.name) LIKE '%reception%' AND ec.code = 'ADM')
  );

-- 4. For remaining employees without categories, assign default Administrative category
UPDATE employees e
SET category_id = ec.id
FROM employee_categories ec
WHERE e.organization_id = ec.organization_id
  AND e.category_id IS NULL
  AND ec.code = 'ADM';

-- 5. Assign default shift (GD24 - General Duty) to employees without shifts
UPDATE employees e
SET shift_id = s.id
FROM shifts s
WHERE e.organization_id = s.organization_id
  AND s.code = 'GD24'
  AND e.shift_id IS NULL;

-- 6. If no GD24 shift exists, assign the first available active shift
UPDATE employees e
SET shift_id = (
  SELECT id FROM shifts s 
  WHERE s.organization_id = e.organization_id 
  AND s.is_active = true 
  ORDER BY s.created_at 
  LIMIT 1
)
WHERE e.shift_id IS NULL
  AND EXISTS (
    SELECT 1 FROM shifts s 
    WHERE s.organization_id = e.organization_id 
    AND s.is_active = true
  );

-- 7. CREATE SALARY RECORDS for all employees without current salary
INSERT INTO employee_salaries (
  employee_id,
  salary_structure_id,
  basic_salary,
  effective_from,
  is_current
)
SELECT 
  e.id,
  ss.id,
  CASE 
    WHEN ec.code = 'DOC' THEN 150000
    WHEN ec.code = 'NRS' THEN 45000
    WHEN ec.code = 'PHR' THEN 55000
    WHEN ec.code = 'LAB' THEN 40000
    WHEN ec.code = 'RAD' THEN 45000
    WHEN ec.code = 'FIN' THEN 50000
    WHEN ec.code = 'HRM' THEN 45000
    WHEN ec.code = 'ADM' THEN 35000
    WHEN ec.code = 'SUP' THEN 25000
    ELSE 35000
  END as basic_salary,
  COALESCE(e.join_date, CURRENT_DATE) as effective_from,
  true
FROM employees e
LEFT JOIN employee_categories ec ON ec.id = e.category_id
CROSS JOIN LATERAL (
  SELECT id FROM salary_structures 
  WHERE organization_id = e.organization_id 
  AND name = 'Staff Basic'
  LIMIT 1
) ss
WHERE NOT EXISTS (
  SELECT 1 FROM employee_salaries es 
  WHERE es.employee_id = e.id AND es.is_current = true
);
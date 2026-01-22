-- Seed default shifts (was missed due to migration error)
INSERT INTO shifts (organization_id, name, code, start_time, end_time, color, is_active, is_night_shift, break_duration_minutes, grace_period_minutes)
SELECT 
  o.id,
  shift_data.name,
  shift_data.code,
  shift_data.start_time::TIME,
  shift_data.end_time::TIME,
  shift_data.color,
  true,
  shift_data.is_night,
  shift_data.break_mins,
  15
FROM organizations o
CROSS JOIN (VALUES
  ('General Duty (24 Hours)', 'GD24', '00:00', '23:59', '#6366f1', false, 60),
  ('Morning Shift', 'MS', '06:00', '14:00', '#f59e0b', false, 30),
  ('Evening Shift', 'ES', '14:00', '22:00', '#3b82f6', false, 30),
  ('Night Shift', 'NS', '22:00', '06:00', '#8b5cf6', true, 30),
  ('OT Duty (Day)', 'OTD', '08:00', '20:00', '#10b981', false, 60),
  ('OT Duty (Night)', 'OTN', '20:00', '08:00', '#059669', true, 60),
  ('Emergency 12hr (Day)', 'ERD', '08:00', '20:00', '#ef4444', false, 60),
  ('Emergency 12hr (Night)', 'ERN', '20:00', '08:00', '#dc2626', true, 60)
) AS shift_data(name, code, start_time, end_time, color, is_night, break_mins)
WHERE NOT EXISTS (
  SELECT 1 FROM shifts s WHERE s.organization_id = o.id AND s.code = shift_data.code
);

-- Assign all employees who don't have a current shift to General Duty (24 Hours)
INSERT INTO shift_assignments (employee_id, shift_id, effective_from, is_current)
SELECT 
  e.id,
  s.id,
  CURRENT_DATE,
  true
FROM employees e
JOIN shifts s ON s.organization_id = e.organization_id AND s.code = 'GD24'
WHERE NOT EXISTS (
  SELECT 1 FROM shift_assignments sa 
  WHERE sa.employee_id = e.id AND sa.is_current = true
);

-- Update the employee's shift_id field for quick reference
UPDATE employees e
SET shift_id = s.id
FROM shifts s
WHERE s.organization_id = e.organization_id 
  AND s.code = 'GD24'
  AND e.shift_id IS NULL;
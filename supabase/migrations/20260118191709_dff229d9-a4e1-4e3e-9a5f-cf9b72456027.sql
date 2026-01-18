-- Seed 30 days of attendance records for all employees
INSERT INTO public.attendance_records (
  organization_id, branch_id, employee_id, attendance_date, 
  check_in, check_out, status, working_hours, late_minutes
)
SELECT 
  e.organization_id,
  e.branch_id,
  e.id,
  d.date,
  CASE 
    WHEN d.day_of_week IN (0, 6) THEN NULL -- Weekend
    WHEN random() < 0.1 THEN NULL -- 10% absent
    WHEN random() < 0.3 THEN ('08:' || LPAD((floor(random() * 30) + 15)::int::text, 2, '0') || ':00')::time -- 30% late
    ELSE ('08:' || LPAD(floor(random() * 10)::int::text, 2, '0') || ':00')::time -- On time
  END as check_in,
  CASE 
    WHEN d.day_of_week IN (0, 6) THEN NULL
    WHEN random() < 0.1 THEN NULL
    ELSE ('17:' || LPAD(floor(random() * 30)::int::text, 2, '0') || ':00')::time
  END as check_out,
  CASE 
    WHEN d.day_of_week IN (0, 6) THEN 'weekend'::attendance_status
    WHEN random() < 0.05 THEN 'on_leave'::attendance_status
    WHEN random() < 0.1 THEN 'absent'::attendance_status
    WHEN random() < 0.3 THEN 'late'::attendance_status
    ELSE 'present'::attendance_status
  END,
  CASE 
    WHEN d.day_of_week IN (0, 6) THEN 0
    WHEN random() < 0.1 THEN 0
    ELSE 8 + floor(random() * 2)::numeric
  END,
  CASE 
    WHEN random() < 0.3 THEN floor(random() * 30)::int
    ELSE 0
  END
FROM public.employees e
CROSS JOIN (
  SELECT 
    (CURRENT_DATE - (n || ' days')::interval)::date as date,
    EXTRACT(DOW FROM (CURRENT_DATE - (n || ' days')::interval)) as day_of_week
  FROM generate_series(1, 30) n
) d
WHERE NOT EXISTS (
  SELECT 1 FROM attendance_records ar 
  WHERE ar.employee_id = e.id AND ar.attendance_date = d.date
)
ON CONFLICT DO NOTHING;
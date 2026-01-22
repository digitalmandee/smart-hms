-- Seed payroll_entries for existing completed payroll run
INSERT INTO payroll_entries (
  payroll_run_id, 
  employee_id, 
  basic_salary, 
  gross_salary, 
  net_salary,
  total_deductions,
  bank_name, 
  account_number, 
  total_working_days, 
  present_days,
  absent_days,
  leave_days,
  earnings, 
  deductions
)
SELECT 
  pr.id,
  e.id,
  COALESCE(es.basic_salary, 30000),
  COALESCE(es.basic_salary, 30000) as gross_salary,
  COALESCE(es.basic_salary, 30000) as net_salary,
  0 as total_deductions,
  e.bank_name,
  e.account_number,
  26 as total_working_days,
  24 as present_days,
  0 as absent_days,
  2 as leave_days,
  '[]'::jsonb as earnings,
  '[]'::jsonb as deductions
FROM payroll_runs pr
CROSS JOIN employees e
LEFT JOIN employee_salaries es ON es.employee_id = e.id AND es.is_current = true
WHERE pr.status = 'completed'
  AND e.employment_status = 'active'
ON CONFLICT (payroll_run_id, employee_id) DO NOTHING;

INSERT INTO public.salary_components (organization_id, name, code, component_type, calculation_type, percentage_of, percentage_value, is_taxable, is_statutory, affects_overtime, sort_order, is_active) VALUES
-- Earnings
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Basic Salary', 'BASIC', 'earning', 'fixed', NULL, NULL, true, false, true, 1, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'House Rent Allowance', 'HRA', 'earning', 'percentage', 'basic', 40, true, false, false, 2, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Transport Allowance', 'TRANSPORT', 'earning', 'fixed', NULL, NULL, false, false, false, 3, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Medical Allowance', 'MEDICAL', 'earning', 'fixed', NULL, NULL, false, false, false, 4, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Overtime', 'OT', 'earning', 'fixed', NULL, NULL, true, false, false, 5, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Special Allowance', 'SPECIAL', 'earning', 'fixed', NULL, NULL, true, false, false, 6, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Performance Bonus', 'PERF_BONUS', 'earning', 'fixed', NULL, NULL, true, false, false, 7, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Night Shift Allowance', 'NIGHT_SHIFT', 'earning', 'fixed', NULL, NULL, false, false, false, 8, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'On-Call Allowance', 'ON_CALL', 'earning', 'fixed', NULL, NULL, false, false, false, 9, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Education Allowance', 'EDUCATION', 'earning', 'fixed', NULL, NULL, false, false, false, 10, true),
-- Deductions
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Income Tax', 'TAX', 'deduction', 'percentage', 'gross', 0, false, true, false, 11, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Provident Fund', 'PF', 'deduction', 'percentage', 'basic', 8.33, false, true, false, 12, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'EOBI / Social Insurance', 'EOBI', 'deduction', 'fixed', NULL, NULL, false, true, false, 13, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Professional Tax', 'PROF_TAX', 'deduction', 'fixed', NULL, NULL, false, true, false, 14, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Loan Deduction', 'LOAN', 'deduction', 'fixed', NULL, NULL, false, false, false, 15, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Advance Salary', 'ADV_SAL', 'deduction', 'fixed', NULL, NULL, false, false, false, 16, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Late Deduction', 'LATE_DED', 'deduction', 'fixed', NULL, NULL, false, false, false, 17, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Absent Deduction', 'ABSENT_DED', 'deduction', 'fixed', NULL, NULL, false, false, false, 18, true);

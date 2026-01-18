-- Seed Employees (10 staff members)
INSERT INTO public.employees (
  organization_id, branch_id, employee_number, first_name, last_name, 
  date_of_birth, gender, marital_status, national_id, personal_email, personal_phone,
  current_address, department_id, designation_id, employee_type, employment_status, join_date
)
SELECT 
  'b1111111-1111-1111-1111-111111111111'::uuid,
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  emp.employee_number,
  emp.first_name,
  emp.last_name,
  emp.dob::date,
  emp.gender::gender,
  emp.marital::marital_status,
  emp.cnic,
  emp.email,
  emp.phone,
  emp.address,
  (SELECT id FROM departments WHERE name = emp.dept LIMIT 1),
  (SELECT id FROM designations WHERE name = emp.desig LIMIT 1),
  'permanent'::employee_type,
  'active'::employment_status,
  emp.join_date::date
FROM (VALUES
  ('EMP-001', 'Ahmed', 'Raza', '1985-03-15', 'male', 'married', '35201-1234567-1', 'ahmed.raza@email.com', '0321-1234567', '123 Model Town, Lahore', 'Human Resources', 'HR Manager', '2020-01-15'),
  ('EMP-002', 'Fatima', 'Khan', '1990-07-22', 'female', 'single', '35202-2345678-2', 'fatima.khan@email.com', '0333-2345678', '456 Gulberg, Lahore', 'Finance', 'Accountant', '2021-03-01'),
  ('EMP-003', 'Muhammad', 'Ali', '1988-11-08', 'male', 'married', '35203-3456789-3', 'muhammad.ali@email.com', '0345-3456789', '789 DHA, Lahore', 'Nursing', 'Nurse', '2019-06-10'),
  ('EMP-004', 'Ayesha', 'Begum', '1992-02-14', 'female', 'married', '35204-4567890-4', 'ayesha.begum@email.com', '0300-4567890', '321 Johar Town, Lahore', 'Laboratory', 'Lab Technician', '2022-01-20'),
  ('EMP-005', 'Usman', 'Shah', '1987-09-30', 'male', 'married', '35205-5678901-5', 'usman.shah@email.com', '0312-5678901', '654 Cantt, Lahore', 'Pharmacy', 'Pharmacist', '2020-08-05'),
  ('EMP-006', 'Zainab', 'Malik', '1995-04-18', 'female', 'single', '35206-6789012-6', 'zainab.malik@email.com', '0323-6789012', '987 Garden Town, Lahore', 'Administration', 'Receptionist', '2023-02-28'),
  ('EMP-007', 'Hassan', 'Iqbal', '1983-12-05', 'male', 'married', '35207-7890123-7', 'hassan.iqbal@email.com', '0334-7890123', '159 Faisal Town, Lahore', 'Finance', 'Accountant', '2018-11-12'),
  ('EMP-008', 'Sana', 'Tariq', '1991-06-25', 'female', 'single', '35208-8901234-8', 'sana.tariq@email.com', '0346-8901234', '753 Township, Lahore', 'Nursing', 'Nurse', '2021-07-15'),
  ('EMP-009', 'Bilal', 'Ahmad', '1986-01-12', 'male', 'married', '35209-9012345-9', 'bilal.ahmad@email.com', '0301-9012345', '852 Iqbal Town, Lahore', 'Laboratory', 'Lab Technician', '2019-04-22'),
  ('EMP-010', 'Amina', 'Hussain', '1993-08-07', 'female', 'married', '35210-0123456-0', 'amina.hussain@email.com', '0313-0123456', '456 Allama Iqbal Town, Lahore', 'Administration', 'Administrator', '2022-09-01')
) AS emp(employee_number, first_name, last_name, dob, gender, marital, cnic, email, phone, address, dept, desig, join_date)
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_number = emp.employee_number)
ON CONFLICT DO NOTHING;
-- Create departments for Shifa Medical Center
INSERT INTO departments (organization_id, name, code, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', name, code, true
FROM (VALUES 
  ('Medical', 'MED'),
  ('Nursing', 'NUR'),
  ('Administration', 'ADM'),
  ('Laboratory', 'LAB'),
  ('Pharmacy', 'PHR'),
  ('Human Resources', 'HR'),
  ('Finance', 'FIN')
) AS t(name, code)
WHERE NOT EXISTS (
  SELECT 1 FROM departments 
  WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' AND code = t.code
);

-- Create designations for Shifa Medical Center
INSERT INTO designations (organization_id, name, code, is_active)
SELECT 'b1111111-1111-1111-1111-111111111111', name, code, true
FROM (VALUES 
  ('Doctor', 'DOC'),
  ('Nurse', 'NUR'),
  ('Lab Technician', 'LAB'),
  ('Pharmacist', 'PHR'),
  ('HR Manager', 'HRM'),
  ('Accountant', 'ACC'),
  ('Receptionist', 'REC'),
  ('Administrator', 'ADM')
) AS t(name, code)
WHERE NOT EXISTS (
  SELECT 1 FROM designations 
  WHERE organization_id = 'b1111111-1111-1111-1111-111111111111' AND code = t.code
);
-- Phase 1: Create Role-Specific Permissions for Menu Access
INSERT INTO permissions (code, name, module, description) VALUES
-- OPD Role-specific
('opd.doctor', 'Doctor OPD Access', 'consultations', 'Access doctor-specific OPD features'),
('opd.nurse', 'Nurse Station Access', 'consultations', 'Access nurse station features'),

-- Pharmacy role-specific
('pharmacy.pharmacist', 'Pharmacist Dashboard', 'pharmacy', 'Access pharmacist-specific features'),

-- Lab role-specific  
('lab.technician', 'Lab Technician Access', 'laboratory', 'Access lab technician features'),

-- Radiology role-specific
('radiology.radiologist', 'Radiologist Access', 'radiology', 'Radiologist interpretation access'),
('radiology.technician', 'Radiology Tech Access', 'radiology', 'Radiology technician capture access'),

-- IPD role-specific
('ipd.nurse', 'IPD Nurse Station', 'ipd', 'Access IPD nursing features'),

-- HR role-specific
('hr.manager', 'HR Manager Access', 'hr', 'Full HR management access'),
('hr.officer', 'HR Officer Access', 'hr', 'HR officer operations access'),

-- Accounts role-specific
('accounts.accountant', 'Accountant Access', 'accounts', 'Accountant operations'),
('accounts.finance_manager', 'Finance Manager Access', 'accounts', 'Finance oversight'),

-- Inventory role-specific
('inventory.store_manager', 'Store Manager Access', 'inventory', 'Store management operations'),

-- Blood Bank
('blood_bank.technician', 'Blood Bank Tech Access', 'blood_bank', 'Blood bank operations'),

-- OT
('ot.technician', 'OT Technician Access', 'ot', 'OT technician operations'),

-- Emergency
('emergency.nurse', 'ER Nurse Access', 'emergency', 'ER nursing triage access'),

-- Reception
('reception.receptionist', 'Receptionist Access', 'reception', 'Front desk operations')
ON CONFLICT (code) DO NOTHING;

-- Phase 2: Assign Role-Specific Permissions to Each Role

-- Doctor gets opd.doctor permission
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'doctor', id, true, NULL FROM permissions WHERE code = 'opd.doctor'
ON CONFLICT DO NOTHING;

-- Nurse gets opd.nurse (not opd.doctor)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'nurse', id, true, NULL FROM permissions WHERE code = 'opd.nurse'
ON CONFLICT DO NOTHING;

-- IPD Nurse gets ipd.nurse and opd.nurse (works in both areas)
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ipd_nurse', id, true, NULL FROM permissions WHERE code = 'ipd.nurse'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ipd_nurse', id, true, NULL FROM permissions WHERE code = 'opd.nurse'
ON CONFLICT DO NOTHING;

-- Pharmacist gets pharmacy.pharmacist
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'pharmacist', id, true, NULL FROM permissions WHERE code = 'pharmacy.pharmacist'
ON CONFLICT DO NOTHING;

-- Lab Technician gets lab.technician
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'lab_technician', id, true, NULL FROM permissions WHERE code = 'lab.technician'
ON CONFLICT DO NOTHING;

-- Radiologist gets radiology.radiologist
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'radiologist', id, true, NULL FROM permissions WHERE code = 'radiology.radiologist'
ON CONFLICT DO NOTHING;

-- Radiology Tech gets radiology.technician
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'radiology_technician', id, true, NULL FROM permissions WHERE code = 'radiology.technician'
ON CONFLICT DO NOTHING;

-- HR Manager gets hr.manager
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'hr_manager', id, true, NULL FROM permissions WHERE code = 'hr.manager'
ON CONFLICT DO NOTHING;

-- HR Officer gets hr.officer
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'hr_officer', id, true, NULL FROM permissions WHERE code = 'hr.officer'
ON CONFLICT DO NOTHING;

-- Accountant gets accounts.accountant
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'accountant', id, true, NULL FROM permissions WHERE code = 'accounts.accountant'
ON CONFLICT DO NOTHING;

-- Finance Manager gets accounts.finance_manager
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'finance_manager', id, true, NULL FROM permissions WHERE code = 'accounts.finance_manager'
ON CONFLICT DO NOTHING;

-- Store Manager gets inventory.store_manager
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'store_manager', id, true, NULL FROM permissions WHERE code = 'inventory.store_manager'
ON CONFLICT DO NOTHING;

-- Blood Bank Tech gets blood_bank.technician
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'blood_bank_technician', id, true, NULL FROM permissions WHERE code = 'blood_bank.technician'
ON CONFLICT DO NOTHING;

-- OT Technician gets ot.technician
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ot_technician', id, true, NULL FROM permissions WHERE code = 'ot.technician'
ON CONFLICT DO NOTHING;

-- Receptionist gets reception.receptionist
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'receptionist', id, true, NULL FROM permissions WHERE code = 'reception.receptionist'
ON CONFLICT DO NOTHING;

-- Admin roles get ALL role-specific permissions
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT r.role::app_role, p.id, true, NULL
FROM permissions p
CROSS JOIN (VALUES ('super_admin'), ('org_admin'), ('branch_admin')) AS r(role)
WHERE p.code IN ('opd.doctor', 'opd.nurse', 'pharmacy.pharmacist', 'lab.technician', 
                  'radiology.radiologist', 'radiology.technician', 'ipd.nurse',
                  'hr.manager', 'hr.officer', 'accounts.accountant', 'accounts.finance_manager',
                  'inventory.store_manager', 'blood_bank.technician', 'ot.technician', 
                  'emergency.nurse', 'reception.receptionist')
ON CONFLICT DO NOTHING;

-- Phase 3: Update Menu Items with Role-Specific Permissions

-- OPD Menu Items - Doctor Dashboard only for doctors
UPDATE menu_items SET required_permission = 'opd.doctor' 
WHERE code = 'opd.doctor_dashboard';

-- OPD Menu Items - Nurse Station only for nurses
UPDATE menu_items SET required_permission = 'opd.nurse' 
WHERE code = 'opd.nurse_station';

-- Pharmacy Dashboard for pharmacists only
UPDATE menu_items SET required_permission = 'pharmacy.pharmacist' 
WHERE code = 'pharmacy_dashboard';

-- Laboratory Dashboard for lab technicians
UPDATE menu_items SET required_permission = 'lab.technician' 
WHERE code = 'lab_dashboard';

-- Radiology - different access levels
UPDATE menu_items SET required_permission = 'radiology.radiologist' 
WHERE code IN ('radiology_dashboard', 'radiology_reports');

UPDATE menu_items SET required_permission = 'radiology.technician' 
WHERE code IN ('radiology_worklist', 'radiology_capture');

-- HR Dashboard for HR roles
UPDATE menu_items SET required_permission = 'hr.manager' 
WHERE code = 'hr.dashboard';

-- Accounts for finance roles
UPDATE menu_items SET required_permission = 'accounts.accountant' 
WHERE code = 'accounts_dashboard';

-- Inventory for store managers
UPDATE menu_items SET required_permission = 'inventory.store_manager' 
WHERE code = 'inventory_dashboard';

-- Blood Bank for blood bank technicians
UPDATE menu_items SET required_permission = 'blood_bank.technician' 
WHERE code = 'blood-bank-dashboard';

-- OT for OT technicians
UPDATE menu_items SET required_permission = 'ot.technician' 
WHERE code = 'ot_dashboard';

-- IPD Nursing items for IPD nurses
UPDATE menu_items SET required_permission = 'ipd.nurse' 
WHERE code IN ('ipd.care.nursing', 'ipd.care.vitals', 'ipd.care.emar', 'ipd.care.medications');

-- Reception for receptionists
UPDATE menu_items SET required_permission = 'reception.receptionist' 
WHERE code = 'reception_dashboard';
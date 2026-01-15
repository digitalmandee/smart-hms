-- Add unique constraint on user_roles to prevent duplicate role assignments
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);

-- Now assign roles to demo users using their profile IDs

-- Super Admin
INSERT INTO user_roles (user_id, role)
VALUES ('8a6259a3-64f0-48c6-bb0c-3a16eba948de', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Org Admin
INSERT INTO user_roles (user_id, role)
VALUES ('8812e69e-d65a-4a98-99c4-c3e172ff7368', 'org_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Branch Admin
INSERT INTO user_roles (user_id, role)
VALUES ('fb611847-34a8-418a-8b07-cfc80602ac81', 'branch_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Doctor
INSERT INTO user_roles (user_id, role)
VALUES ('1fbdf4c6-08ce-404a-a287-abb85d0ba49f', 'doctor')
ON CONFLICT (user_id, role) DO NOTHING;

-- Nurse
INSERT INTO user_roles (user_id, role)
VALUES ('0ef565b0-8a15-4101-90c3-f7622371874d', 'nurse')
ON CONFLICT (user_id, role) DO NOTHING;

-- Receptionist
INSERT INTO user_roles (user_id, role)
VALUES ('71be585d-01ca-4f6f-94b7-70382ba8ab56', 'receptionist')
ON CONFLICT (user_id, role) DO NOTHING;

-- Pharmacist
INSERT INTO user_roles (user_id, role)
VALUES ('3b11c8bd-c683-4930-98dd-c449993f77e3', 'pharmacist')
ON CONFLICT (user_id, role) DO NOTHING;

-- Lab Technician
INSERT INTO user_roles (user_id, role)
VALUES ('dead0b9e-6cdf-40c1-9136-d631daa7a6c8', 'lab_technician')
ON CONFLICT (user_id, role) DO NOTHING;

-- Accountant
INSERT INTO user_roles (user_id, role)
VALUES ('3391ffbc-dd26-4b84-91d3-e49956708478', 'accountant')
ON CONFLICT (user_id, role) DO NOTHING;
-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- PART 1: CREATE DEMO AUTH USERS
-- =====================================================

-- Clean up existing demo data first (if re-running)
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@smarthms.demo'
);
DELETE FROM auth.users WHERE email LIKE '%@smarthms.demo';

-- Create demo users with encrypted passwords
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES
  -- Super Admin
  ('00000000-0000-0000-0000-000000000000', 
   'a1111111-1111-1111-1111-111111111111', 
   'authenticated', 'authenticated', 
   'superadmin@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Bilal Ahmed Khan"}',
   now(), now(), '', ''),
  -- Org Admin
  ('00000000-0000-0000-0000-000000000000',
   'a2222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated',
   'orgadmin@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Fatima Zahra Malik"}',
   now(), now(), '', ''),
  -- Branch Admin
  ('00000000-0000-0000-0000-000000000000',
   'a3333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated',
   'branchadmin@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Usman Ali Shah"}',
   now(), now(), '', ''),
  -- Doctor
  ('00000000-0000-0000-0000-000000000000',
   'a4444444-4444-4444-4444-444444444444',
   'authenticated', 'authenticated',
   'doctor@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Dr. Ayesha Siddiqui"}',
   now(), now(), '', ''),
  -- Nurse
  ('00000000-0000-0000-0000-000000000000',
   'a5555555-5555-5555-5555-555555555555',
   'authenticated', 'authenticated',
   'nurse@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Sana Riaz"}',
   now(), now(), '', ''),
  -- Receptionist
  ('00000000-0000-0000-0000-000000000000',
   'a6666666-6666-6666-6666-666666666666',
   'authenticated', 'authenticated',
   'receptionist@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Hira Nawaz"}',
   now(), now(), '', ''),
  -- Pharmacist
  ('00000000-0000-0000-0000-000000000000',
   'a7777777-7777-7777-7777-777777777777',
   'authenticated', 'authenticated',
   'pharmacist@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Kamran Hussain"}',
   now(), now(), '', ''),
  -- Lab Technician
  ('00000000-0000-0000-0000-000000000000',
   'a8888888-8888-8888-8888-888888888888',
   'authenticated', 'authenticated',
   'labtech@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Zainab Iqbal"}',
   now(), now(), '', ''),
  -- Accountant
  ('00000000-0000-0000-0000-000000000000',
   'a9999999-9999-9999-9999-999999999999',
   'authenticated', 'authenticated',
   'accountant@smarthms.demo',
   crypt('Demo@123', gen_salt('bf')),
   now(),
   '{"provider": "email", "providers": ["email"]}',
   '{"full_name": "Tariq Mahmood"}',
   now(), now(), '', '');

-- Create identities for email login
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 
   '{"sub": "a1111111-1111-1111-1111-111111111111", "email": "superadmin@smarthms.demo"}',
   'email', 'a1111111-1111-1111-1111-111111111111', now(), now(), now()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222',
   '{"sub": "a2222222-2222-2222-2222-222222222222", "email": "orgadmin@smarthms.demo"}',
   'email', 'a2222222-2222-2222-2222-222222222222', now(), now(), now()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333',
   '{"sub": "a3333333-3333-3333-3333-333333333333", "email": "branchadmin@smarthms.demo"}',
   'email', 'a3333333-3333-3333-3333-333333333333', now(), now(), now()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444',
   '{"sub": "a4444444-4444-4444-4444-444444444444", "email": "doctor@smarthms.demo"}',
   'email', 'a4444444-4444-4444-4444-444444444444', now(), now(), now()),
  (gen_random_uuid(), 'a5555555-5555-5555-5555-555555555555',
   '{"sub": "a5555555-5555-5555-5555-555555555555", "email": "nurse@smarthms.demo"}',
   'email', 'a5555555-5555-5555-5555-555555555555', now(), now(), now()),
  (gen_random_uuid(), 'a6666666-6666-6666-6666-666666666666',
   '{"sub": "a6666666-6666-6666-6666-666666666666", "email": "receptionist@smarthms.demo"}',
   'email', 'a6666666-6666-6666-6666-666666666666', now(), now(), now()),
  (gen_random_uuid(), 'a7777777-7777-7777-7777-777777777777',
   '{"sub": "a7777777-7777-7777-7777-777777777777", "email": "pharmacist@smarthms.demo"}',
   'email', 'a7777777-7777-7777-7777-777777777777', now(), now(), now()),
  (gen_random_uuid(), 'a8888888-8888-8888-8888-888888888888',
   '{"sub": "a8888888-8888-8888-8888-888888888888", "email": "labtech@smarthms.demo"}',
   'email', 'a8888888-8888-8888-8888-888888888888', now(), now(), now()),
  (gen_random_uuid(), 'a9999999-9999-9999-9999-999999999999',
   '{"sub": "a9999999-9999-9999-9999-999999999999", "email": "accountant@smarthms.demo"}',
   'email', 'a9999999-9999-9999-9999-999999999999', now(), now(), now());

-- =====================================================
-- PART 2: CREATE ORGANIZATION AND BRANCH
-- =====================================================

-- Insert demo organization
INSERT INTO public.organizations (id, name, slug, email, phone, address, city, country, subscription_plan, subscription_status)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Shifa Medical Center',
  'shifa-medical',
  'info@shifamedical.pk',
  '+92-42-35761234',
  '123 Jail Road, Gulberg III',
  'Lahore',
  'Pakistan',
  'enterprise',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  country = EXCLUDED.country;

-- Insert demo branch
INSERT INTO public.branches (id, organization_id, name, code, address, city, phone, email, is_main_branch, is_active)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  'Main Branch - Gulberg',
  'SMC-MAIN',
  '123 Jail Road, Gulberg III',
  'Lahore',
  '+92-42-35761234',
  'gulberg@shifamedical.pk',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code;

-- =====================================================
-- PART 3: CREATE PROFILES FOR DEMO USERS
-- =====================================================

INSERT INTO public.profiles (id, full_name, email, organization_id, branch_id, is_active)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Bilal Ahmed Khan', 'superadmin@smarthms.demo', NULL, NULL, true),
  ('a2222222-2222-2222-2222-222222222222', 'Fatima Zahra Malik', 'orgadmin@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', NULL, true),
  ('a3333333-3333-3333-3333-333333333333', 'Usman Ali Shah', 'branchadmin@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('a4444444-4444-4444-4444-444444444444', 'Dr. Ayesha Siddiqui', 'doctor@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('a5555555-5555-5555-5555-555555555555', 'Sana Riaz', 'nurse@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('a6666666-6666-6666-6666-666666666666', 'Hira Nawaz', 'receptionist@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('a7777777-7777-7777-7777-777777777777', 'Kamran Hussain', 'pharmacist@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('a8888888-8888-8888-8888-888888888888', 'Zainab Iqbal', 'labtech@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('a9999999-9999-9999-9999-999999999999', 'Tariq Mahmood', 'accountant@smarthms.demo', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  organization_id = EXCLUDED.organization_id,
  branch_id = EXCLUDED.branch_id;

-- =====================================================
-- PART 4: ASSIGN ROLES TO DEMO USERS
-- =====================================================

DELETE FROM public.user_roles WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  'a5555555-5555-5555-5555-555555555555',
  'a6666666-6666-6666-6666-666666666666',
  'a7777777-7777-7777-7777-777777777777',
  'a8888888-8888-8888-8888-888888888888',
  'a9999999-9999-9999-9999-999999999999'
);

INSERT INTO public.user_roles (user_id, role) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'super_admin'),
  ('a2222222-2222-2222-2222-222222222222', 'org_admin'),
  ('a3333333-3333-3333-3333-333333333333', 'branch_admin'),
  ('a4444444-4444-4444-4444-444444444444', 'doctor'),
  ('a5555555-5555-5555-5555-555555555555', 'nurse'),
  ('a6666666-6666-6666-6666-666666666666', 'receptionist'),
  ('a7777777-7777-7777-7777-777777777777', 'pharmacist'),
  ('a8888888-8888-8888-8888-888888888888', 'lab_technician'),
  ('a9999999-9999-9999-9999-999999999999', 'accountant');

-- =====================================================
-- PART 5: CREATE DOCTORS RECORD
-- =====================================================

INSERT INTO public.doctors (id, profile_id, organization_id, branch_id, specialization, qualification, license_number, consultation_fee, is_available)
VALUES (
  'd1111111-1111-1111-1111-111111111111',
  'a4444444-4444-4444-4444-444444444444',
  'b1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'General Physician',
  'MBBS, FCPS',
  'PMC-12345',
  2000,
  true
) ON CONFLICT (id) DO UPDATE SET
  specialization = EXCLUDED.specialization,
  qualification = EXCLUDED.qualification;

-- =====================================================
-- PART 6: CREATE SAMPLE PATIENTS (using valid hex UUIDs)
-- =====================================================

INSERT INTO public.patients (id, organization_id, branch_id, patient_number, first_name, last_name, gender, date_of_birth, phone, email, address, city, blood_group, is_active)
VALUES
  ('e1a11111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'SMC-0001', 'Muhammad', 'Ali', 'male', '1985-03-15', '+92-300-1234567', 'mali@email.com', 'House 45, Block D, Model Town', 'Lahore', 'A+', true),
  ('e2a22222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'SMC-0002', 'Fatima', 'Bibi', 'female', '1990-07-22', '+92-321-2345678', 'fbibi@email.com', 'Flat 12, Garden Town', 'Lahore', 'B+', true),
  ('e3a33333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'SMC-0003', 'Ahmed', 'Hassan', 'male', '1978-11-08', '+92-333-3456789', 'ahassan@email.com', '123 Faisal Town', 'Lahore', 'O+', true),
  ('e4a44444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'SMC-0004', 'Ayesha', 'Khan', 'female', '1995-02-28', '+92-345-4567890', 'akhan@email.com', '78 DHA Phase 5', 'Lahore', 'AB+', true),
  ('e5a55555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'SMC-0005', 'Imran', 'Malik', 'male', '1982-06-10', '+92-312-5678901', 'imalik@email.com', '56 Johar Town', 'Lahore', 'A-', true)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- =====================================================
-- PART 7: CREATE PAYMENT METHODS (using valid hex UUIDs)
-- =====================================================

INSERT INTO public.payment_methods (id, organization_id, name, code, is_active, requires_reference, sort_order)
VALUES
  ('f1a11111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Cash', 'CASH', true, false, 1),
  ('f2a22222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'JazzCash', 'JAZZCASH', true, true, 2),
  ('f3a33333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'EasyPaisa', 'EASYPAISA', true, true, 3),
  ('f4a44444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'Bank Transfer', 'BANK', true, true, 4),
  ('f5a55555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'Credit Card', 'CARD', true, true, 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code;

-- =====================================================
-- PART 8: CREATE SERVICE TYPES (using valid hex UUIDs)
-- =====================================================

INSERT INTO public.service_types (id, organization_id, name, category, default_price, is_active)
VALUES
  ('0a111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'General Consultation', 'consultation', 2000, true),
  ('0a222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Follow-up Visit', 'consultation', 1000, true),
  ('0a333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Blood Test - CBC', 'lab', 1500, true),
  ('0a444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'ECG', 'procedure', 2500, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  default_price = EXCLUDED.default_price;
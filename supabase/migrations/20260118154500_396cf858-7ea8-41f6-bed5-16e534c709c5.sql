-- CLINIC DEMO ENVIRONMENT - Complete Setup (Final with valid UUIDs)

-- Phase 1: Create Clinic Organization
INSERT INTO organizations (id, name, slug, email, phone, address, city, country, facility_type, billing_workflow, subscription_plan, subscription_status)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Al-Noor Family Clinic',
  'alnoor-clinic',
  'info@alnoorclinic.pk',
  '+92-42-35001234',
  '45-B, Commercial Area, DHA Phase 5',
  'Lahore',
  'Pakistan',
  'clinic',
  'pre_visit',
  'professional',
  'active'
) ON CONFLICT (id) DO UPDATE SET facility_type = 'clinic', billing_workflow = 'pre_visit';

-- Create Clinic Branch
INSERT INTO branches (id, organization_id, name, code, is_active, phone, address)
VALUES (
  'c2222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  'Main Clinic - DHA',
  'ANC-DHA',
  true,
  '+92-42-35001234',
  '45-B, Commercial Area, DHA Phase 5, Lahore'
) ON CONFLICT (id) DO NOTHING;

-- Phase 2: Create Clinic Demo Auth Users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES 
  ('a2222222-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'clinic.admin@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Clinic Admin"}', 'authenticated', 'authenticated', now(), now(), '', '', '', ''),
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'clinic.doctor@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Amir Siddiqui"}', 'authenticated', 'authenticated', now(), now(), '', '', '', ''),
  ('a2222222-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'dr.sadia@alnoorclinic.internal', crypt('Demo@123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Sadia Hassan"}', 'authenticated', 'authenticated', now(), now(), '', '', '', ''),
  ('a2222222-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'dr.kamran@alnoorclinic.internal', crypt('Demo@123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dr. Kamran Ali"}', 'authenticated', 'authenticated', now(), now(), '', '', '', ''),
  ('a2222222-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'clinic.receptionist@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sara Receptionist"}', 'authenticated', 'authenticated', now(), now(), '', '', '', ''),
  ('a2222222-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'clinic.pharmacist@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ali Pharmacist"}', 'authenticated', 'authenticated', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Phase 3: Create Clinic Profiles
INSERT INTO profiles (id, email, full_name, organization_id, branch_id)
VALUES 
  ('a2222222-1111-1111-1111-111111111111', 'clinic.admin@healthos.demo', 'Clinic Admin', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
  ('a2222222-2222-2222-2222-222222222222', 'clinic.doctor@healthos.demo', 'Dr. Amir Siddiqui', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
  ('a2222222-5555-5555-5555-555555555555', 'dr.sadia@alnoorclinic.internal', 'Dr. Sadia Hassan', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
  ('a2222222-6666-6666-6666-666666666666', 'dr.kamran@alnoorclinic.internal', 'Dr. Kamran Ali', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
  ('a2222222-3333-3333-3333-333333333333', 'clinic.receptionist@healthos.demo', 'Sara Receptionist', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
  ('a2222222-4444-4444-4444-444444444444', 'clinic.pharmacist@healthos.demo', 'Ali Pharmacist', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Phase 4: Assign Clinic User Roles
INSERT INTO user_roles (user_id, role)
VALUES 
  ('a2222222-1111-1111-1111-111111111111', 'org_admin'),
  ('a2222222-2222-2222-2222-222222222222', 'doctor'),
  ('a2222222-5555-5555-5555-555555555555', 'doctor'),
  ('a2222222-6666-6666-6666-666666666666', 'doctor'),
  ('a2222222-3333-3333-3333-333333333333', 'receptionist'),
  ('a2222222-4444-4444-4444-444444444444', 'pharmacist')
ON CONFLICT (user_id, role) DO NOTHING;

-- Phase 5: Create Clinic Doctors with Fees
INSERT INTO doctors (id, profile_id, organization_id, branch_id, specialization, qualification, license_number, consultation_fee, followup_fee, is_available)
VALUES 
  ('d4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'General Physician', 'MBBS', 'PMC-GP-2024-001', 1000.00, 500.00, true),
  ('d5555555-5555-5555-5555-555555555555', 'a2222222-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Gynecologist', 'MBBS, FCPS', 'PMC-GYN-2024-002', 2000.00, 800.00, true),
  ('d6666666-6666-6666-6666-666666666666', 'a2222222-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Dermatologist', 'MBBS, FCPS', 'PMC-DRM-2024-003', 1500.00, 600.00, true)
ON CONFLICT (id) DO UPDATE SET consultation_fee = EXCLUDED.consultation_fee, followup_fee = EXCLUDED.followup_fee;

-- Phase 6: Configure Clinic Modules
INSERT INTO organization_modules (organization_id, module_code, is_enabled)
VALUES 
  ('b2222222-2222-2222-2222-222222222222', 'patients', true),
  ('b2222222-2222-2222-2222-222222222222', 'appointments', true),
  ('b2222222-2222-2222-2222-222222222222', 'opd', true),
  ('b2222222-2222-2222-2222-222222222222', 'clinic', true),
  ('b2222222-2222-2222-2222-222222222222', 'pharmacy', true),
  ('b2222222-2222-2222-2222-222222222222', 'billing', true),
  ('b2222222-2222-2222-2222-222222222222', 'lab', true),
  ('b2222222-2222-2222-2222-222222222222', 'ipd', false),
  ('b2222222-2222-2222-2222-222222222222', 'emergency', false),
  ('b2222222-2222-2222-2222-222222222222', 'ot', false),
  ('b2222222-2222-2222-2222-222222222222', 'blood_bank', false),
  ('b2222222-2222-2222-2222-222222222222', 'radiology', false)
ON CONFLICT (organization_id, module_code) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

-- Phase 7: Add Clinic Menu Items
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, is_active, required_module)
VALUES ('clinic', 'Clinic', 'Stethoscope', NULL, NULL, 15, true, 'clinic')
ON CONFLICT (code) DO UPDATE SET is_active = true, required_module = 'clinic';

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, is_active, required_module)
VALUES 
  ('clinic-dashboard', 'Dashboard', 'LayoutDashboard', '/app/clinic/dashboard', (SELECT id FROM menu_items WHERE code = 'clinic'), 1, true, 'clinic'),
  ('clinic-token', 'Token Counter', 'Ticket', '/app/clinic/token', (SELECT id FROM menu_items WHERE code = 'clinic'), 2, true, 'clinic')
ON CONFLICT (code) DO UPDATE SET is_active = true, required_module = 'clinic';

-- Phase 8: Seed Clinic Patients (using valid UUID format)
INSERT INTO patients (id, organization_id, branch_id, patient_number, first_name, last_name, date_of_birth, gender, phone, national_id, address, city, blood_group)
VALUES
  ('22000001-0001-0001-0001-000000000001', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'ANC-250118-0001', 'Zainab', 'Bibi', '1990-05-15', 'female', '0321-1234567', '35201-1234567-8', 'House 12, DHA Phase 5', 'Lahore', 'B+'),
  ('22000001-0001-0001-0001-000000000002', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'ANC-250118-0002', 'Imran', 'Khan', '1985-08-20', 'male', '0300-9876543', '35202-9876543-1', 'Model Town', 'Lahore', 'O+'),
  ('22000001-0001-0001-0001-000000000003', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'ANC-250118-0003', 'Ayesha', 'Malik', '1995-02-10', 'female', '0333-5551234', '35203-5551234-2', 'Cantt View', 'Lahore', 'A+'),
  ('22000001-0001-0001-0001-000000000004', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'ANC-250118-0004', 'Bilal', 'Ahmed', '1978-11-30', 'male', '0345-7778899', '35204-7778899-3', 'Gulberg III', 'Lahore', 'AB+'),
  ('22000001-0001-0001-0001-000000000005', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'ANC-250118-0005', 'Fatima', 'Noor', '2000-07-25', 'female', '0312-4443322', '35205-4443322-4', 'Johar Town', 'Lahore', 'B-')
ON CONFLICT (id) DO NOTHING;

-- Phase 9: Seed Clinic Appointments (using valid UUID format)
INSERT INTO appointments (id, organization_id, branch_id, patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, priority, token_number)
VALUES
  ('22200001-0001-0001-0001-000000000001', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '22000001-0001-0001-0001-000000000001', 'd4444444-4444-4444-4444-444444444444', CURRENT_DATE, '09:00', 'checked_in', 'walk_in', 0, 1),
  ('22200001-0001-0001-0001-000000000002', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '22000001-0001-0001-0001-000000000002', 'd4444444-4444-4444-4444-444444444444', CURRENT_DATE, '09:30', 'checked_in', 'walk_in', 0, 2),
  ('22200001-0001-0001-0001-000000000003', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '22000001-0001-0001-0001-000000000003', 'd5555555-5555-5555-5555-555555555555', CURRENT_DATE, '10:00', 'scheduled', 'scheduled', 0, 3)
ON CONFLICT (id) DO NOTHING;
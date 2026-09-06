-- Dental department
INSERT INTO public.departments (id, organization_id, name, code, description, is_active)
VALUES ('d1111111-dddd-4ddd-8ddd-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Dental', 'DENT', 'Dental & Oral Health', true)
ON CONFLICT DO NOTHING;

-- Auth user for the dental doctor
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, phone, phone_confirmed_at,
  confirmation_sent_at, email_change_token_current, email_change_confirm_status,
  is_sso_user, deleted_at
)
VALUES (
  'd2222222-dddd-4ddd-8ddd-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'dental@healthos24.com',
  crypt('Dental@123', gen_salt('bf')),
  now(), '', '',
  '', '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dr. Faisal Siddiqui"}',
  now(), now(), NULL, NULL,
  NULL, '', 0,
  false, NULL
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (
  'd2222222-dddd-4ddd-8ddd-222222222222',
  'd2222222-dddd-4ddd-8ddd-222222222222',
  'dental@healthos24.com',
  'email',
  jsonb_build_object('sub', 'd2222222-dddd-4ddd-8ddd-222222222222', 'email', 'dental@healthos24.com'),
  now(), now(), now()
)
ON CONFLICT DO NOTHING;

UPDATE public.profiles
SET organization_id = 'b1111111-1111-1111-1111-111111111111',
    branch_id = 'c1111111-1111-1111-1111-111111111111',
    full_name = 'Dr. Faisal Siddiqui'
WHERE id = 'd2222222-dddd-4ddd-8ddd-222222222222';

INSERT INTO public.user_roles (user_id, role)
VALUES ('d2222222-dddd-4ddd-8ddd-222222222222', 'doctor')
ON CONFLICT DO NOTHING;

-- Doctor record
INSERT INTO public.doctors (id, profile_id, organization_id, branch_id, specialization, qualification, license_number, consultation_fee, followup_fee, is_available)
VALUES (
  'd3333333-dddd-4ddd-8ddd-333333333333',
  'd2222222-dddd-4ddd-8ddd-222222222222',
  'b1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'Dentistry', 'BDS, MDS (Prosthodontics)', 'PMDC-DENT-4471',
  2000, 1000, true
)
ON CONFLICT (id) DO NOTHING;

-- Weekly clinic schedule Mon-Sat 09:00-14:00
INSERT INTO public.doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active)
SELECT 'd3333333-dddd-4ddd-8ddd-333333333333', d, '09:00', '14:00', 20, 1, true
FROM generate_series(1, 6) AS d
ON CONFLICT DO NOTHING;

-- Dental services in the price list
INSERT INTO public.service_types (organization_id, name, category, default_price, is_active)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Dental Consultation', 'consultation', 1500, true),
  ('b1111111-1111-1111-1111-111111111111', 'Dental Scaling & Polishing', 'procedure', 4000, true),
  ('b1111111-1111-1111-1111-111111111111', 'Composite Filling', 'procedure', 3500, true),
  ('b1111111-1111-1111-1111-111111111111', 'Tooth Extraction (Simple)', 'procedure', 3000, true),
  ('b1111111-1111-1111-1111-111111111111', 'Root Canal Treatment', 'procedure', 15000, true),
  ('b1111111-1111-1111-1111-111111111111', 'Porcelain Crown', 'procedure', 25000, true)
ON CONFLICT DO NOTHING;

-- Dental procedure catalog
INSERT INTO public.dental_procedures (organization_id, code, name, category, description, default_cost, duration_minutes, is_active)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'D0120', 'Periodic Oral Examination', 'diagnostic', 'Routine dental check-up', 1500, 15, true),
  ('b1111111-1111-1111-1111-111111111111', 'D1110', 'Scaling & Polishing', 'preventive', 'Full mouth cleaning', 4000, 30, true),
  ('b1111111-1111-1111-1111-111111111111', 'D2391', 'Composite Filling - 1 Surface', 'restorative', 'Tooth-coloured restoration', 3500, 30, true),
  ('b1111111-1111-1111-1111-111111111111', 'D2392', 'Composite Filling - 2 Surface', 'restorative', 'Tooth-coloured restoration', 4500, 40, true),
  ('b1111111-1111-1111-1111-111111111111', 'D7140', 'Extraction - Simple', 'oral_surgery', 'Erupted tooth extraction', 3000, 30, true),
  ('b1111111-1111-1111-1111-111111111111', 'D7210', 'Extraction - Surgical', 'oral_surgery', 'Surgical removal of tooth', 8000, 60, true),
  ('b1111111-1111-1111-1111-111111111111', 'D3310', 'Root Canal - Anterior', 'endodontic', 'Endodontic therapy', 12000, 60, true),
  ('b1111111-1111-1111-1111-111111111111', 'D3330', 'Root Canal - Molar', 'endodontic', 'Endodontic therapy', 18000, 90, true),
  ('b1111111-1111-1111-1111-111111111111', 'D2740', 'Porcelain Crown', 'prosthodontic', 'Full ceramic crown', 25000, 60, true),
  ('b1111111-1111-1111-1111-111111111111', 'D4341', 'Periodontal Scaling per Quadrant', 'periodontic', 'Deep cleaning', 5000, 45, true)
ON CONFLICT DO NOTHING;
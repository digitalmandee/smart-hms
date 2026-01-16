
-- Fix: Link existing demo doctor profile to doctors table
-- First update the existing doctor record to use the demo doctor profile
UPDATE doctors 
SET profile_id = '1fbdf4c6-08ce-404a-a287-abb85d0ba49f'
WHERE id = 'd1111111-1111-1111-1111-111111111111';

-- Create auth users for 2 additional doctors
-- Using the same password hash as existing demo accounts (Demo@123)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    'd2222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'cardiologist@healthos.demo',
    '$2a$06$oK51FfSE5UMF5fPfUjiZbek/wyc6qSAgvIBQY4erO4jNZVFZr/Pbe',
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Usman Malik"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'pediatrician@healthos.demo',
    '$2a$06$oK51FfSE5UMF5fPfUjiZbek/wyc6qSAgvIBQY4erO4jNZVFZr/Pbe',
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Fatima Khan"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- Create profiles for the new doctors
INSERT INTO profiles (id, email, full_name, organization_id, branch_id)
VALUES 
  ('d2222222-2222-2222-2222-222222222222', 'cardiologist@healthos.demo', 'Dr. Usman Malik', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
  ('d3333333-3333-3333-3333-333333333333', 'pediatrician@healthos.demo', 'Dr. Fatima Khan', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Create doctor records for new doctors
INSERT INTO doctors (id, profile_id, organization_id, branch_id, specialization, qualification, license_number, is_available)
VALUES 
  ('d2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Cardiologist', 'MBBS, FCPS (Cardiology)', 'PMC-CARD-2024-001', true),
  ('d3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Pediatrician', 'MBBS, FCPS (Pediatrics)', 'PMC-PEDS-2024-001', true)
ON CONFLICT (id) DO NOTHING;

-- Assign doctor role to new doctors
INSERT INTO user_roles (user_id, role)
VALUES 
  ('d2222222-2222-2222-2222-222222222222', 'doctor'),
  ('d3333333-3333-3333-3333-333333333333', 'doctor')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure existing demo doctor has doctor role
INSERT INTO user_roles (user_id, role)
VALUES ('1fbdf4c6-08ce-404a-a287-abb85d0ba49f', 'doctor')
ON CONFLICT (user_id, role) DO NOTHING;

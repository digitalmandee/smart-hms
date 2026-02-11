
-- 1. Create a main branch for MediCare Pharmacy
INSERT INTO public.branches (id, organization_id, name, code, is_main_branch, is_active, address, city, phone, email)
VALUES (
  'c0d9b317-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'c0d9b317-110d-4f2d-a13b-e79dbc056787',
  'MediCare Pharmacy - Main',
  'MCP-MAIN',
  true,
  true,
  '45 Commercial Area, Gulberg III',
  'Lahore',
  '+92-42-35761234',
  'info@medicarepharmacy.pk'
);

-- 2. Enable Pharmacy and Pharmacy POS modules
INSERT INTO public.organization_modules (organization_id, module_code, is_enabled, enabled_at)
VALUES 
  ('c0d9b317-110d-4f2d-a13b-e79dbc056787', 'pharmacy', true, now()),
  ('c0d9b317-110d-4f2d-a13b-e79dbc056787', 'pharmacy_pos', true, now())
ON CONFLICT DO NOTHING;

-- 3. Also enable core modules (patients, billing)
INSERT INTO public.organization_modules (organization_id, module_code, is_enabled, enabled_at)
VALUES 
  ('c0d9b317-110d-4f2d-a13b-e79dbc056787', 'patients', true, now()),
  ('c0d9b317-110d-4f2d-a13b-e79dbc056787', 'billing', true, now())
ON CONFLICT DO NOTHING;

-- 4. Create auth user for the independent pharmacy pharmacist
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, phone, phone_confirmed_at,
  confirmation_sent_at, email_change_token_current, email_change_confirm_status,
  is_sso_user, deleted_at
)
VALUES (
  'c0d9b317-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'pharmacy@medicare.demo',
  '$2a$06$J7L0VOYS9BIWxeT0EYwpIuCVCvcPmGFTxmbKtvZYRU1vPVM5uqB3a',
  now(), '', '',
  '', '', 
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Imran Shah"}',
  now(), now(), '', NULL,
  NULL, '', 0,
  false, NULL
);

-- 5. Create identity for the user
INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
VALUES (
  'c0d9b317-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'c0d9b317-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'pharmacy@medicare.demo',
  'email',
  jsonb_build_object('sub', 'c0d9b317-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'email', 'pharmacy@medicare.demo'),
  now(), now(), now()
);

-- 6. Update profile with org/branch (auto-created by handle_new_user trigger)
UPDATE public.profiles
SET 
  organization_id = 'c0d9b317-110d-4f2d-a13b-e79dbc056787',
  branch_id = 'c0d9b317-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  full_name = 'Imran Shah',
  phone = '+92-300-1234567'
WHERE id = 'c0d9b317-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- 7. Assign pharmacist role
INSERT INTO public.user_roles (user_id, role)
VALUES ('c0d9b317-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pharmacist');

-- Create demo users in auth.users
-- Using DO block to handle duplicates gracefully

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Super Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'superadmin@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'superadmin@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'superadmin@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Org Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'orgadmin@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'orgadmin@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Org Admin"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'orgadmin@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'orgadmin@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Branch Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'branchadmin@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'branchadmin@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Branch Admin"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'branchadmin@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'branchadmin@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Doctor
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'doctor@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'doctor@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Doctor"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'doctor@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'doctor@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Nurse
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nurse@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'nurse@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Nurse"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'nurse@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'nurse@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Receptionist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'receptionist@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'receptionist@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Receptionist"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'receptionist@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'receptionist@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Pharmacist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pharmacist@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'pharmacist@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Pharmacist"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'pharmacist@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'pharmacist@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Lab Tech
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'labtech@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'labtech@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Lab Tech"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'labtech@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'labtech@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;

  -- Accountant
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'accountant@healthos.demo') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'accountant@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Accountant"}', false, 'authenticated', 'authenticated', '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), user_id, 'accountant@healthos.demo', jsonb_build_object('sub', user_id::text, 'email', 'accountant@healthos.demo', 'email_verified', true), 'email', now(), now(), now());
  END IF;
END $$;
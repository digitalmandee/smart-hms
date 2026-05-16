DO $$
DECLARE
  v_org uuid := 'b1111111-1111-1111-1111-111111111111';
  v_branch uuid := 'c1111111-1111-1111-1111-111111111111';
  v_pwd text := crypt('Devmine@098', gen_salt('bf'));
  v_doc uuid := '00000000-0000-4000-a000-000000000d01';
  v_nur uuid := '00000000-0000-4000-a000-000000000d02';
  v_sta uuid := '00000000-0000-4000-a000-000000000d03';
  v_pat uuid := '00000000-0000-4000-a000-000000000d04';
  r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    (v_doc, 'mobile.doctor@healthos24.test',  'Dr. Mobile Test'),
    (v_nur, 'mobile.nurse@healthos24.test',   'Nurse Mobile Test'),
    (v_sta, 'mobile.staff@healthos24.test',   'Staff Mobile Test'),
    (v_pat, 'mobile.patient@healthos24.test', 'Patient Mobile Test')
  ) AS t(uid, email, full_name)
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', r.uid, 'authenticated', 'authenticated',
      r.email, v_pwd, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', r.full_name),
      now(), now(), '', '', '', ''
    ) ON CONFLICT (id) DO UPDATE
      SET encrypted_password = EXCLUDED.encrypted_password,
          email_confirmed_at = now(), updated_at = now();

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), r.uid,
      jsonb_build_object('sub', r.uid::text, 'email', r.email, 'email_verified', true),
      'email', r.email, now(), now(), now()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;

    INSERT INTO public.profiles (id, organization_id, branch_id, full_name, email, is_active)
    VALUES (r.uid, v_org, v_branch, r.full_name, r.email, true)
    ON CONFLICT (id) DO UPDATE
      SET organization_id = EXCLUDED.organization_id,
          branch_id = EXCLUDED.branch_id,
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          is_active = true, updated_at = now();
  END LOOP;

  INSERT INTO public.user_roles (user_id, role) VALUES
    (v_doc, 'doctor'), (v_nur, 'nurse'),
    (v_sta, 'receptionist'), (v_pat, 'patient')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.doctors (
    profile_id, organization_id, branch_id, specialization, qualification,
    license_number, consultation_fee, followup_fee, is_available
  )
  SELECT v_doc, v_org, v_branch, 'General Practice', 'MBBS',
         'TEST-DOC-001', 500, 300, true
  WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE profile_id = v_doc);

  INSERT INTO public.nurses (
    profile_id, organization_id, branch_id, license_number, qualification,
    specialization, is_available
  )
  SELECT v_nur, v_org, v_branch, 'TEST-NUR-001', 'BSc Nursing', 'General', true
  WHERE NOT EXISTS (SELECT 1 FROM public.nurses WHERE profile_id = v_nur);

  INSERT INTO public.employees (
    profile_id, organization_id, branch_id, employee_number,
    first_name, last_name, work_email, personal_phone, nationality, join_date
  )
  SELECT v_sta, v_org, v_branch, 'EMP-MOBILE-001',
         'Staff', 'Mobile Test', 'mobile.staff@healthos24.test',
         '+923000000003', 'Pakistani', CURRENT_DATE
  WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE profile_id = v_sta);

  INSERT INTO public.patients (
    id, organization_id, branch_id, patient_number, first_name, last_name,
    gender, date_of_birth, phone, email, nationality, preferred_language, is_active
  ) VALUES (
    v_pat, v_org, v_branch, 'PAT-MOBILE-001', 'Patient', 'Mobile Test',
    'male', '1990-01-01', '+923000000004', 'mobile.patient@healthos24.test',
    'Pakistan', 'English', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;
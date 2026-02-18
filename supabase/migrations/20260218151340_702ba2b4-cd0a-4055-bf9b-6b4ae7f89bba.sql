-- Fix SECURITY DEFINER functions to include SET search_path = public
-- This prevents search_path manipulation attacks

CREATE OR REPLACE FUNCTION public.generate_kiosk_username(kiosk_name text, org_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  base_username text;
  final_username text;
  counter int := 0;
BEGIN
  base_username := lower(regexp_replace(kiosk_name, '[^a-zA-Z0-9]', '-', 'g'));
  base_username := regexp_replace(base_username, '-+', '-', 'g');
  base_username := trim(both '-' from base_username);
  base_username := 'kiosk-' || base_username;
  
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM kiosk_configs WHERE kiosk_username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || '-' || counter;
  END LOOP;
  
  RETURN final_username;
END;
$function$;

CREATE OR REPLACE FUNCTION public.hash_kiosk_password(password text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_kiosk_password(kiosk_id uuid, password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  stored_hash text;
BEGIN
  SELECT kiosk_password_hash INTO stored_hash
  FROM kiosk_configs
  WHERE id = kiosk_id AND is_active = true;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_hash = crypt(password, stored_hash);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_kiosk_session(p_kiosk_id uuid, p_device_info jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text)
 RETURNS TABLE(session_id uuid, session_token text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_session_id uuid;
  v_session_token text;
  v_org_id uuid;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM kiosk_configs
  WHERE id = p_kiosk_id;
  
  UPDATE kiosk_sessions
  SET is_active = false, ended_at = now()
  WHERE kiosk_id = p_kiosk_id AND is_active = true;
  
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO kiosk_sessions (kiosk_id, organization_id, session_token, device_info, ip_address)
  VALUES (p_kiosk_id, v_org_id, v_session_token, p_device_info, p_ip_address)
  RETURNING id INTO v_session_id;
  
  UPDATE kiosk_configs
  SET last_login_at = now(), last_login_ip = p_ip_address
  WHERE id = p_kiosk_id;
  
  RETURN QUERY SELECT v_session_id, v_session_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_kiosk_session(p_session_token text)
 RETURNS TABLE(valid boolean, kiosk_id uuid, session_id uuid, kiosk_name text, kiosk_type text, departments text[], organization_id uuid, display_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_session kiosk_sessions%ROWTYPE;
  v_kiosk kiosk_configs%ROWTYPE;
  v_timeout_minutes int;
BEGIN
  SELECT * INTO v_session
  FROM kiosk_sessions s
  WHERE s.session_token = p_session_token AND s.is_active = true;
  
  IF v_session.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, NULL::text, NULL::text, NULL::text[], NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  SELECT * INTO v_kiosk
  FROM kiosk_configs
  WHERE id = v_session.kiosk_id AND is_active = true;
  
  IF v_kiosk.id IS NULL THEN
    UPDATE kiosk_sessions SET is_active = false, ended_at = now()
    WHERE id = v_session.id;
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, NULL::text, NULL::text, NULL::text[], NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  v_timeout_minutes := COALESCE(v_kiosk.session_timeout_minutes, 480);
  IF v_session.last_activity_at < now() - (v_timeout_minutes || ' minutes')::interval THEN
    UPDATE kiosk_sessions SET is_active = false, ended_at = now()
    WHERE id = v_session.id;
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, NULL::text, NULL::text, NULL::text[], NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  UPDATE kiosk_sessions SET last_activity_at = now()
  WHERE id = v_session.id;
  
  RETURN QUERY SELECT 
    true,
    v_kiosk.id,
    v_session.id,
    v_kiosk.name,
    v_kiosk.kiosk_type::text,
    v_kiosk.departments,
    v_kiosk.organization_id,
    v_kiosk.display_message;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_kiosk_token(p_kiosk_id uuid, p_session_id uuid, p_organization_id uuid, p_appointment_id uuid, p_token_number integer, p_patient_name text, p_patient_phone text, p_doctor_name text, p_department text, p_priority integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO kiosk_token_logs (
    kiosk_id, session_id, organization_id, appointment_id,
    token_number, patient_name, patient_phone, doctor_name,
    department, priority, printed
  )
  VALUES (
    p_kiosk_id, p_session_id, p_organization_id, p_appointment_id,
    p_token_number, p_patient_name, p_patient_phone, p_doctor_name,
    p_department, p_priority, true
  )
  RETURNING id INTO v_log_id;
  
  UPDATE kiosk_sessions
  SET tokens_generated = tokens_generated + 1, last_activity_at = now()
  WHERE id = p_session_id;
  
  RETURN v_log_id;
END;
$function$;

-- Also fix other SECURITY DEFINER functions without search_path
CREATE OR REPLACE FUNCTION public.generate_expense_number(p_org_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_count INT;
  v_prefix TEXT := 'EXP';
  v_date TEXT := to_char(CURRENT_DATE, 'YYMMDD');
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.expenses
  WHERE organization_id = p_org_id
    AND created_at::date = CURRENT_DATE;
  
  RETURN v_prefix || '-' || v_date || '-' || LPAD(v_count::TEXT, 3, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_opd_token(p_opd_department_id uuid, p_appointment_date date, p_branch_id uuid)
 RETURNS TABLE(token_number integer, token_display text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_dept_code TEXT;
  v_next_token INTEGER;
BEGIN
  SELECT code INTO v_dept_code
  FROM opd_departments
  WHERE id = p_opd_department_id;
  
  SELECT COALESCE(MAX(a.token_number), 0) + 1 INTO v_next_token
  FROM appointments a
  WHERE a.opd_department_id = p_opd_department_id
    AND a.appointment_date = p_appointment_date;
  
  RETURN QUERY SELECT v_next_token, v_dept_code || '-' || LPAD(v_next_token::TEXT, 3, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_opd_department_by_specialization(p_specialization_id uuid, p_branch_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_dept_id UUID;
BEGIN
  SELECT od.id INTO v_dept_id
  FROM opd_departments od
  JOIN opd_department_specializations ods ON od.id = ods.opd_department_id
  WHERE ods.specialization_id = p_specialization_id
    AND od.branch_id = p_branch_id
    AND od.is_active = true
  LIMIT 1;
  
  RETURN v_dept_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_default_account(p_organization_id uuid, p_account_code text, p_account_name text, p_account_type_category text DEFAULT 'asset'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_account_id UUID;
  v_account_type_id UUID;
BEGIN
  SELECT id INTO v_account_id
  FROM public.accounts
  WHERE organization_id = p_organization_id
    AND account_number = p_account_code
  LIMIT 1;
  
  IF v_account_id IS NOT NULL THEN
    RETURN v_account_id;
  END IF;
  
  SELECT id INTO v_account_type_id
  FROM public.account_types
  WHERE organization_id = p_organization_id
    AND category = p_account_type_category
  LIMIT 1;
  
  IF v_account_type_id IS NULL THEN
    INSERT INTO public.account_types (
      organization_id, code, name, category, is_debit_normal, is_system
    ) VALUES (
      p_organization_id, 
      UPPER(LEFT(p_account_type_category, 3)), 
      INITCAP(p_account_type_category),
      p_account_type_category,
      p_account_type_category IN ('asset', 'expense'),
      true
    )
    RETURNING id INTO v_account_type_id;
  END IF;
  
  INSERT INTO public.accounts (
    organization_id, account_number, name, account_type_id, is_system, is_active
  ) VALUES (
    p_organization_id, p_account_code, p_account_name, v_account_type_id, true, true
  )
  RETURNING id INTO v_account_id;
  
  RETURN v_account_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_queue_display_for_kiosk()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  display_id UUID;
  display_type TEXT;
BEGIN
  display_type := CASE 
    WHEN NEW.kiosk_type = 'emergency' THEN 'emergency'
    WHEN NEW.kiosk_type = 'ipd' THEN 'ipd'
    ELSE 'opd'
  END;
  
  INSERT INTO queue_display_configs (
    organization_id, branch_id, name, display_type, departments, linked_kiosk_ids
  ) VALUES (
    NEW.organization_id, NEW.branch_id, NEW.name || ' Display',
    display_type, NEW.departments, jsonb_build_array(NEW.id)
  ) RETURNING id INTO display_id;
  
  NEW.linked_display_id := display_id;
  RETURN NEW;
END;
$function$;

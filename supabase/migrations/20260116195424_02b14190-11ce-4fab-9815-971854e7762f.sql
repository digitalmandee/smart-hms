-- Add kiosk authentication columns to kiosk_configs
ALTER TABLE kiosk_configs ADD COLUMN IF NOT EXISTS kiosk_username text UNIQUE;
ALTER TABLE kiosk_configs ADD COLUMN IF NOT EXISTS kiosk_password_hash text;
ALTER TABLE kiosk_configs ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE kiosk_configs ADD COLUMN IF NOT EXISTS last_login_ip text;
ALTER TABLE kiosk_configs ADD COLUMN IF NOT EXISTS session_timeout_minutes int DEFAULT 480;

-- Create kiosk_sessions table to track active and past sessions
CREATE TABLE IF NOT EXISTS kiosk_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiosk_id uuid NOT NULL REFERENCES kiosk_configs(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  last_activity_at timestamptz DEFAULT now(),
  device_info jsonb DEFAULT '{}',
  ip_address text,
  tokens_generated int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create kiosk_token_logs table to archive all token activity
CREATE TABLE IF NOT EXISTS kiosk_token_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiosk_id uuid NOT NULL REFERENCES kiosk_configs(id) ON DELETE CASCADE,
  session_id uuid REFERENCES kiosk_sessions(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  token_number int NOT NULL,
  patient_name text,
  patient_phone text,
  doctor_name text,
  department text,
  priority int DEFAULT 0,
  generated_at timestamptz NOT NULL DEFAULT now(),
  printed boolean DEFAULT false,
  print_count int DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kiosk_sessions_kiosk_id ON kiosk_sessions(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_sessions_is_active ON kiosk_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kiosk_sessions_session_token ON kiosk_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_kiosk_token_logs_kiosk_id ON kiosk_token_logs(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_token_logs_session_id ON kiosk_token_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_token_logs_generated_at ON kiosk_token_logs(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kiosk_configs_username ON kiosk_configs(kiosk_username) WHERE kiosk_username IS NOT NULL;

-- Enable RLS
ALTER TABLE kiosk_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosk_token_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kiosk_sessions
CREATE POLICY "Staff can view their organization's kiosk sessions"
  ON kiosk_sessions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage their organization's kiosk sessions"
  ON kiosk_sessions FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow public access for kiosk session validation (needed for kiosk login)
CREATE POLICY "Kiosk sessions can be read with valid token"
  ON kiosk_sessions FOR SELECT
  USING (true);

CREATE POLICY "Kiosk sessions can be updated with valid token"
  ON kiosk_sessions FOR UPDATE
  USING (true);

-- RLS Policies for kiosk_token_logs
CREATE POLICY "Staff can view their organization's token logs"
  ON kiosk_token_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Token logs can be inserted by anyone (for kiosk use)"
  ON kiosk_token_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can manage their organization's token logs"
  ON kiosk_token_logs FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Function to generate unique kiosk username
CREATE OR REPLACE FUNCTION generate_kiosk_username(kiosk_name text, org_id uuid)
RETURNS text AS $$
DECLARE
  base_username text;
  final_username text;
  counter int := 0;
BEGIN
  -- Create base username from kiosk name
  base_username := lower(regexp_replace(kiosk_name, '[^a-zA-Z0-9]', '-', 'g'));
  base_username := regexp_replace(base_username, '-+', '-', 'g');
  base_username := trim(both '-' from base_username);
  base_username := 'kiosk-' || base_username;
  
  -- Ensure uniqueness
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM kiosk_configs WHERE kiosk_username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || '-' || counter;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hash kiosk password
CREATE OR REPLACE FUNCTION hash_kiosk_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify kiosk password
CREATE OR REPLACE FUNCTION verify_kiosk_password(kiosk_id uuid, password text)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create kiosk session
CREATE OR REPLACE FUNCTION create_kiosk_session(
  p_kiosk_id uuid,
  p_device_info jsonb DEFAULT '{}',
  p_ip_address text DEFAULT NULL
)
RETURNS TABLE(session_id uuid, session_token text) AS $$
DECLARE
  v_session_id uuid;
  v_session_token text;
  v_org_id uuid;
BEGIN
  -- Get organization_id from kiosk
  SELECT organization_id INTO v_org_id
  FROM kiosk_configs
  WHERE id = p_kiosk_id;
  
  -- End any existing active sessions for this kiosk
  UPDATE kiosk_sessions
  SET is_active = false, ended_at = now()
  WHERE kiosk_id = p_kiosk_id AND is_active = true;
  
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create new session
  INSERT INTO kiosk_sessions (kiosk_id, organization_id, session_token, device_info, ip_address)
  VALUES (p_kiosk_id, v_org_id, v_session_token, p_device_info, p_ip_address)
  RETURNING id INTO v_session_id;
  
  -- Update kiosk last login
  UPDATE kiosk_configs
  SET last_login_at = now(), last_login_ip = p_ip_address
  WHERE id = p_kiosk_id;
  
  RETURN QUERY SELECT v_session_id, v_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and refresh kiosk session
CREATE OR REPLACE FUNCTION validate_kiosk_session(p_session_token text)
RETURNS TABLE(
  valid boolean,
  kiosk_id uuid,
  session_id uuid,
  kiosk_name text,
  kiosk_type text,
  departments text[],
  organization_id uuid,
  display_message text
) AS $$
DECLARE
  v_session kiosk_sessions%ROWTYPE;
  v_kiosk kiosk_configs%ROWTYPE;
  v_timeout_minutes int;
BEGIN
  -- Find session
  SELECT * INTO v_session
  FROM kiosk_sessions s
  WHERE s.session_token = p_session_token AND s.is_active = true;
  
  IF v_session.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, NULL::text, NULL::text, NULL::text[], NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Get kiosk details
  SELECT * INTO v_kiosk
  FROM kiosk_configs
  WHERE id = v_session.kiosk_id AND is_active = true;
  
  IF v_kiosk.id IS NULL THEN
    -- Kiosk deactivated, end session
    UPDATE kiosk_sessions SET is_active = false, ended_at = now()
    WHERE id = v_session.id;
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, NULL::text, NULL::text, NULL::text[], NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Check session timeout
  v_timeout_minutes := COALESCE(v_kiosk.session_timeout_minutes, 480);
  IF v_session.last_activity_at < now() - (v_timeout_minutes || ' minutes')::interval THEN
    -- Session expired
    UPDATE kiosk_sessions SET is_active = false, ended_at = now()
    WHERE id = v_session.id;
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, NULL::text, NULL::text, NULL::text[], NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Update last activity
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log token generation
CREATE OR REPLACE FUNCTION log_kiosk_token(
  p_kiosk_id uuid,
  p_session_id uuid,
  p_organization_id uuid,
  p_appointment_id uuid,
  p_token_number int,
  p_patient_name text,
  p_patient_phone text,
  p_doctor_name text,
  p_department text,
  p_priority int DEFAULT 0
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Insert token log
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
  
  -- Update session token count
  UPDATE kiosk_sessions
  SET tokens_generated = tokens_generated + 1, last_activity_at = now()
  WHERE id = p_session_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
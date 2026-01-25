-- Fix: Grant wallet permission to doctor roles (using correct column names)
DO $$
DECLARE
  v_permission_id UUID;
BEGIN
  -- Check if wallet.view permission exists, if not create it
  SELECT id INTO v_permission_id FROM permissions WHERE code = 'wallet.view';
  
  IF v_permission_id IS NULL THEN
    INSERT INTO permissions (code, name, description, module)
    VALUES ('wallet.view', 'View Own Wallet', 'View personal earnings and wallet balance', 'wallet')
    RETURNING id INTO v_permission_id;
  END IF;
  
  -- Grant to doctor roles
  INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
  SELECT r.role, v_permission_id, true, NULL
  FROM (VALUES ('doctor'::app_role), ('surgeon'::app_role), ('anesthetist'::app_role)) AS r(role)
  WHERE NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role = r.role 
      AND rp.permission_id = v_permission_id
      AND rp.organization_id IS NULL
  )
  ON CONFLICT DO NOTHING;
END $$;
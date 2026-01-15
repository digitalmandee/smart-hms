-- Create missing demo users: HR Officer, OT Technician, Radiology Technician
-- These need to be created via auth.users first, then profiles and user_roles

-- Get the demo organization and branch IDs
DO $$
DECLARE
  v_org_id UUID;
  v_branch_id UUID;
  v_hrofficer_id UUID := gen_random_uuid();
  v_ottech_id UUID := gen_random_uuid();
  v_radtech_id UUID := gen_random_uuid();
BEGIN
  -- Get the HealthOS demo organization
  SELECT id INTO v_org_id FROM organizations WHERE slug = 'healthos' LIMIT 1;
  
  -- Get the first branch
  SELECT id INTO v_branch_id FROM branches WHERE organization_id = v_org_id LIMIT 1;
  
  -- If org exists, create the profiles
  IF v_org_id IS NOT NULL AND v_branch_id IS NOT NULL THEN
    -- HR Officer profile (if not exists)
    INSERT INTO profiles (id, email, full_name, organization_id, branch_id, is_active)
    SELECT v_hrofficer_id, 'hrofficer@healthos.demo', 'Demo HR Officer', v_org_id, v_branch_id, true
    WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'hrofficer@healthos.demo');
    
    -- OT Technician profile (if not exists)
    INSERT INTO profiles (id, email, full_name, organization_id, branch_id, is_active)
    SELECT v_ottech_id, 'ottechnician@healthos.demo', 'Demo OT Technician', v_org_id, v_branch_id, true
    WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'ottechnician@healthos.demo');
    
    -- Radiology Technician profile (if not exists)
    INSERT INTO profiles (id, email, full_name, organization_id, branch_id, is_active)
    SELECT v_radtech_id, 'radtech@healthos.demo', 'Demo Radiology Tech', v_org_id, v_branch_id, true
    WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'radtech@healthos.demo');
    
    -- Assign roles (using subqueries to get the actual profile IDs)
    INSERT INTO user_roles (user_id, role)
    SELECT id, 'hr_officer' FROM profiles WHERE email = 'hrofficer@healthos.demo'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO user_roles (user_id, role)
    SELECT id, 'ot_technician' FROM profiles WHERE email = 'ottechnician@healthos.demo'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO user_roles (user_id, role)
    SELECT id, 'radiology_technician' FROM profiles WHERE email = 'radtech@healthos.demo'
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Add Radiology Technician permissions
INSERT INTO role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'radiology_technician', p.id, true, NULL
FROM permissions p
WHERE p.code IN (
  'dashboard.view',
  'radiology.view', 'radiology.orders.view', 'radiology.capture',
  'patients.view'
)
ON CONFLICT DO NOTHING;
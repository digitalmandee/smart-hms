-- Part 2: Add Blood Bank permissions
INSERT INTO permissions (code, name, module, description) VALUES
  ('blood_bank.view', 'View Blood Bank', 'blood_bank', 'Access Blood Bank module'),
  ('blood_bank.donors.manage', 'Manage Donors', 'blood_bank', 'Create, edit, delete blood donors'),
  ('blood_bank.donations.manage', 'Manage Donations', 'blood_bank', 'Manage blood donations'),
  ('blood_bank.inventory.manage', 'Manage Blood Inventory', 'blood_bank', 'Manage blood units inventory'),
  ('blood_bank.requests.manage', 'Manage Blood Requests', 'blood_bank', 'Manage blood requests'),
  ('blood_bank.transfusions.manage', 'Manage Transfusions', 'blood_bank', 'Record and manage transfusions'),
  ('blood_bank.cross_match', 'Perform Cross Match', 'blood_bank', 'Perform blood cross matching')
ON CONFLICT (code) DO NOTHING;

-- Part 3: Add Radiology permissions
INSERT INTO permissions (code, name, module, description) VALUES
  ('radiology.view', 'View Radiology', 'radiology', 'Access Radiology module'),
  ('radiology.orders.create', 'Create Imaging Orders', 'radiology', 'Create new imaging orders'),
  ('radiology.orders.manage', 'Manage Orders', 'radiology', 'Manage imaging orders'),
  ('radiology.capture', 'Capture Images', 'radiology', 'Capture diagnostic images'),
  ('radiology.reports.create', 'Create Reports', 'radiology', 'Create radiology reports'),
  ('radiology.reports.verify', 'Verify Reports', 'radiology', 'Verify and finalize reports')
ON CONFLICT (code) DO NOTHING;

-- Part 4: Ensure dashboard.view permission exists
INSERT INTO permissions (code, name, module, description) VALUES
  ('dashboard.view', 'View Dashboard', 'core', 'Access main dashboard')
ON CONFLICT (code) DO NOTHING;

-- Part 5: Create demo users for new roles
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
  aud, role, confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 
   'storemanager@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Store Manager"}', 
   'authenticated', 'authenticated', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000000', 
   'hrmanager@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo HR Manager"}', 
   'authenticated', 'authenticated', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000000', 
   'hrofficer@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo HR Officer"}', 
   'authenticated', 'authenticated', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000000', 
   'financemanager@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Finance Manager"}', 
   'authenticated', 'authenticated', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000000', 
   'bloodbank@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Blood Bank Tech"}', 
   'authenticated', 'authenticated', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000000', 
   'radiologist@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Radiologist"}', 
   'authenticated', 'authenticated', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000000', 
   'radtech@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Radiology Tech"}', 
   'authenticated', 'authenticated', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000000', 
   'ipdnurse@healthos.demo', crypt('Demo@123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo IPD Nurse"}', 
   'authenticated', 'authenticated', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Part 6: Create profile entries for new demo users
INSERT INTO profiles (id, full_name, organization_id, branch_id, is_active) VALUES
  ('00000000-0000-0000-0000-000000000020', 'Demo Store Manager', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000021', 'Demo HR Manager', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000022', 'Demo HR Officer', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000023', 'Demo Finance Manager', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000024', 'Demo Blood Bank Tech', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000025', 'Demo Radiologist', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000026', 'Demo Radiology Tech', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000027', 'Demo IPD Nurse', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', true)
ON CONFLICT (id) DO NOTHING;

-- Part 7: Assign roles to new demo users
INSERT INTO user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000020', 'store_manager'),
  ('00000000-0000-0000-0000-000000000021', 'hr_manager'),
  ('00000000-0000-0000-0000-000000000022', 'hr_officer'),
  ('00000000-0000-0000-0000-000000000023', 'finance_manager'),
  ('00000000-0000-0000-0000-000000000024', 'blood_bank_technician'),
  ('00000000-0000-0000-0000-000000000025', 'radiologist'),
  ('00000000-0000-0000-0000-000000000026', 'radiology_technician'),
  ('00000000-0000-0000-0000-000000000027', 'ipd_nurse')
ON CONFLICT (user_id, role) DO NOTHING;

-- Part 8: Assign permissions to new roles via role_permissions
-- Blood Bank Technician permissions
INSERT INTO role_permissions (organization_id, role, permission_id, is_granted)
SELECT 'b1111111-1111-1111-1111-111111111111', 'blood_bank_technician'::app_role, id, true
FROM permissions 
WHERE code IN ('dashboard.view', 'blood_bank.view', 'blood_bank.donors.manage', 'blood_bank.donations.manage', 
               'blood_bank.inventory.manage', 'blood_bank.requests.manage', 'blood_bank.transfusions.manage', 
               'blood_bank.cross_match', 'patients.view')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Radiologist permissions
INSERT INTO role_permissions (organization_id, role, permission_id, is_granted)
SELECT 'b1111111-1111-1111-1111-111111111111', 'radiologist'::app_role, id, true
FROM permissions 
WHERE code IN ('dashboard.view', 'radiology.view', 'radiology.orders.manage', 'radiology.reports.create', 
               'radiology.reports.verify', 'patients.view')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Radiology Technician permissions
INSERT INTO role_permissions (organization_id, role, permission_id, is_granted)
SELECT 'b1111111-1111-1111-1111-111111111111', 'radiology_technician'::app_role, id, true
FROM permissions 
WHERE code IN ('dashboard.view', 'radiology.view', 'radiology.orders.manage', 'radiology.capture', 'patients.view')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- IPD Nurse permissions
INSERT INTO role_permissions (organization_id, role, permission_id, is_granted)
SELECT 'b1111111-1111-1111-1111-111111111111', 'ipd_nurse'::app_role, id, true
FROM permissions 
WHERE code IN ('dashboard.view', 'ipd.view', 'ipd.nursing.manage', 'ipd.vitals.manage', 
               'ipd.emar.manage', 'ipd.admissions.view', 'patients.view')
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Store Manager - add dashboard.view if missing
INSERT INTO role_permissions (organization_id, role, permission_id, is_granted)
SELECT 'b1111111-1111-1111-1111-111111111111', 'store_manager'::app_role, id, true
FROM permissions 
WHERE code = 'dashboard.view'
ON CONFLICT (organization_id, role, permission_id) DO NOTHING;

-- Part 9: Update Blood Bank menu items to use blood_bank.view permission
UPDATE menu_items SET required_permission = 'blood_bank.view' WHERE code = 'blood_bank';
UPDATE menu_items SET required_permission = 'blood_bank.donors.manage' WHERE code = 'blood_donors';
UPDATE menu_items SET required_permission = 'blood_bank.donations.manage' WHERE code = 'blood_donations';
UPDATE menu_items SET required_permission = 'blood_bank.inventory.manage' WHERE code = 'blood_inventory';
UPDATE menu_items SET required_permission = 'blood_bank.requests.manage' WHERE code = 'blood_requests';
UPDATE menu_items SET required_permission = 'blood_bank.cross_match' WHERE code = 'blood_cross_match';
UPDATE menu_items SET required_permission = 'blood_bank.transfusions.manage' WHERE code = 'blood_transfusions';

-- Part 10: Update Radiology menu items to use radiology permissions
UPDATE menu_items SET required_permission = 'radiology.view' WHERE code = 'radiology';
UPDATE menu_items SET required_permission = 'radiology.orders.manage' WHERE code = 'imaging_orders';
UPDATE menu_items SET required_permission = 'radiology.capture' WHERE code IN ('tech_worklist', 'image_capture');
UPDATE menu_items SET required_permission = 'radiology.reports.create' WHERE code IN ('reporting_worklist', 'report_entry');
UPDATE menu_items SET required_permission = 'radiology.reports.verify' WHERE code = 'report_verification';
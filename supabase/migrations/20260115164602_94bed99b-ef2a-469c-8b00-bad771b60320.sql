-- Part 1: Add Missing Permissions for all modules

-- Pharmacy POS permissions
INSERT INTO public.permissions (code, name, description, module, created_at)
VALUES 
  ('pharmacy.pos', 'Manage POS Terminal', 'Access and use the pharmacy POS terminal', 'pharmacy', now()),
  ('pharmacy.pos.sessions', 'Manage POS Sessions', 'Open/close POS sessions and manage cash', 'pharmacy', now())
ON CONFLICT (code) DO NOTHING;

-- Emergency permissions
INSERT INTO public.permissions (code, name, description, module, created_at)
VALUES 
  ('emergency.view', 'View Emergency Module', 'Access the emergency module', 'emergency', now()),
  ('emergency.register', 'Register ER Patients', 'Register new emergency patients', 'emergency', now()),
  ('emergency.triage', 'Perform Triage', 'Perform triage assessments', 'emergency', now()),
  ('emergency.treat', 'Treat ER Patients', 'Provide treatment to ER patients', 'emergency', now())
ON CONFLICT (code) DO NOTHING;

-- Inventory permissions
INSERT INTO public.permissions (code, name, description, module, created_at)
VALUES 
  ('inventory.view', 'View Inventory', 'Access the inventory module', 'inventory', now()),
  ('inventory.manage', 'Manage Inventory', 'Add/edit inventory items', 'inventory', now()),
  ('inventory.po', 'Manage Purchase Orders', 'Create and manage purchase orders', 'inventory', now()),
  ('inventory.grn', 'Manage GRN', 'Create and manage goods received notes', 'inventory', now()),
  ('inventory.requisitions', 'Manage Requisitions', 'Create and manage stock requisitions', 'inventory', now())
ON CONFLICT (code) DO NOTHING;

-- Laboratory permissions
INSERT INTO public.permissions (code, name, description, module, created_at)
VALUES 
  ('laboratory.view', 'View Laboratory', 'Access the laboratory module', 'laboratory', now()),
  ('laboratory.orders', 'Manage Lab Orders', 'Create and manage lab orders', 'laboratory', now()),
  ('laboratory.results', 'Enter Lab Results', 'Enter and edit lab results', 'laboratory', now()),
  ('laboratory.reports', 'View Lab Reports', 'View and print lab reports', 'laboratory', now())
ON CONFLICT (code) DO NOTHING;

-- Accounts permissions
INSERT INTO public.permissions (code, name, description, module, created_at)
VALUES 
  ('accounts.view', 'View Accounts', 'Access the accounts module', 'accounts', now()),
  ('accounts.journal', 'Manage Journal Entries', 'Create journal entries', 'accounts', now()),
  ('accounts.ledger', 'View Ledgers', 'View account ledgers', 'accounts', now()),
  ('accounts.reports', 'View Financial Reports', 'View financial reports', 'accounts', now())
ON CONFLICT (code) DO NOTHING;

-- Part 2: Fix Parent Menu Permissions
UPDATE public.menu_items SET required_permission = 'emergency.view' WHERE code = 'emergency' AND parent_id IS NULL;
UPDATE public.menu_items SET required_permission = 'inventory.view' WHERE code = 'inventory' AND parent_id IS NULL;
UPDATE public.menu_items SET required_permission = 'laboratory.view' WHERE code = 'laboratory' AND parent_id IS NULL;
UPDATE public.menu_items SET required_permission = 'ot:view' WHERE code = 'operation_theatre' AND parent_id IS NULL;
UPDATE public.menu_items SET required_permission = 'accounts.view' WHERE code = 'accounts' AND parent_id IS NULL;

-- Part 3: Add Pharmacy POS Menu Items
-- First get the pharmacy parent menu id
DO $$
DECLARE
  pharmacy_parent_id UUID;
BEGIN
  SELECT id INTO pharmacy_parent_id FROM public.menu_items WHERE code = 'pharmacy' AND parent_id IS NULL;
  
  IF pharmacy_parent_id IS NOT NULL THEN
    -- Delete existing pharmacy children to rebuild correctly
    DELETE FROM public.menu_items WHERE parent_id = pharmacy_parent_id;
    
    -- Insert POS and pharmacy menu items with correct order
    INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
    VALUES 
      ('pharmacy_pos', 'POS Terminal', 'Store', '/app/pharmacy/pos', pharmacy_parent_id, 1, 'pharmacy.pos', 'pharmacy', true),
      ('pharmacy_prescriptions', 'Prescription Queue', 'FileText', '/app/pharmacy/prescriptions', pharmacy_parent_id, 2, 'pharmacy.dispense', 'pharmacy', true),
      ('pharmacy_transactions', 'Transactions', 'Receipt', '/app/pharmacy/transactions', pharmacy_parent_id, 3, 'pharmacy.pos', 'pharmacy', true),
      ('pharmacy_sessions', 'POS Sessions', 'Clock', '/app/pharmacy/sessions', pharmacy_parent_id, 4, 'pharmacy.pos.sessions', 'pharmacy', true),
      ('pharmacy_medicines', 'Medicines', 'Pill', '/app/pharmacy/medicines', pharmacy_parent_id, 5, 'pharmacy.inventory', 'pharmacy', true),
      ('pharmacy_categories', 'Categories', 'Tags', '/app/pharmacy/categories', pharmacy_parent_id, 6, 'pharmacy.categories', 'pharmacy', true),
      ('pharmacy_inventory', 'Inventory', 'Package', '/app/pharmacy/inventory', pharmacy_parent_id, 7, 'pharmacy.inventory', 'pharmacy', true),
      ('pharmacy_stock_entry', 'Stock Entry', 'PackagePlus', '/app/pharmacy/stock-entry', pharmacy_parent_id, 8, 'pharmacy.inventory', 'pharmacy', true),
      ('pharmacy_alerts', 'Stock Alerts', 'AlertTriangle', '/app/pharmacy/alerts', pharmacy_parent_id, 9, 'pharmacy.inventory', 'pharmacy', true),
      ('pharmacy_reports', 'Reports', 'BarChart3', '/app/pharmacy/reports', pharmacy_parent_id, 10, 'pharmacy.reports', 'pharmacy', true);
  END IF;
END $$;

-- Part 4: Assign Permissions to Roles
-- First, get all permission IDs we need
DO $$
DECLARE
  perm_record RECORD;
BEGIN
  -- Pharmacist permissions
  FOR perm_record IN 
    SELECT id FROM public.permissions WHERE code IN (
      'pharmacy.pos', 'pharmacy.pos.sessions', 'pharmacy.view', 'pharmacy.dispense', 
      'pharmacy.inventory', 'pharmacy.categories', 'pharmacy.reports',
      'patients.view', 'billing.view'
    )
  LOOP
    INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
    VALUES ('pharmacist', perm_record.id, true, NULL)
    ON CONFLICT (role, permission_id, organization_id) DO NOTHING;
  END LOOP;

  -- Lab Technician permissions
  FOR perm_record IN 
    SELECT id FROM public.permissions WHERE code IN (
      'laboratory.view', 'laboratory.orders', 'laboratory.results', 'laboratory.reports',
      'patients.view'
    )
  LOOP
    INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
    VALUES ('lab_technician', perm_record.id, true, NULL)
    ON CONFLICT (role, permission_id, organization_id) DO NOTHING;
  END LOOP;

  -- Accountant permissions
  FOR perm_record IN 
    SELECT id FROM public.permissions WHERE code IN (
      'accounts.view', 'accounts.journal', 'accounts.ledger', 'accounts.reports',
      'billing.view', 'billing.reports'
    )
  LOOP
    INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
    VALUES ('accountant', perm_record.id, true, NULL)
    ON CONFLICT (role, permission_id, organization_id) DO NOTHING;
  END LOOP;

  -- Doctor permissions for emergency
  FOR perm_record IN 
    SELECT id FROM public.permissions WHERE code IN (
      'emergency.view', 'emergency.treat', 'ot:view', 'ot:schedule'
    )
  LOOP
    INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
    VALUES ('doctor', perm_record.id, true, NULL)
    ON CONFLICT (role, permission_id, organization_id) DO NOTHING;
  END LOOP;

  -- Nurse permissions for emergency & IPD
  FOR perm_record IN 
    SELECT id FROM public.permissions WHERE code IN (
      'emergency.view', 'emergency.register', 'emergency.triage',
      'ipd.view', 'ipd.nursing'
    )
  LOOP
    INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
    VALUES ('nurse', perm_record.id, true, NULL)
    ON CONFLICT (role, permission_id, organization_id) DO NOTHING;
  END LOOP;

  -- Store Manager permissions for inventory
  FOR perm_record IN 
    SELECT id FROM public.permissions WHERE code IN (
      'inventory.view', 'inventory.manage', 'inventory.po', 'inventory.grn', 'inventory.requisitions'
    )
  LOOP
    INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
    VALUES ('store_manager', perm_record.id, true, NULL)
    ON CONFLICT (role, permission_id, organization_id) DO NOTHING;
  END LOOP;
END $$;
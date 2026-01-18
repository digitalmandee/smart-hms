-- Create or update Reports parent menu
DO $$
DECLARE
  reports_parent_id UUID;
BEGIN
  -- Check if Reports parent exists
  SELECT id INTO reports_parent_id FROM menu_items WHERE code = 'reports' LIMIT 1;
  
  IF reports_parent_id IS NULL THEN
    -- Create Reports parent menu
    INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
    VALUES ('reports', 'Reports', 'BarChart3', NULL, NULL, 7, 'reports.view', true)
    RETURNING id INTO reports_parent_id;
  ELSE
    -- Update existing Reports parent
    UPDATE menu_items SET icon = 'BarChart3', sort_order = 7, is_active = true WHERE id = reports_parent_id;
  END IF;
  
  -- Delete old sub-items for this parent
  DELETE FROM menu_items WHERE parent_id = reports_parent_id;
  
  -- Add Reports Hub
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.hub', 'Reports Hub', 'LayoutDashboard', '/app/reports', reports_parent_id, 1, 'reports.view', true);
  
  -- Clinical Reports
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.clinic', 'Clinic Reports', 'Ticket', '/app/clinic/reports', reports_parent_id, 10, 'reports.view', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.patients', 'Patient Reports', 'Users', '/app/patients/reports', reports_parent_id, 11, 'reports.patients', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.appointments', 'Appointment Reports', 'Calendar', '/app/appointments/reports', reports_parent_id, 12, 'reports.appointments', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.doctors', 'Doctor Reports', 'Stethoscope', '/app/opd/reports', reports_parent_id, 13, 'reports.view', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.lab', 'Lab Reports', 'TestTube', '/app/lab/reports', reports_parent_id, 14, 'reports.view', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.emergency', 'ER Reports', 'Siren', '/app/emergency/reports', reports_parent_id, 15, 'reports.view', true);
  
  -- Operational Reports
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.ipd', 'IPD Reports', 'Bed', '/app/ipd/reports', reports_parent_id, 20, 'ipd.reports.view', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.pharmacy', 'Pharmacy Reports', 'Pill', '/app/pharmacy/reports', reports_parent_id, 21, 'pharmacy.reports', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.inventory', 'Inventory Reports', 'Package', '/app/inventory/reports', reports_parent_id, 22, 'inventory.view', true);
  
  -- Financial Reports
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.billing', 'Billing Reports', 'Receipt', '/app/billing/reports', reports_parent_id, 30, 'billing.view', true);
  
  INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
  VALUES ('reports.financial', 'Financial Reports', 'DollarSign', '/app/accounts/reports', reports_parent_id, 31, 'accounts.view', true);
END $$;
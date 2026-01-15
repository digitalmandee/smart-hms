
-- Insert Blood Bank Menu Items with correct column names
-- First insert the parent menu
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active) VALUES
  ('blood-bank', 'Blood Bank', 'Droplet', NULL, NULL, 60, 'blood_bank:view', true)
ON CONFLICT (code) DO NOTHING;

-- Get the parent ID and insert children
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 
  child.code,
  child.name,
  child.icon,
  child.path,
  parent.id,
  child.sort_order,
  child.required_permission,
  true
FROM (VALUES
  ('blood-bank-dashboard', 'Dashboard', 'LayoutDashboard', '/app/blood-bank', 1, 'blood_bank:view'),
  ('blood-bank-donors', 'Donors', 'Users', '/app/blood-bank/donors', 2, 'blood_bank:view'),
  ('blood-bank-donations', 'Donations', 'Heart', '/app/blood-bank/donations', 3, 'blood_bank:manage_donations'),
  ('blood-bank-inventory', 'Inventory', 'Package', '/app/blood-bank/inventory', 4, 'blood_bank:view'),
  ('blood-bank-requests', 'Blood Requests', 'FileText', '/app/blood-bank/requests', 5, 'blood_bank:process_requests'),
  ('blood-bank-cross-match', 'Cross Matching', 'TestTubes', '/app/blood-bank/cross-match', 6, 'blood_bank:cross_match'),
  ('blood-bank-transfusions', 'Transfusions', 'Activity', '/app/blood-bank/transfusions', 7, 'blood_bank:manage_transfusions')
) AS child(code, name, icon, path, sort_order, required_permission)
CROSS JOIN (SELECT id FROM public.menu_items WHERE code = 'blood-bank') AS parent
ON CONFLICT (code) DO NOTHING;

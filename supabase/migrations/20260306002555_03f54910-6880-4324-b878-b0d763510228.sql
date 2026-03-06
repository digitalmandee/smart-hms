
INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
VALUES 
  ('insurance.nphies.eligibility', 'Eligibility Checks', '/app/insurance/nphies/eligibility', 'ShieldCheck', 'f82fe6cc-4d68-4a28-be41-1469b0fcf1c6', 30, true, 'insurance'),
  ('insurance.nphies.pre-auth', 'Pre-Authorizations', '/app/insurance/nphies/pre-authorizations', 'FileCheck', 'f82fe6cc-4d68-4a28-be41-1469b0fcf1c6', 40, true, 'insurance')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

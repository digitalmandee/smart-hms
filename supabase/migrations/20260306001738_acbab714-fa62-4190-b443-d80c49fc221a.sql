
-- 1. Add 'insurance' to available_modules
INSERT INTO available_modules (code, name, description, icon, category, is_core, is_hospital_only, sort_order)
VALUES ('insurance', 'Insurance', 'Insurance companies, plans, claims, and NPHIES integration', 'ShieldCheck', 'clinical', false, false, 25)
ON CONFLICT (code) DO NOTHING;

-- 2. Enable insurance module for all existing organizations
INSERT INTO organization_modules (organization_id, module_code, is_enabled, enabled_at)
SELECT o.id, 'insurance', true, now()
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM organization_modules om 
  WHERE om.organization_id = o.id AND om.module_code = 'insurance'
);

-- 3. Create top-level Insurance menu item
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
VALUES ('insurance', 'Insurance', 'ShieldCheck', NULL, NULL, 55, 'insurance', NULL, true)
ON CONFLICT (code) DO NOTHING;

-- 4. Create Manual Insurance sub-group
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.manual', 'Manual Insurance', 'FileText', NULL, id, 1, NULL, NULL, true
FROM menu_items WHERE code = 'insurance'
ON CONFLICT (code) DO NOTHING;

-- 5. Create NPHIES sub-group
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.nphies', 'NPHIES', 'CloudUpload', NULL, id, 2, NULL, NULL, true
FROM menu_items WHERE code = 'insurance'
ON CONFLICT (code) DO NOTHING;

-- 6. Manual Insurance children
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.manual.companies', 'Insurance Companies', 'Building2', '/app/insurance/companies', id, 1, NULL, NULL, true
FROM menu_items WHERE code = 'insurance.manual'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.manual.plans', 'Insurance Plans', 'ClipboardList', '/app/insurance/plans', id, 2, NULL, NULL, true
FROM menu_items WHERE code = 'insurance.manual'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.manual.claims', 'Claims', 'FileCheck', '/app/insurance/claims', id, 3, NULL, NULL, true
FROM menu_items WHERE code = 'insurance.manual'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.manual.claims-report', 'Claims Report', 'BarChart3', '/app/insurance/claims-report', id, 4, NULL, NULL, true
FROM menu_items WHERE code = 'insurance.manual'
ON CONFLICT (code) DO NOTHING;

-- 7. NPHIES children
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.nphies.settings', 'NPHIES Settings', 'Settings', '/app/insurance/nphies/settings', id, 1, NULL, NULL, true
FROM menu_items WHERE code = 'insurance.nphies'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, required_permission, is_active)
SELECT 'insurance.nphies.analytics', 'NPHIES Analytics', 'BarChart3', '/app/insurance/nphies/analytics', id, 2, NULL, NULL, true
FROM menu_items WHERE code = 'insurance.nphies'
ON CONFLICT (code) DO NOTHING;

-- 8. Deactivate old billing.insurance.* entries
UPDATE menu_items SET is_active = false WHERE code LIKE 'billing.insurance%';

-- 9. Deactivate legacy insurance_* entries
UPDATE menu_items SET is_active = false WHERE code IN ('insurance_companies', 'insurance_plans', 'insurance_claims');

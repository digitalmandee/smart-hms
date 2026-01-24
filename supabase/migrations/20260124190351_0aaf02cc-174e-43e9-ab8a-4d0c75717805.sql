-- Add Compliance parent menu under HR
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active) 
SELECT 'hr.compliance', 'Compliance', 'ShieldCheck', NULL, id, 25, 'hr', true
FROM menu_items WHERE code = 'hr'
ON CONFLICT (code) DO NOTHING;

-- Add Compliance child items
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active) 
SELECT 'hr.compliance.licenses', 'Medical Licenses', 'Award', '/app/hr/compliance/licenses', id, 1, 'hr', true
FROM menu_items WHERE code = 'hr.compliance'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active) 
SELECT 'hr.compliance.documents', 'Employee Documents', 'FileText', '/app/hr/compliance/documents', id, 2, 'hr', true
FROM menu_items WHERE code = 'hr.compliance'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active) 
SELECT 'hr.compliance.fitness', 'Medical Fitness', 'HeartPulse', '/app/hr/compliance/medical-fitness', id, 3, 'hr', true
FROM menu_items WHERE code = 'hr.compliance'
ON CONFLICT (code) DO NOTHING;

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_module, is_active) 
SELECT 'hr.compliance.vaccinations', 'Vaccinations', 'Syringe', '/app/hr/compliance/vaccinations', id, 4, 'hr', true
FROM menu_items WHERE code = 'hr.compliance'
ON CONFLICT (code) DO NOTHING;
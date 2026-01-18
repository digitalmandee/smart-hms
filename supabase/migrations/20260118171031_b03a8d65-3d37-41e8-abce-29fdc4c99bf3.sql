-- Add menu items for new report pages (without organization_id)
INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
SELECT 'clinic-reports', 'Reports', '/app/clinic/reports', 'BarChart3', 
  (SELECT id FROM menu_items WHERE code = 'clinic' LIMIT 1), 50, true, 'clinic'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'clinic-reports');

INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
SELECT 'appointment-reports', 'Reports', '/app/appointments/reports', 'BarChart3', 
  (SELECT id FROM menu_items WHERE code = 'appointments' LIMIT 1), 50, true, 'appointments'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'appointment-reports');

INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
SELECT 'patient-reports', 'Reports', '/app/patients/reports', 'BarChart3', 
  (SELECT id FROM menu_items WHERE code = 'patients' LIMIT 1), 50, true, 'patients'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'patient-reports');

INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
SELECT 'opd-reports', 'Doctor Reports', '/app/opd/reports', 'BarChart3', 
  (SELECT id FROM menu_items WHERE code = 'opd' LIMIT 1), 50, true, 'opd'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'opd-reports');

INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
SELECT 'lab-reports', 'Reports', '/app/lab/reports', 'BarChart3', 
  (SELECT id FROM menu_items WHERE code = 'lab' LIMIT 1), 50, true, 'lab'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'lab-reports');

INSERT INTO menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_module)
SELECT 'er-reports', 'Reports', '/app/emergency/reports', 'BarChart3', 
  (SELECT id FROM menu_items WHERE code = 'emergency' LIMIT 1), 50, true, 'emergency'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'er-reports');
-- Add menu items for new settings pages
INSERT INTO menu_items (id, name, code, path, icon, parent_id, required_permission, sort_order, is_active)
SELECT 
  gen_random_uuid(),
  'Specializations',
  'settings.specializations',
  '/app/settings/specializations',
  'Award',
  (SELECT id FROM menu_items WHERE code = 'settings' LIMIT 1),
  'settings.view',
  50,
  true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'settings.specializations');

INSERT INTO menu_items (id, name, code, path, icon, parent_id, required_permission, sort_order, is_active)
SELECT 
  gen_random_uuid(),
  'Qualifications',
  'settings.qualifications',
  '/app/settings/qualifications',
  'GraduationCap',
  (SELECT id FROM menu_items WHERE code = 'settings' LIMIT 1),
  'settings.view',
  51,
  true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'settings.qualifications');

INSERT INTO menu_items (id, name, code, path, icon, parent_id, required_permission, sort_order, is_active)
SELECT 
  gen_random_uuid(),
  'Doctor Fees',
  'settings.doctor_fees',
  '/app/settings/doctor-fees',
  'Stethoscope',
  (SELECT id FROM menu_items WHERE code = 'settings' LIMIT 1),
  'settings.view',
  52,
  true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE code = 'settings.doctor_fees');
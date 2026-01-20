-- Add menu items for new configuration pages
INSERT INTO menu_items (name, path, icon, parent_id, sort_order, required_permission, is_active)
SELECT 'Patient Config', '/app/settings/patient-config', 'UserCog', id, 45, 'settings.view', true
FROM menu_items WHERE path = '/app/settings' AND parent_id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (name, path, icon, parent_id, sort_order, required_permission, is_active)
SELECT 'HR Config', '/app/settings/hr-config', 'HeartHandshake', id, 46, 'settings.view', true
FROM menu_items WHERE path = '/app/settings' AND parent_id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (name, path, icon, parent_id, sort_order, required_permission, is_active)
SELECT 'IPD Config', '/app/settings/ipd-config', 'BedDouble', id, 47, 'settings.view', true
FROM menu_items WHERE path = '/app/settings' AND parent_id IS NULL
ON CONFLICT DO NOTHING;
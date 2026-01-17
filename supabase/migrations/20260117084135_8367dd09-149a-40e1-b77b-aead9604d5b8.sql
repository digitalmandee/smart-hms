-- Grant kiosk and queue display permissions to branch_admin

-- Ensure permissions exist
INSERT INTO permissions (code, name, description, module)
SELECT 'settings.kiosks', 'Manage Kiosks', 'Create and configure kiosk terminals', 'settings'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'settings.kiosks');

INSERT INTO permissions (code, name, description, module)
SELECT 'settings.queue-displays', 'Manage Queue Displays', 'Configure queue display screens', 'settings'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'settings.queue-displays');

-- Grant to branch_admin role
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin'::app_role, p.id, true
FROM permissions p
WHERE p.code = 'settings.kiosks'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role = 'branch_admin' AND rp.permission_id = p.id);

INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin'::app_role, p.id, true
FROM permissions p
WHERE p.code = 'settings.queue-displays'
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role = 'branch_admin' AND rp.permission_id = p.id);

-- Ensure menu items exist (using correct column: name not label)
INSERT INTO menu_items (parent_id, code, name, path, icon, sort_order, required_permission, is_active)
SELECT parent.id, 'kiosk-management', 'Kiosk Management', '/app/settings/kiosks', 'Monitor', 80, 'settings.kiosks', true
FROM menu_items parent
WHERE parent.path = '/app/settings' AND parent.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE path = '/app/settings/kiosks');

INSERT INTO menu_items (parent_id, code, name, path, icon, sort_order, required_permission, is_active)
SELECT parent.id, 'queue-displays', 'Queue Displays', '/app/settings/queue-displays', 'LayoutGrid', 81, 'settings.queue-displays', true
FROM menu_items parent
WHERE parent.path = '/app/settings' AND parent.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE path = '/app/settings/queue-displays');
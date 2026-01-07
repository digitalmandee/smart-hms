-- Add Notification Settings menu item
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
VALUES (
  'settings.notifications',
  'Notifications',
  'Bell',
  '/app/settings/notifications',
  '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc',
  7,
  'settings.view',
  true
);
-- Insert child menu items for OT (parent already exists)
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_permission)
VALUES 
  ('ot-dashboard', 'OT Dashboard', '/app/ot', 'LayoutDashboard', (SELECT id FROM public.menu_items WHERE code = 'ot' LIMIT 1), 1, true, 'ot:view'),
  ('ot-schedule', 'Surgery Schedule', '/app/ot/schedule', 'Calendar', (SELECT id FROM public.menu_items WHERE code = 'ot' LIMIT 1), 2, true, 'ot:view'),
  ('ot-surgeries', 'Surgeries', '/app/ot/surgeries', 'Scissors', (SELECT id FROM public.menu_items WHERE code = 'ot' LIMIT 1), 3, true, 'ot:view'),
  ('ot-rooms', 'OT Rooms', '/app/ot/rooms', 'DoorOpen', (SELECT id FROM public.menu_items WHERE code = 'ot' LIMIT 1), 4, true, 'ot:manage_rooms'),
  ('ot-pacu', 'Recovery (PACU)', '/app/ot/pacu', 'HeartPulse', (SELECT id FROM public.menu_items WHERE code = 'ot' LIMIT 1), 5, true, 'ot:view')
ON CONFLICT (code) DO NOTHING;

-- Add OT-related permissions if they don't exist
INSERT INTO public.permissions (code, name, description, module)
VALUES 
  ('ot:view', 'View OT', 'View operation theatre dashboard and schedules', 'ot'),
  ('ot:schedule', 'Schedule Surgeries', 'Create and manage surgery schedules', 'ot'),
  ('ot:manage_rooms', 'Manage OT Rooms', 'Add, edit, and manage operating rooms', 'ot'),
  ('ot:start_surgery', 'Start/Complete Surgery', 'Start and complete surgical procedures', 'ot'),
  ('ot:pacu', 'PACU Access', 'Access post-anesthesia care unit', 'ot'),
  ('ot:anesthesia', 'Manage Anesthesia Records', 'Create and manage anesthesia records', 'ot')
ON CONFLICT (code) DO NOTHING;
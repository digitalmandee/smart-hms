-- Add menu items for Clinical Config and Lab Settings
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, required_permission, is_active)
VALUES 
  ('settings-clinical', 'Clinical Config', '/app/settings/clinical', 'Stethoscope', '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc', 25, 'settings.clinical', true),
  ('settings-lab', 'Lab Settings', '/app/settings/lab', 'TestTube', '3e939b73-9ede-4cf3-9c3b-8e13df3cf6dc', 26, 'settings.lab', true)
ON CONFLICT DO NOTHING;
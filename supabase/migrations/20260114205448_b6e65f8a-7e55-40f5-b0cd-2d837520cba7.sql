-- Insert Emergency Department menu items with correct parent_id reference
-- First insert the parent menu item
INSERT INTO public.menu_items (code, name, icon, path, sort_order, is_active)
VALUES ('emergency', 'Emergency', 'Siren', NULL, 25, true)
ON CONFLICT (code) DO NOTHING;

-- Then insert child menu items using subquery for parent_id
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 'er_dashboard', 'ER Dashboard', 'Activity', '/app/emergency', id, 1, true 
FROM menu_items WHERE code = 'emergency'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 'er_register', 'New Registration', 'UserPlus', '/app/emergency/register', id, 2, true 
FROM menu_items WHERE code = 'emergency'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 'er_triage', 'Triage Station', 'Gauge', '/app/emergency/triage', id, 3, true 
FROM menu_items WHERE code = 'emergency'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 'er_queue', 'ER Queue', 'ListOrdered', '/app/emergency/queue', id, 4, true 
FROM menu_items WHERE code = 'emergency'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 'er_ambulance', 'Ambulance Alerts', 'Ambulance', '/app/emergency/ambulance-alerts', id, 5, true 
FROM menu_items WHERE code = 'emergency'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, is_active)
SELECT 'er_display', 'Queue Display', 'Monitor', '/app/emergency/display', id, 6, true 
FROM menu_items WHERE code = 'emergency'
ON CONFLICT (code) DO NOTHING;
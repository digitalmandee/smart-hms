-- Add Token Printer and Nurse Station menu items for better navigation clarity

-- OPD Token Printer menu item
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'opd_token_printer', 'Token Queue', 'ListOrdered', '/app/appointments/queue', 
       id, 15, 'appointments.checkin', true
FROM public.menu_items WHERE code = 'opd'
ON CONFLICT (code) DO NOTHING;

-- Nurse Station menu item under OPD
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'nurse_station', 'Nurse Station', 'HeartPulse', '/app/opd/nursing', 
       id, 5, 'appointments.checkin', true
FROM public.menu_items WHERE code = 'opd'
ON CONFLICT (code) DO NOTHING;

-- ER Token Queue menu item
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'er_token_queue', 'ER Queue', 'ListOrdered', '/app/emergency/queue', 
       id, 15, 'emergency.view', true
FROM public.menu_items WHERE code = 'emergency'
ON CONFLICT (code) DO NOTHING;
-- Fix the appointments.schedule menu item path to match the actual route
UPDATE public.menu_items 
SET path = '/app/appointments/schedules'
WHERE code = 'appointments.schedule' AND path = '/app/appointments/schedule';
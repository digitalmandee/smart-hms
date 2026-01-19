-- Fix Token Kiosk menu item path - pointing to wrong route
UPDATE public.menu_items 
SET path = '/app/appointments/kiosk-setup'
WHERE code = 'opd_token_kiosk';
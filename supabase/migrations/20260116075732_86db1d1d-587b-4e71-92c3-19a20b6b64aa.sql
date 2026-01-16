-- Update token display menu items to point to public URLs
-- These are informational - staff copies the URL for their TV/kiosk setup

-- Update OPD Token Display menu item with note about public URL
UPDATE menu_items 
SET name = 'Token Display Setup',
    icon = 'Monitor'
WHERE code = 'opd_token_display';

-- Update ER Display menu item
UPDATE menu_items 
SET name = 'ER Display Setup',
    is_active = true
WHERE code = 'er_display';

-- Add Token Kiosk setup menu item if not exists
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 
  'token_kiosk_setup', 
  'Token Kiosk Setup', 
  'Ticket', 
  '/app/appointments/kiosk-setup',
  id,
  17,
  'appointments.manage',
  true
FROM menu_items WHERE code = 'appointments'
ON CONFLICT (code) DO UPDATE SET 
  name = 'Token Kiosk Setup',
  is_active = true;
-- Update menu_items paths from /app/settings/services to /app/services
UPDATE menu_items 
SET path = '/app/services' 
WHERE code = 'services.all';

UPDATE menu_items 
SET path = '/app/services/doctor-fees' 
WHERE code = 'services.consultations';
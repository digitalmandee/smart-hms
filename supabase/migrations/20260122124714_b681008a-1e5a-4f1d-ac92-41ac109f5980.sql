-- Update menu_items paths to use the new category services page pattern
UPDATE menu_items 
SET path = '/app/services/category/consultation' 
WHERE code = 'services.consultations' OR path = '/app/services/doctor-fees';

UPDATE menu_items 
SET path = '/app/services/category/lab' 
WHERE code = 'services.lab' OR path = '/app/lab/templates';

UPDATE menu_items 
SET path = '/app/services/category/radiology' 
WHERE code = 'services.radiology' OR path = '/app/radiology/procedures';

UPDATE menu_items 
SET path = '/app/services/category/room' 
WHERE code = 'services.rooms' OR path = '/app/ipd/setup/bed-types';
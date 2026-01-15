-- Clean up duplicate OT menu items that lack proper permissions
DELETE FROM menu_items 
WHERE code LIKE 'ot.%' 
AND required_permission IS NULL;
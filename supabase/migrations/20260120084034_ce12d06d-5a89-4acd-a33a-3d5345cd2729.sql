-- Fix inactive Patient Care menu
UPDATE menu_items SET is_active = true WHERE code = 'ipd.care';

-- Ensure proper sort order for IPD submenus  
UPDATE menu_items SET sort_order = 2 WHERE code = 'ipd.admissions';
UPDATE menu_items SET sort_order = 3 WHERE code = 'ipd.beds';
UPDATE menu_items SET sort_order = 4 WHERE code = 'ipd.care';
UPDATE menu_items SET sort_order = 5 WHERE code = 'ipd.discharge';
UPDATE menu_items SET sort_order = 6 WHERE code = 'ipd.records';
UPDATE menu_items SET sort_order = 8 WHERE code = 'ipd.setup';
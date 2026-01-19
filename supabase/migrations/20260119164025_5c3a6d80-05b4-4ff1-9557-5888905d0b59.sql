-- Fix Diet Types path to match actual route
UPDATE public.menu_items 
SET path = '/app/ipd/setup/diet-types' 
WHERE name = 'Diet Types' AND path = '/app/ipd/diet-types';
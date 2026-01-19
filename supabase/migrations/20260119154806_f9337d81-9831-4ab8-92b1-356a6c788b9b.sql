-- Enable IPD menu items that now have working pages
UPDATE public.menu_items 
SET is_active = true 
WHERE path IN (
  '/app/ipd/beds/wards',
  '/app/ipd/beds/transfers',
  '/app/ipd/care/vitals',
  '/app/ipd/care/diet',
  '/app/ipd/admissions/history',
  '/app/ipd/setup/diet-types',
  '/app/ipd/diet',
  '/app/ipd/vitals',
  '/app/ipd/nursing-notes',
  '/app/ipd/care-plans',
  '/app/ipd/history'
);

-- Update icon for diet-types menu item
UPDATE public.menu_items
SET icon = 'Apple'
WHERE path = '/app/ipd/setup/diet-types';

-- Update icon for housekeeping menu
UPDATE public.menu_items
SET icon = 'Sparkles'
WHERE path = '/app/ipd/beds/housekeeping';

-- Update icons for other IPD items
UPDATE public.menu_items SET icon = 'History' WHERE path = '/app/ipd/history' AND icon IS NULL;
UPDATE public.menu_items SET icon = 'DoorOpen' WHERE path LIKE '%discharge%' AND icon IS NULL;
UPDATE public.menu_items SET icon = 'UtensilsCrossed' WHERE path = '/app/ipd/diet' AND icon IS NULL;
UPDATE public.menu_items SET icon = 'Plus' WHERE name ILIKE '%new admission%' AND icon IS NULL;
UPDATE public.menu_items SET icon = 'Settings2' WHERE path LIKE '%/setup%' AND icon IS NULL;
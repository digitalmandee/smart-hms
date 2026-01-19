-- Fix IPD Billing menu item icon from IndianRupee to Receipt
UPDATE public.menu_items 
SET icon = 'Receipt' 
WHERE code = 'ipd.charges' AND icon = 'IndianRupee';

-- Also fix any other Indian Rupee icons if they exist
UPDATE public.menu_items 
SET icon = 'Receipt' 
WHERE icon = 'IndianRupee';
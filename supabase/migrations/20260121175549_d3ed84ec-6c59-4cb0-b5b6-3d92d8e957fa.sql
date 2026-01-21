-- Fix menu item paths that cause 404s

-- Fix Clinic Dashboard path (menu says /dashboard but route is at /clinic)
UPDATE menu_items 
SET path = '/app/clinic' 
WHERE path = '/app/clinic/dashboard';

-- Fix IPD Nursing Notes path (menu says /nursing but route is /nursing-notes)
UPDATE menu_items 
SET path = '/app/ipd/nursing-notes' 
WHERE path = '/app/ipd/nursing';
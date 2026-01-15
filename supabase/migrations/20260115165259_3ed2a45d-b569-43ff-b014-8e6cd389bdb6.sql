-- Add Lab Dashboard menu item
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 
  'lab_dashboard',
  'Lab Dashboard',
  'TestTube',
  '/app/lab',
  id,
  0,
  'laboratory.view',
  true
FROM public.menu_items 
WHERE code = 'laboratory'
ON CONFLICT (code) DO NOTHING;
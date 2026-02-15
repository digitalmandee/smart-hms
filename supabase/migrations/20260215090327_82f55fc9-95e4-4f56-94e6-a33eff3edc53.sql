-- Add AI Chat as a submenu item under OPD (no new module)
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, is_active, required_permission, required_module)
SELECT 
  'opd.ai-chat',
  'AI Assistant',
  '/app/ai-chat',
  'Bot',
  (SELECT id FROM public.menu_items WHERE code = 'opd' AND parent_id IS NULL LIMIT 1),
  99,
  true,
  'opd.doctor',
  'opd'
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE code = 'opd.ai-chat');
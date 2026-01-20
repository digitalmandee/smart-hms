-- Add permissions for clinical settings (using correct column 'module' instead of 'category')
INSERT INTO public.permissions (code, name, description, module)
VALUES 
  ('settings.clinical', 'Manage Clinical Config', 'Configure symptoms, frequencies, durations, instructions', 'settings'),
  ('settings.lab', 'Manage Lab Settings', 'Configure lab payment and workflow settings', 'settings'),
  ('lab.create-order', 'Create Lab Orders', 'Create lab orders without consultation', 'lab')
ON CONFLICT (code) DO NOTHING;

-- Grant permissions to org_admin and branch_admin
INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT 'org_admin', p.id, true
FROM public.permissions p
WHERE p.code IN ('settings.clinical', 'settings.lab', 'lab.create-order')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT 'branch_admin', p.id, true
FROM public.permissions p
WHERE p.code IN ('settings.clinical', 'settings.lab')
ON CONFLICT DO NOTHING;

-- Grant lab.create-order to receptionist
INSERT INTO public.role_permissions (role, permission_id, is_granted)
SELECT 'receptionist', p.id, true
FROM public.permissions p
WHERE p.code = 'lab.create-order'
ON CONFLICT DO NOTHING;
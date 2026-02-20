
INSERT INTO public.stores (organization_id, branch_id, name, store_type, is_central, is_active, description, context)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'ab111111-1111-1111-1111-111111111111', 'Main Distribution Center', 'central', true, true, 'Primary distribution warehouse', 'warehouse'),
  ('a1111111-1111-1111-1111-111111111111', 'ab111111-1111-1111-1111-111111111111', 'Medical Supplies Store', 'medical', false, true, 'Medical supplies storage', 'warehouse'),
  ('a1111111-1111-1111-1111-111111111111', 'ab111111-1111-1111-1111-111111111111', 'General Storage Area', 'general', false, true, 'General item storage', 'warehouse')
ON CONFLICT DO NOTHING;

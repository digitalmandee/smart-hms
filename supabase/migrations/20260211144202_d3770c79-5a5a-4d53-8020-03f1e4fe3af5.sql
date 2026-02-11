INSERT INTO public.stores (name, code, store_type, branch_id, organization_id, is_active)
SELECT s.name, s.code, s.store_type::store_type, b.id, b.organization_id, true
FROM (VALUES
  ('Medical Store', 'MED-01', 'medical'),
  ('Surgical Store', 'SURG-01', 'surgical'),
  ('Pharmacy Store', 'PHAR-01', 'pharmacy'),
  ('Equipment Store', 'EQUIP-01', 'equipment')
) AS s(name, code, store_type)
CROSS JOIN branches b
WHERE NOT EXISTS (
  SELECT 1 FROM stores st WHERE st.branch_id = b.id AND st.code = s.code
);
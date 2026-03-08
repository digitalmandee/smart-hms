
-- Insert KSA Integrations parent menu item
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES ('ksa_integrations', 'KSA Integrations', 'ShieldAlert', NULL, NULL, 102, NULL, 'ksa_compliance', true);

-- Insert child menu items referencing the parent
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES 
  ('ksa_dashboard', 'KSA Dashboard', 'LayoutDashboard', '/app/settings/ksa-integrations', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 1, NULL, 'ksa_compliance', true),
  ('ksa_nphies', 'NPHIES', 'FileText', '/app/settings/ksa/nphies', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 2, NULL, 'ksa_compliance', true),
  ('ksa_zatca', 'ZATCA Phase 2', 'Receipt', '/app/settings/ksa/zatca', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 3, NULL, 'ksa_compliance', true),
  ('ksa_wasfaty', 'Wasfaty', 'Pill', '/app/settings/ksa/wasfaty', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 4, NULL, 'ksa_compliance', true),
  ('ksa_tatmeen', 'Tatmeen / RSD', 'ScanBarcode', '/app/settings/ksa/tatmeen', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 5, NULL, 'ksa_compliance', true),
  ('ksa_hesn', 'HESN', 'ShieldAlert', '/app/settings/ksa/hesn', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 6, NULL, 'ksa_compliance', true),
  ('ksa_nafath', 'Nafath', 'Fingerprint', '/app/settings/ksa/nafath', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 7, NULL, 'ksa_compliance', true),
  ('ksa_sehhaty', 'Sehhaty', 'Smartphone', '/app/settings/ksa/sehhaty', (SELECT id FROM public.menu_items WHERE code = 'ksa_integrations'), 8, NULL, 'ksa_compliance', true);

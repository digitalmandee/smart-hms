-- Add menu items for Lab Analyzers and PACS Servers
INSERT INTO menu_items (code, name, icon, path, parent_id, required_module, sort_order, is_active)
VALUES 
  ('lab.analyzers', 'Lab Analyzers', 'FlaskConical', '/app/lab/analyzers', '3417b2f5-93dd-4408-9f1c-8dfac19ce161', 'lab', 60, true),
  ('radiology.pacs-servers', 'PACS Servers', 'Server', '/app/radiology/pacs/servers', '9ff1827f-4689-40dd-96e4-4378dfefa3bc', 'radiology', 80, true)
ON CONFLICT (code) DO NOTHING;
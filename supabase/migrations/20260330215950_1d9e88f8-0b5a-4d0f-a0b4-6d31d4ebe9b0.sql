-- Add missing modules to available_modules
INSERT INTO available_modules (code, name, description, icon, category, is_core, is_hospital_only, sort_order)
VALUES
  ('inventory', 'Inventory Management', 'Track and manage inventory, stock levels, and requisitions', 'Package', 'operations', true, false, 50),
  ('warehouse', 'Warehouse Operations', 'Warehouse management, dock scheduling, and logistics', 'Warehouse', 'operations', false, true, 51),
  ('dialysis', 'Dialysis Center', 'Manage dialysis sessions, machines, and scheduling', 'Droplets', 'clinical', false, true, 52)
ON CONFLICT (code) DO NOTHING;

-- Enable inventory module for ALL existing organizations
INSERT INTO organization_modules (organization_id, module_code, is_enabled, enabled_at)
SELECT o.id, 'inventory', true, now()
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM organization_modules om 
  WHERE om.organization_id = o.id AND om.module_code = 'inventory'
);

-- Enable warehouse module for ALL existing organizations
INSERT INTO organization_modules (organization_id, module_code, is_enabled, enabled_at)
SELECT o.id, 'warehouse', true, now()
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM organization_modules om 
  WHERE om.organization_id = o.id AND om.module_code = 'warehouse'
);

-- Enable dialysis module for ALL existing organizations
INSERT INTO organization_modules (organization_id, module_code, is_enabled, enabled_at)
SELECT o.id, 'dialysis', true, now()
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM organization_modules om 
  WHERE om.organization_id = o.id AND om.module_code = 'dialysis'
);
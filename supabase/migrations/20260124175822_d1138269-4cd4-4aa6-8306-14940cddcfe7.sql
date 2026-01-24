-- Grant permissions to ot_pharmacist role
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'ot_pharmacist', p.id, true
FROM permissions p
WHERE p.code IN (
  'pharmacy.view',
  'pharmacy.inventory',
  'pharmacy.pos',
  'ot.view'
)
ON CONFLICT DO NOTHING;

-- Grant permissions to opd_nurse role
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'opd_nurse', p.id, true
FROM permissions p
WHERE p.code IN (
  'opd.nurse',
  'opd.view',
  'patients.view',
  'appointments.view'
)
ON CONFLICT DO NOTHING;
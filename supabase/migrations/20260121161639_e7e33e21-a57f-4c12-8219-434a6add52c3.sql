-- Grant ipd.admissions.edit permission to ipd_nurse role for all organizations
INSERT INTO role_permissions (organization_id, role, permission_id, is_granted)
SELECT 
  rp.organization_id,
  'ipd_nurse'::app_role,
  p.id,
  true
FROM permissions p
CROSS JOIN (SELECT DISTINCT organization_id FROM role_permissions WHERE organization_id IS NOT NULL) rp
WHERE p.code = 'ipd.admissions.edit'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions existing 
  WHERE existing.organization_id = rp.organization_id 
  AND existing.role = 'ipd_nurse'::app_role 
  AND existing.permission_id = p.id
);

-- Grant ipd.beds.manage permission to ipd_nurse role for all organizations
INSERT INTO role_permissions (organization_id, role, permission_id, is_granted)
SELECT 
  rp.organization_id,
  'ipd_nurse'::app_role,
  p.id,
  true
FROM permissions p
CROSS JOIN (SELECT DISTINCT organization_id FROM role_permissions WHERE organization_id IS NOT NULL) rp
WHERE p.code = 'ipd.beds.manage'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions existing 
  WHERE existing.organization_id = rp.organization_id 
  AND existing.role = 'ipd_nurse'::app_role 
  AND existing.permission_id = p.id
);
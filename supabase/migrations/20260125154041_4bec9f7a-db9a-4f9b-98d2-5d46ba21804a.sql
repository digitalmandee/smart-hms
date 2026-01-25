
-- Grant OT permissions to ot_nurse role
INSERT INTO public.role_permissions (role, permission_id, is_granted, organization_id)
SELECT 'ot_nurse'::app_role, p.id, true, NULL
FROM public.permissions p
WHERE p.code IN ('ot:view', 'ot.pre-op', 'ot.intra-op', 'ot.nursing', 'laboratory.orders');

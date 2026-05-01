REVOKE EXECUTE ON FUNCTION public.is_org_admin_for(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_admin_for(uuid) TO authenticated;
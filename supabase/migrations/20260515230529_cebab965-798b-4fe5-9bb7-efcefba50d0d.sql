
REVOKE EXECUTE ON FUNCTION public.user_belongs_to_org(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_owns_patient(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_belongs_to_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_patient(uuid) TO authenticated;

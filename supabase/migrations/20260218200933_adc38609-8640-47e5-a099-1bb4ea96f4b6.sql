CREATE OR REPLACE FUNCTION public.set_org_language(p_language text, p_supported_languages text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE organizations
  SET default_language = p_language,
      supported_languages = p_supported_languages
  WHERE id = (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$;
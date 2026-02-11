CREATE POLICY "Super admins can manage all organization modules"
  ON public.organization_modules
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
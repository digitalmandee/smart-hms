-- Fix overly permissive RLS policy - drop and recreate with proper conditions
DROP POLICY IF EXISTS "Users can manage kiosks of their organization" ON public.kiosk_configs;

-- Create specific policies for each operation
CREATE POLICY "Users can insert kiosks in their organization"
  ON public.kiosk_configs FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update kiosks in their organization"
  ON public.kiosk_configs FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete kiosks in their organization"
  ON public.kiosk_configs FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));
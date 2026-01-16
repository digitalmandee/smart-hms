-- Create kiosk_configs table for managing different kiosks
CREATE TABLE public.kiosk_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  kiosk_type TEXT NOT NULL DEFAULT 'opd' CHECK (kiosk_type IN ('opd', 'ipd', 'emergency')),
  departments JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  auto_print BOOLEAN DEFAULT true,
  show_estimated_wait BOOLEAN DEFAULT true,
  display_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.kiosk_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for kiosk_configs
CREATE POLICY "Users can view kiosks of their organization"
  ON public.kiosk_configs FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage kiosks of their organization"
  ON public.kiosk_configs FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Public access for kiosk displays (read-only)
CREATE POLICY "Public can view active kiosks"
  ON public.kiosk_configs FOR SELECT
  USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_kiosk_configs_updated_at
  BEFORE UPDATE ON public.kiosk_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Add menu items for kiosk management
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'kiosk_management', 'Kiosk Management', 'Monitor', '/app/settings/kiosks',
  id, 15, 'settings.manage', true
FROM public.menu_items WHERE code = 'settings'
ON CONFLICT (code) DO UPDATE SET 
  name = 'Kiosk Management',
  path = '/app/settings/kiosks',
  is_active = true;

-- Add queue control menu item
INSERT INTO public.menu_items (code, name, icon, path, parent_id, sort_order, required_permission, is_active)
SELECT 'queue_control', 'Queue Control', 'Megaphone', '/app/appointments/queue-control',
  id, 12, 'appointments.checkin', true
FROM public.menu_items WHERE code = 'appointments'
ON CONFLICT (code) DO UPDATE SET 
  name = 'Queue Control',
  path = '/app/appointments/queue-control',
  is_active = true;
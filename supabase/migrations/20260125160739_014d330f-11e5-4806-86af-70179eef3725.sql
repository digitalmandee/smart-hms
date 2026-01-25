-- Create lab_settings table for organization-level lab configuration
CREATE TABLE public.lab_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  allow_direct_lab_payment BOOLEAN DEFAULT false,
  require_consultation_for_lab BOOLEAN DEFAULT true,
  lab_payment_location TEXT DEFAULT 'reception' CHECK (lab_payment_location IN ('reception', 'lab', 'both')),
  auto_generate_invoice BOOLEAN DEFAULT true,
  allow_unpaid_processing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, branch_id)
);

-- Add comment
COMMENT ON COLUMN public.lab_settings.allow_unpaid_processing IS 
  'When true, lab can collect samples and enter results for orders with pending payment (Pay Later workflow)';

-- Enable RLS
ALTER TABLE public.lab_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization lab settings"
  ON public.lab_settings FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users with settings permission can manage lab settings"
  ON public.lab_settings FOR ALL
  TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

-- Trigger for updated_at
CREATE TRIGGER update_lab_settings_updated_at
  BEFORE UPDATE ON public.lab_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
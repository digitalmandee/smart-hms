-- Create nurses table linked to employees
CREATE TABLE public.nurses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  employee_id UUID UNIQUE REFERENCES public.employees(id),
  profile_id UUID REFERENCES auth.users(id),
  branch_id UUID REFERENCES public.branches(id),
  license_number TEXT,
  license_expiry DATE,
  qualification TEXT,
  specialization TEXT, -- ICU, OT, Pediatric, General, etc.
  assigned_ward_id UUID REFERENCES public.wards(id),
  is_charge_nurse BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_nurses_employee_id ON public.nurses(employee_id);
CREATE INDEX idx_nurses_organization_id ON public.nurses(organization_id);
CREATE INDEX idx_nurses_assigned_ward_id ON public.nurses(assigned_ward_id);

-- Enable RLS
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nurses
CREATE POLICY "Users can view nurses in their organization"
  ON public.nurses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert nurses in their organization"
  ON public.nurses FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update nurses in their organization"
  ON public.nurses FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nurses in their organization"
  ON public.nurses FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_nurses_updated_at
  BEFORE UPDATE ON public.nurses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
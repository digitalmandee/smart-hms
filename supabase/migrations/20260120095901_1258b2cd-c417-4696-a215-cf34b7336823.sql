-- Create branch_modules table for branch-level module control
CREATE TABLE IF NOT EXISTS public.branch_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  enabled_at TIMESTAMPTZ DEFAULT now(),
  enabled_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, module_code)
);

-- Add foreign key to available_modules
ALTER TABLE public.branch_modules 
ADD CONSTRAINT branch_modules_module_code_fkey 
FOREIGN KEY (module_code) REFERENCES public.available_modules(code) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.branch_modules ENABLE ROW LEVEL SECURITY;

-- RLS policies for branch_modules
CREATE POLICY "Super admins can manage all branch modules"
  ON public.branch_modules FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Org admins can view their organization branch modules"
  ON public.branch_modules FOR SELECT
  USING (
    branch_id IN (
      SELECT id FROM public.branches 
      WHERE organization_id = public.get_user_organization_id()
    )
  );

CREATE POLICY "Org admins can manage their organization branch modules"
  ON public.branch_modules FOR ALL
  USING (
    branch_id IN (
      SELECT id FROM public.branches 
      WHERE organization_id = public.get_user_organization_id()
    )
    AND public.has_permission('manage_branches')
  );

-- Trigger for updated_at
CREATE TRIGGER update_branch_modules_updated_at
  BEFORE UPDATE ON public.branch_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_branch_modules_branch_id ON public.branch_modules(branch_id);
CREATE INDEX idx_branch_modules_module_code ON public.branch_modules(module_code);
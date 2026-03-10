
-- Employee Transfers table
CREATE TABLE public.employee_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  from_department_id UUID REFERENCES public.departments(id),
  to_department_id UUID REFERENCES public.departments(id),
  from_branch_id UUID REFERENCES public.branches(id),
  to_branch_id UUID REFERENCES public.branches(id),
  transfer_date DATE NOT NULL,
  effective_date DATE,
  reason TEXT,
  status TEXT DEFAULT 'requested',
  approved_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.employee_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfers in their org"
  ON public.employee_transfers FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert transfers in their org"
  ON public.employee_transfers FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update transfers in their org"
  ON public.employee_transfers FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Employee Promotions table
CREATE TABLE public.employee_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  old_designation_id UUID REFERENCES public.designations(id),
  new_designation_id UUID REFERENCES public.designations(id),
  old_salary NUMERIC(12,2),
  new_salary NUMERIC(12,2),
  effective_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  letter_issued BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.employee_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view promotions in their org"
  ON public.employee_promotions FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert promotions in their org"
  ON public.employee_promotions FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update promotions in their org"
  ON public.employee_promotions FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Employee Grievances table
CREATE TABLE public.employee_grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  grievance_number TEXT,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  filed_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'filed',
  assigned_to UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  resolved_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.employee_grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view grievances in their org"
  ON public.employee_grievances FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert grievances in their org"
  ON public.employee_grievances FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update grievances in their org"
  ON public.employee_grievances FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Grievance number generator
CREATE OR REPLACE FUNCTION public.generate_grievance_number()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(grievance_number FROM 14) AS INT)), 0) + 1
  INTO seq_num
  FROM public.employee_grievances
  WHERE organization_id = NEW.organization_id
    AND grievance_number LIKE 'GRV-' || date_part || '-%';
  NEW.grievance_number := 'GRV-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_grievance_number
  BEFORE INSERT ON public.employee_grievances
  FOR EACH ROW
  WHEN (NEW.grievance_number IS NULL)
  EXECUTE FUNCTION public.generate_grievance_number();

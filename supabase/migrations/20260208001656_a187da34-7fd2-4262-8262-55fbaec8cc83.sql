-- Create expenses table for petty cash/expense tracking
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  billing_session_id UUID REFERENCES public.billing_sessions(id),
  expense_number VARCHAR(50) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'petty_cash',
  description TEXT NOT NULL,
  paid_to VARCHAR(255),
  payment_method_id UUID REFERENCES public.payment_methods(id),
  reference_number VARCHAR(100),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add constraint for valid categories
ALTER TABLE public.expenses ADD CONSTRAINT valid_expense_category CHECK (
  category IN ('petty_cash', 'refund', 'staff_advance', 'misc', 'other')
);

-- Add constraint for positive amount
ALTER TABLE public.expenses ADD CONSTRAINT positive_expense_amount CHECK (amount > 0);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for expenses
CREATE POLICY "Users can view expenses in their organization" 
ON public.expenses FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create expenses in their organization" 
ON public.expenses FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update expenses in their organization" 
ON public.expenses FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Generate expense number function
CREATE OR REPLACE FUNCTION public.generate_expense_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INT;
  v_prefix TEXT := 'EXP';
  v_date TEXT := to_char(CURRENT_DATE, 'YYMMDD');
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.expenses
  WHERE organization_id = p_org_id
    AND created_at::date = CURRENT_DATE;
  
  RETURN v_prefix || '-' || v_date || '-' || LPAD(v_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_expenses_org_branch ON public.expenses(organization_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_expenses_session ON public.expenses(billing_session_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);

-- Trigger to update updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
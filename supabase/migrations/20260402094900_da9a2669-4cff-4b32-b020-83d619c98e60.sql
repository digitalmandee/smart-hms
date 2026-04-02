
-- Create billing_tax_slabs table
CREATE TABLE public.billing_tax_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  applies_to TEXT DEFAULT 'all',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_tax_slabs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view billing tax slabs in their org"
  ON public.billing_tax_slabs FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert billing tax slabs in their org"
  ON public.billing_tax_slabs FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update billing tax slabs in their org"
  ON public.billing_tax_slabs FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete billing tax slabs in their org"
  ON public.billing_tax_slabs FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Add tax columns to invoice_items
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0;

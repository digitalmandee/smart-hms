-- Create pharmacy returns tracking tables
CREATE TABLE public.pharmacy_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_transaction_id UUID,
  original_invoice_id UUID REFERENCES invoices(id),
  patient_id UUID REFERENCES patients(id),
  branch_id UUID REFERENCES branches(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  return_number TEXT NOT NULL,
  return_type TEXT NOT NULL CHECK (return_type IN ('cash_refund', 'add_credit', 'deduct_outstanding')),
  total_refund_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit_adjustment NUMERIC(12,2) DEFAULT 0,
  credit_id UUID,
  processed_by UUID REFERENCES profiles(id),
  reason TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pharmacy_return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID REFERENCES pharmacy_returns(id) ON DELETE CASCADE NOT NULL,
  original_item_id UUID,
  medicine_id UUID REFERENCES medicines(id),
  medicine_name TEXT NOT NULL,
  batch_number TEXT,
  quantity_returned INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  restocked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pharmacy_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_return_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacy_returns
CREATE POLICY "Users can view returns in their organization"
  ON public.pharmacy_returns FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create returns in their branch"
  ON public.pharmacy_returns FOR INSERT
  WITH CHECK (branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update returns in their organization"
  ON public.pharmacy_returns FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for pharmacy_return_items
CREATE POLICY "Users can view return items"
  ON public.pharmacy_return_items FOR SELECT
  USING (return_id IN (SELECT id FROM pharmacy_returns WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can create return items"
  ON public.pharmacy_return_items FOR INSERT
  WITH CHECK (return_id IN (SELECT id FROM pharmacy_returns WHERE branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())));

-- Create index for faster lookups
CREATE INDEX idx_pharmacy_returns_patient ON public.pharmacy_returns(patient_id);
CREATE INDEX idx_pharmacy_returns_transaction ON public.pharmacy_returns(original_transaction_id);
CREATE INDEX idx_pharmacy_returns_branch ON public.pharmacy_returns(branch_id);
CREATE INDEX idx_pharmacy_return_items_return ON public.pharmacy_return_items(return_id);
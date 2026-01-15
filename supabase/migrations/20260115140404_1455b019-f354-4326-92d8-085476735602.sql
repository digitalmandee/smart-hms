-- =============================================
-- Pharmacy POS Tables
-- =============================================

-- POS Sessions table (cash drawer management)
CREATE TABLE public.pharmacy_pos_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  session_number VARCHAR(50) NOT NULL,
  opened_by UUID NOT NULL REFERENCES public.profiles(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_by UUID REFERENCES public.profiles(id),
  closed_at TIMESTAMPTZ,
  opening_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(12,2),
  expected_cash DECIMAL(12,2),
  cash_difference DECIMAL(12,2),
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS Transactions table
CREATE TABLE public.pharmacy_pos_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.pharmacy_pos_sessions(id),
  transaction_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2),
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'voided', 'refunded')),
  voided_by UUID REFERENCES public.profiles(id),
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS Items table (line items)
CREATE TABLE public.pharmacy_pos_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.pharmacy_pos_transactions(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id),
  inventory_id UUID REFERENCES public.medicine_inventory(id),
  batch_number VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS Payments table (multi-method payments)
CREATE TABLE public.pharmacy_pos_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.pharmacy_pos_transactions(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reference_number VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pharmacy_pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_pos_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_pos_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for POS Sessions
CREATE POLICY "Users can view POS sessions in their organization"
ON public.pharmacy_pos_sessions FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create POS sessions in their organization"
ON public.pharmacy_pos_sessions FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update POS sessions in their organization"
ON public.pharmacy_pos_sessions FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS Policies for POS Transactions
CREATE POLICY "Users can view POS transactions in their organization"
ON public.pharmacy_pos_transactions FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create POS transactions in their organization"
ON public.pharmacy_pos_transactions FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update POS transactions in their organization"
ON public.pharmacy_pos_transactions FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS Policies for POS Items
CREATE POLICY "Users can view POS items via transaction"
ON public.pharmacy_pos_items FOR SELECT
USING (transaction_id IN (
  SELECT id FROM public.pharmacy_pos_transactions WHERE organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Users can create POS items via transaction"
ON public.pharmacy_pos_items FOR INSERT
WITH CHECK (transaction_id IN (
  SELECT id FROM public.pharmacy_pos_transactions WHERE organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
));

-- RLS Policies for POS Payments
CREATE POLICY "Users can view POS payments via transaction"
ON public.pharmacy_pos_payments FOR SELECT
USING (transaction_id IN (
  SELECT id FROM public.pharmacy_pos_transactions WHERE organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Users can create POS payments via transaction"
ON public.pharmacy_pos_payments FOR INSERT
WITH CHECK (transaction_id IN (
  SELECT id FROM public.pharmacy_pos_transactions WHERE organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
));

-- Indexes for performance
CREATE INDEX idx_pos_sessions_org ON public.pharmacy_pos_sessions(organization_id);
CREATE INDEX idx_pos_sessions_branch ON public.pharmacy_pos_sessions(branch_id);
CREATE INDEX idx_pos_sessions_status ON public.pharmacy_pos_sessions(status);
CREATE INDEX idx_pos_transactions_org ON public.pharmacy_pos_transactions(organization_id);
CREATE INDEX idx_pos_transactions_session ON public.pharmacy_pos_transactions(session_id);
CREATE INDEX idx_pos_transactions_created ON public.pharmacy_pos_transactions(created_at);
CREATE INDEX idx_pos_items_transaction ON public.pharmacy_pos_items(transaction_id);
CREATE INDEX idx_pos_payments_transaction ON public.pharmacy_pos_payments(transaction_id);

-- Function to generate POS transaction number
CREATE OR REPLACE FUNCTION public.generate_pos_transaction_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_num INTEGER;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(transaction_number FROM 'POS-[0-9]{6}-([0-9]+)') AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM public.pharmacy_pos_transactions
  WHERE organization_id = NEW.organization_id
    AND transaction_number LIKE 'POS-' || date_part || '-%';
  
  NEW.transaction_number := 'POS-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating transaction numbers
CREATE TRIGGER set_pos_transaction_number
BEFORE INSERT ON public.pharmacy_pos_transactions
FOR EACH ROW
WHEN (NEW.transaction_number IS NULL OR NEW.transaction_number = '')
EXECUTE FUNCTION public.generate_pos_transaction_number();

-- Function to generate POS session number
CREATE OR REPLACE FUNCTION public.generate_pos_session_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_num INTEGER;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(session_number FROM 'SES-[0-9]{6}-([0-9]+)') AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM public.pharmacy_pos_sessions
  WHERE organization_id = NEW.organization_id
    AND session_number LIKE 'SES-' || date_part || '-%';
  
  NEW.session_number := 'SES-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating session numbers
CREATE TRIGGER set_pos_session_number
BEFORE INSERT ON public.pharmacy_pos_sessions
FOR EACH ROW
WHEN (NEW.session_number IS NULL OR NEW.session_number = '')
EXECUTE FUNCTION public.generate_pos_session_number();

-- Updated at triggers
CREATE TRIGGER update_pos_sessions_updated_at
BEFORE UPDATE ON public.pharmacy_pos_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_transactions_updated_at
BEFORE UPDATE ON public.pharmacy_pos_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Accounts Menu Items
-- =============================================

-- Get the max sort order to place Accounts menu appropriately
DO $$
DECLARE
  max_sort INTEGER;
  accounts_parent_id UUID;
BEGIN
  SELECT COALESCE(MAX(sort_order), 0) + 10 INTO max_sort FROM public.menu_items WHERE parent_id IS NULL;
  
  -- Insert Accounts parent menu
  INSERT INTO public.menu_items (code, name, icon, path, sort_order, is_active)
  VALUES ('accounts', 'Accounts & Finance', 'Calculator', NULL, max_sort, true)
  RETURNING id INTO accounts_parent_id;
  
  -- Insert child menu items
  INSERT INTO public.menu_items (code, name, icon, path, sort_order, is_active, parent_id)
  VALUES 
    ('accounts_dashboard', 'Dashboard', 'LayoutDashboard', '/app/accounts', 10, true, accounts_parent_id),
    ('chart_of_accounts', 'Chart of Accounts', 'ListTree', '/app/accounts/chart-of-accounts', 20, true, accounts_parent_id),
    ('journal_entries', 'Journal Entries', 'FileText', '/app/accounts/journal-entries', 30, true, accounts_parent_id),
    ('general_ledger', 'General Ledger', 'BookOpen', '/app/accounts/ledger', 40, true, accounts_parent_id);
END $$;
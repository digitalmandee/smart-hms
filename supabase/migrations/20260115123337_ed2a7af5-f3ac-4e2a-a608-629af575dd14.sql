-- =============================================
-- ACCOUNTS & FINANCE MODULE - DATABASE SCHEMA
-- =============================================

-- 1. Account Types (Asset, Liability, Equity, Revenue, Expense)
CREATE TABLE public.account_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_type_id UUID REFERENCES public.account_types(id),
  is_debit_normal BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- 2. Accounts (Chart of Accounts)
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  account_number TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type_id UUID NOT NULL REFERENCES public.account_types(id),
  parent_account_id UUID REFERENCES public.accounts(id),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  opening_balance_date DATE,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(organization_id, account_number)
);

-- 3. Fiscal Years
CREATE TABLE public.fiscal_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- 4. Journal Entries
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('invoice', 'payment', 'pos_session', 'grn', 'vendor_payment', 'manual', 'adjustment', 'opening', 'closing')),
  reference_id UUID,
  description TEXT,
  notes TEXT,
  is_posted BOOLEAN NOT NULL DEFAULT false,
  posted_at TIMESTAMPTZ,
  posted_by UUID REFERENCES public.profiles(id),
  is_reversed BOOLEAN NOT NULL DEFAULT false,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES public.profiles(id),
  reversal_entry_id UUID REFERENCES public.journal_entries(id),
  fiscal_year_id UUID REFERENCES public.fiscal_years(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  UNIQUE(organization_id, entry_number)
);

-- 5. Journal Entry Lines
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  description TEXT,
  debit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (debit_amount >= 0 AND credit_amount >= 0),
  CHECK (NOT (debit_amount > 0 AND credit_amount > 0))
);

-- 6. Bank Accounts
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  account_id UUID REFERENCES public.accounts(id),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'current', 'overdraft')),
  ifsc_code TEXT,
  swift_code TEXT,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- 7. Bank Transactions
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  value_date DATE,
  description TEXT,
  reference_number TEXT,
  transaction_type TEXT CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'interest', 'charge', 'other')),
  debit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  running_balance NUMERIC(15,2),
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES public.profiles(id),
  statement_date DATE,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- 8. Vendor Payments
CREATE TABLE public.vendor_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  payment_number TEXT NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  grn_id UUID REFERENCES public.goods_received_notes(id),
  payment_date DATE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  reference_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(organization_id, payment_number)
);

-- 9. Budget Periods
CREATE TABLE public.budget_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  fiscal_year_id UUID NOT NULL REFERENCES public.fiscal_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Budget Allocations
CREATE TABLE public.budget_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_period_id UUID NOT NULL REFERENCES public.budget_periods(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  branch_id UUID REFERENCES public.branches(id),
  allocated_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(budget_period_id, account_id, branch_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_accounts_org ON public.accounts(organization_id);
CREATE INDEX idx_accounts_type ON public.accounts(account_type_id);
CREATE INDEX idx_accounts_parent ON public.accounts(parent_account_id);
CREATE INDEX idx_accounts_number ON public.accounts(account_number);

CREATE INDEX idx_journal_entries_org ON public.journal_entries(organization_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_ref ON public.journal_entries(reference_type, reference_id);
CREATE INDEX idx_journal_entries_posted ON public.journal_entries(is_posted);

CREATE INDEX idx_journal_lines_entry ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON public.journal_entry_lines(account_id);

CREATE INDEX idx_bank_transactions_account ON public.bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_reconciled ON public.bank_transactions(is_reconciled);

CREATE INDEX idx_vendor_payments_vendor ON public.vendor_payments(vendor_id);
CREATE INDEX idx_vendor_payments_date ON public.vendor_payments(payment_date);

-- =============================================
-- TRIGGERS FOR AUTO-GENERATION
-- =============================================

-- Generate Journal Entry Number
CREATE OR REPLACE FUNCTION public.generate_journal_entry_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(NEW.entry_date, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 13) AS INT)), 0) + 1
  INTO seq_num
  FROM public.journal_entries
  WHERE organization_id = NEW.organization_id
    AND entry_number LIKE 'JE-' || date_part || '-%';
  
  NEW.entry_number := 'JE-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_journal_entry_number
  BEFORE INSERT ON public.journal_entries
  FOR EACH ROW
  WHEN (NEW.entry_number IS NULL OR NEW.entry_number = '')
  EXECUTE FUNCTION public.generate_journal_entry_number();

-- Generate Vendor Payment Number
CREATE OR REPLACE FUNCTION public.generate_vendor_payment_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  date_part TEXT;
  seq_num INT;
BEGIN
  date_part := TO_CHAR(NEW.payment_date, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 13) AS INT)), 0) + 1
  INTO seq_num
  FROM public.vendor_payments
  WHERE organization_id = NEW.organization_id
    AND payment_number LIKE 'VP-' || date_part || '-%';
  
  NEW.payment_number := 'VP-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_vendor_payment_number
  BEFORE INSERT ON public.vendor_payments
  FOR EACH ROW
  WHEN (NEW.payment_number IS NULL OR NEW.payment_number = '')
  EXECUTE FUNCTION public.generate_vendor_payment_number();

-- Update account balance after journal line insert/update/delete
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_account_id UUID;
  v_is_debit_normal BOOLEAN;
  v_total_debit NUMERIC(15,2);
  v_total_credit NUMERIC(15,2);
  v_opening_balance NUMERIC(15,2);
  v_new_balance NUMERIC(15,2);
BEGIN
  -- Determine which account to update
  IF TG_OP = 'DELETE' THEN
    v_account_id := OLD.account_id;
  ELSE
    v_account_id := NEW.account_id;
  END IF;
  
  -- Get account details
  SELECT a.opening_balance, at.is_debit_normal
  INTO v_opening_balance, v_is_debit_normal
  FROM public.accounts a
  JOIN public.account_types at ON at.id = a.account_type_id
  WHERE a.id = v_account_id;
  
  -- Calculate totals from posted entries only
  SELECT COALESCE(SUM(jel.debit_amount), 0), COALESCE(SUM(jel.credit_amount), 0)
  INTO v_total_debit, v_total_credit
  FROM public.journal_entry_lines jel
  JOIN public.journal_entries je ON je.id = jel.journal_entry_id
  WHERE jel.account_id = v_account_id
    AND je.is_posted = true;
  
  -- Calculate new balance based on normal balance type
  IF v_is_debit_normal THEN
    v_new_balance := v_opening_balance + v_total_debit - v_total_credit;
  ELSE
    v_new_balance := v_opening_balance + v_total_credit - v_total_debit;
  END IF;
  
  -- Update account balance
  UPDATE public.accounts
  SET current_balance = v_new_balance, updated_at = now()
  WHERE id = v_account_id;
  
  -- If old account was different, update that too
  IF TG_OP = 'UPDATE' AND OLD.account_id != NEW.account_id THEN
    SELECT a.opening_balance, at.is_debit_normal
    INTO v_opening_balance, v_is_debit_normal
    FROM public.accounts a
    JOIN public.account_types at ON at.id = a.account_type_id
    WHERE a.id = OLD.account_id;
    
    SELECT COALESCE(SUM(jel.debit_amount), 0), COALESCE(SUM(jel.credit_amount), 0)
    INTO v_total_debit, v_total_credit
    FROM public.journal_entry_lines jel
    JOIN public.journal_entries je ON je.id = jel.journal_entry_id
    WHERE jel.account_id = OLD.account_id
      AND je.is_posted = true;
    
    IF v_is_debit_normal THEN
      v_new_balance := v_opening_balance + v_total_debit - v_total_credit;
    ELSE
      v_new_balance := v_opening_balance + v_total_credit - v_total_debit;
    END IF;
    
    UPDATE public.accounts
    SET current_balance = v_new_balance, updated_at = now()
    WHERE id = OLD.account_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE TRIGGER update_account_balance_on_line_change
  AFTER INSERT OR UPDATE OR DELETE ON public.journal_entry_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance();

-- Updated at triggers
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_payments_updated_at
  BEFORE UPDATE ON public.vendor_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_allocations_updated_at
  BEFORE UPDATE ON public.budget_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;

-- Account Types Policies
CREATE POLICY "Users can view account types of their organization"
  ON public.account_types FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage account types of their organization"
  ON public.account_types FOR ALL
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Accounts Policies
CREATE POLICY "Users can view accounts of their organization"
  ON public.accounts FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage accounts of their organization"
  ON public.accounts FOR ALL
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Fiscal Years Policies
CREATE POLICY "Users can view fiscal years of their organization"
  ON public.fiscal_years FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage fiscal years of their organization"
  ON public.fiscal_years FOR ALL
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Journal Entries Policies
CREATE POLICY "Users can view journal entries of their organization"
  ON public.journal_entries FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage journal entries of their organization"
  ON public.journal_entries FOR ALL
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Journal Entry Lines Policies
CREATE POLICY "Users can view journal entry lines"
  ON public.journal_entry_lines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.id = journal_entry_id
        AND (je.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can manage journal entry lines"
  ON public.journal_entry_lines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.id = journal_entry_id
        AND (je.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

-- Bank Accounts Policies
CREATE POLICY "Users can view bank accounts of their organization"
  ON public.bank_accounts FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage bank accounts of their organization"
  ON public.bank_accounts FOR ALL
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Bank Transactions Policies
CREATE POLICY "Users can view bank transactions"
  ON public.bank_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bank_accounts ba
      WHERE ba.id = bank_account_id
        AND (ba.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can manage bank transactions"
  ON public.bank_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bank_accounts ba
      WHERE ba.id = bank_account_id
        AND (ba.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

-- Vendor Payments Policies
CREATE POLICY "Users can view vendor payments of their organization"
  ON public.vendor_payments FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage vendor payments of their organization"
  ON public.vendor_payments FOR ALL
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Budget Periods Policies
CREATE POLICY "Users can view budget periods of their organization"
  ON public.budget_periods FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can manage budget periods of their organization"
  ON public.budget_periods FOR ALL
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());

-- Budget Allocations Policies
CREATE POLICY "Users can view budget allocations"
  ON public.budget_allocations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.budget_periods bp
      WHERE bp.id = budget_period_id
        AND (bp.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );

CREATE POLICY "Users can manage budget allocations"
  ON public.budget_allocations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.budget_periods bp
      WHERE bp.id = budget_period_id
        AND (bp.organization_id = public.get_user_organization_id() OR public.is_super_admin())
    )
  );
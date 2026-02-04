-- =============================================
-- DROP PARTIAL TABLES FROM FAILED MIGRATION
-- =============================================
DROP TABLE IF EXISTS public.daily_closings CASCADE;
DROP TABLE IF EXISTS public.billing_sessions CASCADE;
DROP FUNCTION IF EXISTS generate_session_number(UUID);
DROP FUNCTION IF EXISTS generate_closing_number(UUID, UUID, DATE);
DROP FUNCTION IF EXISTS update_session_on_payment();
DROP TRIGGER IF EXISTS trigger_update_session_on_payment ON payments;

-- =============================================
-- BILLING SESSIONS TABLE
-- Universal session management for all billing counters
-- =============================================

CREATE TABLE public.billing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  session_number VARCHAR(50) NOT NULL,
  counter_type VARCHAR(30) NOT NULL CHECK (counter_type IN ('reception', 'ipd', 'pharmacy', 'opd', 'er')),
  opened_by UUID NOT NULL REFERENCES profiles(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_by UUID REFERENCES profiles(id),
  closed_at TIMESTAMPTZ,
  opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0,
  expected_cash DECIMAL(12,2) DEFAULT 0,
  actual_cash DECIMAL(12,2),
  cash_difference DECIMAL(12,2),
  card_total DECIMAL(12,2) DEFAULT 0,
  upi_total DECIMAL(12,2) DEFAULT 0,
  other_total DECIMAL(12,2) DEFAULT 0,
  total_collections DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'reconciled')),
  notes TEXT,
  shift VARCHAR(20) CHECK (shift IN ('morning', 'evening', 'night')),
  cash_denominations JSONB,
  reconciled_by UUID REFERENCES profiles(id),
  reconciled_at TIMESTAMPTZ,
  discrepancy_reason TEXT,
  discrepancy_approved_by UUID REFERENCES profiles(id),
  discrepancy_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, session_number)
);

-- Create indexes for better query performance
CREATE INDEX idx_billing_sessions_org_branch ON public.billing_sessions(organization_id, branch_id);
CREATE INDEX idx_billing_sessions_status ON public.billing_sessions(status);
CREATE INDEX idx_billing_sessions_opened_by ON public.billing_sessions(opened_by);
CREATE INDEX idx_billing_sessions_opened_at ON public.billing_sessions(opened_at);
CREATE INDEX idx_billing_sessions_counter_type ON public.billing_sessions(counter_type);

-- Enable RLS
ALTER TABLE public.billing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view sessions in their organization"
  ON public.billing_sessions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create sessions in their organization"
  ON public.billing_sessions FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own sessions or managers can update any"
  ON public.billing_sessions FOR UPDATE
  USING (
    opened_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('org_admin', 'branch_admin', 'accountant', 'finance_manager')
    )
  );

-- =============================================
-- DAILY CLOSINGS TABLE
-- Master record for end-of-day reconciliation
-- =============================================

CREATE TABLE public.daily_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  closing_date DATE NOT NULL,
  closing_number VARCHAR(50) NOT NULL,
  
  -- Collection totals by payment method
  total_cash_collected DECIMAL(12,2) DEFAULT 0,
  total_card_collected DECIMAL(12,2) DEFAULT 0,
  total_upi_collected DECIMAL(12,2) DEFAULT 0,
  total_other_collected DECIMAL(12,2) DEFAULT 0,
  grand_total DECIMAL(12,2) DEFAULT 0,
  
  -- Transaction counts
  total_invoices INTEGER DEFAULT 0,
  total_payments INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  
  -- Department-wise breakdown
  opd_collections DECIMAL(12,2) DEFAULT 0,
  ipd_collections DECIMAL(12,2) DEFAULT 0,
  pharmacy_sales DECIMAL(12,2) DEFAULT 0,
  lab_collections DECIMAL(12,2) DEFAULT 0,
  radiology_collections DECIMAL(12,2) DEFAULT 0,
  er_collections DECIMAL(12,2) DEFAULT 0,
  other_collections DECIMAL(12,2) DEFAULT 0,
  
  -- Receivables
  outstanding_receivables DECIMAL(12,2) DEFAULT 0,
  new_credit_given DECIMAL(12,2) DEFAULT 0,
  credit_recovered DECIMAL(12,2) DEFAULT 0,
  
  -- Cash reconciliation
  expected_cash DECIMAL(12,2) DEFAULT 0,
  actual_cash DECIMAL(12,2),
  cash_difference DECIMAL(12,2),
  cash_denominations JSONB,
  
  -- Workflow
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  closed_by UUID REFERENCES profiles(id),
  closed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, branch_id, closing_date)
);

-- Create indexes
CREATE INDEX idx_daily_closings_org_branch ON public.daily_closings(organization_id, branch_id);
CREATE INDEX idx_daily_closings_date ON public.daily_closings(closing_date);
CREATE INDEX idx_daily_closings_status ON public.daily_closings(status);

-- Enable RLS
ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view closings in their organization"
  ON public.daily_closings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create closings in their organization"
  ON public.daily_closings FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Managers can update closings"
  ON public.daily_closings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('org_admin', 'branch_admin', 'accountant', 'finance_manager')
    )
  );

-- =============================================
-- LINK PAYMENTS TO SESSIONS
-- Add billing_session_id to payments table
-- =============================================

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_session_id UUID REFERENCES billing_sessions(id);

CREATE INDEX IF NOT EXISTS idx_payments_billing_session ON public.payments(billing_session_id);

-- =============================================
-- HELPER FUNCTION: Generate Session Number
-- =============================================

CREATE OR REPLACE FUNCTION generate_session_number(p_org_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  v_date_part VARCHAR(6);
  v_seq INTEGER;
  v_session_number VARCHAR(50);
BEGIN
  v_date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  SELECT COALESCE(MAX(
    NULLIF(REGEXP_REPLACE(session_number, '^SES-\d{6}-', ''), '')::INTEGER
  ), 0) + 1
  INTO v_seq
  FROM billing_sessions
  WHERE organization_id = p_org_id
  AND session_number LIKE 'SES-' || v_date_part || '-%';
  
  v_session_number := 'SES-' || v_date_part || '-' || LPAD(v_seq::TEXT, 4, '0');
  
  RETURN v_session_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- HELPER FUNCTION: Generate Daily Closing Number
-- =============================================

CREATE OR REPLACE FUNCTION generate_closing_number(p_org_id UUID, p_branch_id UUID, p_date DATE)
RETURNS VARCHAR(50) AS $$
DECLARE
  v_date_part VARCHAR(6);
  v_seq INTEGER;
  v_closing_number VARCHAR(50);
BEGIN
  v_date_part := TO_CHAR(p_date, 'YYMMDD');
  
  SELECT COALESCE(MAX(
    NULLIF(REGEXP_REPLACE(closing_number, '^EOD-\d{6}-', ''), '')::INTEGER
  ), 0) + 1
  INTO v_seq
  FROM daily_closings
  WHERE organization_id = p_org_id
  AND branch_id = p_branch_id
  AND closing_number LIKE 'EOD-' || v_date_part || '-%';
  
  v_closing_number := 'EOD-' || v_date_part || '-' || LPAD(v_seq::TEXT, 2, '0');
  
  RETURN v_closing_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- TRIGGER: Update session totals on payment insert
-- =============================================

CREATE OR REPLACE FUNCTION update_session_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.billing_session_id IS NOT NULL THEN
    UPDATE billing_sessions
    SET 
      total_collections = total_collections + NEW.amount,
      transaction_count = transaction_count + 1,
      updated_at = now()
    WHERE id = NEW.billing_session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_session_on_payment
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION update_session_on_payment();

-- =============================================
-- TRIGGER: Auto-update timestamps
-- =============================================

CREATE TRIGGER update_billing_sessions_updated_at
BEFORE UPDATE ON billing_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_closings_updated_at
BEFORE UPDATE ON daily_closings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Recurring Journal Templates
CREATE TABLE public.recurring_journal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  description text,
  frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  start_date date NOT NULL,
  end_date date,
  next_run_date date,
  last_run_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_journal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recurring templates in their org"
  ON public.recurring_journal_templates FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create recurring templates in their org"
  ON public.recurring_journal_templates FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update recurring templates in their org"
  ON public.recurring_journal_templates FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete recurring templates in their org"
  ON public.recurring_journal_templates FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- PDC Register
CREATE TABLE public.pdc_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id),
  cheque_number text NOT NULL,
  cheque_date date NOT NULL,
  party_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  pdc_type text NOT NULL DEFAULT 'received' CHECK (pdc_type IN ('received', 'issued')),
  bank_account_id uuid REFERENCES public.bank_accounts(id),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'deposited', 'cleared', 'bounced', 'cancelled')),
  journal_entry_id uuid REFERENCES public.journal_entries(id),
  reversal_journal_id uuid REFERENCES public.journal_entries(id),
  deposited_at timestamptz,
  cleared_at timestamptz,
  bounced_at timestamptz,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pdc_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view PDCs in their org"
  ON public.pdc_register FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create PDCs in their org"
  ON public.pdc_register FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update PDCs in their org"
  ON public.pdc_register FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete PDCs in their org"
  ON public.pdc_register FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX idx_recurring_templates_org ON public.recurring_journal_templates(organization_id);
CREATE INDEX idx_recurring_templates_next_run ON public.recurring_journal_templates(next_run_date) WHERE is_active = true;
CREATE INDEX idx_pdc_register_org ON public.pdc_register(organization_id);
CREATE INDEX idx_pdc_register_status ON public.pdc_register(status);
CREATE INDEX idx_pdc_register_cheque_date ON public.pdc_register(cheque_date);

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS is_welfare boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS welfare_fund text,
  ADD COLUMN IF NOT EXISTS welfare_coverage_pct numeric NOT NULL DEFAULT 100;

CREATE TABLE public.fund_utilizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid,
  invoice_id uuid,
  fund text NOT NULL,
  department text,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.fund_utilizations TO authenticated;
GRANT ALL ON public.fund_utilizations TO service_role;
ALTER TABLE public.fund_utilizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org staff read fund utilizations" ON public.fund_utilizations FOR SELECT TO authenticated
  USING (organization_id = public.get_user_organization_id() OR public.is_super_admin());
CREATE POLICY "org staff add fund utilizations" ON public.fund_utilizations FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());
CREATE INDEX idx_fund_util_org_fund ON public.fund_utilizations(organization_id, fund);
CREATE UNIQUE INDEX uq_fund_util_invoice_fund ON public.fund_utilizations(invoice_id, fund) WHERE invoice_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.post_fund_utilization_to_journal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_fund_acc uuid; v_ar uuid; v_je uuid;
BEGIN
  IF COALESCE(NEW.amount,0) <= 0 THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type='fund_utilization' AND reference_id=NEW.id) THEN RETURN NEW; END IF;
  v_fund_acc := public.get_or_create_default_account(NEW.organization_id, 'EXP-FUND-' || upper(NEW.fund), initcap(replace(NEW.fund,'_',' ')) || ' Fund Utilized', 'expense');
  v_ar := public.get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  INSERT INTO journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, 'JE-FND-' || to_char(now(),'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::text,4,'0'),
          CURRENT_DATE, 'Welfare paid from ' || NEW.fund || ' fund', 'fund_utilization', NEW.id, true)
  RETURNING id INTO v_je;
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_je, v_fund_acc, 'Fund utilized', NEW.amount, 0), (v_je, v_ar, 'Patient bill covered by fund', 0, NEW.amount);
  IF NEW.invoice_id IS NOT NULL THEN
    UPDATE invoices SET paid_amount = COALESCE(paid_amount,0) + NEW.amount,
      balance_amount = GREATEST(COALESCE(total_amount,0) - COALESCE(paid_amount,0) - NEW.amount, 0)
    WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_post_fund_utilization AFTER INSERT ON public.fund_utilizations
  FOR EACH ROW EXECUTE FUNCTION public.post_fund_utilization_to_journal();

-- Donations credit a per-fund revenue account
CREATE OR REPLACE FUNCTION public.post_donation_to_journal()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_rev uuid; v_cash uuid; v_je uuid; v_donor text; v_fund text;
BEGIN
  IF NEW.status = 'received' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'received')) THEN
    IF COALESCE(NEW.amount, 0) <= 0 THEN RETURN NEW; END IF;
    IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type='donation' AND reference_id=NEW.id) THEN RETURN NEW; END IF;
    v_fund := COALESCE(NEW.purpose, 'general');
    SELECT name INTO v_donor FROM public.financial_donors WHERE id = NEW.donor_id;
    v_rev := public.get_or_create_default_account(NEW.organization_id, 'REV-DON-' || upper(v_fund), initcap(replace(v_fund,'_',' ')) || ' Donations', 'revenue');
    v_cash := CASE WHEN NEW.payment_method IN ('bank_transfer','online','mobile_wallet','cheque')
      THEN public.get_or_create_default_account(NEW.organization_id, '1010', 'Bank Account', 'asset')
      ELSE public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset') END;
    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, 'JE-DON-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
            NEW.donation_date, 'Donation from ' || COALESCE(v_donor, 'Anonymous') || ' - ' || v_fund, 'donation', NEW.id, true)
    RETURNING id INTO v_je;
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_je, v_cash, 'Donation received', NEW.amount, 0), (v_je, v_rev, v_fund || ' fund donation', 0, NEW.amount);
    UPDATE public.financial_donors SET total_donated = total_donated + NEW.amount, total_donations_count = total_donations_count + 1 WHERE id = NEW.donor_id;
  END IF;
  RETURN NEW;
END $function$;
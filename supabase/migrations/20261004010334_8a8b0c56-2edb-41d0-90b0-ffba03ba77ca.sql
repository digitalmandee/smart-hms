CREATE OR REPLACE FUNCTION public.validate_fund_utilization()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_in numeric; v_out numeric; v_bal numeric;
BEGIN
  IF COALESCE(NEW.amount,0) <= 0 THEN RAISE EXCEPTION 'Fund amount must be positive'; END IF;
  SELECT COALESCE(SUM(amount),0) INTO v_in FROM financial_donations
   WHERE organization_id = NEW.organization_id AND purpose = NEW.fund AND status = 'received';
  SELECT COALESCE(SUM(amount),0) INTO v_out FROM fund_utilizations
   WHERE organization_id = NEW.organization_id AND fund = NEW.fund;
  IF v_in - v_out < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient % fund balance (available %)', NEW.fund, v_in - v_out;
  END IF;
  IF NEW.invoice_id IS NOT NULL THEN
    SELECT COALESCE(total_amount,0) - COALESCE(paid_amount,0) INTO v_bal FROM invoices WHERE id = NEW.invoice_id;
    IF v_bal IS NULL THEN RAISE EXCEPTION 'Invoice not found'; END IF;
    IF NEW.amount > v_bal + 0.01 THEN RAISE EXCEPTION 'Fund amount exceeds invoice balance (%)', v_bal; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_validate_fund_utilization ON public.fund_utilizations;
CREATE TRIGGER trg_validate_fund_utilization BEFORE INSERT ON public.fund_utilizations
FOR EACH ROW EXECUTE FUNCTION public.validate_fund_utilization();

CREATE OR REPLACE FUNCTION public.post_fund_utilization_to_journal()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_fund_acc uuid; v_ar uuid; v_je uuid; v_paid numeric; v_total numeric;
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
      balance_amount = GREATEST(COALESCE(total_amount,0) - COALESCE(paid_amount,0) - NEW.amount, 0),
      status = CASE WHEN COALESCE(paid_amount,0) + NEW.amount >= COALESCE(total_amount,0) - 0.01 THEN 'paid'::invoice_status ELSE 'partially_paid'::invoice_status END,
      notes = trim(both ' ' from COALESCE(notes,'') || ' [Welfare: ' || NEW.fund || ' ' || NEW.amount::text || ']')
    WHERE id = NEW.invoice_id
    RETURNING paid_amount, total_amount INTO v_paid, v_total;
    IF v_paid >= v_total - 0.01 THEN
      UPDATE lab_orders SET payment_status = 'paid' WHERE invoice_id = NEW.invoice_id;
    END IF;
  END IF;
  RETURN NEW;
END $function$;
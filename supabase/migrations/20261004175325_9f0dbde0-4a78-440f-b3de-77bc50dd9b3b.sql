ALTER TABLE public.journal_entries DROP CONSTRAINT journal_entries_reference_type_check;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_reference_type_check CHECK (reference_type IS NULL OR reference_type = ANY (ARRAY['invoice','payment','expense','payroll','pos_transaction','patient_deposit','credit_note','grn','donation','vendor_payment','stock_adjustment','shipment','manual','opening_balance','cpv','crv','bpv','brv','surgery','invoice_cancellation','write_off','depreciation','bank_deposit','fund_utilization','blood_camp_expense','blood_camp_expense_reversal']));

CREATE OR REPLACE FUNCTION public.bb_camp_expense_reverse(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r record; v_rev uuid;
BEGIN
  FOR r IN SELECT * FROM journal_entries WHERE reference_type='blood_camp_expense' AND reference_id=p_id AND is_reversed=false LOOP
    INSERT INTO journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted, status)
    VALUES (r.organization_id, r.branch_id, 'JE-BCR-' || to_char(now(),'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::text,4,'0'),
            CURRENT_DATE, 'Reversal: ' || COALESCE(r.description,''), 'blood_camp_expense_reversal', p_id, true, 'posted')
    RETURNING id INTO v_rev;
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount, branch_id)
    SELECT v_rev, account_id, 'Reversal', credit_amount, debit_amount, branch_id FROM journal_entry_lines WHERE journal_entry_id = r.id;
    UPDATE journal_entries SET is_reversed=true, reversed_at=now(), reversed_by=auth.uid(), reversal_entry_id=v_rev WHERE id=r.id;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.post_blood_camp_expense_to_journal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_exp uuid; v_cash uuid; v_je uuid; v_branch uuid; v_camp text;
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    IF TG_OP = 'DELETE' OR OLD.amount IS DISTINCT FROM NEW.amount OR OLD.category IS DISTINCT FROM NEW.category THEN
      PERFORM public.bb_camp_expense_reverse(OLD.id);
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  END IF;
  IF COALESCE(NEW.amount,0) <= 0 THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type='blood_camp_expense' AND reference_id=NEW.id AND is_reversed=false) THEN RETURN NEW; END IF;
  SELECT branch_id, COALESCE(camp_number, name) INTO v_branch, v_camp FROM blood_camps WHERE id = NEW.camp_id;
  v_exp := public.get_or_create_default_account(NEW.organization_id, 'EXP-BBCAMP-001', 'Blood Camp Expenses', 'expense');
  v_cash := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
  INSERT INTO journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted, status, created_by)
  VALUES (NEW.organization_id, v_branch, 'JE-BCE-' || to_char(now(),'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::text,4,'0'),
          CURRENT_DATE, 'Blood camp ' || COALESCE(v_camp,'') || ' expense: ' || NEW.category, 'blood_camp_expense', NEW.id, true, 'posted', NEW.created_by)
  RETURNING id INTO v_je;
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount, branch_id) VALUES
    (v_je, v_exp, 'Camp expense (' || NEW.category || ')' || COALESCE(' - ' || NEW.notes,''), NEW.amount, 0, v_branch),
    (v_je, v_cash, 'Paid in cash', 0, NEW.amount, v_branch);
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.bb_camp_expense_reverse(uuid) FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_post_blood_camp_expense ON public.blood_camp_expenses;
CREATE TRIGGER trg_post_blood_camp_expense AFTER INSERT OR UPDATE OR DELETE ON public.blood_camp_expenses
FOR EACH ROW EXECUTE FUNCTION public.post_blood_camp_expense_to_journal();

DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT id FROM blood_camp_expenses LOOP
    UPDATE blood_camp_expenses SET amount = amount WHERE id = r.id;
  END LOOP;
END $$;
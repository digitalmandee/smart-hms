-- 1. Allow the missing ledger reference types
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_reference_type_check;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_reference_type_check
CHECK (
  reference_type IS NULL OR reference_type = ANY (ARRAY[
    'invoice','payment','expense','payroll','pos_transaction','patient_deposit',
    'credit_note','grn','donation','vendor_payment','stock_adjustment','shipment',
    'manual','opening_balance','cpv','crv','bpv','brv','surgery',
    'invoice_cancellation','write_off','depreciation','bank_deposit'
  ])
);

-- 2. Period-based idempotency key used by depreciation / recurring postings
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS reference_number text;
CREATE INDEX IF NOT EXISTS idx_journal_entries_ref_number
  ON public.journal_entries (organization_id, reference_type, reference_number);

-- 3. Recurring auto-post: remove non-existent total_debit / total_credit columns
CREATE OR REPLACE FUNCTION public.auto_post_due_recurring_templates(_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_today date := CURRENT_DATE;
  v_tmpl record;
  v_journal_id uuid;
  v_branch_id uuid;
  v_line jsonb;
  v_total_dr numeric;
  v_total_cr numeric;
  v_next_run date;
  v_posted int := 0;
  v_results jsonb := '[]'::jsonb;
BEGIN
  SELECT id INTO v_branch_id FROM branches
   WHERE organization_id = _organization_id AND is_active = true
   ORDER BY created_at LIMIT 1;

  FOR v_tmpl IN
    SELECT * FROM recurring_journal_templates
     WHERE organization_id = _organization_id
       AND is_active = true
       AND next_run_date IS NOT NULL
       AND next_run_date <= v_today
       AND (end_date IS NULL OR end_date >= v_today)
  LOOP
    v_total_dr := 0;
    v_total_cr := 0;
    FOR v_line IN SELECT * FROM jsonb_array_elements(v_tmpl.lines) LOOP
      v_total_dr := v_total_dr + COALESCE((v_line->>'debit_amount')::numeric, 0);
      v_total_cr := v_total_cr + COALESCE((v_line->>'credit_amount')::numeric, 0);
    END LOOP;

    IF round(v_total_dr,2) <> round(v_total_cr,2) OR v_total_dr = 0 THEN
      v_results := v_results || jsonb_build_object('template', v_tmpl.template_name, 'status','skipped_unbalanced');
      CONTINUE;
    END IF;

    INSERT INTO journal_entries(
      organization_id, branch_id, entry_date, posting_date, entry_number,
      reference_type, reference_number, description,
      is_posted, posted_at, posted_by, created_by
    ) VALUES (
      _organization_id, v_branch_id, v_today, v_today, '',
      'manual', 'REC-' || v_tmpl.id || '-' || v_today,
      'Recurring auto-post: ' || v_tmpl.template_name,
      true, now(), v_tmpl.created_by, v_tmpl.created_by
    ) RETURNING id INTO v_journal_id;

    FOR v_line IN SELECT * FROM jsonb_array_elements(v_tmpl.lines) LOOP
      INSERT INTO journal_entry_lines(journal_entry_id, account_id, debit_amount, credit_amount, description)
      VALUES (
        v_journal_id,
        (v_line->>'account_id')::uuid,
        COALESCE((v_line->>'debit_amount')::numeric, 0),
        COALESCE((v_line->>'credit_amount')::numeric, 0),
        COALESCE(v_line->>'description', v_tmpl.template_name)
      );
    END LOOP;

    v_next_run := CASE v_tmpl.frequency
      WHEN 'monthly' THEN v_tmpl.next_run_date + interval '1 month'
      WHEN 'quarterly' THEN v_tmpl.next_run_date + interval '3 months'
      WHEN 'yearly' THEN v_tmpl.next_run_date + interval '1 year'
      ELSE v_tmpl.next_run_date + interval '1 month'
    END;

    UPDATE recurring_journal_templates
       SET last_run_date = v_today, next_run_date = v_next_run
     WHERE id = v_tmpl.id;

    v_posted := v_posted + 1;
    v_results := v_results || jsonb_build_object('template', v_tmpl.template_name, 'status','posted', 'journal_id', v_journal_id);
  END LOOP;

  RETURN jsonb_build_object('status','complete', 'posted_count', v_posted, 'details', v_results);
END;
$function$;

-- 4. Stamp posted_at / posted_by on every posted journal entry (covers all trigger paths)
CREATE OR REPLACE FUNCTION public.stamp_journal_posting_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.is_posted THEN
    NEW.posted_at := COALESCE(NEW.posted_at, now());
    NEW.posted_by := COALESCE(NEW.posted_by, NEW.created_by, auth.uid());
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_stamp_journal_posting_metadata ON public.journal_entries;
CREATE TRIGGER trg_stamp_journal_posting_metadata
BEFORE INSERT OR UPDATE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.stamp_journal_posting_metadata();
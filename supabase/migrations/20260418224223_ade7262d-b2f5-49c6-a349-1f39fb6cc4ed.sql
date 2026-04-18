
-- ===========================================================================
-- 1) LOCK FISCAL YEAR (idempotent; refuses if there are unposted entries)
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.lock_fiscal_year(_fiscal_year_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fy fiscal_years%ROWTYPE;
  v_unposted int;
BEGIN
  SELECT * INTO v_fy FROM fiscal_years WHERE id = _fiscal_year_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fiscal year % not found', _fiscal_year_id;
  END IF;

  IF v_fy.is_closed THEN
    RETURN jsonb_build_object('status','already_closed','fiscal_year', v_fy.name);
  END IF;

  -- Safety: refuse to lock if any unposted JE exists in the period for this org
  SELECT count(*) INTO v_unposted
  FROM journal_entries
  WHERE organization_id = v_fy.organization_id
    AND entry_date BETWEEN v_fy.start_date AND v_fy.end_date
    AND COALESCE(is_posted, false) = false;

  IF v_unposted > 0 THEN
    RAISE EXCEPTION 'Cannot lock: % unposted journal entries exist in this fiscal year', v_unposted;
  END IF;

  UPDATE fiscal_years
     SET is_closed = true,
         closed_at = now(),
         closed_by = auth.uid()
   WHERE id = _fiscal_year_id;

  RETURN jsonb_build_object('status','locked','fiscal_year', v_fy.name, 'locked_at', now());
END;
$$;

-- ===========================================================================
-- 2) PER-ASSET DEPRECIATION POSTING
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.post_monthly_depreciation_per_asset(
  _organization_id uuid,
  _month int,
  _year int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_key text := _year || '-' || lpad(_month::text, 2, '0');
  v_entry_date date := make_date(_year, _month, 1) + interval '1 month' - interval '1 day';
  v_branch_id uuid;
  v_journal_id uuid;
  v_total numeric := 0;
  v_count int := 0;
  v_skipped int := 0;
  v_no_account int := 0;
  v_asset record;
  v_monthly_dep numeric;
  v_months_elapsed int;
  v_remaining numeric;
BEGIN
  -- Idempotency: refuse if already posted for this period
  IF EXISTS (
    SELECT 1 FROM journal_entries
     WHERE organization_id = _organization_id
       AND reference_type = 'depreciation'
       AND reference_number = v_period_key
  ) THEN
    RAISE EXCEPTION 'Depreciation already posted for %', v_period_key;
  END IF;

  -- Pick a branch for the JE header (first active branch)
  SELECT id INTO v_branch_id FROM branches
   WHERE organization_id = _organization_id AND is_active = true
   ORDER BY created_at LIMIT 1;

  -- Create the parent journal entry (we will populate lines below)
  INSERT INTO journal_entries(
    organization_id, branch_id, entry_date, posting_date, entry_number,
    reference_type, reference_number, description,
    is_posted, posted_at, posted_by, created_by
  ) VALUES (
    _organization_id, v_branch_id, v_entry_date, v_entry_date, '',
    'depreciation', v_period_key,
    'Monthly Depreciation for ' || v_period_key || ' (per-asset)',
    true, now(), auth.uid(), auth.uid()
  ) RETURNING id INTO v_journal_id;

  -- Iterate active assets that have BOTH expense + accumulated dep accounts configured
  FOR v_asset IN
    SELECT * FROM fixed_assets
     WHERE organization_id = _organization_id
       AND status = 'active'
  LOOP
    -- Compute months elapsed from purchase
    v_months_elapsed := (date_part('year', v_entry_date)::int - date_part('year', v_asset.purchase_date)::int) * 12
                      + (date_part('month', v_entry_date)::int - date_part('month', v_asset.purchase_date)::int);

    -- Skip future-purchased / fully-depreciated assets
    IF v_months_elapsed < 1 OR v_months_elapsed > v_asset.useful_life_months THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Skip assets without per-asset GL accounts configured
    IF v_asset.account_id IS NULL OR v_asset.depreciation_account_id IS NULL THEN
      v_no_account := v_no_account + 1;
      CONTINUE;
    END IF;

    -- Straight-line monthly depreciation (DB function uses SL only; advanced methods
    -- still use the per-asset hook). Cap at remaining depreciable amount.
    v_monthly_dep := round(((v_asset.purchase_cost - COALESCE(v_asset.salvage_value,0)) / v_asset.useful_life_months)::numeric, 2);
    v_remaining := (v_asset.purchase_cost - COALESCE(v_asset.salvage_value,0)) - COALESCE(v_asset.accumulated_depreciation,0);
    IF v_monthly_dep > v_remaining THEN
      v_monthly_dep := round(v_remaining::numeric, 2);
    END IF;

    IF v_monthly_dep <= 0 THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- DR Depreciation Expense (per-asset)
    INSERT INTO journal_entry_lines(journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_asset.depreciation_account_id, v_monthly_dep, 0,
            'Depreciation expense ' || v_period_key || ' — ' || v_asset.name);

    -- CR Accumulated Depreciation (per-asset's contra-asset = account_id is the asset; we
    -- expect depreciation_account_id to be the EXPENSE acct and account_id is the ASSET acct.
    -- Convention: post accumulated dep to the asset's contra; if not separately configured,
    -- credit the asset GL itself).
    INSERT INTO journal_entry_lines(journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES (v_journal_id, v_asset.account_id, 0, v_monthly_dep,
            'Accumulated depreciation ' || v_period_key || ' — ' || v_asset.name);

    -- Update asset roll-forward
    UPDATE fixed_assets
       SET accumulated_depreciation = round((COALESCE(accumulated_depreciation,0) + v_monthly_dep)::numeric, 2),
           net_book_value = round(GREATEST(
              purchase_cost - (COALESCE(accumulated_depreciation,0) + v_monthly_dep),
              COALESCE(salvage_value,0)
           )::numeric, 2),
           last_depreciation_date = v_entry_date
     WHERE id = v_asset.id;

    v_total := v_total + v_monthly_dep;
    v_count := v_count + 1;
  END LOOP;

  -- If nothing posted, delete the empty parent JE so we don't pollute the ledger
  IF v_count = 0 THEN
    DELETE FROM journal_entries WHERE id = v_journal_id;
    RETURN jsonb_build_object(
      'status','no_op',
      'reason','no eligible assets',
      'skipped', v_skipped,
      'no_account', v_no_account
    );
  END IF;

  RETURN jsonb_build_object(
    'status','posted',
    'journal_id', v_journal_id,
    'period', v_period_key,
    'assets_processed', v_count,
    'skipped', v_skipped,
    'no_account', v_no_account,
    'total_depreciation', v_total
  );
END;
$$;

-- ===========================================================================
-- 3) AUTO-POST DUE RECURRING TEMPLATES
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.auto_post_due_recurring_templates(_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- Validate balanced lines
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
      total_debit, total_credit, is_posted, posted_at, posted_by, created_by
    ) VALUES (
      _organization_id, v_branch_id, v_today, v_today, '',
      'manual', 'REC-' || v_tmpl.id || '-' || v_today,
      'Recurring auto-post: ' || v_tmpl.template_name,
      v_total_dr, v_total_cr, true, now(), v_tmpl.created_by, v_tmpl.created_by
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

    -- Advance next_run_date based on frequency
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
$$;

GRANT EXECUTE ON FUNCTION public.lock_fiscal_year(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.post_monthly_depreciation_per_asset(uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_post_due_recurring_templates(uuid) TO authenticated;

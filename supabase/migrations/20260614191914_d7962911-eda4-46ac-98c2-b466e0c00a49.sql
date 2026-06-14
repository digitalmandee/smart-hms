
-- =====================================================================
-- 1. GL Trial Balance health check (per month)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.gl_trial_balance_health(
  _start_date date DEFAULT (date_trunc('year', now()))::date,
  _end_date   date DEFAULT (now())::date
)
RETURNS TABLE (
  period_month   date,
  entries_count  bigint,
  total_debit    numeric,
  total_credit   numeric,
  difference     numeric,
  is_balanced    boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  SELECT organization_id INTO _org_id FROM public.profiles WHERE id = auth.uid();
  IF _org_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    date_trunc('month', je.entry_date)::date                                AS period_month,
    COUNT(DISTINCT je.id)                                                   AS entries_count,
    COALESCE(SUM(jel.debit_amount), 0)::numeric                             AS total_debit,
    COALESCE(SUM(jel.credit_amount), 0)::numeric                            AS total_credit,
    COALESCE(SUM(jel.debit_amount) - SUM(jel.credit_amount), 0)::numeric    AS difference,
    ROUND(COALESCE(SUM(jel.debit_amount) - SUM(jel.credit_amount), 0)::numeric, 2) = 0
                                                                            AS is_balanced
  FROM public.journal_entries je
  LEFT JOIN public.journal_entry_lines jel ON jel.journal_entry_id = je.id
  WHERE je.organization_id = _org_id
    AND je.is_posted = true
    AND je.entry_date BETWEEN _start_date AND _end_date
  GROUP BY date_trunc('month', je.entry_date)
  ORDER BY period_month DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.gl_trial_balance_health(date, date) TO authenticated;

-- =====================================================================
-- 2. GL Source Coverage report (orphan source rows without journal entries)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.gl_coverage_report(
  _start_date date DEFAULT (date_trunc('year', now()))::date,
  _end_date   date DEFAULT (now())::date
)
RETURNS TABLE (
  source_type    text,
  source_label   text,
  expected_count bigint,
  posted_count   bigint,
  orphan_count   bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  SELECT organization_id INTO _org_id FROM public.profiles WHERE id = auth.uid();
  IF _org_id IS NULL THEN RETURN; END IF;

  -- Invoices (any non-cancelled invoice should have a JE)
  RETURN QUERY
  SELECT
    'invoice'::text,
    'Invoices'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM public.journal_entries je
        WHERE je.organization_id = _org_id
          AND je.reference_type = 'invoice'
          AND je.reference_id = i.id
      )
    )::bigint,
    COUNT(*) FILTER (
      WHERE NOT EXISTS (
        SELECT 1 FROM public.journal_entries je
        WHERE je.organization_id = _org_id
          AND je.reference_type = 'invoice'
          AND je.reference_id = i.id
      )
    )::bigint
  FROM public.invoices i
  WHERE i.organization_id = _org_id
    AND COALESCE(i.status,'') NOT IN ('cancelled','draft')
    AND i.invoice_date BETWEEN _start_date AND _end_date;

  -- Payments
  RETURN QUERY
  SELECT
    'payment'::text,
    'Payments'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'payment'
        AND je.reference_id = p.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'payment'
        AND je.reference_id = p.id
    ))::bigint
  FROM public.payments p
  WHERE p.organization_id = _org_id
    AND p.payment_date BETWEEN _start_date AND _end_date;

  -- Pharmacy POS sales
  RETURN QUERY
  SELECT
    'pharmacy_pos'::text,
    'Pharmacy POS sales'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('pharmacy_pos','pharmacy_sale')
        AND je.reference_id = t.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('pharmacy_pos','pharmacy_sale')
        AND je.reference_id = t.id
    ))::bigint
  FROM public.pharmacy_pos_transactions t
  WHERE t.organization_id = _org_id
    AND COALESCE(t.status,'') = 'completed'
    AND t.created_at::date BETWEEN _start_date AND _end_date;

  -- Goods Received Notes (verified)
  RETURN QUERY
  SELECT
    'grn'::text,
    'Goods Received Notes'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('grn','goods_received_note')
        AND je.reference_id = g.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('grn','goods_received_note')
        AND je.reference_id = g.id
    ))::bigint
  FROM public.goods_received_notes g
  WHERE g.organization_id = _org_id
    AND COALESCE(g.status,'') IN ('verified','accepted','received')
    AND g.created_at::date BETWEEN _start_date AND _end_date;

  -- Surgeries (completed)
  RETURN QUERY
  SELECT
    'surgery'::text,
    'Surgeries'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'surgery'
        AND je.reference_id = s.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'surgery'
        AND je.reference_id = s.id
    ))::bigint
  FROM public.surgeries s
  WHERE s.organization_id = _org_id
    AND COALESCE(s.status,'') = 'completed'
    AND s.created_at::date BETWEEN _start_date AND _end_date;

  -- Payroll runs (posted)
  RETURN QUERY
  SELECT
    'payroll'::text,
    'Payroll runs'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('payroll','payroll_run')
        AND je.reference_id = pr.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('payroll','payroll_run')
        AND je.reference_id = pr.id
    ))::bigint
  FROM public.payroll_runs pr
  WHERE pr.organization_id = _org_id
    AND COALESCE(pr.status,'') IN ('posted','paid')
    AND pr.created_at::date BETWEEN _start_date AND _end_date;

  -- Expenses (approved/paid)
  RETURN QUERY
  SELECT
    'expense'::text,
    'Expenses'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'expense'
        AND je.reference_id = e.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'expense'
        AND je.reference_id = e.id
    ))::bigint
  FROM public.expenses e
  WHERE e.organization_id = _org_id
    AND COALESCE(e.status,'') IN ('approved','paid')
    AND e.created_at::date BETWEEN _start_date AND _end_date;

  -- Patient deposits (completed)
  RETURN QUERY
  SELECT
    'patient_deposit'::text,
    'Patient deposits'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('patient_deposit','deposit')
        AND je.reference_id = d.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type IN ('patient_deposit','deposit')
        AND je.reference_id = d.id
    ))::bigint
  FROM public.patient_deposits d
  WHERE d.organization_id = _org_id
    AND COALESCE(d.status,'') = 'completed'
    AND d.created_at::date BETWEEN _start_date AND _end_date;

  -- Vendor payments
  RETURN QUERY
  SELECT
    'vendor_payment'::text,
    'Vendor payments'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'vendor_payment'
        AND je.reference_id = vp.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'vendor_payment'
        AND je.reference_id = vp.id
    ))::bigint
  FROM public.vendor_payments vp
  WHERE vp.organization_id = _org_id
    AND vp.payment_date BETWEEN _start_date AND _end_date;

  -- Credit notes (approved)
  RETURN QUERY
  SELECT
    'credit_note'::text,
    'Credit notes'::text,
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'credit_note'
        AND je.reference_id = cn.id
    ))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.journal_entries je
      WHERE je.organization_id = _org_id
        AND je.reference_type = 'credit_note'
        AND je.reference_id = cn.id
    ))::bigint
  FROM public.credit_notes cn
  WHERE cn.organization_id = _org_id
    AND COALESCE(cn.status,'') = 'approved'
    AND cn.issue_date BETWEEN _start_date AND _end_date;
END;
$$;

GRANT EXECUTE ON FUNCTION public.gl_coverage_report(date, date) TO authenticated;

-- =====================================================================
-- 3. Period lock status (for a date)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.gl_period_lock_status(_check_date date)
RETURNS TABLE (
  is_locked     boolean,
  fiscal_year   text,
  closed_at     timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  SELECT organization_id INTO _org_id FROM public.profiles WHERE id = auth.uid();
  IF _org_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT fy.is_closed, fy.name::text, fy.closed_at
  FROM public.fiscal_years fy
  WHERE fy.organization_id = _org_id
    AND _check_date BETWEEN fy.start_date AND fy.end_date
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.gl_period_lock_status(date) TO authenticated;

-- =====================================================================
-- 4. Period-lock guard trigger on journal_entries
-- =====================================================================
CREATE OR REPLACE FUNCTION public.enforce_fiscal_year_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _entry_date date;
  _org_id     uuid;
  _is_locked  boolean;
  _fy_name    text;
BEGIN
  -- Service role bypass (reversals / admin scripts)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    _entry_date := OLD.entry_date;
    _org_id     := OLD.organization_id;
  ELSE
    _entry_date := NEW.entry_date;
    _org_id     := NEW.organization_id;
  END IF;

  SELECT fy.is_closed, fy.name
    INTO _is_locked, _fy_name
  FROM public.fiscal_years fy
  WHERE fy.organization_id = _org_id
    AND _entry_date BETWEEN fy.start_date AND fy.end_date
  LIMIT 1;

  IF _is_locked THEN
    RAISE EXCEPTION 'Fiscal year % is closed. Entries for % cannot be created, modified or deleted.',
      _fy_name, _entry_date
      USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_fiscal_year_lock ON public.journal_entries;
CREATE TRIGGER trg_enforce_fiscal_year_lock
BEFORE INSERT OR UPDATE OR DELETE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_fiscal_year_lock();

-- Also guard line edits against locked parent JEs
CREATE OR REPLACE FUNCTION public.enforce_fiscal_year_lock_on_lines()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _je_id uuid;
  _entry_date date;
  _org_id uuid;
  _is_locked boolean;
  _fy_name text;
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  _je_id := COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);

  SELECT je.entry_date, je.organization_id
    INTO _entry_date, _org_id
  FROM public.journal_entries je WHERE je.id = _je_id;

  IF _entry_date IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT fy.is_closed, fy.name INTO _is_locked, _fy_name
  FROM public.fiscal_years fy
  WHERE fy.organization_id = _org_id
    AND _entry_date BETWEEN fy.start_date AND fy.end_date
  LIMIT 1;

  IF _is_locked THEN
    RAISE EXCEPTION 'Fiscal year % is closed. Journal lines for % cannot be changed.',
      _fy_name, _entry_date
      USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_fiscal_year_lock_on_lines ON public.journal_entry_lines;
CREATE TRIGGER trg_enforce_fiscal_year_lock_on_lines
BEFORE INSERT OR UPDATE OR DELETE ON public.journal_entry_lines
FOR EACH ROW EXECUTE FUNCTION public.enforce_fiscal_year_lock_on_lines();

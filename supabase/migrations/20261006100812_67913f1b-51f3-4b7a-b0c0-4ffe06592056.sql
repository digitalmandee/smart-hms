CREATE OR REPLACE FUNCTION public.gl_coverage_report(_start_date date DEFAULT (date_trunc('year'::text, now()))::date, _end_date date DEFAULT (now())::date)
 RETURNS TABLE(source_type text, source_label text, expected_count bigint, posted_count bigint, orphan_count bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _org_id uuid;
BEGIN
  SELECT organization_id INTO _org_id FROM public.profiles WHERE id = auth.uid();
  IF _org_id IS NULL THEN RETURN; END IF;

  RETURN QUERY SELECT 'invoice'::text,'Invoices'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='invoice' AND je.reference_id=i.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='invoice' AND je.reference_id=i.id))::bigint
  FROM invoices i WHERE i.organization_id=_org_id AND COALESCE(i.status::text,'') NOT IN ('cancelled','draft') AND i.invoice_date BETWEEN _start_date AND _end_date;

  -- payments has no organization_id; scope through the linked invoice
  RETURN QUERY SELECT 'payment'::text,'Payments'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='payment' AND je.reference_id=p.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='payment' AND je.reference_id=p.id))::bigint
  FROM payments p JOIN invoices pi ON pi.id=p.invoice_id
  WHERE pi.organization_id=_org_id AND p.payment_date BETWEEN _start_date AND _end_date;

  RETURN QUERY SELECT 'pharmacy_pos'::text,'Pharmacy POS sales'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('pharmacy_pos','pharmacy_sale') AND je.reference_id=t.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('pharmacy_pos','pharmacy_sale') AND je.reference_id=t.id))::bigint
  FROM pharmacy_pos_transactions t WHERE t.organization_id=_org_id AND COALESCE(t.status::text,'')='completed' AND t.created_at::date BETWEEN _start_date AND _end_date;

  RETURN QUERY SELECT 'grn'::text,'Goods Received Notes'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('grn','goods_received_note') AND je.reference_id=g.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('grn','goods_received_note') AND je.reference_id=g.id))::bigint
  FROM goods_received_notes g WHERE g.organization_id=_org_id AND COALESCE(g.status::text,'') IN ('verified','accepted','received') AND g.created_at::date BETWEEN _start_date AND _end_date;

  RETURN QUERY SELECT 'surgery'::text,'Surgeries'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='surgery' AND je.reference_id=s.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='surgery' AND je.reference_id=s.id))::bigint
  FROM surgeries s WHERE s.organization_id=_org_id AND COALESCE(s.status::text,'')='completed' AND s.created_at::date BETWEEN _start_date AND _end_date;

  RETURN QUERY SELECT 'payroll'::text,'Payroll runs'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('payroll','payroll_run') AND je.reference_id=pr.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('payroll','payroll_run') AND je.reference_id=pr.id))::bigint
  FROM payroll_runs pr WHERE pr.organization_id=_org_id AND COALESCE(pr.status::text,'') IN ('posted','paid') AND pr.created_at::date BETWEEN _start_date AND _end_date;

  -- expenses has no status column; every recorded expense should be posted
  RETURN QUERY SELECT 'expense'::text,'Expenses'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='expense' AND je.reference_id=e.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='expense' AND je.reference_id=e.id))::bigint
  FROM expenses e WHERE e.organization_id=_org_id AND e.created_at::date BETWEEN _start_date AND _end_date;

  RETURN QUERY SELECT 'patient_deposit'::text,'Patient deposits'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('patient_deposit','deposit') AND je.reference_id=d.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type IN ('patient_deposit','deposit') AND je.reference_id=d.id))::bigint
  FROM patient_deposits d WHERE d.organization_id=_org_id AND COALESCE(d.status::text,'')='completed' AND d.created_at::date BETWEEN _start_date AND _end_date;

  RETURN QUERY SELECT 'vendor_payment'::text,'Vendor payments'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='vendor_payment' AND je.reference_id=vp.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='vendor_payment' AND je.reference_id=vp.id))::bigint
  FROM vendor_payments vp WHERE vp.organization_id=_org_id AND vp.payment_date BETWEEN _start_date AND _end_date;

  RETURN QUERY SELECT 'credit_note'::text,'Credit notes'::text,COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='credit_note' AND je.reference_id=cn.id))::bigint,
    COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM journal_entries je WHERE je.organization_id=_org_id AND je.reference_type='credit_note' AND je.reference_id=cn.id))::bigint
  FROM credit_notes cn WHERE cn.organization_id=_org_id AND COALESCE(cn.status::text,'')='approved' AND cn.created_at::date BETWEEN _start_date AND _end_date;
END;
$function$;
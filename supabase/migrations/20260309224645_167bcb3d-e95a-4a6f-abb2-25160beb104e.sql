-- Backfill doctor_earnings for existing paid consultation invoices
INSERT INTO public.doctor_earnings (
  organization_id, doctor_id, compensation_plan_id,
  earning_date, source_type, source_id, source_reference,
  patient_id, gross_amount, doctor_share_percent,
  doctor_share_amount, hospital_share_amount
)
SELECT DISTINCT ON (i.id, a.doctor_id)
  i.organization_id, a.doctor_id, dcp.id,
  COALESCE(i.invoice_date::date, CURRENT_DATE), 'consultation', i.id, i.invoice_number,
  i.patient_id, ii.total_price, COALESCE(dcp.consultation_share_percent, 0),
  ROUND(COALESCE(ii.total_price, 0) * COALESCE(dcp.consultation_share_percent, 0) / 100, 2),
  COALESCE(ii.total_price, 0) - ROUND(COALESCE(ii.total_price, 0) * COALESCE(dcp.consultation_share_percent, 0) / 100, 2)
FROM public.invoices i
JOIN public.invoice_items ii ON ii.invoice_id = i.id
JOIN public.appointments a ON a.invoice_id = i.id
LEFT JOIN public.doctor_compensation_plans dcp ON dcp.doctor_id = a.doctor_id AND dcp.is_active = true
WHERE i.status = 'paid'
  AND ii.description ILIKE '%consultation%'
  AND a.doctor_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.doctor_earnings de WHERE de.source_id = i.id AND de.doctor_id = a.doctor_id);
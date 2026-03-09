
-- Data fix: Link lab orders to their consultation's appointment invoice
UPDATE public.lab_orders lo
SET invoice_id = sub.invoice_id, payment_status = 'paid'
FROM (
  SELECT lo2.id as lab_order_id, a.invoice_id
  FROM public.lab_orders lo2
  JOIN public.consultations c ON c.id = lo2.consultation_id
  JOIN public.appointments a ON a.id = c.appointment_id
  JOIN public.invoices i ON i.id = a.invoice_id AND i.status = 'paid'
  WHERE lo2.payment_status != 'paid'
    AND lo2.invoice_id IS NULL
    AND lo2.consultation_id IS NOT NULL
) sub
WHERE lo.id = sub.lab_order_id;

-- Also fix imaging orders the same way
UPDATE public.imaging_orders io
SET invoice_id = sub.invoice_id, payment_status = 'paid'
FROM (
  SELECT io2.id as imaging_order_id, a.invoice_id
  FROM public.imaging_orders io2
  JOIN public.consultations c ON c.id = io2.consultation_id
  JOIN public.appointments a ON a.id = c.appointment_id
  JOIN public.invoices i ON i.id = a.invoice_id AND i.status = 'paid'
  WHERE io2.payment_status != 'paid'
    AND io2.invoice_id IS NULL
    AND io2.consultation_id IS NOT NULL
) sub
WHERE io.id = sub.imaging_order_id;

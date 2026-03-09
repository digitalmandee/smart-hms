-- Data fix: Link lab/imaging orders that were paid but stuck as 'pending'
-- Match by invoice patient_id = lab_order patient_id and invoice is paid
UPDATE public.lab_orders lo
SET payment_status = 'paid'
FROM public.invoices i
WHERE lo.invoice_id = i.id
  AND i.status = 'paid'
  AND lo.payment_status != 'paid';

UPDATE public.imaging_orders io
SET payment_status = 'paid'
FROM public.invoices i
WHERE io.invoice_id = i.id
  AND i.status = 'paid'
  AND io.payment_status != 'paid';
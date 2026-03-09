
-- Data fix: Link existing orphaned appointments to their paid invoices
UPDATE appointments a
SET invoice_id = i.id, payment_status = 'paid'
FROM invoices i
WHERE i.patient_id = a.patient_id
  AND i.status = 'paid'
  AND ABS(a.appointment_date::date - i.invoice_date::date) <= 1
  AND a.invoice_id IS NULL
  AND a.payment_status = 'pending'
  AND a.appointment_date >= '2026-03-09';

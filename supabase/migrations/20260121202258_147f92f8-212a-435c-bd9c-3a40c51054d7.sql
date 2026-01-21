-- Create lab orders for lab invoices that don't have one
WITH lab_invoices AS (
  SELECT DISTINCT i.id as invoice_id, 
         i.invoice_number,
         i.patient_id,
         i.branch_id,
         i.status as invoice_status
  FROM invoices i
  JOIN invoice_items ii ON i.id = ii.invoice_id
  JOIN service_types st ON ii.service_type_id = st.id
  WHERE st.category = 'lab'
    AND NOT EXISTS (
      SELECT 1 FROM lab_orders lo WHERE lo.invoice_id = i.id
    )
),
inserted_orders AS (
  INSERT INTO lab_orders (
    order_number, 
    patient_id, 
    branch_id, 
    invoice_id, 
    payment_status, 
    status, 
    priority, 
    clinical_notes
  )
  SELECT 
    'LAB-' || to_char(now(), 'YYMMDD') || '-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
    patient_id,
    branch_id,
    invoice_id,
    CASE WHEN invoice_status = 'paid' THEN 'paid' ELSE 'pending' END,
    'ordered',
    'routine',
    'Backfilled from Invoice ' || invoice_number
  FROM lab_invoices
  RETURNING id, invoice_id
)
-- Create lab order items for the backfilled orders
INSERT INTO lab_order_items (lab_order_id, service_type_id, test_name, status)
SELECT 
  io.id,
  ii.service_type_id,
  ii.description,
  'pending'
FROM inserted_orders io
JOIN invoice_items ii ON io.invoice_id = ii.invoice_id
JOIN service_types st ON ii.service_type_id = st.id
WHERE st.category = 'lab';
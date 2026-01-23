-- Create lab order for Nazia's invoice (INV-20260123-560)
WITH lab_order AS (
  INSERT INTO lab_orders (
    order_number,
    patient_id,
    branch_id,
    invoice_id,
    payment_status,
    status,
    priority,
    clinical_notes
  ) VALUES (
    'LAB-260123-9001',
    '416c4a34-84d7-416c-92e3-0c2850c4fda8',
    'c1111111-1111-1111-1111-111111111111',
    '52d5f882-5bde-496c-8ee8-8a10f71d7ce9',
    'pending',
    'ordered',
    'routine',
    'Created from Invoice INV-20260123-560'
  )
  RETURNING id
)
INSERT INTO lab_order_items (lab_order_id, service_type_id, test_name, test_category, status)
SELECT 
  lo.id,
  ii.service_type_id,
  ii.description,
  'lab',
  'pending'
FROM lab_order lo
CROSS JOIN invoice_items ii
JOIN service_types st ON ii.service_type_id = st.id
WHERE ii.invoice_id = '52d5f882-5bde-496c-8ee8-8a10f71d7ce9'
  AND st.category = 'lab';
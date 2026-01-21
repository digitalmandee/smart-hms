-- Fix missing deposit invoice for admission ADM2601190003
-- First create the invoice
WITH admission_data AS (
  SELECT 
    id, organization_id, branch_id, patient_id, 
    admission_number, admission_date, deposit_amount
  FROM admissions 
  WHERE id = 'd9034ec1-6e98-46e1-abde-4d2def8ad57c'
    AND admission_invoice_id IS NULL
    AND deposit_amount > 0
),
new_invoice AS (
  INSERT INTO invoices (
    organization_id, branch_id, patient_id, 
    invoice_number, invoice_date, subtotal, 
    tax_amount, discount_amount, total_amount, 
    paid_amount, balance_amount, status, notes
  )
  SELECT 
    organization_id,
    branch_id,
    patient_id,
    'DEP-' || upper(substr(md5(random()::text), 1, 8)),
    admission_date,
    deposit_amount,
    0, 0,
    deposit_amount,
    deposit_amount, -- Marking as fully paid since deposit was collected
    0,
    'paid',
    'Admission deposit for ' || admission_number
  FROM admission_data
  RETURNING id, total_amount
),
-- Create invoice item
invoice_item AS (
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
  SELECT 
    ni.id,
    'Admission Deposit',
    1,
    ni.total_amount,
    ni.total_amount
  FROM new_invoice ni
  RETURNING invoice_id
)
-- Link invoice to admission
UPDATE admissions 
SET admission_invoice_id = (SELECT id FROM new_invoice)
WHERE id = 'd9034ec1-6e98-46e1-abde-4d2def8ad57c'
  AND admission_invoice_id IS NULL;
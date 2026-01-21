-- Update existing imaging/radiology services to use radiology category
UPDATE service_types 
SET category = 'radiology' 
WHERE category = 'procedure' 
AND (
  name ILIKE '%x-ray%' 
  OR name ILIKE '%xray%' 
  OR name ILIKE '%ct scan%' 
  OR name ILIKE '%ct %' 
  OR name ILIKE '%mri%' 
  OR name ILIKE '%ultrasound%' 
  OR name ILIKE '%usg%' 
  OR name ILIKE '%mammography%' 
  OR name ILIKE '%ecg%' 
  OR name ILIKE '%echo%' 
  OR name ILIKE '%doppler%' 
  OR name ILIKE '%fluoroscopy%' 
  OR name ILIKE '%pet%' 
  OR name ILIKE '%dexa%'
  OR name ILIKE '%radiograph%'
  OR name ILIKE '%angiography%'
);

-- Create imaging orders for existing invoices with imaging items that don't have orders yet
-- Use a fallback for ordered_by when created_by is null
INSERT INTO imaging_orders (
  order_number, patient_id, organization_id, branch_id, invoice_id,
  modality, procedure_name, status, priority, payment_status, clinical_indication, ordered_by
)
SELECT 
  'IMG-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*9999)::text, 4, '0'),
  i.patient_id,
  i.organization_id,
  i.branch_id,
  i.id,
  CASE 
    WHEN LOWER(ii.description) LIKE '%x-ray%' OR LOWER(ii.description) LIKE '%xray%' THEN 'xray'::imaging_modality
    WHEN LOWER(ii.description) LIKE '%ct%' THEN 'ct_scan'::imaging_modality
    WHEN LOWER(ii.description) LIKE '%mri%' THEN 'mri'::imaging_modality
    WHEN LOWER(ii.description) LIKE '%ultrasound%' OR LOWER(ii.description) LIKE '%usg%' THEN 'ultrasound'::imaging_modality
    WHEN LOWER(ii.description) LIKE '%mammograph%' THEN 'mammography'::imaging_modality
    WHEN LOWER(ii.description) LIKE '%ecg%' THEN 'ecg'::imaging_modality
    WHEN LOWER(ii.description) LIKE '%echo%' THEN 'echo'::imaging_modality
    ELSE 'other'::imaging_modality
  END,
  ii.description,
  'ordered'::imaging_order_status,
  'routine'::imaging_priority,
  CASE WHEN i.status = 'paid' THEN 'paid' ELSE 'pending' END,
  'Created from Invoice ' || i.invoice_number,
  COALESCE(i.created_by, (SELECT id FROM profiles WHERE organization_id = i.organization_id LIMIT 1))
FROM invoices i
JOIN invoice_items ii ON ii.invoice_id = i.id
LEFT JOIN service_types st ON ii.service_type_id = st.id
WHERE NOT EXISTS (
  SELECT 1 FROM imaging_orders io WHERE io.invoice_id = i.id
)
AND COALESCE(i.created_by, (SELECT id FROM profiles WHERE organization_id = i.organization_id LIMIT 1)) IS NOT NULL
AND (
  LOWER(ii.description) LIKE '%x-ray%' 
  OR LOWER(ii.description) LIKE '%xray%'
  OR LOWER(ii.description) LIKE '%ct scan%' 
  OR LOWER(ii.description) LIKE '%ct %'
  OR LOWER(ii.description) LIKE '%mri%' 
  OR LOWER(ii.description) LIKE '%ultrasound%'
  OR LOWER(ii.description) LIKE '%usg%'
  OR LOWER(ii.description) LIKE '%ecg%'
  OR LOWER(ii.description) LIKE '%echo%'
  OR LOWER(ii.description) LIKE '%mammograph%'
  OR st.category = 'radiology'
);
-- Update lab order items with realistic test results
UPDATE lab_order_items 
SET result_values = '{"hemoglobin": 14.2, "wbc": 7800, "rbc": 4.9, "platelets": 245000, "hematocrit": 41}'::jsonb,
    result_notes = 'All parameters within normal limits',
    result = 'Normal',
    result_date = NOW(),
    status = 'completed'
WHERE id = '483af14f-3b23-4488-bb44-0f128b9efd4a';

UPDATE lab_order_items 
SET result_values = '{"total_cholesterol": 188, "hdl": 55, "ldl": 112, "triglycerides": 105}'::jsonb,
    result_notes = 'Lipid levels within acceptable range',
    result = 'Normal',
    result_date = NOW(),
    status = 'completed'
WHERE id = '153b0f16-1a4d-40a2-b3fb-b38d3155711f';

UPDATE lab_order_items 
SET result_values = '{"fasting_glucose": 98, "hba1c": 5.4}'::jsonb,
    result_notes = 'Blood sugar levels normal',
    result = 'Normal',
    result_date = NOW(),
    status = 'completed'
WHERE id = '8e2f0542-795c-4635-8c11-50d93114d699';

UPDATE lab_order_items 
SET result_values = '{"tsh": 2.8, "t3": 1.2, "t4": 8.5}'::jsonb,
    result_notes = 'Thyroid function normal',
    result = 'Normal',
    result_date = NOW(),
    status = 'completed'
WHERE id = '74cd7f92-9621-42e8-8880-2033f488baa0';

UPDATE lab_order_items 
SET result_values = '{"creatinine": 1.1, "bun": 18, "egfr": 92}'::jsonb,
    result_notes = 'Kidney function normal',
    result = 'Normal',
    result_date = NOW(),
    status = 'completed'
WHERE id = '287da579-8423-4fb9-bca0-d8c5a169eac0';

UPDATE lab_order_items 
SET result_values = '{"alt": 28, "ast": 32, "alp": 85, "bilirubin": 0.8}'::jsonb,
    result_notes = 'Liver enzymes normal',
    result = 'Normal',
    result_date = NOW(),
    status = 'completed'
WHERE id = 'd874a2a4-e1fb-408a-953e-abfcc64c888d';

-- Update corresponding lab orders to completed
UPDATE lab_orders SET status = 'completed' 
WHERE id IN (
  SELECT DISTINCT lab_order_id FROM lab_order_items 
  WHERE id IN (
    '483af14f-3b23-4488-bb44-0f128b9efd4a',
    '153b0f16-1a4d-40a2-b3fb-b38d3155711f',
    '8e2f0542-795c-4635-8c11-50d93114d699',
    '74cd7f92-9621-42e8-8880-2033f488baa0',
    '287da579-8423-4fb9-bca0-d8c5a169eac0',
    'd874a2a4-e1fb-408a-953e-abfcc64c888d'
  )
);
-- PHASE 3: Seed Sample Lab Results Data
-- Update existing lab orders with completed results and publish status

-- Order 1: CBC, ESR, FBS - Mark as completed with results
UPDATE lab_orders SET 
  status = 'completed',
  completed_at = NOW() - INTERVAL '2 hours',
  result_notes = 'All parameters within normal limits. No abnormalities detected.',
  is_published = true,
  published_at = NOW() - INTERVAL '1 hour',
  access_code = '847293'
WHERE id = '09db26b8-995e-4872-8842-2448dc299671';

-- Update lab order items for Order 1
UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"Hemoglobin": 14.5, "RBC Count": 5.2, "WBC Count": 7500, "Platelet Count": 250000, "Hematocrit": 43, "MCV": 85, "MCH": 28, "MCHC": 33, "RDW": 13.2}'::jsonb,
  result_notes = 'Normal blood picture',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '80b4bc11-a4ef-4898-819d-d426966e947c';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"ESR": 12}'::jsonb,
  result_notes = 'Within normal range',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '118dde1a-ca1a-430c-adc5-755375bf82a3';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"Fasting Glucose": 95}'::jsonb,
  result_notes = 'Normal fasting glucose',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = 'ed566e23-6cb7-4c6f-9e17-b8a4433a8223';

-- Order 2: CBC, LFT, Urine - Mark as completed with results
UPDATE lab_orders SET 
  status = 'completed',
  completed_at = NOW() - INTERVAL '3 hours',
  result_notes = 'Mild elevation in liver enzymes. Recommend follow-up.',
  is_published = true,
  published_at = NOW() - INTERVAL '2 hours',
  access_code = '592847'
WHERE id = '1bcad73e-c61b-426b-a049-0780300a13e2';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"Hemoglobin": 11.2, "RBC Count": 4.1, "WBC Count": 8200, "Platelet Count": 310000, "Hematocrit": 35, "MCV": 82, "MCH": 27, "MCHC": 32, "RDW": 14.1}'::jsonb,
  result_notes = 'Mild anemia noted',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = 'a88e11b3-c07f-4729-ae2c-3c2c8420bf49';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"Total Bilirubin": 1.4, "Direct Bilirubin": 0.4, "SGOT (AST)": 52, "SGPT (ALT)": 68, "Alkaline Phosphatase": 95, "GGT": 45, "Total Protein": 7.2, "Albumin": 4.1}'::jsonb,
  result_notes = 'Elevated transaminases - recommend hepatology consult',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '642fd720-5343-4f35-b469-c99ecb125a98';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"Color": "Yellow", "Appearance": "Clear", "Specific Gravity": 1.018, "pH": 6.0, "Protein": "Nil", "Glucose": "Nil", "RBCs": "0-1", "WBCs": "2-3", "Epithelial Cells": "Few", "Bacteria": "Nil"}'::jsonb,
  result_notes = 'Normal urinalysis',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '543d2111-8c68-4836-a164-dd0925814ea8';

-- Order 3: Lipid Profile, HbA1c, RFT - Mark as completed with results  
UPDATE lab_orders SET 
  status = 'completed',
  completed_at = NOW() - INTERVAL '4 hours',
  result_notes = 'Diabetic profile - HbA1c elevated. Lipids borderline high.',
  is_published = true,
  published_at = NOW() - INTERVAL '3 hours',
  access_code = '638492'
WHERE id = 'bf4d416f-619f-4c94-ad0e-3e71b43411e6';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"Total Cholesterol": 215, "Triglycerides": 180, "HDL Cholesterol": 38, "LDL Cholesterol": 135, "VLDL Cholesterol": 36}'::jsonb,
  result_notes = 'Borderline high cholesterol, low HDL',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '1679724d-5bb5-4f67-a22e-f7c05066fef6';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"HbA1c": 7.8}'::jsonb,
  result_notes = 'Poor glycemic control - diabetes management needed',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '83f3d646-b118-42ca-b957-105232d78d5b';

UPDATE lab_order_items SET 
  status = 'completed',
  result_values = '{"Blood Urea": 18, "Serum Creatinine": 1.1, "BUN": 20, "Uric Acid": 5.8, "eGFR": 95}'::jsonb,
  result_notes = 'Renal function preserved',
  performed_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '52edd544-3ff5-4b08-977b-591c2f1e9320';

-- Order 4: CBC - Mark as collected (in progress)
UPDATE lab_orders SET 
  status = 'collected',
  result_notes = NULL
WHERE id = 'ca60f7dd-6530-4d96-a3f5-bbf13c78599c';

UPDATE lab_order_items SET 
  status = 'pending'
WHERE id = 'd874a2a4-e1fb-408a-953e-abfcc64c888d';

-- Order 5: Keep as ordered (pending)
UPDATE lab_orders SET 
  status = 'ordered'
WHERE id = '1741cd95-f3c1-472a-9fcb-fc2558052a7d';

-- Phase 2: Seed 6 prescriptions linked to consultations (using existing doctor)
INSERT INTO prescriptions (id, consultation_id, patient_id, doctor_id, branch_id, prescription_number, notes, status)
VALUES
  ('a1111111-0001-0001-0001-000000000001', 'c8904d38-a22a-4ae7-91fb-95510f1b8a6a', 'e7e350d0-58fb-41ea-a98f-ecddbd0fac63', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'RX-260116-0001', 'Apply cream twice daily. Avoid allergens.', 'dispensed'),
  ('a1111111-0001-0001-0001-000000000002', 'cfbdd485-758c-435a-9620-09ab1457feec', 'ec1cf706-71ae-41ff-a690-02826a2a6c1c', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'RX-260116-0002', 'Complete full antibiotic course. Rest and hydration.', 'dispensed'),
  ('a1111111-0001-0001-0001-000000000003', '013deb39-b8c1-4b5d-a64c-efc2ad73ac0e', 'bfe33172-4116-4fec-b35d-7a095afb1361', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'RX-260116-0003', 'Monitor BP daily. Low sodium diet advised.', 'created'),
  ('a1111111-0001-0001-0001-000000000004', 'cfada4fe-ec8f-41fa-a954-392758b8a324', 'e6ddd7c8-b6cf-4029-8b58-ee745da30be2', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'RX-260116-0004', 'Apply heat packs. Physiotherapy recommended.', 'created'),
  ('a1111111-0001-0001-0001-000000000005', '11f9533f-1eb1-4b11-8774-8d57d696e3e9', 'bbed1ff7-b3b4-49b1-84db-698d103e7870', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'RX-260116-0005', 'Avoid dust and pollen. Use mask outdoors.', 'dispensed'),
  ('a1111111-0001-0001-0001-000000000006', '760f353b-5846-4413-b274-d85a58017e16', '06a37be6-620e-41af-82a6-352b537be3ee', 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'RX-260116-0006', 'Patient declined medication. Referred to specialist.', 'cancelled')
ON CONFLICT (id) DO NOTHING;

-- Phase 3: Seed prescription items (18 items total)
INSERT INTO prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, quantity, instructions, is_dispensed)
VALUES
  -- Prescription 1 (Dermatitis - 3 items)
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000001', 'Hydrocortisone Cream 1%', '1 application', 'Twice daily', '7 days', 1, 'Apply thin layer on affected area', true),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000001', 'Cetirizine 10mg', '1 tablet', 'Once daily', '7 days', 7, 'Take at bedtime', true),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000001', 'Calamine Lotion', '1 application', 'As needed', '14 days', 1, 'Apply for itching relief', true),
  
  -- Prescription 2 (Pharyngitis - 3 items)
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000002', 'Amoxicillin 500mg', '1 capsule', 'Three times daily', '7 days', 21, 'Take after meals', true),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000002', 'Paracetamol 500mg', '1-2 tablets', 'Every 6 hours', '5 days', 20, 'Take for fever/pain', true),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000002', 'Strepsils Lozenges', '1 lozenge', 'Every 3 hours', '5 days', 24, 'Dissolve slowly in mouth', true),
  
  -- Prescription 3 (Hypertension - 4 items)
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000003', 'Amlodipine 5mg', '1 tablet', 'Once daily', '30 days', 30, 'Take in the morning', false),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000003', 'Losartan 50mg', '1 tablet', 'Once daily', '30 days', 30, 'Take with or without food', false),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000003', 'Aspirin 75mg', '1 tablet', 'Once daily', '30 days', 30, 'Take after breakfast', false),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000003', 'Atorvastatin 10mg', '1 tablet', 'Once daily', '30 days', 30, 'Take at bedtime', false),
  
  -- Prescription 4 (Osteoarthritis - 2 items)
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000004', 'Diclofenac Sodium 50mg', '1 tablet', 'Twice daily', '7 days', 14, 'Take after meals', false),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000004', 'Glucosamine Sulfate 500mg', '1 capsule', 'Three times daily', '30 days', 90, 'Take with meals', false),
  
  -- Prescription 5 (Allergic Rhinitis - 3 items)
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000005', 'Fluticasone Nasal Spray', '2 sprays', 'Once daily', '30 days', 1, 'Spray in each nostril', true),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000005', 'Levocetirizine 5mg', '1 tablet', 'Once daily', '14 days', 14, 'Take at bedtime', true),
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000005', 'Montelukast 10mg', '1 tablet', 'Once daily', '30 days', 30, 'Take in the evening', true),
  
  -- Prescription 6 (Cancelled - 1 item)
  (gen_random_uuid(), 'a1111111-0001-0001-0001-000000000006', 'Multivitamin', '1 tablet', 'Once daily', '30 days', 30, 'Take after breakfast', false);

-- Phase 4: Seed lab order items (15 items for 5 orders)
INSERT INTO lab_order_items (id, lab_order_id, service_type_id, test_name, test_category, instructions, status)
VALUES
  -- Lab Order 1 (ordered)
  (gen_random_uuid(), '09db26b8-995e-4872-8842-2448dc299671', '0a333333-3333-3333-3333-333333333333', 'Complete Blood Count (CBC)', 'Hematology', 'Fasting not required', 'pending'),
  (gen_random_uuid(), '09db26b8-995e-4872-8842-2448dc299671', NULL, 'ESR', 'Hematology', NULL, 'pending'),
  (gen_random_uuid(), '09db26b8-995e-4872-8842-2448dc299671', NULL, 'Blood Sugar Fasting', 'Biochemistry', '8-12 hours fasting required', 'pending'),
  
  -- Lab Order 2 (collected)
  (gen_random_uuid(), '1bcad73e-c61b-426b-a049-0780300a13e2', '0a333333-3333-3333-3333-333333333333', 'Complete Blood Count (CBC)', 'Hematology', NULL, 'collected'),
  (gen_random_uuid(), '1bcad73e-c61b-426b-a049-0780300a13e2', NULL, 'Liver Function Tests (LFT)', 'Biochemistry', 'Fasting preferred', 'collected'),
  (gen_random_uuid(), '1bcad73e-c61b-426b-a049-0780300a13e2', NULL, 'Urine Complete Examination', 'Urinalysis', 'Midstream clean catch sample', 'collected'),
  
  -- Lab Order 3 (processing)
  (gen_random_uuid(), 'bf4d416f-619f-4c94-ad0e-3e71b43411e6', NULL, 'Lipid Profile', 'Biochemistry', '12 hours fasting required', 'processing'),
  (gen_random_uuid(), 'bf4d416f-619f-4c94-ad0e-3e71b43411e6', NULL, 'HbA1c', 'Biochemistry', 'No fasting required', 'processing'),
  (gen_random_uuid(), 'bf4d416f-619f-4c94-ad0e-3e71b43411e6', NULL, 'Renal Function Tests (RFT)', 'Biochemistry', NULL, 'processing'),
  
  -- Lab Order 4 (completed)
  (gen_random_uuid(), 'ca60f7dd-6530-4d96-a3f5-bbf13c78599c', '0a333333-3333-3333-3333-333333333333', 'Complete Blood Count (CBC)', 'Hematology', NULL, 'completed'),
  (gen_random_uuid(), 'ca60f7dd-6530-4d96-a3f5-bbf13c78599c', NULL, 'Thyroid Profile (T3, T4, TSH)', 'Endocrinology', 'Morning sample preferred', 'completed'),
  (gen_random_uuid(), 'ca60f7dd-6530-4d96-a3f5-bbf13c78599c', NULL, 'Serum Electrolytes', 'Biochemistry', NULL, 'completed'),
  
  -- Lab Order 5 (ordered)
  (gen_random_uuid(), '1741cd95-f3c1-472a-9fcb-fc2558052a7d', NULL, 'Appendix Ultrasound', 'Radiology', 'Full bladder required', 'pending'),
  (gen_random_uuid(), '1741cd95-f3c1-472a-9fcb-fc2558052a7d', '0a333333-3333-3333-3333-333333333333', 'Complete Blood Count (CBC)', 'Hematology', 'Stat order', 'pending'),
  (gen_random_uuid(), '1741cd95-f3c1-472a-9fcb-fc2558052a7d', NULL, 'CRP (C-Reactive Protein)', 'Biochemistry', NULL, 'pending');

-- Phase 5: Seed invoice items (18 items for 6 invoices)
INSERT INTO invoice_items (id, invoice_id, service_type_id, description, quantity, unit_price, discount_percent, total_price)
VALUES
  -- Invoice 1 (INV-260116-0001, total: 550)
  (gen_random_uuid(), 'cf345b27-3c1a-4998-bef2-c0c48fc3331a', '0a111111-1111-1111-1111-111111111111', 'General Consultation', 1, 500.00, 0, 500.00),
  (gen_random_uuid(), 'cf345b27-3c1a-4998-bef2-c0c48fc3331a', NULL, 'Registration Fee', 1, 50.00, 0, 50.00),
  
  -- Invoice 2 (INV-260116-0002, total: 1550)
  (gen_random_uuid(), '8207732f-32f1-417c-966f-9fc0830c7fb8', '0a111111-1111-1111-1111-111111111111', 'General Consultation', 1, 500.00, 0, 500.00),
  (gen_random_uuid(), '8207732f-32f1-417c-966f-9fc0830c7fb8', '0a333333-3333-3333-3333-333333333333', 'Blood Test - CBC', 1, 800.00, 0, 800.00),
  (gen_random_uuid(), '8207732f-32f1-417c-966f-9fc0830c7fb8', NULL, 'Medication - Amoxicillin 500mg x 21', 1, 250.00, 0, 250.00),
  
  -- Invoice 3 (INV-260116-0003, total: 880)
  (gen_random_uuid(), 'b4d28310-2aec-4951-b0bc-460007807f95', '0a222222-2222-2222-2222-222222222222', 'Follow-up Visit', 1, 300.00, 0, 300.00),
  (gen_random_uuid(), 'b4d28310-2aec-4951-b0bc-460007807f95', NULL, 'Blood Pressure Monitoring', 1, 200.00, 0, 200.00),
  (gen_random_uuid(), 'b4d28310-2aec-4951-b0bc-460007807f95', NULL, 'Medication - Antihypertensives', 1, 380.00, 0, 380.00),
  
  -- Invoice 4 (INV-260116-0004, total: 2550)
  (gen_random_uuid(), '12881184-49e3-43ee-aa8b-25502d2f61c0', '0a111111-1111-1111-1111-111111111111', 'General Consultation', 1, 500.00, 0, 500.00),
  (gen_random_uuid(), '12881184-49e3-43ee-aa8b-25502d2f61c0', NULL, 'X-Ray Knee (Both)', 1, 1500.00, 0, 1500.00),
  (gen_random_uuid(), '12881184-49e3-43ee-aa8b-25502d2f61c0', NULL, 'Medication - Pain Management', 1, 550.00, 0, 550.00),
  
  -- Invoice 5 (INV-260116-0005, total: 16500)
  (gen_random_uuid(), '6377e8dd-99e5-4e56-a87b-7ed7a63e8ec9', NULL, 'Emergency Room Charges', 1, 5000.00, 0, 5000.00),
  (gen_random_uuid(), '6377e8dd-99e5-4e56-a87b-7ed7a63e8ec9', NULL, 'CT Scan Abdomen', 1, 8000.00, 0, 8000.00),
  (gen_random_uuid(), '6377e8dd-99e5-4e56-a87b-7ed7a63e8ec9', '0a333333-3333-3333-3333-333333333333', 'Blood Tests (Panel)', 1, 2500.00, 0, 2500.00),
  (gen_random_uuid(), '6377e8dd-99e5-4e56-a87b-7ed7a63e8ec9', NULL, 'IV Fluids & Medications', 1, 1000.00, 0, 1000.00),
  
  -- Invoice 6 (INV-260116-0006, total: 8800)
  (gen_random_uuid(), 'e7f61101-2311-4033-80af-b4ce02ef30fc', NULL, 'Emergency Triage & Assessment', 1, 2000.00, 0, 2000.00),
  (gen_random_uuid(), 'e7f61101-2311-4033-80af-b4ce02ef30fc', NULL, 'Wound Care & Dressing', 1, 1500.00, 0, 1500.00),
  (gen_random_uuid(), 'e7f61101-2311-4033-80af-b4ce02ef30fc', NULL, 'Observation (4 hours)', 1, 5300.00, 0, 5300.00);

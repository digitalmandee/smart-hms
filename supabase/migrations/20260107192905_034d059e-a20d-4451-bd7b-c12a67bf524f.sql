-- SEED DATA FOR SMART HMS DEMO (Fixed UUIDs)

-- 1. Create Demo Organization
INSERT INTO public.organizations (id, name, slug, email, phone, address, city, country, subscription_plan, subscription_status, trial_ends_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'City General Hospital',
  'city-general-hospital',
  'admin@citygeneralhospital.com',
  '+1-555-100-0001',
  '123 Healthcare Boulevard',
  'San Francisco',
  'USA',
  'professional',
  'active',
  now() + interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Demo Branches
INSERT INTO public.branches (id, organization_id, name, code, address, city, phone, email, is_main_branch, is_active)
VALUES 
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Main Branch - City Center', 'MAIN', '123 Healthcare Boulevard', 'San Francisco', '+1-555-100-0002', 'main@citygeneralhospital.com', true, true),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Downtown Clinic', 'DTC', '456 Market Street', 'San Francisco', '+1-555-100-0003', 'downtown@citygeneralhospital.com', false, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Medicine Categories
INSERT INTO public.medicine_categories (id, organization_id, name, description, is_active)
VALUES 
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Analgesics', 'Pain relievers', true),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Antibiotics', 'Bacterial infections', true),
  ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cardiovascular', 'Heart medicines', true),
  ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vitamins', 'Supplements', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create Medicines
INSERT INTO public.medicines (id, organization_id, name, generic_name, category_id, manufacturer, strength, unit, is_active)
VALUES 
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Paracetamol 500mg', 'Acetaminophen', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PharmaCorp', '500mg', 'tablet', true),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ibuprofen 400mg', 'Ibuprofen', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MediLabs', '400mg', 'tablet', true),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Amoxicillin 500mg', 'Amoxicillin', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'GenericPharma', '500mg', 'capsule', true),
  ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Amlodipine 5mg', 'Amlodipine', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CardioMed', '5mg', 'tablet', true),
  ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vitamin C 1000mg', 'Ascorbic Acid', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VitaPlus', '1000mg', 'tablet', true),
  ('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Metformin 500mg', 'Metformin', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'DiabeCare', '500mg', 'tablet', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create Medicine Inventory
INSERT INTO public.medicine_inventory (id, medicine_id, branch_id, batch_number, quantity, reorder_level, unit_price, selling_price, expiry_date)
VALUES 
  ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BATCH-001', 500, 50, 0.10, 0.25, now() + interval '2 years'),
  ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BATCH-002', 15, 30, 0.15, 0.35, now() + interval '1 year'),
  ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BATCH-003', 100, 20, 0.50, 1.00, now() + interval '30 days'),
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BATCH-004', 200, 25, 0.25, 0.60, now() + interval '1 year')
ON CONFLICT (id) DO NOTHING;

-- 6. Create Service Types
INSERT INTO public.service_types (id, organization_id, name, category, default_price, is_active)
VALUES 
  ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'General Consultation', 'consultation', 50.00, true),
  ('f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Specialist Consultation', 'consultation', 100.00, true),
  ('f3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Complete Blood Count', 'lab', 25.00, true)
ON CONFLICT (id) DO NOTHING;

-- 7. Create Payment Methods
INSERT INTO public.payment_methods (id, organization_id, name, code, is_active, sort_order)
VALUES 
  ('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cash', 'cash', true, 1),
  ('12eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Credit Card', 'credit_card', true, 2)
ON CONFLICT (id) DO NOTHING;

-- 8. Create Sample Patients
INSERT INTO public.patients (id, organization_id, branch_id, patient_number, first_name, last_name, gender, date_of_birth, phone, email, blood_group, is_active)
VALUES 
  ('21eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CGH-2024-0001', 'John', 'Smith', 'male', '1985-03-15', '+1-555-201-0001', 'john.smith@email.com', 'O+', true),
  ('22eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CGH-2024-0002', 'Sarah', 'Johnson', 'female', '1990-07-22', '+1-555-201-0002', 'sarah.j@email.com', 'A+', true),
  ('23eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CGH-2024-0003', 'Michael', 'Williams', 'male', '1978-11-08', '+1-555-201-0003', 'mwilliams@email.com', 'B+', true),
  ('24eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CGH-2024-0004', 'Emily', 'Brown', 'female', '1995-02-28', '+1-555-201-0004', 'emily.brown@email.com', 'AB+', true),
  ('25eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CGH-2024-0005', 'David', 'Davis', 'male', '1982-06-14', '+1-555-201-0005', 'ddavis@email.com', 'O-', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Add Medical History
INSERT INTO public.patient_medical_history (id, patient_id, condition_type, description, diagnosed_date, notes)
VALUES 
  ('31eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '21eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'allergy', 'Penicillin Allergy', '2015-05-10', 'Causes severe rash'),
  ('32eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '21eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'chronic_disease', 'Type 2 Diabetes', '2018-03-20', 'On Metformin'),
  ('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '23eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'chronic_disease', 'Hypertension', '2016-07-15', 'On Amlodipine')
ON CONFLICT (id) DO NOTHING;
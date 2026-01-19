-- Fix Nadia Perveen's profile - link to Shifa Medical Center
UPDATE profiles 
SET organization_id = 'b1111111-1111-1111-1111-111111111111',
    branch_id = 'c1111111-1111-1111-1111-111111111111'
WHERE id = '00000000-0000-0000-0000-000000000027';

-- Create Admission 1: Muhammad Ali - Acute Gastroenteritis
INSERT INTO admissions (
  id, organization_id, branch_id, patient_id, ward_id, bed_id,
  attending_doctor_id, admission_date, admission_time, admission_type,
  status, diagnosis_on_admission, chief_complaint
) VALUES (
  '11110001-0001-0001-0001-000000000001',
  'b1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'e1a11111-1111-1111-1111-111111111111',
  'f672e1a6-2b8d-4453-b166-f102edd8d45b',
  '96d5a54f-6942-49b2-8f97-617cea8a0b76',
  'd1111111-1111-1111-1111-111111111111',
  CURRENT_DATE - INTERVAL '2 days',
  '09:30:00',
  'direct',
  'admitted',
  'Acute Gastroenteritis with moderate dehydration',
  'Loose motions x 10 episodes, vomiting, weakness for 2 days'
) ON CONFLICT (id) DO NOTHING;

-- Create Admission 2: Fatima Bibi - Pneumonia
INSERT INTO admissions (
  id, organization_id, branch_id, patient_id, ward_id, bed_id,
  attending_doctor_id, admission_date, admission_time, admission_type,
  status, diagnosis_on_admission, chief_complaint
) VALUES (
  '11110001-0001-0001-0001-000000000002',
  'b1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'e2a22222-2222-2222-2222-222222222222',
  'f672e1a6-2b8d-4453-b166-f102edd8d45b',
  '10a75d81-9d5b-49c8-8f45-32731d61ab85',
  'd1111111-1111-1111-1111-111111111111',
  CURRENT_DATE - INTERVAL '1 day',
  '14:15:00',
  'emergency',
  'admitted',
  'Community Acquired Pneumonia - Right Lower Lobe',
  'High grade fever, productive cough, difficulty breathing for 3 days'
) ON CONFLICT (id) DO NOTHING;

-- Update beds to occupied status
UPDATE beds SET status = 'occupied', current_admission_id = '11110001-0001-0001-0001-000000000001'
WHERE id = '96d5a54f-6942-49b2-8f97-617cea8a0b76';

UPDATE beds SET status = 'occupied', current_admission_id = '11110001-0001-0001-0001-000000000002'
WHERE id = '10a75d81-9d5b-49c8-8f45-32731d61ab85';

-- Seed IPD Vitals for Muhammad Ali (4 entries showing improvement)
INSERT INTO ipd_vitals (admission_id, recorded_by, recorded_at, temperature, blood_pressure_systolic, blood_pressure_diastolic, pulse, oxygen_saturation, notes)
VALUES
('11110001-0001-0001-0001-000000000001', '00000000-0000-0000-0000-000000000027', NOW() - INTERVAL '36 hours', 38.2, 100, 70, 102, 97, 'Febrile, signs of mild dehydration'),
('11110001-0001-0001-0001-000000000001', '00000000-0000-0000-0000-000000000027', NOW() - INTERVAL '24 hours', 37.8, 110, 72, 96, 98, 'On IV fluids, improving'),
('11110001-0001-0001-0001-000000000001', '00000000-0000-0000-0000-000000000027', NOW() - INTERVAL '12 hours', 37.2, 118, 76, 84, 99, 'Tolerating orals, stools improving'),
('11110001-0001-0001-0001-000000000001', '00000000-0000-0000-0000-000000000027', NOW() - INTERVAL '2 hours', 36.8, 120, 80, 78, 99, 'Stable, ready for discharge consideration');

-- Seed IPD Vitals for Fatima Bibi (3 entries showing recovery)
INSERT INTO ipd_vitals (admission_id, recorded_by, recorded_at, temperature, blood_pressure_systolic, blood_pressure_diastolic, pulse, respiratory_rate, oxygen_saturation, notes)
VALUES
('11110001-0001-0001-0001-000000000002', '00000000-0000-0000-0000-000000000027', NOW() - INTERVAL '20 hours', 39.1, 90, 60, 110, 26, 91, 'Tachypneic, started on O2 2L/min'),
('11110001-0001-0001-0001-000000000002', '00000000-0000-0000-0000-000000000027', NOW() - INTERVAL '12 hours', 38.4, 100, 68, 98, 22, 94, 'On IV Ceftriaxone + Azithromycin'),
('11110001-0001-0001-0001-000000000002', '00000000-0000-0000-0000-000000000027', NOW() - INTERVAL '4 hours', 37.6, 108, 72, 88, 20, 96, 'Improved, O2 weaned to room air');

-- Seed Daily Rounds for Muhammad Ali
INSERT INTO daily_rounds (admission_id, doctor_id, round_date, round_time, condition_status, findings, diagnosis_update, instructions, diet_orders, activity_orders)
VALUES
('11110001-0001-0001-0001-000000000001', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', '10:00:00', 'Stable', 'Patient had 6 loose stools overnight. No blood or mucus. Tolerating ORS. Vitals stable.', 'Acute gastroenteritis - improving', 'Continue IV fluids, start ORS. Labs: CBC, RFT', 'Clear liquids progressing to soft diet', 'Bed rest'),
('11110001-0001-0001-0001-000000000001', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '09:30:00', 'Improving', 'Only 2 loose stools. Appetite improving. Well hydrated.', 'Resolving gastroenteritis', 'Stop IV fluids. Oral medications. Plan discharge tomorrow.', 'Regular diet as tolerated', 'Ambulate as tolerated');

-- Seed Daily Rounds for Fatima Bibi
INSERT INTO daily_rounds (admission_id, doctor_id, round_date, round_time, condition_status, findings, diagnosis_update, instructions, diet_orders, activity_orders)
VALUES
('11110001-0001-0001-0001-000000000002', 'd1111111-1111-1111-1111-111111111111', CURRENT_DATE, '10:15:00', 'Stable', 'Fever reduced. Cough productive. SpO2 96% on room air. Chest: decreased breath sounds RLL with crackles.', 'CAP Right Lower Lobe - responding to antibiotics', 'Continue IV antibiotics. Chest physiotherapy. Repeat CXR if no improvement in 48hrs.', 'High protein diet, adequate fluids', 'Bedside mobilization');
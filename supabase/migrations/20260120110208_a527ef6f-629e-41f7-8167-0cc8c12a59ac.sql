-- Seed ER registrations for today (some without triage for triage station testing)
INSERT INTO emergency_registrations (
  organization_id, branch_id, patient_id, arrival_mode, arrival_time, 
  chief_complaint, status, is_trauma, triage_level, assigned_zone
) VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
   'e1a11111-1111-1111-1111-111111111111', 'walk_in', NOW() - INTERVAL '30 minutes', 
   'High fever and chills for 2 days', 'waiting', false, NULL, NULL),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
   'e2a22222-2222-2222-2222-222222222222', 'ambulance', NOW() - INTERVAL '15 minutes', 
   'Severe chest pain, radiating to left arm', 'waiting', false, NULL, NULL),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
   'e4a44444-4444-4444-4444-444444444444', 'ambulance', NOW() - INTERVAL '60 minutes', 
   'Cardiac arrest - revived by EMS', 'in_treatment', false, '1', 'Resuscitation Bay'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 
   'e5a55555-5555-5555-5555-555555555555', 'walk_in', NOW() - INTERVAL '90 minutes', 
   'Severe abdominal pain with vomiting', 'in_treatment', false, '2', 'Trauma Bay')
ON CONFLICT DO NOTHING;

-- Update existing ER registrations without zones
UPDATE emergency_registrations 
SET assigned_zone = CASE 
  WHEN triage_level = '1' THEN 'Resuscitation Bay'
  WHEN triage_level = '2' THEN 'Trauma Bay'
  WHEN triage_level = '3' THEN 'Yellow Zone'
  WHEN triage_level IN ('4', '5') THEN 'Green Zone'
  ELSE NULL
END
WHERE assigned_zone IS NULL AND triage_level IS NOT NULL;

-- Seed appointments for today (without appointment_type to use default)
INSERT INTO appointments (
  organization_id, branch_id, patient_id, doctor_id, 
  appointment_date, appointment_time, status, token_number, chief_complaint, check_in_vitals
) VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111',
   'e1a11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111',
   CURRENT_DATE, '09:00:00', 'checked_in', 1, 'Routine checkup', NULL),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111',
   'e2a22222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111',
   CURRENT_DATE, '09:30:00', 'checked_in', 2, 'Cough and cold', NULL),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111',
   'e3a33333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111',
   CURRENT_DATE, '10:00:00', 'checked_in', 3, 'Headache and dizziness', 
   '{"pulse": 78, "blood_pressure": "130/85", "temperature": 37.2, "weight": 72}'),
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111',
   'e4a44444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222',
   CURRENT_DATE, '10:30:00', 'checked_in', 4, 'Follow-up for diabetes', 
   '{"pulse": 72, "blood_pressure": "140/90", "temperature": 36.8, "weight": 85}')
ON CONFLICT DO NOTHING;
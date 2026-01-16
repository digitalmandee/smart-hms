
-- Seed Appointments for Shifa Medical Center
DO $$
DECLARE
    v_org_id UUID := 'b1111111-1111-1111-1111-111111111111';
    v_branch_id UUID := 'c1111111-1111-1111-1111-111111111111';
    v_doctor_id UUID := 'd1111111-1111-1111-1111-111111111111';
    v_today DATE := CURRENT_DATE;
    v_now TIMESTAMP := NOW();
    
    -- Patient IDs
    p1 UUID := 'e1a11111-1111-1111-1111-111111111111';
    p2 UUID := 'e2a22222-2222-2222-2222-222222222222';
    p3 UUID := 'e3a33333-3333-3333-3333-333333333333';
    p4 UUID := 'e4a44444-4444-4444-4444-444444444444';
    p5 UUID := 'e5a55555-5555-5555-5555-555555555555';
    p6 UUID := '33bbccff-0a9b-44fb-bd05-e25f5d0ae20c';
    p7 UUID := 'fe90473d-7afb-42ec-9a54-94b99f29c59d';
    p8 UUID := '21e75fd0-8753-4067-b6b4-e920720bd9c2';
    p9 UUID := '9de46a65-b3a5-4d68-b7e7-1e2781a27f20';
    p10 UUID := 'e7e350d0-58fb-41ea-a98f-ecddbd0fac63';
    p11 UUID := 'ec1cf706-71ae-41ff-a690-02826a2a6c1c';
    p12 UUID := 'bfe33172-4116-4fec-b35d-7a095afb1361';
    p13 UUID := 'e6ddd7c8-b6cf-4029-8b58-ee745da30be2';
    p14 UUID := 'bbed1ff7-b3b4-49b1-84db-698d103e7870';
    p15 UUID := '06a37be6-620e-41af-82a6-352b537be3ee';
BEGIN
    -- =============================================
    -- SEED APPOINTMENTS (15 for today)
    -- =============================================
    
    -- 3 Scheduled (token 1-3)
    INSERT INTO appointments (organization_id, branch_id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, priority, token_number, chief_complaint)
    VALUES 
        (v_org_id, v_branch_id, p1, v_doctor_id, v_today, '09:00', 'scheduled'::appointment_type, 'scheduled'::appointment_status, 0, 1, 'Routine checkup'),
        (v_org_id, v_branch_id, p2, v_doctor_id, v_today, '09:15', 'walk_in'::appointment_type, 'scheduled'::appointment_status, 0, 2, 'Fever for 3 days'),
        (v_org_id, v_branch_id, p3, v_doctor_id, v_today, '09:30', 'follow_up'::appointment_type, 'scheduled'::appointment_status, 0, 3, 'Post-surgery follow-up');
    
    -- 4 Checked-in (token 4-7) with vitals
    INSERT INTO appointments (organization_id, branch_id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, priority, token_number, chief_complaint, check_in_at, check_in_vitals)
    VALUES 
        (v_org_id, v_branch_id, p4, v_doctor_id, v_today, '09:45', 'walk_in'::appointment_type, 'checked_in'::appointment_status, 0, 4, 'Cough and cold', v_now - interval '30 minutes', '{"blood_pressure": {"systolic": 120, "diastolic": 80}, "pulse": 72, "temperature": 98.6, "spo2": 98}'::jsonb),
        (v_org_id, v_branch_id, p5, v_doctor_id, v_today, '10:00', 'scheduled'::appointment_type, 'checked_in'::appointment_status, 1, 5, 'Severe headache', v_now - interval '25 minutes', '{"blood_pressure": {"systolic": 140, "diastolic": 90}, "pulse": 88, "temperature": 99.2, "spo2": 97}'::jsonb),
        (v_org_id, v_branch_id, p6, v_doctor_id, v_today, '10:15', 'walk_in'::appointment_type, 'checked_in'::appointment_status, 2, 6, 'Chest pain - urgent', v_now - interval '20 minutes', '{"blood_pressure": {"systolic": 160, "diastolic": 100}, "pulse": 110, "temperature": 98.4, "spo2": 94}'::jsonb),
        (v_org_id, v_branch_id, p7, v_doctor_id, v_today, '10:30', 'follow_up'::appointment_type, 'checked_in'::appointment_status, 0, 7, 'Diabetes follow-up', v_now - interval '15 minutes', '{"blood_pressure": {"systolic": 130, "diastolic": 85}, "pulse": 76, "temperature": 98.2, "blood_sugar": {"value": 180, "type": "fasting"}}'::jsonb);
    
    -- 2 In Progress (token 8-9)
    INSERT INTO appointments (organization_id, branch_id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, priority, token_number, chief_complaint, check_in_at, check_in_vitals)
    VALUES 
        (v_org_id, v_branch_id, p8, v_doctor_id, v_today, '10:45', 'scheduled'::appointment_type, 'in_progress'::appointment_status, 0, 8, 'Back pain', v_now - interval '45 minutes', '{"blood_pressure": {"systolic": 125, "diastolic": 82}, "pulse": 74, "temperature": 98.4, "spo2": 99}'::jsonb),
        (v_org_id, v_branch_id, p9, v_doctor_id, v_today, '11:00', 'walk_in'::appointment_type, 'in_progress'::appointment_status, 1, 9, 'Abdominal pain', v_now - interval '40 minutes', '{"blood_pressure": {"systolic": 118, "diastolic": 78}, "pulse": 82, "temperature": 99.8, "spo2": 98}'::jsonb);
    
    -- 6 Completed (token 10-15)
    INSERT INTO appointments (organization_id, branch_id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, priority, token_number, chief_complaint, check_in_at, check_in_vitals)
    VALUES 
        (v_org_id, v_branch_id, p10, v_doctor_id, v_today, '08:00', 'scheduled'::appointment_type, 'completed'::appointment_status, 0, 10, 'Skin rash', v_now - interval '3 hours', '{"blood_pressure": {"systolic": 115, "diastolic": 75}, "pulse": 68, "temperature": 98.2, "spo2": 99}'::jsonb),
        (v_org_id, v_branch_id, p11, v_doctor_id, v_today, '08:15', 'walk_in'::appointment_type, 'completed'::appointment_status, 0, 11, 'Sore throat', v_now - interval '2.5 hours', '{"blood_pressure": {"systolic": 120, "diastolic": 80}, "pulse": 70, "temperature": 100.2, "spo2": 98}'::jsonb),
        (v_org_id, v_branch_id, p12, v_doctor_id, v_today, '08:30', 'follow_up'::appointment_type, 'completed'::appointment_status, 0, 12, 'Hypertension control', v_now - interval '2 hours', '{"blood_pressure": {"systolic": 145, "diastolic": 92}, "pulse": 78, "temperature": 98.4, "spo2": 97}'::jsonb),
        (v_org_id, v_branch_id, p13, v_doctor_id, v_today, '08:45', 'scheduled'::appointment_type, 'completed'::appointment_status, 0, 13, 'Joint pain', v_now - interval '1.5 hours', '{"blood_pressure": {"systolic": 128, "diastolic": 84}, "pulse": 72, "temperature": 98.6, "spo2": 98}'::jsonb),
        (v_org_id, v_branch_id, p14, v_doctor_id, v_today, '09:00', 'walk_in'::appointment_type, 'completed'::appointment_status, 0, 14, 'Allergies', v_now - interval '1 hour', '{"blood_pressure": {"systolic": 112, "diastolic": 72}, "pulse": 66, "temperature": 98.0, "spo2": 99}'::jsonb),
        (v_org_id, v_branch_id, p15, v_doctor_id, v_today, '09:15', 'follow_up'::appointment_type, 'completed'::appointment_status, 0, 15, 'Post-viral fatigue', v_now - interval '50 minutes', '{"blood_pressure": {"systolic": 118, "diastolic": 76}, "pulse": 70, "temperature": 98.4, "spo2": 98}'::jsonb);

    RAISE NOTICE 'Successfully seeded 15 appointments';
END $$;


-- Seed Consultations for completed/in-progress appointments
DO $$
DECLARE
    v_branch_id UUID := 'c1111111-1111-1111-1111-111111111111';
    v_doctor_id UUID := 'd1111111-1111-1111-1111-111111111111';
BEGIN
    -- Consultations for completed appointments (tokens 10-15)
    INSERT INTO consultations (appointment_id, patient_id, doctor_id, branch_id, chief_complaint, symptoms, diagnosis, clinical_notes, vitals)
    VALUES 
        ('0986979f-b8fa-47e4-8e11-c58dc8019829', 'e7e350d0-58fb-41ea-a98f-ecddbd0fac63', v_doctor_id, v_branch_id, 
         'Skin rash', 'Itchy rash on arms for 5 days', 'Contact Dermatitis', 
         'Erythematous papular rash on bilateral forearms. Prescribed topical corticosteroids.',
         '{"blood_pressure": {"systolic": 115, "diastolic": 75}, "pulse": 68}'::jsonb),
        
        ('04e18fb4-e5ad-4605-a81e-a146fb7a18ae', 'ec1cf706-71ae-41ff-a690-02826a2a6c1c', v_doctor_id, v_branch_id,
         'Sore throat', 'Sore throat and difficulty swallowing for 2 days', 'Acute Pharyngitis',
         'Pharyngeal erythema, tonsillar enlargement. Antibiotics prescribed.',
         '{"blood_pressure": {"systolic": 120, "diastolic": 80}, "pulse": 70, "temperature": 100.2}'::jsonb),
        
        ('c818e528-2131-474e-b2e2-c8c4b4f03e84', 'bfe33172-4116-4fec-b35d-7a095afb1361', v_doctor_id, v_branch_id,
         'Hypertension control', 'Monthly follow-up for BP management', 'Essential Hypertension',
         'BP elevated at 145/92. Continue current medications, advised lifestyle changes.',
         '{"blood_pressure": {"systolic": 145, "diastolic": 92}, "pulse": 78}'::jsonb),
        
        ('ef71bfe6-30e5-4970-8f58-24742ac0ccce', 'e6ddd7c8-b6cf-4029-8b58-ee745da30be2', v_doctor_id, v_branch_id,
         'Joint pain', 'Bilateral knee pain for 2 weeks, worse with climbing stairs', 'Osteoarthritis of knee',
         'Crepitus in both knees, mild effusion. NSAIDs and physiotherapy advised.',
         '{"blood_pressure": {"systolic": 128, "diastolic": 84}, "pulse": 72}'::jsonb),
        
        ('fac6f1a5-b855-42f2-81fc-f913b35afe4d', 'bbed1ff7-b3b4-49b1-84db-698d103e7870', v_doctor_id, v_branch_id,
         'Allergies', 'Seasonal allergies with sneezing and watery eyes', 'Allergic Rhinitis',
         'Clear nasal discharge, conjunctival injection. Antihistamines prescribed.',
         '{"blood_pressure": {"systolic": 112, "diastolic": 72}, "pulse": 66}'::jsonb),
        
        ('f6e449e9-84e7-4026-97c8-a006da203598', '06a37be6-620e-41af-82a6-352b537be3ee', v_doctor_id, v_branch_id,
         'Post-viral fatigue', 'Persistent fatigue after viral illness 3 weeks ago', 'Post-viral Syndrome',
         'Mild pallor, otherwise normal. Labs ordered to rule out anemia.',
         '{"blood_pressure": {"systolic": 118, "diastolic": 76}, "pulse": 70}'::jsonb),
        
        -- In-progress consultations (tokens 8-9)
        ('d0872e24-e690-41f0-9db6-dc7fe3d20b34', '21e75fd0-8753-4067-b6b4-e920720bd9c2', v_doctor_id, v_branch_id,
         'Back pain', 'Lower back pain radiating to left leg for 1 week', 'Lumbar Radiculopathy',
         'Tenderness L4-L5, positive SLR left side. Muscle relaxants, NSAIDs prescribed.',
         '{"blood_pressure": {"systolic": 125, "diastolic": 82}, "pulse": 74}'::jsonb),
        
        ('aa60d65b-0ba2-4584-9213-7353cf5b7d40', '9de46a65-b3a5-4d68-b7e7-1e2781a27f20', v_doctor_id, v_branch_id,
         'Abdominal pain', 'Right lower quadrant pain for 2 days, worse today', 'Suspected Acute Appendicitis',
         'RLQ tenderness, guarding present. Urgent surgical consultation advised. NPO.',
         '{"blood_pressure": {"systolic": 118, "diastolic": 78}, "pulse": 82, "temperature": 99.8}'::jsonb);

    RAISE NOTICE 'Successfully seeded 8 consultations';
END $$;


-- Seed remaining data with correct enum casting
DO $$
DECLARE
    v_org_id UUID := 'b1111111-1111-1111-1111-111111111111';
    v_branch_id UUID := 'c1111111-1111-1111-1111-111111111111';
    v_doctor_id UUID := 'd1111111-1111-1111-1111-111111111111';
    con_id UUID;
BEGIN
    SELECT id INTO con_id FROM consultations LIMIT 1;
    
    -- Lab Orders (5)
    INSERT INTO lab_orders (consultation_id, patient_id, doctor_id, branch_id, priority, clinical_notes, status)
    VALUES 
        (con_id, 'e7e350d0-58fb-41ea-a98f-ecddbd0fac63', v_doctor_id, v_branch_id, 'routine'::lab_order_priority, 'CBC and ESR', 'ordered'::lab_order_status),
        (con_id, 'ec1cf706-71ae-41ff-a690-02826a2a6c1c', v_doctor_id, v_branch_id, 'urgent'::lab_order_priority, 'Throat culture', 'collected'::lab_order_status),
        (con_id, 'bfe33172-4116-4fec-b35d-7a095afb1361', v_doctor_id, v_branch_id, 'routine'::lab_order_priority, 'Lipid profile', 'processing'::lab_order_status),
        (con_id, '06a37be6-620e-41af-82a6-352b537be3ee', v_doctor_id, v_branch_id, 'routine'::lab_order_priority, 'Hemoglobin', 'completed'::lab_order_status),
        (con_id, '9de46a65-b3a5-4d68-b7e7-1e2781a27f20', v_doctor_id, v_branch_id, 'stat'::lab_order_priority, 'Appendicitis workup', 'ordered'::lab_order_status);

    -- ER Registrations (5) with correct triage_level enum
    INSERT INTO emergency_registrations (organization_id, branch_id, patient_id, arrival_mode, arrival_time, triage_level, chief_complaint, is_trauma, is_mlc, vitals, status, assigned_doctor_id)
    VALUES 
        (v_org_id, v_branch_id, 'e1a11111-1111-1111-1111-111111111111', 'ambulance'::arrival_mode, NOW() - interval '2 hours', '1'::triage_level, 'Chest pain', false, false, '{"bp": "90/60"}'::jsonb, 'in_treatment'::er_status, v_doctor_id),
        (v_org_id, v_branch_id, 'e2a22222-2222-2222-2222-222222222222', 'walk_in'::arrival_mode, NOW() - interval '3 hours', '3'::triage_level, 'Fever', false, false, '{"bp": "120/80"}'::jsonb, 'discharged'::er_status, v_doctor_id),
        (v_org_id, v_branch_id, 'e3a33333-3333-3333-3333-333333333333', 'brought_by_family'::arrival_mode, NOW() - interval '1 hour', '2'::triage_level, 'RTA - leg injury', true, true, '{"bp": "130/85"}'::jsonb, 'in_treatment'::er_status, v_doctor_id),
        (v_org_id, v_branch_id, 'e4a44444-4444-4444-4444-444444444444', 'walk_in'::arrival_mode, NOW() - interval '4 hours', '4'::triage_level, 'Minor cut', true, false, '{"bp": "118/76"}'::jsonb, 'discharged'::er_status, v_doctor_id),
        (v_org_id, v_branch_id, 'e5a55555-5555-5555-5555-555555555555', 'ambulance'::arrival_mode, NOW() - interval '30 minutes', '1'::triage_level, 'Suspected stroke', false, false, '{"bp": "180/110"}'::jsonb, 'waiting'::er_status, v_doctor_id);

    -- Invoices (6)
    INSERT INTO invoices (organization_id, branch_id, patient_id, invoice_date, subtotal, tax_amount, discount_amount, total_amount, paid_amount, status, notes)
    VALUES 
        (v_org_id, v_branch_id, 'e7e350d0-58fb-41ea-a98f-ecddbd0fac63', CURRENT_DATE, 500, 50, 0, 550, 550, 'paid'::invoice_status, 'OPD consultation'),
        (v_org_id, v_branch_id, 'ec1cf706-71ae-41ff-a690-02826a2a6c1c', CURRENT_DATE, 1500, 150, 100, 1550, 1550, 'paid'::invoice_status, 'Consultation + Lab'),
        (v_org_id, v_branch_id, 'bfe33172-4116-4fec-b35d-7a095afb1361', CURRENT_DATE, 800, 80, 0, 880, 500, 'partially_paid'::invoice_status, 'Follow-up'),
        (v_org_id, v_branch_id, 'e6ddd7c8-b6cf-4029-8b58-ee745da30be2', CURRENT_DATE, 2500, 250, 200, 2550, 0, 'pending'::invoice_status, 'Orthopedic'),
        (v_org_id, v_branch_id, 'e1a11111-1111-1111-1111-111111111111', CURRENT_DATE, 15000, 1500, 0, 16500, 5000, 'partially_paid'::invoice_status, 'ER cardiac'),
        (v_org_id, v_branch_id, 'e3a33333-3333-3333-3333-333333333333', CURRENT_DATE, 8000, 800, 0, 8800, 0, 'pending'::invoice_status, 'ER trauma');

    RAISE NOTICE 'Seeded lab orders, ER cases, and invoices';
END $$;

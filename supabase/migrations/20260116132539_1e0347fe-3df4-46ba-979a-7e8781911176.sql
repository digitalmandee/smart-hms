
-- Seed 19 more patients with explicit patient numbers
DO $$
DECLARE
    v_org_id UUID := 'b1111111-1111-1111-1111-111111111111';
    v_branch_id UUID := 'c1111111-1111-1111-1111-111111111111';
    v_date_part TEXT := TO_CHAR(CURRENT_DATE, 'YYMMDD');
    i INT;
BEGIN
    FOR i IN 2..20 LOOP
        INSERT INTO patients (organization_id, branch_id, patient_number, first_name, last_name, date_of_birth, gender, phone, email, national_id, address, city, blood_group, emergency_contact_name, emergency_contact_phone, nationality)
        VALUES (
            v_org_id, v_branch_id, 
            'SHIFA-SMC-' || v_date_part || '-' || LPAD(i::TEXT, 4, '0'),
            CASE i 
                WHEN 2 THEN 'Fatima' WHEN 3 THEN 'Ali Hassan' WHEN 4 THEN 'Ayesha' WHEN 5 THEN 'Imran'
                WHEN 6 THEN 'Zainab' WHEN 7 THEN 'Usman' WHEN 8 THEN 'Sara' WHEN 9 THEN 'Hassan'
                WHEN 10 THEN 'Amina' WHEN 11 THEN 'Bilal' WHEN 12 THEN 'Sana' WHEN 13 THEN 'Kashif'
                WHEN 14 THEN 'Nadia' WHEN 15 THEN 'Tariq' WHEN 16 THEN 'Hira' WHEN 17 THEN 'Farhan Jr'
                WHEN 18 THEN 'Rabia' WHEN 19 THEN 'Asad' WHEN 20 THEN 'Maham'
            END,
            CASE i 
                WHEN 2 THEN 'Bibi' WHEN 3 THEN 'Raza' WHEN 4 THEN 'Malik' WHEN 5 THEN 'Hussain'
                WHEN 6 THEN 'Shah' WHEN 7 THEN 'Ahmed' WHEN 8 THEN 'Iqbal' WHEN 9 THEN 'Ali'
                WHEN 10 THEN 'Tariq' WHEN 11 THEN 'Qureshi' WHEN 12 THEN 'Riaz' WHEN 13 THEN 'Nawaz'
                WHEN 14 THEN 'Akram' WHEN 15 THEN 'Mehmood' WHEN 16 THEN 'Saeed' WHEN 17 THEN 'Saleem'
                WHEN 18 THEN 'Anwar' WHEN 19 THEN 'Javed' WHEN 20 THEN 'Zahid'
            END,
            CASE i 
                WHEN 2 THEN '1990-07-22' WHEN 3 THEN '1978-11-08' WHEN 4 THEN '1995-02-14' WHEN 5 THEN '1982-09-30'
                WHEN 6 THEN '1988-05-18' WHEN 7 THEN '1975-12-25' WHEN 8 THEN '1992-08-07' WHEN 9 THEN '1980-04-12'
                WHEN 10 THEN '1998-01-20' WHEN 11 THEN '1983-06-28' WHEN 12 THEN '1993-10-15' WHEN 13 THEN '1976-03-03'
                WHEN 14 THEN '1989-07-09' WHEN 15 THEN '1970-11-22' WHEN 16 THEN '1996-04-17' WHEN 17 THEN '1984-08-31'
                WHEN 18 THEN '1991-12-05' WHEN 19 THEN '1979-02-28' WHEN 20 THEN '1997-09-14'
            END::DATE,
            (CASE WHEN i % 2 = 0 THEN 'female' ELSE 'male' END)::gender,
            '+92-3' || LPAD((i * 11)::TEXT, 2, '0') || '-' || LPAD((1234567 + i * 111111)::TEXT, 7, '0'),
            'patient' || i || '@email.pk',
            '352' || LPAD((i * 1111111)::TEXT, 10, '0'),
            'House ' || (i * 10) || ', Lahore',
            'Lahore',
            CASE i % 8 WHEN 0 THEN 'A+' WHEN 1 THEN 'B+' WHEN 2 THEN 'O+' WHEN 3 THEN 'AB+' WHEN 4 THEN 'A-' WHEN 5 THEN 'B-' WHEN 6 THEN 'O-' ELSE 'AB-' END,
            'Emergency Contact ' || i,
            '+92-3' || LPAD((i * 12)::TEXT, 2, '0') || '-9999999',
            'Pakistani'
        );
    END LOOP;
    
    RAISE NOTICE 'Successfully seeded 19 additional patients';
END $$;

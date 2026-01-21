-- Seed bed history data for demo purposes

DO $$
DECLARE
  v_org_id UUID;
  v_bed_1 UUID;
  v_bed_2 UUID;
  v_bed_3 UUID;
  v_bed_4 UUID;
  v_bed_5 UUID;
  v_profile_id UUID;
  v_patient_1 UUID;
  v_patient_2 UUID;
  v_admission_1 UUID;
  v_admission_2 UUID;
  v_branch_id UUID;
BEGIN
  -- Get first organization
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  
  -- Get first profile for reporter/resolver
  SELECT id INTO v_profile_id FROM profiles WHERE organization_id = v_org_id LIMIT 1;
  
  -- Get first branch
  SELECT id INTO v_branch_id FROM branches WHERE organization_id = v_org_id LIMIT 1;
  
  -- Get some beds via ward join
  SELECT b.id INTO v_bed_1 FROM beds b JOIN wards w ON b.ward_id = w.id WHERE w.organization_id = v_org_id LIMIT 1 OFFSET 0;
  SELECT b.id INTO v_bed_2 FROM beds b JOIN wards w ON b.ward_id = w.id WHERE w.organization_id = v_org_id LIMIT 1 OFFSET 1;
  SELECT b.id INTO v_bed_3 FROM beds b JOIN wards w ON b.ward_id = w.id WHERE w.organization_id = v_org_id LIMIT 1 OFFSET 2;
  SELECT b.id INTO v_bed_4 FROM beds b JOIN wards w ON b.ward_id = w.id WHERE w.organization_id = v_org_id LIMIT 1 OFFSET 3;
  SELECT b.id INTO v_bed_5 FROM beds b JOIN wards w ON b.ward_id = w.id WHERE w.organization_id = v_org_id LIMIT 1 OFFSET 4;
  
  -- Get some patients
  SELECT id INTO v_patient_1 FROM patients WHERE organization_id = v_org_id LIMIT 1 OFFSET 0;
  SELECT id INTO v_patient_2 FROM patients WHERE organization_id = v_org_id LIMIT 1 OFFSET 1;

  -- Only proceed if we have the necessary data
  IF v_org_id IS NOT NULL AND v_bed_1 IS NOT NULL AND v_profile_id IS NOT NULL THEN
    
    -- Insert bed issue logs (resolved issues)
    INSERT INTO bed_issue_logs (bed_id, organization_id, issue_type, description, severity, reported_by, reported_at, resolved_by, resolved_at, resolution_notes)
    VALUES
      (v_bed_1, v_org_id, 'maintenance', 'IV pump malfunction - intermittent power issues', 'high', v_profile_id, NOW() - INTERVAL '15 days', v_profile_id, NOW() - INTERVAL '14 days', 'Replaced with new IV pump unit #4521'),
      (v_bed_1, v_org_id, 'housekeeping', 'Deep cleaning required after patient discharge', 'medium', v_profile_id, NOW() - INTERVAL '10 days', v_profile_id, NOW() - INTERVAL '10 days', 'Full sanitization completed per protocol'),
      (v_bed_1, v_org_id, 'equipment', 'Bed rail loose on left side', 'low', v_profile_id, NOW() - INTERVAL '5 days', v_profile_id, NOW() - INTERVAL '4 days', 'Tightened bolts and verified stability');
    
    IF v_bed_2 IS NOT NULL THEN
      INSERT INTO bed_issue_logs (bed_id, organization_id, issue_type, description, severity, reported_by, reported_at, resolved_by, resolved_at, resolution_notes)
      VALUES
        (v_bed_2, v_org_id, 'maintenance', 'Call button not responding', 'critical', v_profile_id, NOW() - INTERVAL '12 days', v_profile_id, NOW() - INTERVAL '11 days', 'Replaced call button module'),
        (v_bed_2, v_org_id, 'housekeeping', 'Spill cleanup required', 'low', v_profile_id, NOW() - INTERVAL '8 days', v_profile_id, NOW() - INTERVAL '8 days', 'Cleaned and sanitized floor area');
    END IF;
    
    IF v_bed_3 IS NOT NULL THEN
      INSERT INTO bed_issue_logs (bed_id, organization_id, issue_type, description, severity, reported_by, reported_at, resolved_by, resolved_at, resolution_notes)
      VALUES
        (v_bed_3, v_org_id, 'equipment', 'Mattress worn - needs replacement', 'medium', v_profile_id, NOW() - INTERVAL '20 days', v_profile_id, NOW() - INTERVAL '18 days', 'New pressure-relief mattress installed'),
        (v_bed_3, v_org_id, 'maintenance', 'Overhead light flickering', 'low', v_profile_id, NOW() - INTERVAL '7 days', v_profile_id, NOW() - INTERVAL '6 days', 'Replaced LED bulb');
    END IF;
    
    IF v_bed_4 IS NOT NULL THEN
      INSERT INTO bed_issue_logs (bed_id, organization_id, issue_type, description, severity, reported_by, reported_at, resolved_by, resolved_at, resolution_notes)
      VALUES
        (v_bed_4, v_org_id, 'housekeeping', 'Terminal cleaning after isolation patient', 'high', v_profile_id, NOW() - INTERVAL '6 days', v_profile_id, NOW() - INTERVAL '5 days', 'Full decontamination completed with UV sterilization'),
        (v_bed_4, v_org_id, 'equipment', 'Oxygen flow meter inaccurate', 'high', v_profile_id, NOW() - INTERVAL '3 days', v_profile_id, NOW() - INTERVAL '2 days', 'Calibrated and verified against reference meter');
    END IF;
    
    IF v_bed_5 IS NOT NULL THEN
      -- Add one open issue for realism
      INSERT INTO bed_issue_logs (bed_id, organization_id, issue_type, description, severity, reported_by, reported_at)
      VALUES
        (v_bed_5, v_org_id, 'maintenance', 'Bed height adjustment motor slow to respond', 'low', v_profile_id, NOW() - INTERVAL '1 day');
    END IF;
    
    -- Create historical admissions if we have patients and branch
    IF v_patient_1 IS NOT NULL AND v_branch_id IS NOT NULL THEN
      INSERT INTO admissions (
        organization_id, branch_id, patient_id, bed_id,
        admission_number, admission_date, admission_time,
        status, actual_discharge_date, discharge_time,
        chief_complaint, diagnosis_on_admission, discharge_diagnosis,
        condition_at_discharge, discharge_summary
      ) VALUES (
        v_org_id, v_branch_id, v_patient_1, v_bed_1,
        'ADM-HIST-001', (NOW() - INTERVAL '25 days')::date, '10:30',
        'discharged', (NOW() - INTERVAL '20 days')::date, '14:00',
        'Chest pain and shortness of breath',
        'Acute bronchitis with mild respiratory distress',
        'Bronchitis resolved, stable for discharge',
        'Improved', 'Patient responded well to antibiotic therapy and bronchodilators. Oxygen saturation normalized. Follow-up in 1 week.'
      ) RETURNING id INTO v_admission_1;
      
      IF v_bed_2 IS NOT NULL AND v_admission_1 IS NOT NULL THEN
        INSERT INTO bed_transfers (
          admission_id, from_bed_id, to_bed_id, organization_id,
          transfer_reason, notes, ordered_by, transferred_by, transferred_at
        ) VALUES (
          v_admission_1, v_bed_2, v_bed_1, v_org_id,
          'Step-down from observation',
          'Patient stable, moving to general ward for continued care',
          v_profile_id, v_profile_id, NOW() - INTERVAL '22 days'
        );
      END IF;
    END IF;
    
    IF v_patient_2 IS NOT NULL AND v_branch_id IS NOT NULL AND v_bed_2 IS NOT NULL THEN
      INSERT INTO admissions (
        organization_id, branch_id, patient_id, bed_id,
        admission_number, admission_date, admission_time,
        status, actual_discharge_date, discharge_time,
        chief_complaint, diagnosis_on_admission, discharge_diagnosis,
        condition_at_discharge, discharge_summary
      ) VALUES (
        v_org_id, v_branch_id, v_patient_2, v_bed_2,
        'ADM-HIST-002', (NOW() - INTERVAL '18 days')::date, '14:45',
        'discharged', (NOW() - INTERVAL '12 days')::date, '11:30',
        'Abdominal pain and fever',
        'Acute appendicitis - post appendectomy',
        'Appendectomy successful, wound healing well',
        'Recovered', 'Laparoscopic appendectomy performed successfully. Post-op recovery uneventful. Wound care instructions provided.'
      ) RETURNING id INTO v_admission_2;
      
      IF v_bed_3 IS NOT NULL AND v_admission_2 IS NOT NULL THEN
        INSERT INTO bed_transfers (
          admission_id, from_bed_id, to_bed_id, organization_id,
          transfer_reason, notes, ordered_by, transferred_by, transferred_at
        ) VALUES (
          v_admission_2, v_bed_3, v_bed_2, v_org_id,
          'Post-surgery transfer',
          'Patient transferred from recovery to surgical ward',
          v_profile_id, v_profile_id, NOW() - INTERVAL '17 days'
        );
      END IF;
    END IF;
    
    IF v_bed_3 IS NOT NULL AND v_bed_4 IS NOT NULL AND v_admission_1 IS NOT NULL THEN
      INSERT INTO bed_transfers (
        admission_id, from_bed_id, to_bed_id, organization_id,
        transfer_reason, notes, ordered_by, transferred_by, transferred_at
      ) VALUES (
        v_admission_1, v_bed_4, v_bed_3, v_org_id,
        'Closer monitoring required',
        'Patient requested room closer to nursing station',
        v_profile_id, v_profile_id, NOW() - INTERVAL '23 days'
      );
    END IF;
    
  END IF;
END $$;
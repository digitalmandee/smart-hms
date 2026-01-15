-- Seed Radiology Master Data: Modalities and Procedures
-- Also fix TEMP patient number

DO $$
DECLARE
  org1_id UUID;
  org1_branch_id UUID;
  org2_id UUID;
  org2_branch_id UUID;
  mod_xray_1 UUID;
  mod_usg_1 UUID;
  mod_ct_1 UUID;
  mod_mri_1 UUID;
  mod_ecg_1 UUID;
  mod_echo_1 UUID;
  mod_xray_2 UUID;
  mod_usg_2 UUID;
  mod_ct_2 UUID;
  mod_mri_2 UUID;
BEGIN
  -- Get organizations
  SELECT o.id, b.id INTO org1_id, org1_branch_id
  FROM organizations o
  JOIN branches b ON b.organization_id = o.id AND b.is_main_branch = true
  WHERE o.slug = 'shifa-medical' LIMIT 1;

  SELECT o.id, b.id INTO org2_id, org2_branch_id
  FROM organizations o
  JOIN branches b ON b.organization_id = o.id AND b.is_main_branch = true
  WHERE o.slug = 'city-hospital' LIMIT 1;

  IF org1_id IS NOT NULL THEN
    -- Create Modalities for Org 1
    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'X-Ray', 'XRAY', 'xray', 'Radiology', 15, true)
    RETURNING id INTO mod_xray_1;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'Ultrasound', 'USG', 'ultrasound', 'Radiology', 30, true)
    RETURNING id INTO mod_usg_1;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'CT Scan', 'CT', 'ct_scan', 'Radiology', 45, true)
    RETURNING id INTO mod_ct_1;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'MRI', 'MRI', 'mri', 'Radiology', 60, true)
    RETURNING id INTO mod_mri_1;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'ECG', 'ECG', 'ecg', 'Cardiology', 15, true)
    RETURNING id INTO mod_ecg_1;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org1_id, org1_branch_id, 'Echocardiography', 'ECHO', 'echo', 'Cardiology', 30, true)
    RETURNING id INTO mod_echo_1;

    -- Create Procedures for Org 1
    -- X-Ray procedures
    INSERT INTO imaging_procedures (organization_id, modality_id, name, code, modality_type, body_part, estimated_duration_minutes, base_price, is_active)
    VALUES 
      (org1_id, mod_xray_1, 'Chest X-Ray PA View', 'XR-CHEST-PA', 'xray', 'Chest', 15, 300, true),
      (org1_id, mod_xray_1, 'Chest X-Ray AP/Lateral', 'XR-CHEST-LAT', 'xray', 'Chest', 20, 450, true),
      (org1_id, mod_xray_1, 'Abdomen X-Ray', 'XR-ABD', 'xray', 'Abdomen', 15, 350, true),
      (org1_id, mod_xray_1, 'Spine X-Ray - Lumbar', 'XR-SPINE-L', 'xray', 'Spine', 20, 500, true),
      (org1_id, mod_xray_1, 'Hand X-Ray', 'XR-HAND', 'xray', 'Hand', 10, 250, true),
      (org1_id, mod_xray_1, 'Skull X-Ray', 'XR-SKULL', 'xray', 'Head', 15, 400, true);

    -- Ultrasound procedures
    INSERT INTO imaging_procedures (organization_id, modality_id, name, code, modality_type, body_part, estimated_duration_minutes, base_price, is_active)
    VALUES 
      (org1_id, mod_usg_1, 'Abdomen Ultrasound', 'USG-ABD', 'ultrasound', 'Abdomen', 30, 800, true),
      (org1_id, mod_usg_1, 'Pelvis Ultrasound', 'USG-PELV', 'ultrasound', 'Pelvis', 30, 800, true),
      (org1_id, mod_usg_1, 'Thyroid Ultrasound', 'USG-THY', 'ultrasound', 'Neck', 20, 600, true),
      (org1_id, mod_usg_1, 'Doppler - Lower Limb', 'USG-DOP-LL', 'ultrasound', 'Lower Limb', 45, 1500, true);

    -- CT procedures
    INSERT INTO imaging_procedures (organization_id, modality_id, name, code, modality_type, body_part, estimated_duration_minutes, base_price, is_active)
    VALUES 
      (org1_id, mod_ct_1, 'CT Head Plain', 'CT-HEAD', 'ct_scan', 'Head', 30, 2500, true),
      (org1_id, mod_ct_1, 'CT Chest', 'CT-CHEST', 'ct_scan', 'Chest', 45, 4000, true),
      (org1_id, mod_ct_1, 'CT Abdomen', 'CT-ABD', 'ct_scan', 'Abdomen', 45, 4500, true),
      (org1_id, mod_ct_1, 'HRCT Chest', 'HRCT-CHEST', 'ct_scan', 'Chest', 45, 5000, true);

    -- MRI procedures
    INSERT INTO imaging_procedures (organization_id, modality_id, name, code, modality_type, body_part, estimated_duration_minutes, base_price, is_active)
    VALUES 
      (org1_id, mod_mri_1, 'MRI Brain', 'MRI-BRAIN', 'mri', 'Head', 60, 8000, true),
      (org1_id, mod_mri_1, 'MRI Spine - Lumbar', 'MRI-SPINE-L', 'mri', 'Spine', 60, 8000, true),
      (org1_id, mod_mri_1, 'MRI Knee', 'MRI-KNEE', 'mri', 'Knee', 45, 6000, true),
      (org1_id, mod_mri_1, 'MRI Shoulder', 'MRI-SHLDR', 'mri', 'Shoulder', 45, 6000, true);

    -- ECG/Echo procedures
    INSERT INTO imaging_procedures (organization_id, modality_id, name, code, modality_type, body_part, estimated_duration_minutes, base_price, is_active)
    VALUES 
      (org1_id, mod_ecg_1, '12-Lead ECG', 'ECG-12L', 'ecg', 'Heart', 15, 200, true),
      (org1_id, mod_echo_1, '2D Echocardiography', 'ECHO-2D', 'echo', 'Heart', 30, 1500, true),
      (org1_id, mod_echo_1, 'Stress Echo', 'ECHO-STRESS', 'echo', 'Heart', 60, 3000, true);
  END IF;

  IF org2_id IS NOT NULL THEN
    -- Create Modalities for Org 2
    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'X-Ray', 'XRAY', 'xray', 'Radiology', 15, true)
    RETURNING id INTO mod_xray_2;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'Ultrasound', 'USG', 'ultrasound', 'Radiology', 30, true)
    RETURNING id INTO mod_usg_2;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'CT Scan', 'CT', 'ct_scan', 'Radiology', 45, true)
    RETURNING id INTO mod_ct_2;

    INSERT INTO imaging_modalities (id, organization_id, branch_id, name, code, modality_type, department, default_duration_minutes, is_active)
    VALUES (gen_random_uuid(), org2_id, org2_branch_id, 'MRI', 'MRI', 'mri', 'Radiology', 60, true)
    RETURNING id INTO mod_mri_2;

    -- Create Procedures for Org 2
    INSERT INTO imaging_procedures (organization_id, modality_id, name, code, modality_type, body_part, estimated_duration_minutes, base_price, is_active)
    VALUES 
      (org2_id, mod_xray_2, 'Chest X-Ray PA View', 'XR-CHEST-PA', 'xray', 'Chest', 15, 250, true),
      (org2_id, mod_xray_2, 'Abdomen X-Ray', 'XR-ABD', 'xray', 'Abdomen', 15, 300, true),
      (org2_id, mod_usg_2, 'Abdomen Ultrasound', 'USG-ABD', 'ultrasound', 'Abdomen', 30, 700, true),
      (org2_id, mod_usg_2, 'Pelvis Ultrasound', 'USG-PELV', 'ultrasound', 'Pelvis', 30, 700, true),
      (org2_id, mod_ct_2, 'CT Head Plain', 'CT-HEAD', 'ct_scan', 'Head', 30, 2200, true),
      (org2_id, mod_ct_2, 'CT Chest', 'CT-CHEST', 'ct_scan', 'Chest', 45, 3500, true),
      (org2_id, mod_mri_2, 'MRI Brain', 'MRI-BRAIN', 'mri', 'Head', 60, 7000, true),
      (org2_id, mod_mri_2, 'MRI Knee', 'MRI-KNEE', 'mri', 'Knee', 45, 5500, true);
  END IF;
END $$;

-- Fix TEMP patient number
UPDATE patients 
SET patient_number = 'SHIFA-SMC-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-0001'
WHERE patient_number LIKE 'TEMP%' OR patient_number = 'TEMP';
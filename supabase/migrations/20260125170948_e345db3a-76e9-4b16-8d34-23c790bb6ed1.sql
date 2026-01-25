-- Seed additional lab test templates for organization b1111111-1111-1111-1111-111111111111

-- 16. Fasting Blood Sugar (FBS)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Fasting Blood Sugar (FBS)',
  'Diabetes',
  '51557e42-e97a-477c-b35c-4caf2e849cd9',
  '[{"name": "Fasting Blood Sugar", "unit": "mg/dL", "type": "number", "normal_min": 70, "normal_max": 100}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 17. Ferritin
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Ferritin',
  'Hematology',
  '6a75d257-aec4-4cc9-947d-f6f054303471',
  '[{"name": "Ferritin", "unit": "ng/mL", "type": "number", "normal_min": 20, "normal_max": 300}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 18. HbA1c
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'HbA1c',
  'Diabetes',
  '351d6d9d-809e-4d34-9464-2473908eec5b',
  '[{"name": "HbA1c", "unit": "%", "type": "number", "normal_min": 4.0, "normal_max": 5.6}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 19. Hemoglobin (Hb)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Hemoglobin (Hb)',
  'Hematology',
  'aa59ebae-d296-4ddc-8153-405d61a13101',
  '[{"name": "Hemoglobin", "unit": "g/dL", "type": "number", "normal_min": 12.0, "normal_max": 17.5}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 20. Hepatitis B (HBsAg)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Hepatitis B (HBsAg)',
  'Serology',
  'af532659-ce3d-493d-960c-8cbc1de13325',
  '[{"name": "HBsAg", "unit": "", "type": "text", "normal_min": null, "normal_max": null}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 21. Hepatitis C (Anti-HCV)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Hepatitis C (Anti-HCV)',
  'Serology',
  '78cc189d-82bb-429b-8cf1-a24f2938aa1e',
  '[{"name": "Anti-HCV", "unit": "", "type": "text", "normal_min": null, "normal_max": null}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 22. HIV Screening
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'HIV Screening',
  'Serology',
  'e8c95321-8d98-4fd0-97b8-8ce763e0e905',
  '[{"name": "HIV 1/2 Antibody", "unit": "", "type": "text", "normal_min": null, "normal_max": null}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 23. Iron Studies
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Iron Studies',
  'Hematology',
  '4e0d9bf0-d02d-4b63-8fe9-f221411831be',
  '[
    {"name": "Serum Iron", "unit": "µg/dL", "type": "number", "normal_min": 60, "normal_max": 170},
    {"name": "TIBC", "unit": "µg/dL", "type": "number", "normal_min": 250, "normal_max": 400},
    {"name": "Transferrin Saturation", "unit": "%", "type": "number", "normal_min": 20, "normal_max": 50}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 24. Kidney Function Tests (RFT)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Kidney Function Tests (RFT)',
  'Renal',
  'ccda150c-d86b-4bd2-acad-7ed193e87f00',
  '[
    {"name": "Serum Creatinine", "unit": "mg/dL", "type": "number", "normal_min": 0.7, "normal_max": 1.3},
    {"name": "Blood Urea", "unit": "mg/dL", "type": "number", "normal_min": 15, "normal_max": 45},
    {"name": "BUN", "unit": "mg/dL", "type": "number", "normal_min": 7, "normal_max": 20},
    {"name": "eGFR", "unit": "mL/min/1.73m²", "type": "number", "normal_min": 90, "normal_max": 120}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 25. Lipid Profile
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Lipid Profile',
  'Biochemistry',
  '4a9b4f87-e4eb-4c27-a047-e36181be8748',
  '[
    {"name": "Total Cholesterol", "unit": "mg/dL", "type": "number", "normal_min": 0, "normal_max": 200},
    {"name": "LDL Cholesterol", "unit": "mg/dL", "type": "number", "normal_min": 0, "normal_max": 100},
    {"name": "HDL Cholesterol", "unit": "mg/dL", "type": "number", "normal_min": 40, "normal_max": 100},
    {"name": "Triglycerides", "unit": "mg/dL", "type": "number", "normal_min": 0, "normal_max": 150},
    {"name": "VLDL", "unit": "mg/dL", "type": "number", "normal_min": 5, "normal_max": 40}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 26. Liver Function Tests (LFT)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Liver Function Tests (LFT)',
  'Liver',
  'bf6885d0-026e-4e16-8b04-19b3422119ea',
  '[
    {"name": "Total Bilirubin", "unit": "mg/dL", "type": "number", "normal_min": 0.1, "normal_max": 1.2},
    {"name": "Direct Bilirubin", "unit": "mg/dL", "type": "number", "normal_min": 0, "normal_max": 0.3},
    {"name": "ALT (SGPT)", "unit": "U/L", "type": "number", "normal_min": 7, "normal_max": 56},
    {"name": "AST (SGOT)", "unit": "U/L", "type": "number", "normal_min": 10, "normal_max": 40},
    {"name": "Alkaline Phosphatase", "unit": "U/L", "type": "number", "normal_min": 44, "normal_max": 147},
    {"name": "Total Protein", "unit": "g/dL", "type": "number", "normal_min": 6.0, "normal_max": 8.3},
    {"name": "Albumin", "unit": "g/dL", "type": "number", "normal_min": 3.5, "normal_max": 5.5},
    {"name": "Globulin", "unit": "g/dL", "type": "number", "normal_min": 2.0, "normal_max": 3.5}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 27. Magnesium
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Magnesium',
  'Biochemistry',
  '4968d1ef-014a-47cd-9495-883f69dab014',
  '[{"name": "Serum Magnesium", "unit": "mg/dL", "type": "number", "normal_min": 1.7, "normal_max": 2.2}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 28. Malaria Parasite (MP)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Malaria Parasite (MP)',
  'Microbiology',
  '205b6b08-8fce-4a0b-826d-29ec42c36427',
  '[
    {"name": "Malaria Parasite", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Species", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 29. Platelet Count
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Platelet Count',
  'Hematology',
  '6931cd28-cc33-4a06-88e8-8b05e6e84835',
  '[{"name": "Platelet Count", "unit": "cells/µL", "type": "number", "normal_min": 150000, "normal_max": 450000}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 30. Procalcitonin
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Procalcitonin',
  'Immunology',
  '586b50f2-9754-4390-a0e3-946063a51956',
  '[{"name": "Procalcitonin", "unit": "ng/mL", "type": "number", "normal_min": 0, "normal_max": 0.5}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 31. PSA
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'PSA (Prostate Specific Antigen)',
  'Tumor Markers',
  '725f349e-fffb-4a61-b6ef-c4b8a1d8dd54',
  '[{"name": "PSA", "unit": "ng/mL", "type": "number", "normal_min": 0, "normal_max": 4.0}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 32. PT/INR
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'PT/INR',
  'Coagulation',
  '77f2e61e-1842-4506-b336-ab68a7147c65',
  '[
    {"name": "Prothrombin Time", "unit": "seconds", "type": "number", "normal_min": 11, "normal_max": 13.5},
    {"name": "INR", "unit": "", "type": "number", "normal_min": 0.8, "normal_max": 1.2},
    {"name": "Control", "unit": "seconds", "type": "number", "normal_min": 11, "normal_max": 13.5}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 33. Pus Culture & Sensitivity
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Pus Culture & Sensitivity',
  'Microbiology',
  '5ab297a6-c7f7-4dd0-b99c-9bac1daac051',
  '[
    {"name": "Culture Result", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Organism Isolated", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Sensitivity", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 34. Random Blood Sugar (RBS)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Random Blood Sugar (RBS)',
  'Diabetes',
  '897adc1e-33f9-4093-bfcb-b6eb9be8cdef',
  '[{"name": "Random Blood Sugar", "unit": "mg/dL", "type": "number", "normal_min": 70, "normal_max": 140}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 35. Serum Albumin
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Serum Albumin',
  'Biochemistry',
  '4a05f4e7-0eae-4f1f-a4d9-ce058c312c07',
  '[{"name": "Serum Albumin", "unit": "g/dL", "type": "number", "normal_min": 3.5, "normal_max": 5.5}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 36. Serum Amylase
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Serum Amylase',
  'Biochemistry',
  '56775b6e-d8e8-4748-abf8-631d4bc2baa5',
  '[{"name": "Serum Amylase", "unit": "U/L", "type": "number", "normal_min": 28, "normal_max": 100}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 37. Serum Bilirubin
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Serum Bilirubin',
  'Liver',
  'c2ad44e7-d979-486d-89f1-a524a7f815c0',
  '[
    {"name": "Total Bilirubin", "unit": "mg/dL", "type": "number", "normal_min": 0.1, "normal_max": 1.2},
    {"name": "Direct Bilirubin", "unit": "mg/dL", "type": "number", "normal_min": 0, "normal_max": 0.3},
    {"name": "Indirect Bilirubin", "unit": "mg/dL", "type": "number", "normal_min": 0.1, "normal_max": 1.0}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 38. Serum Creatinine
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Serum Creatinine',
  'Renal',
  'dbe096a6-5e7a-42bb-b0bf-221e88f436f3',
  '[{"name": "Serum Creatinine", "unit": "mg/dL", "type": "number", "normal_min": 0.7, "normal_max": 1.3}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 39. Serum Lipase
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Serum Lipase',
  'Biochemistry',
  '2f2820ce-c930-454b-b332-ac41e11fb732',
  '[{"name": "Serum Lipase", "unit": "U/L", "type": "number", "normal_min": 0, "normal_max": 160}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 40. Serum Protein
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Serum Protein',
  'Biochemistry',
  '5a3fc296-6cea-41eb-af16-6abb26b7c689',
  '[
    {"name": "Total Protein", "unit": "g/dL", "type": "number", "normal_min": 6.0, "normal_max": 8.3},
    {"name": "A/G Ratio", "unit": "", "type": "number", "normal_min": 1.0, "normal_max": 2.5}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 41. Sputum Culture
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Sputum Culture',
  'Microbiology',
  '457acdcf-f176-4a64-830b-f74d37781977',
  '[
    {"name": "Culture Result", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Organism Isolated", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Sensitivity", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 42. Stool Complete Examination
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Stool Complete Examination',
  'Clinical Pathology',
  'dd785a43-ad0d-4766-98a0-a99e7edc8165',
  '[
    {"name": "Color", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Consistency", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Mucus", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "RBCs", "unit": "/HPF", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Pus Cells", "unit": "/HPF", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Ova/Cysts", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Occult Blood", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 43. Stool Culture
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Stool Culture',
  'Microbiology',
  'c9d2e8e6-f065-42c7-b8c8-cf6268db8ab4',
  '[
    {"name": "Culture Result", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Organism Isolated", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Sensitivity", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 44. Thyroid Profile (T3, T4, TSH)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Thyroid Profile (T3, T4, TSH)',
  'Thyroid',
  '19c48c32-bfbd-402f-a31d-a80a80d48f7a',
  '[
    {"name": "TSH", "unit": "µIU/mL", "type": "number", "normal_min": 0.4, "normal_max": 4.0},
    {"name": "T3", "unit": "ng/dL", "type": "number", "normal_min": 80, "normal_max": 200},
    {"name": "T4", "unit": "µg/dL", "type": "number", "normal_min": 4.5, "normal_max": 12.0},
    {"name": "Free T4", "unit": "ng/dL", "type": "number", "normal_min": 0.8, "normal_max": 1.8}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 45. Troponin T
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Troponin T',
  'Cardiac',
  'bbca8e20-8a4d-41e5-80d2-d60a93735a6e',
  '[{"name": "Troponin T", "unit": "ng/mL", "type": "number", "normal_min": 0, "normal_max": 0.01}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 46. TSH
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'TSH',
  'Thyroid',
  '2cd98aab-aac6-4c7f-a060-2ad962c6a7a8',
  '[{"name": "TSH", "unit": "µIU/mL", "type": "number", "normal_min": 0.4, "normal_max": 4.0}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 47. Typhoid (Widal Test)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Typhoid (Widal Test)',
  'Serology',
  '9da0e145-1b9a-4d3e-a996-d2cd36fb3918',
  '[
    {"name": "Typhi O", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Typhi H", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Para A O", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Para A H", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Para B O", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Para B H", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 48. Uric Acid
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Uric Acid',
  'Biochemistry',
  'd4b9f024-446a-417c-be33-d6f9f98c10dd',
  '[{"name": "Uric Acid", "unit": "mg/dL", "type": "number", "normal_min": 2.5, "normal_max": 7.0}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 49. Urine Complete Examination
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Urine Complete Examination',
  'Clinical Pathology',
  'afa17478-91bc-4a38-b6c3-771f19aa08d1',
  '[
    {"name": "Color", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Appearance", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Specific Gravity", "unit": "", "type": "number", "normal_min": 1.005, "normal_max": 1.030},
    {"name": "pH", "unit": "", "type": "number", "normal_min": 4.5, "normal_max": 8.0},
    {"name": "Protein", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Glucose", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Ketones", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Bilirubin", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Blood", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "RBCs", "unit": "/HPF", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Pus Cells", "unit": "/HPF", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Epithelial Cells", "unit": "/HPF", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Casts", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Crystals", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 50. Urine Culture & Sensitivity
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Urine Culture & Sensitivity',
  'Microbiology',
  'd02a4554-8430-461a-9492-d40ec67cf20f',
  '[
    {"name": "Culture Result", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Colony Count", "unit": "CFU/mL", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Organism Isolated", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Sensitivity", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 51. VDRL (Syphilis)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'VDRL (Syphilis)',
  'Serology',
  'e2f61e08-7266-42ae-9159-96d6cd00b921',
  '[{"name": "VDRL", "unit": "", "type": "text", "normal_min": null, "normal_max": null}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 52. Vitamin B12
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Vitamin B12',
  'Biochemistry',
  '31529d24-3e1c-45d4-bb2d-fc1934dafb5d',
  '[{"name": "Vitamin B12", "unit": "pg/mL", "type": "number", "normal_min": 200, "normal_max": 900}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 53. Vitamin D
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Vitamin D',
  'Biochemistry',
  '2a14148f-8570-4f89-a1d0-29782a1dba97',
  '[{"name": "25-OH Vitamin D", "unit": "ng/mL", "type": "number", "normal_min": 30, "normal_max": 100}]'::jsonb,
  true
) ON CONFLICT DO NOTHING;
-- Seed comprehensive lab test templates for organization b1111111-1111-1111-1111-111111111111
-- Each template is linked to the matching service_type via service_type_id

-- 1. Complete Blood Count (CBC)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Complete Blood Count (CBC)',
  'Hematology',
  '9c54d690-ae5e-460c-beb5-3a6cac8d98c8',
  '[
    {"name": "Hemoglobin", "unit": "g/dL", "type": "number", "normal_min": 12.0, "normal_max": 17.5},
    {"name": "RBC Count", "unit": "million/µL", "type": "number", "normal_min": 4.0, "normal_max": 6.0},
    {"name": "WBC Count", "unit": "cells/µL", "type": "number", "normal_min": 4500, "normal_max": 11000},
    {"name": "Platelet Count", "unit": "cells/µL", "type": "number", "normal_min": 150000, "normal_max": 450000},
    {"name": "Hematocrit", "unit": "%", "type": "number", "normal_min": 36, "normal_max": 52},
    {"name": "MCV", "unit": "fL", "type": "number", "normal_min": 80, "normal_max": 100},
    {"name": "MCH", "unit": "pg", "type": "number", "normal_min": 27, "normal_max": 33},
    {"name": "MCHC", "unit": "g/dL", "type": "number", "normal_min": 32, "normal_max": 36},
    {"name": "RDW", "unit": "%", "type": "number", "normal_min": 11.5, "normal_max": 14.5}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 2. Blood Test - CBC (alternate service)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Blood Test - CBC',
  'Hematology',
  '0a333333-3333-3333-3333-333333333333',
  '[
    {"name": "Hemoglobin", "unit": "g/dL", "type": "number", "normal_min": 12.0, "normal_max": 17.5},
    {"name": "RBC Count", "unit": "million/µL", "type": "number", "normal_min": 4.0, "normal_max": 6.0},
    {"name": "WBC Count", "unit": "cells/µL", "type": "number", "normal_min": 4500, "normal_max": 11000},
    {"name": "Platelet Count", "unit": "cells/µL", "type": "number", "normal_min": 150000, "normal_max": 450000},
    {"name": "Hematocrit", "unit": "%", "type": "number", "normal_min": 36, "normal_max": 52},
    {"name": "MCV", "unit": "fL", "type": "number", "normal_min": 80, "normal_max": 100},
    {"name": "MCH", "unit": "pg", "type": "number", "normal_min": 27, "normal_max": 33},
    {"name": "MCHC", "unit": "g/dL", "type": "number", "normal_min": 32, "normal_max": 36}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 3. APTT
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'APTT',
  'Coagulation',
  '47f63511-b9f7-4acc-9dd8-e746f32c76f6',
  '[
    {"name": "aPTT", "unit": "seconds", "type": "number", "normal_min": 25, "normal_max": 35},
    {"name": "Control", "unit": "seconds", "type": "number", "normal_min": 25, "normal_max": 35}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 4. CK-MB
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'CK-MB',
  'Cardiac',
  '54f9bdba-4dea-4cf6-b49c-8f05d1fce196',
  '[
    {"name": "CK-MB", "unit": "U/L", "type": "number", "normal_min": 0, "normal_max": 25},
    {"name": "Total CK", "unit": "U/L", "type": "number", "normal_min": 30, "normal_max": 200}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 5. Blood Culture
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Blood Culture',
  'Microbiology',
  'f46f256b-f12e-4fa0-a939-d993854595e2',
  '[
    {"name": "Culture Result", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Organism Isolated", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Sensitivity", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 6. Blood Group & Rh Factor
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Blood Group & Rh Factor',
  'Hematology',
  '247dcfda-5441-4251-9496-ddf66f1462f3',
  '[
    {"name": "ABO Group", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Rh Factor", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 7. Blood Urea
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Blood Urea',
  'Renal',
  'ed49925a-e9ca-4792-bc72-f08c1ba9d2a6',
  '[
    {"name": "Blood Urea", "unit": "mg/dL", "type": "number", "normal_min": 15, "normal_max": 45},
    {"name": "BUN", "unit": "mg/dL", "type": "number", "normal_min": 7, "normal_max": 20}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 8. Calcium
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Calcium',
  'Biochemistry',
  '9c7e32d3-977f-4bf0-8f03-af9d039a7833',
  '[
    {"name": "Total Calcium", "unit": "mg/dL", "type": "number", "normal_min": 8.5, "normal_max": 10.5},
    {"name": "Ionized Calcium", "unit": "mmol/L", "type": "number", "normal_min": 1.12, "normal_max": 1.32}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 9. Cardiac Enzymes (Troponin I)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Cardiac Enzymes (Troponin I)',
  'Cardiac',
  '7b5181b6-db33-4e6f-8885-f2e7adff90c6',
  '[
    {"name": "Troponin I", "unit": "ng/mL", "type": "number", "normal_min": 0, "normal_max": 0.04},
    {"name": "CK-MB", "unit": "U/L", "type": "number", "normal_min": 0, "normal_max": 25}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 10. CRP (C-Reactive Protein)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'CRP (C-Reactive Protein)',
  'Immunology',
  '3269d376-9adf-4707-9df3-b3e3bb737dc6',
  '[
    {"name": "CRP", "unit": "mg/L", "type": "number", "normal_min": 0, "normal_max": 10}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 11. D-Dimer
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'D-Dimer',
  'Coagulation',
  '71622cda-062b-4d1f-a6e5-c99cd53b41b3',
  '[
    {"name": "D-Dimer", "unit": "ng/mL", "type": "number", "normal_min": 0, "normal_max": 500}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 12. Dengue IgG/IgM
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Dengue IgG/IgM',
  'Serology',
  '8a9fd36a-8710-4c73-85d3-90f4dd0cf37b',
  '[
    {"name": "Dengue IgG", "unit": "", "type": "text", "normal_min": null, "normal_max": null},
    {"name": "Dengue IgM", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 13. Dengue NS1
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Dengue NS1',
  'Serology',
  '53c7d2f9-71e4-42fe-bfcf-51785c5f5913',
  '[
    {"name": "NS1 Antigen", "unit": "", "type": "text", "normal_min": null, "normal_max": null}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 14. Electrolytes (Na, K, Cl)
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'Electrolytes (Na, K, Cl)',
  'Biochemistry',
  '80ea6828-0e9e-4159-ab9e-d339b8826361',
  '[
    {"name": "Sodium (Na)", "unit": "mEq/L", "type": "number", "normal_min": 136, "normal_max": 145},
    {"name": "Potassium (K)", "unit": "mEq/L", "type": "number", "normal_min": 3.5, "normal_max": 5.0},
    {"name": "Chloride (Cl)", "unit": "mEq/L", "type": "number", "normal_min": 98, "normal_max": 106}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 15. ESR
INSERT INTO lab_test_templates (organization_id, test_name, test_category, service_type_id, fields, is_active)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'ESR',
  'Hematology',
  '616ed215-8f25-4de8-8f4d-48a3569b8938',
  '[
    {"name": "ESR 1st Hour", "unit": "mm/hr", "type": "number", "normal_min": 0, "normal_max": 20}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;
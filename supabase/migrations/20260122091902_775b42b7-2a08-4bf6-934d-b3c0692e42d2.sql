-- ============================================================
-- MIGRATION: Promote Services to Top-Level Menu with Submenus
-- ============================================================

-- Step 1: Create top-level Services menu
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
VALUES ('services', 'Services', 'Banknote', NULL, NULL, 72, 'settings.view', NULL, true);

-- Step 2: Add submenus under Services
INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'services.all', 'All Services', 'List', '/app/settings/services', id, 1, 'settings.view', NULL, true
FROM menu_items WHERE code = 'services';

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'services.consultations', 'Consultations', 'Stethoscope', '/app/settings/doctor-fees', id, 2, 'settings.view', NULL, true
FROM menu_items WHERE code = 'services';

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'services.lab', 'Lab Tests', 'FlaskConical', '/app/lab/templates', id, 3, 'settings.view', 'lab', true
FROM menu_items WHERE code = 'services';

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'services.radiology', 'Radiology', 'Scan', '/app/radiology/procedures', id, 4, 'settings.view', 'radiology', true
FROM menu_items WHERE code = 'services';

INSERT INTO menu_items (code, name, icon, path, parent_id, sort_order, required_permission, required_module, is_active)
SELECT 'services.rooms', 'Rooms & Beds', 'BedDouble', '/app/ipd/setup/bed-types', id, 5, 'settings.view', 'ipd', true
FROM menu_items WHERE code = 'services';

-- Step 3: Deactivate old Services menu item under Settings
UPDATE menu_items 
SET is_active = false 
WHERE code = 'settings.services';

-- ============================================================
-- DATA CLEANUP: Link unlinked lab templates with pricing
-- ============================================================

-- Step 4: Create service_types for unlinked lab templates with proper pricing
-- Only for templates that have a valid organization_id
INSERT INTO service_types (name, category, default_price, organization_id, is_active, created_at)
SELECT DISTINCT 
  lt.test_name,
  'lab'::service_category,
  CASE 
    WHEN lt.test_name ILIKE '%CBC%' OR lt.test_name ILIKE '%Complete Blood Count%' THEN 350
    WHEN lt.test_name ILIKE '%LFT%' OR lt.test_name ILIKE '%Liver Function%' THEN 800
    WHEN lt.test_name ILIKE '%RFT%' OR lt.test_name ILIKE '%Renal Function%' THEN 600
    WHEN lt.test_name ILIKE '%Lipid Profile%' THEN 900
    WHEN lt.test_name ILIKE '%Thyroid%' THEN 1200
    WHEN lt.test_name ILIKE '%Fasting Blood Sugar%' OR lt.test_name ILIKE '%FBS%' THEN 150
    WHEN lt.test_name ILIKE '%HbA1c%' THEN 600
    WHEN lt.test_name ILIKE '%Urine%Routine%' OR lt.test_name ILIKE '%Urinalysis%' THEN 200
    ELSE 500 -- Default price for other tests
  END,
  lt.organization_id,
  true,
  NOW()
FROM lab_test_templates lt
WHERE lt.service_type_id IS NULL
  AND lt.organization_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM service_types st 
    WHERE st.name = lt.test_name 
    AND st.category = 'lab' 
    AND st.organization_id = lt.organization_id
  );

-- Step 5: Link unlinked lab templates to their service_types
UPDATE lab_test_templates lt
SET service_type_id = st.id
FROM service_types st
WHERE st.name = lt.test_name 
  AND st.category = 'lab' 
  AND st.organization_id = lt.organization_id
  AND lt.service_type_id IS NULL
  AND lt.organization_id IS NOT NULL;

-- Step 6: Update zero-priced lab service_types with industry-standard pricing
UPDATE service_types
SET default_price = CASE 
    WHEN name ILIKE '%CBC%' OR name ILIKE '%Complete Blood Count%' THEN 350
    WHEN name ILIKE '%LFT%' OR name ILIKE '%Liver Function%' THEN 800
    WHEN name ILIKE '%RFT%' OR name ILIKE '%Renal Function%' THEN 600
    WHEN name ILIKE '%Lipid Profile%' THEN 900
    WHEN name ILIKE '%Thyroid%' THEN 1200
    WHEN name ILIKE '%Fasting Blood Sugar%' OR name ILIKE '%FBS%' THEN 150
    WHEN name ILIKE '%HbA1c%' THEN 600
    WHEN name ILIKE '%Urine%Routine%' OR name ILIKE '%Urinalysis%' THEN 200
    WHEN name ILIKE '%Hemoglobin%' THEN 150
    WHEN name ILIKE '%ESR%' THEN 150
    WHEN name ILIKE '%Blood Sugar%' THEN 150
    WHEN name ILIKE '%Creatinine%' THEN 200
    WHEN name ILIKE '%Urea%' THEN 200
    WHEN name ILIKE '%Electrolyte%' THEN 500
    WHEN name ILIKE '%Calcium%' THEN 250
    WHEN name ILIKE '%Phosphorus%' THEN 250
    WHEN name ILIKE '%Uric Acid%' THEN 200
    WHEN name ILIKE '%Bilirubin%' THEN 200
    WHEN name ILIKE '%Protein%' THEN 200
    WHEN name ILIKE '%Albumin%' THEN 200
    WHEN name ILIKE '%Globulin%' THEN 200
    WHEN name ILIKE '%SGOT%' OR name ILIKE '%AST%' THEN 200
    WHEN name ILIKE '%SGPT%' OR name ILIKE '%ALT%' THEN 200
    WHEN name ILIKE '%ALP%' OR name ILIKE '%Alkaline Phosphatase%' THEN 200
    WHEN name ILIKE '%GGT%' THEN 250
    WHEN name ILIKE '%Cholesterol%' THEN 200
    WHEN name ILIKE '%Triglyceride%' THEN 200
    WHEN name ILIKE '%HDL%' THEN 250
    WHEN name ILIKE '%LDL%' THEN 250
    WHEN name ILIKE '%VLDL%' THEN 200
    WHEN name ILIKE '%T3%' THEN 300
    WHEN name ILIKE '%T4%' THEN 300
    WHEN name ILIKE '%TSH%' THEN 400
    WHEN name ILIKE '%PT%' OR name ILIKE '%Prothrombin%' THEN 350
    WHEN name ILIKE '%APTT%' THEN 350
    WHEN name ILIKE '%INR%' THEN 350
    WHEN name ILIKE '%Blood Culture%' THEN 800
    WHEN name ILIKE '%Urine Culture%' THEN 600
    WHEN name ILIKE '%Stool%' THEN 200
    WHEN name ILIKE '%Widal%' THEN 300
    WHEN name ILIKE '%HIV%' THEN 500
    WHEN name ILIKE '%HBsAg%' THEN 400
    WHEN name ILIKE '%HCV%' THEN 600
    WHEN name ILIKE '%VDRL%' THEN 300
    WHEN name ILIKE '%Dengue%' THEN 600
    WHEN name ILIKE '%Malaria%' THEN 300
    WHEN name ILIKE '%COVID%' THEN 500
    ELSE 500 -- Default for unmatched
  END,
  price_updated_at = NOW()
WHERE category = 'lab' 
  AND (default_price IS NULL OR default_price = 0);

-- ============================================================
-- DATA CLEANUP: Remove duplicate service_types
-- ============================================================

-- Step 7: Delete duplicate service_types that are NOT linked to any data
-- Keep the ones that are actually linked to imaging_procedures, ipd_bed_types, or lab_test_templates
DELETE FROM service_types st
WHERE st.id IN (
  SELECT st2.id
  FROM service_types st2
  WHERE EXISTS (
    -- There's another service_type with same name, category, org that IS linked
    SELECT 1 FROM service_types st3
    WHERE st3.name = st2.name 
      AND st3.category = st2.category 
      AND st3.organization_id = st2.organization_id
      AND st3.id != st2.id
      AND (
        EXISTS (SELECT 1 FROM imaging_procedures ip WHERE ip.service_type_id = st3.id)
        OR EXISTS (SELECT 1 FROM ipd_bed_types ibt WHERE ibt.service_type_id = st3.id)
        OR EXISTS (SELECT 1 FROM lab_test_templates ltt WHERE ltt.service_type_id = st3.id)
      )
  )
  -- And this one is NOT linked
  AND NOT EXISTS (SELECT 1 FROM imaging_procedures ip WHERE ip.service_type_id = st2.id)
  AND NOT EXISTS (SELECT 1 FROM ipd_bed_types ibt WHERE ibt.service_type_id = st2.id)
  AND NOT EXISTS (SELECT 1 FROM lab_test_templates ltt WHERE ltt.service_type_id = st2.id)
);
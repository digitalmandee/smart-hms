-- Seed all configuration tables with default data for existing organizations
DO $$
DECLARE
  org RECORD;
  cat_identity UUID;
  cat_education UUID;
  cat_employment UUID;
  cat_medical UUID;
  cat_other UUID;
BEGIN
  FOR org IN SELECT id FROM organizations LOOP
    -- 1. Seed config_cities (10 cities)
    INSERT INTO config_cities (organization_id, name, province, sort_order, is_active) VALUES
      (org.id, 'Lahore', 'Punjab', 0, true),
      (org.id, 'Karachi', 'Sindh', 1, true),
      (org.id, 'Islamabad', 'Federal', 2, true),
      (org.id, 'Rawalpindi', 'Punjab', 3, true),
      (org.id, 'Faisalabad', 'Punjab', 4, true),
      (org.id, 'Multan', 'Punjab', 5, true),
      (org.id, 'Peshawar', 'KPK', 6, true),
      (org.id, 'Quetta', 'Balochistan', 7, true),
      (org.id, 'Sialkot', 'Punjab', 8, true),
      (org.id, 'Gujranwala', 'Punjab', 9, true)
    ON CONFLICT DO NOTHING;

    -- 2. Seed config_languages (7 languages)
    INSERT INTO config_languages (organization_id, code, name, sort_order, is_active) VALUES
      (org.id, 'urdu', 'Urdu', 0, true),
      (org.id, 'english', 'English', 1, true),
      (org.id, 'punjabi', 'Punjabi', 2, true),
      (org.id, 'sindhi', 'Sindhi', 3, true),
      (org.id, 'pashto', 'Pashto', 4, true),
      (org.id, 'balochi', 'Balochi', 5, true),
      (org.id, 'saraiki', 'Saraiki', 6, true)
    ON CONFLICT DO NOTHING;

    -- 3. Seed config_occupations (12 occupations)
    INSERT INTO config_occupations (organization_id, name, sort_order, is_active) VALUES
      (org.id, 'Business', 0, true),
      (org.id, 'Government Employee', 1, true),
      (org.id, 'Private Employee', 2, true),
      (org.id, 'Doctor', 3, true),
      (org.id, 'Engineer', 4, true),
      (org.id, 'Teacher', 5, true),
      (org.id, 'Student', 6, true),
      (org.id, 'Housewife', 7, true),
      (org.id, 'Retired', 8, true),
      (org.id, 'Farmer', 9, true),
      (org.id, 'Labour', 10, true),
      (org.id, 'Other', 11, true)
    ON CONFLICT DO NOTHING;

    -- 4. Seed config_relations (9 relations)
    INSERT INTO config_relations (organization_id, name, sort_order, is_active) VALUES
      (org.id, 'Spouse', 0, true),
      (org.id, 'Son', 1, true),
      (org.id, 'Daughter', 2, true),
      (org.id, 'Father', 3, true),
      (org.id, 'Mother', 4, true),
      (org.id, 'Brother', 5, true),
      (org.id, 'Sister', 6, true),
      (org.id, 'Friend', 7, true),
      (org.id, 'Other', 8, true)
    ON CONFLICT DO NOTHING;

    -- 5. Seed config_referral_sources (7 sources)
    INSERT INTO config_referral_sources (organization_id, name, sort_order, is_active) VALUES
      (org.id, 'Doctor Referral', 0, true),
      (org.id, 'Hospital Referral', 1, true),
      (org.id, 'Walk-in', 2, true),
      (org.id, 'Online', 3, true),
      (org.id, 'Friend/Family', 4, true),
      (org.id, 'Advertisement', 5, true),
      (org.id, 'Other', 6, true)
    ON CONFLICT DO NOTHING;

    -- 6. Seed config_insurance_providers (7 providers)
    INSERT INTO config_insurance_providers (organization_id, name, sort_order, is_active) VALUES
      (org.id, 'State Life', 0, true),
      (org.id, 'Jubilee Life', 1, true),
      (org.id, 'EFU Life', 2, true),
      (org.id, 'Adamjee Insurance', 3, true),
      (org.id, 'Allianz EFU', 4, true),
      (org.id, 'IGI Insurance', 5, true),
      (org.id, 'Other', 6, true)
    ON CONFLICT DO NOTHING;

    -- 7. Seed config_diet_types (15 diet types)
    INSERT INTO config_diet_types (organization_id, code, name, description, icon, color, sort_order, is_active) VALUES
      (org.id, 'normal', 'Normal / Regular', 'Standard balanced diet with no restrictions', 'Utensils', 'bg-green-100 text-green-800', 0, true),
      (org.id, 'soft', 'Soft Diet', 'Easy to chew and digest foods', 'Leaf', 'bg-blue-100 text-blue-800', 1, true),
      (org.id, 'liquid', 'Full Liquid', 'All liquids including milk, juices, and soups', 'Droplet', 'bg-cyan-100 text-cyan-800', 2, true),
      (org.id, 'clear_liquid', 'Clear Liquid', 'Clear fluids only - water, broth, clear juices', 'Droplet', 'bg-sky-100 text-sky-800', 3, true),
      (org.id, 'npo', 'NPO (Nothing By Mouth)', 'No oral intake - pre-surgery or specific conditions', 'Ban', 'bg-red-100 text-red-800', 4, true),
      (org.id, 'diabetic', 'Diabetic Diet', 'Controlled carbohydrate and sugar intake', 'AlertTriangle', 'bg-orange-100 text-orange-800', 5, true),
      (org.id, 'renal', 'Renal Diet', 'Low sodium, potassium, and phosphorus for kidney patients', 'FlaskConical', 'bg-pink-100 text-pink-800', 6, true),
      (org.id, 'cardiac', 'Cardiac Diet', 'Heart-healthy, low cholesterol and sodium', 'Heart', 'bg-rose-100 text-rose-800', 7, true),
      (org.id, 'low_sodium', 'Low Sodium', 'Restricted salt intake for hypertension', 'Sparkles', 'bg-purple-100 text-purple-800', 8, true),
      (org.id, 'high_protein', 'High Protein', 'Increased protein for healing and recovery', 'Beef', 'bg-amber-100 text-amber-800', 9, true),
      (org.id, 'low_fat', 'Low Fat', 'Reduced fat content for digestive health', 'Salad', 'bg-lime-100 text-lime-800', 10, true),
      (org.id, 'bland', 'Bland Diet', 'Non-irritating foods for GI conditions', 'Apple', 'bg-stone-100 text-stone-800', 11, true),
      (org.id, 'pureed', 'Pureed', 'Blended foods for swallowing difficulties', 'Pill', 'bg-violet-100 text-violet-800', 12, true),
      (org.id, 'tube_feeding', 'Tube Feeding', 'Enteral nutrition via feeding tube', 'Syringe', 'bg-indigo-100 text-indigo-800', 13, true),
      (org.id, 'custom', 'Custom Diet', 'Customized diet based on specific patient needs', 'Settings2', 'bg-gray-100 text-gray-800', 14, true)
    ON CONFLICT DO NOTHING;

    -- 8. Seed config_nurse_specializations (14 specializations)
    INSERT INTO config_nurse_specializations (organization_id, code, name, sort_order, is_active) VALUES
      (org.id, 'general', 'General Nursing', 0, true),
      (org.id, 'icu', 'ICU/Critical Care', 1, true),
      (org.id, 'emergency', 'Emergency/Trauma', 2, true),
      (org.id, 'pediatric', 'Pediatric', 3, true),
      (org.id, 'neonatal', 'Neonatal/NICU', 4, true),
      (org.id, 'surgical', 'Surgical/OR', 5, true),
      (org.id, 'cardiac', 'Cardiac Care', 6, true),
      (org.id, 'oncology', 'Oncology', 7, true),
      (org.id, 'dialysis', 'Dialysis/Renal', 8, true),
      (org.id, 'obstetric', 'Obstetric/Labor & Delivery', 9, true),
      (org.id, 'psychiatric', 'Psychiatric/Mental Health', 10, true),
      (org.id, 'geriatric', 'Geriatric', 11, true),
      (org.id, 'community', 'Community Health', 12, true),
      (org.id, 'infection_control', 'Infection Control', 13, true)
    ON CONFLICT DO NOTHING;

    -- 9. Seed config_document_categories (5 categories)
    INSERT INTO config_document_categories (organization_id, code, name, sort_order, is_active) VALUES
      (org.id, 'identity', 'Identity Documents', 0, true),
      (org.id, 'education', 'Education Certificates', 1, true),
      (org.id, 'employment', 'Employment Documents', 2, true),
      (org.id, 'medical', 'Medical Certificates', 3, true),
      (org.id, 'other', 'Other Documents', 4, true)
    ON CONFLICT DO NOTHING;

    -- Get category IDs for document types
    SELECT id INTO cat_identity FROM config_document_categories WHERE organization_id = org.id AND code = 'identity' LIMIT 1;
    SELECT id INTO cat_education FROM config_document_categories WHERE organization_id = org.id AND code = 'education' LIMIT 1;
    SELECT id INTO cat_employment FROM config_document_categories WHERE organization_id = org.id AND code = 'employment' LIMIT 1;
    SELECT id INTO cat_medical FROM config_document_categories WHERE organization_id = org.id AND code = 'medical' LIMIT 1;
    SELECT id INTO cat_other FROM config_document_categories WHERE organization_id = org.id AND code = 'other' LIMIT 1;

    -- 10. Seed config_document_types (11 document types)
    INSERT INTO config_document_types (organization_id, category_id, code, name, requires_expiry, sort_order, is_active) VALUES
      (org.id, cat_identity, 'national_id', 'National ID Card (CNIC)', true, 0, true),
      (org.id, cat_identity, 'passport', 'Passport', true, 1, true),
      (org.id, cat_identity, 'driving_license', 'Driving License', true, 2, true),
      (org.id, cat_education, 'degree', 'Degree Certificate', false, 3, true),
      (org.id, cat_education, 'transcript', 'Academic Transcript', false, 4, true),
      (org.id, cat_employment, 'experience_letter', 'Experience Letter', false, 5, true),
      (org.id, cat_employment, 'offer_letter', 'Offer Letter', false, 6, true),
      (org.id, cat_employment, 'contract', 'Employment Contract', true, 7, true),
      (org.id, cat_employment, 'relieving_letter', 'Relieving Letter', false, 8, true),
      (org.id, cat_medical, 'fitness_certificate', 'Medical Fitness Certificate', true, 9, true),
      (org.id, cat_other, 'other', 'Other Document', false, 10, true)
    ON CONFLICT DO NOTHING;

  END LOOP;
END $$;
-- Seed comprehensive Pakistani hospital services for all existing organizations
-- All prices in Pakistani Rupees (Rs.)

-- Insert services for each organization
INSERT INTO service_types (organization_id, name, category, default_price, is_active)
SELECT o.id, s.name, s.category::service_category, s.default_price, true
FROM organizations o
CROSS JOIN (VALUES
  -- ============ CONSULTATION SERVICES ============
  ('General Consultation (OPD)', 'consultation', 1500),
  ('Specialist Consultation', 'consultation', 2500),
  ('Follow-up Visit', 'consultation', 800),
  ('Emergency Consultation', 'consultation', 3000),
  ('Pediatric Consultation', 'consultation', 2000),
  ('Gynecology Consultation', 'consultation', 2500),
  ('Cardiology Consultation', 'consultation', 3500),
  ('Orthopedic Consultation', 'consultation', 3000),
  ('ENT Consultation', 'consultation', 2500),
  ('Dermatology Consultation', 'consultation', 2000),
  ('Neurology Consultation', 'consultation', 4000),
  ('Psychiatry Consultation', 'consultation', 3000),
  ('Oncology Consultation', 'consultation', 5000),
  ('Nephrology Consultation', 'consultation', 3500),
  ('Pulmonology Consultation', 'consultation', 3000),
  ('Ophthalmology Consultation', 'consultation', 2500),
  ('Urology Consultation', 'consultation', 3000),
  ('Gastroenterology Consultation', 'consultation', 3500),

  -- ============ OBSTETRICS & GYNECOLOGY PROCEDURES ============
  ('Normal Vaginal Delivery (NVD)', 'procedure', 35000),
  ('Cesarean Section (C-Section)', 'procedure', 85000),
  ('Emergency C-Section', 'procedure', 100000),
  ('Episiotomy', 'procedure', 8000),
  ('Forceps Delivery', 'procedure', 45000),
  ('Vacuum Delivery', 'procedure', 40000),
  ('D&C (Dilation & Curettage)', 'procedure', 25000),
  ('Hysterectomy', 'procedure', 120000),
  ('Laparoscopic Surgery (Gynae)', 'procedure', 80000),
  ('Tubal Ligation', 'procedure', 25000),
  ('Hysteroscopy', 'procedure', 35000),

  -- ============ GENERAL SURGERY PROCEDURES ============
  ('Appendectomy', 'procedure', 45000),
  ('Hernia Repair', 'procedure', 55000),
  ('Cholecystectomy (Open)', 'procedure', 70000),
  ('Laparoscopic Cholecystectomy', 'procedure', 100000),
  ('Hemorrhoidectomy', 'procedure', 35000),
  ('Abscess Drainage', 'procedure', 15000),
  ('Wound Suturing', 'procedure', 3000),
  ('Minor Surgery', 'procedure', 10000),
  ('Major Surgery', 'procedure', 80000),
  ('Lipoma Excision', 'procedure', 20000),
  ('Mastectomy', 'procedure', 150000),
  ('Thyroidectomy', 'procedure', 100000),

  -- ============ ORTHOPEDIC PROCEDURES ============
  ('Fracture Reduction (Closed)', 'procedure', 15000),
  ('Fracture Fixation (ORIF)', 'procedure', 80000),
  ('Plaster Cast Application', 'procedure', 3500),
  ('POP Removal', 'procedure', 1000),
  ('Hip Replacement', 'procedure', 350000),
  ('Knee Replacement', 'procedure', 350000),
  ('Arthroscopy', 'procedure', 120000),
  ('Spine Surgery', 'procedure', 300000),

  -- ============ CARDIOLOGY PROCEDURES ============
  ('ECG (Electrocardiogram)', 'procedure', 500),
  ('Echocardiography (Echo)', 'procedure', 5000),
  ('Stress Test (TMT)', 'procedure', 4000),
  ('Holter Monitoring (24hr)', 'procedure', 6000),
  ('Angiography', 'procedure', 50000),
  ('Angioplasty (Single Stent)', 'procedure', 250000),
  ('Angioplasty (Double Stent)', 'procedure', 350000),
  ('Pacemaker Implantation', 'procedure', 300000),
  ('CABG (Bypass Surgery)', 'procedure', 600000),

  -- ============ NEPHROLOGY PROCEDURES ============
  ('Dialysis Session', 'procedure', 8000),
  ('Dialysis (Monthly Package)', 'procedure', 80000),
  ('Fistula Creation (AV Fistula)', 'procedure', 45000),
  ('Kidney Biopsy', 'procedure', 25000),
  ('Peritoneal Dialysis', 'procedure', 10000),

  -- ============ ENT PROCEDURES ============
  ('Tonsillectomy', 'procedure', 40000),
  ('Adenoidectomy', 'procedure', 35000),
  ('Septoplasty', 'procedure', 50000),
  ('Myringotomy', 'procedure', 20000),
  ('FESS (Sinus Surgery)', 'procedure', 60000),
  ('Ear Wax Removal', 'procedure', 1500),

  -- ============ OPHTHALMOLOGY PROCEDURES ============
  ('Cataract Surgery (Phaco)', 'procedure', 45000),
  ('LASIK', 'procedure', 100000),
  ('Glaucoma Surgery', 'procedure', 60000),
  ('Retinal Surgery', 'procedure', 80000),
  ('Eye Examination', 'procedure', 1000),

  -- ============ EMERGENCY PROCEDURES ============
  ('ER Registration Fee', 'procedure', 500),
  ('Resuscitation Charges', 'procedure', 25000),
  ('Nebulization', 'procedure', 500),
  ('Oxygen Therapy (per hour)', 'procedure', 200),
  ('IV Cannulation', 'procedure', 300),
  ('Urinary Catheterization', 'procedure', 1500),
  ('NG Tube Insertion', 'procedure', 1000),
  ('Stomach Wash (Gastric Lavage)', 'procedure', 3000),
  ('Injection Administration', 'procedure', 200),
  ('Dressing (Simple)', 'procedure', 500),
  ('Dressing (Complex)', 'procedure', 1500),
  ('Splint Application', 'procedure', 2000),
  ('Tracheostomy', 'procedure', 30000),
  ('Chest Tube Insertion', 'procedure', 15000),
  ('Lumbar Puncture', 'procedure', 8000)
) AS s(name, category, default_price)
WHERE NOT EXISTS (
  SELECT 1 FROM service_types st 
  WHERE st.organization_id = o.id AND st.name = s.name
);

-- Create enum for medical code types
CREATE TYPE public.medical_code_type AS ENUM ('icd10', 'cpt', 'drg');

-- Create medical_codes table
CREATE TABLE public.medical_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code_type medical_code_type NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast search
CREATE INDEX idx_medical_codes_type_code ON public.medical_codes (code_type, code);
CREATE INDEX idx_medical_codes_org ON public.medical_codes (organization_id);

-- Enable RLS
ALTER TABLE public.medical_codes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read global codes + their org codes
CREATE POLICY "Users can read medical codes" ON public.medical_codes
  FOR SELECT TO authenticated
  USING (organization_id IS NULL OR organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Allow users to insert org-specific codes
CREATE POLICY "Users can insert org medical codes" ON public.medical_codes
  FOR INSERT TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Seed common ICD-10 codes (global, org_id = NULL)
INSERT INTO public.medical_codes (organization_id, code_type, code, description, description_ar, category) VALUES
-- Infectious diseases
(NULL, 'icd10', 'A09', 'Infectious gastroenteritis and colitis', 'التهاب المعدة والأمعاء المعدي', 'Infectious'),
(NULL, 'icd10', 'A41.9', 'Sepsis, unspecified organism', 'تعفن الدم، كائن غير محدد', 'Infectious'),
(NULL, 'icd10', 'B34.9', 'Viral infection, unspecified', 'عدوى فيروسية غير محددة', 'Infectious'),
-- Endocrine
(NULL, 'icd10', 'E11', 'Type 2 diabetes mellitus', 'داء السكري من النوع الثاني', 'Endocrine'),
(NULL, 'icd10', 'E11.9', 'Type 2 DM without complications', 'داء السكري النوع 2 بدون مضاعفات', 'Endocrine'),
(NULL, 'icd10', 'E78.5', 'Dyslipidemia, unspecified', 'اضطراب شحوم الدم غير محدد', 'Endocrine'),
(NULL, 'icd10', 'E03.9', 'Hypothyroidism, unspecified', 'قصور الغدة الدرقية غير محدد', 'Endocrine'),
-- Circulatory
(NULL, 'icd10', 'I10', 'Essential (primary) hypertension', 'ارتفاع ضغط الدم الأساسي', 'Circulatory'),
(NULL, 'icd10', 'I25.10', 'Atherosclerotic heart disease', 'مرض القلب التصلبي العصيدي', 'Circulatory'),
(NULL, 'icd10', 'I48.91', 'Atrial fibrillation, unspecified', 'رجفان أذيني غير محدد', 'Circulatory'),
(NULL, 'icd10', 'I50.9', 'Heart failure, unspecified', 'فشل القلب غير محدد', 'Circulatory'),
-- Respiratory
(NULL, 'icd10', 'J06.9', 'Acute upper respiratory infection', 'عدوى الجهاز التنفسي العلوي الحادة', 'Respiratory'),
(NULL, 'icd10', 'J18.9', 'Pneumonia, unspecified organism', 'الالتهاب الرئوي، كائن غير محدد', 'Respiratory'),
(NULL, 'icd10', 'J44.1', 'COPD with acute exacerbation', 'مرض الانسداد الرئوي المزمن مع نوبة حادة', 'Respiratory'),
(NULL, 'icd10', 'J45.20', 'Mild intermittent asthma', 'ربو متقطع خفيف', 'Respiratory'),
-- Digestive
(NULL, 'icd10', 'K21.0', 'GERD with esophagitis', 'ارتجاع المريء مع التهاب', 'Digestive'),
(NULL, 'icd10', 'K35.80', 'Acute appendicitis, unspecified', 'التهاب الزائدة الدودية الحاد', 'Digestive'),
(NULL, 'icd10', 'K80.20', 'Calculus of gallbladder without obstruction', 'حصوة المرارة بدون انسداد', 'Digestive'),
(NULL, 'icd10', 'K92.2', 'Gastrointestinal hemorrhage', 'نزيف الجهاز الهضمي', 'Digestive'),
-- Musculoskeletal
(NULL, 'icd10', 'M54.5', 'Low back pain', 'ألم أسفل الظهر', 'Musculoskeletal'),
(NULL, 'icd10', 'M79.3', 'Panniculitis, unspecified', 'التهاب السبلة الشحمية', 'Musculoskeletal'),
(NULL, 'icd10', 'S72.001A', 'Fracture of unspecified part of neck of femur', 'كسر عنق الفخذ', 'Musculoskeletal'),
-- Genitourinary
(NULL, 'icd10', 'N18.9', 'Chronic kidney disease, unspecified', 'مرض الكلى المزمن غير محدد', 'Genitourinary'),
(NULL, 'icd10', 'N39.0', 'Urinary tract infection, site not specified', 'عدوى المسالك البولية', 'Genitourinary'),
-- Pregnancy
(NULL, 'icd10', 'O80', 'Single spontaneous delivery', 'ولادة طبيعية مفردة', 'Pregnancy'),
(NULL, 'icd10', 'O82', 'Cesarean delivery', 'ولادة قيصرية', 'Pregnancy'),
-- Neonatal
(NULL, 'icd10', 'P07.39', 'Preterm newborn', 'مولود خديج', 'Neonatal'),
(NULL, 'icd10', 'P59.9', 'Neonatal jaundice, unspecified', 'يرقان حديثي الولادة', 'Neonatal'),
-- Mental
(NULL, 'icd10', 'F32.9', 'Major depressive disorder, unspecified', 'اضطراب اكتئابي رئيسي غير محدد', 'Mental'),
(NULL, 'icd10', 'F41.9', 'Anxiety disorder, unspecified', 'اضطراب القلق غير محدد', 'Mental'),
-- Neoplasms
(NULL, 'icd10', 'C50.919', 'Malignant neoplasm of breast', 'ورم خبيث في الثدي', 'Neoplasms'),
(NULL, 'icd10', 'D64.9', 'Anemia, unspecified', 'فقر الدم غير محدد', 'Blood'),
-- Symptoms
(NULL, 'icd10', 'R10.9', 'Unspecified abdominal pain', 'ألم بطني غير محدد', 'Symptoms'),
(NULL, 'icd10', 'R50.9', 'Fever, unspecified', 'حمى غير محددة', 'Symptoms'),
(NULL, 'icd10', 'R51', 'Headache', 'صداع', 'Symptoms'),
-- Injury
(NULL, 'icd10', 'T78.40', 'Allergy, unspecified', 'حساسية غير محددة', 'Injury'),
(NULL, 'icd10', 'Z00.00', 'General adult medical exam', 'فحص طبي عام للبالغين', 'Factors'),
(NULL, 'icd10', 'Z23', 'Encounter for immunization', 'مراجعة للتطعيم', 'Factors'),
(NULL, 'icd10', 'Z96.1', 'Presence of intraocular lens implant', 'وجود عدسة باطن العين', 'Factors');

-- Seed common CPT codes
INSERT INTO public.medical_codes (organization_id, code_type, code, description, description_ar, category) VALUES
-- E&M
(NULL, 'cpt', '99201', 'Office visit, new patient, level 1', 'زيارة عيادة، مريض جديد، مستوى 1', 'E&M'),
(NULL, 'cpt', '99202', 'Office visit, new patient, level 2', 'زيارة عيادة، مريض جديد، مستوى 2', 'E&M'),
(NULL, 'cpt', '99213', 'Office visit, established patient, level 3', 'زيارة عيادة، مريض مراجع، مستوى 3', 'E&M'),
(NULL, 'cpt', '99214', 'Office visit, established patient, level 4', 'زيارة عيادة، مريض مراجع، مستوى 4', 'E&M'),
(NULL, 'cpt', '99281', 'Emergency department visit, level 1', 'زيارة طوارئ، مستوى 1', 'E&M'),
(NULL, 'cpt', '99283', 'Emergency department visit, level 3', 'زيارة طوارئ، مستوى 3', 'E&M'),
(NULL, 'cpt', '99285', 'Emergency department visit, level 5', 'زيارة طوارئ، مستوى 5', 'E&M'),
-- Lab
(NULL, 'cpt', '80053', 'Comprehensive metabolic panel', 'تحليل أيضي شامل', 'Laboratory'),
(NULL, 'cpt', '85025', 'Complete blood count (CBC) with differential', 'تعداد دم كامل مع تفريقي', 'Laboratory'),
(NULL, 'cpt', '81001', 'Urinalysis with microscopy', 'تحليل بول مع فحص مجهري', 'Laboratory'),
(NULL, 'cpt', '82947', 'Glucose, quantitative, blood', 'قياس الجلوكوز الكمي في الدم', 'Laboratory'),
-- Imaging
(NULL, 'cpt', '71046', 'Chest X-ray, 2 views', 'أشعة صدر، منظرين', 'Imaging'),
(NULL, 'cpt', '74177', 'CT abdomen and pelvis with contrast', 'أشعة مقطعية للبطن والحوض مع صبغة', 'Imaging'),
(NULL, 'cpt', '70553', 'MRI brain with and without contrast', 'رنين مغناطيسي للدماغ مع وبدون صبغة', 'Imaging'),
(NULL, 'cpt', '76856', 'Pelvic ultrasound, complete', 'موجات فوق صوتية للحوض، كامل', 'Imaging'),
-- Surgery
(NULL, 'cpt', '47562', 'Laparoscopic cholecystectomy', 'استئصال المرارة بالمنظار', 'Surgery'),
(NULL, 'cpt', '44970', 'Laparoscopic appendectomy', 'استئصال الزائدة بالمنظار', 'Surgery'),
(NULL, 'cpt', '27130', 'Total hip arthroplasty', 'استبدال مفصل الورك الكامل', 'Surgery'),
(NULL, 'cpt', '59510', 'Cesarean delivery', 'ولادة قيصرية', 'Surgery'),
-- Anesthesia
(NULL, 'cpt', '00100', 'Anesthesia for procedures on head', 'تخدير لإجراءات على الرأس', 'Anesthesia'),
(NULL, 'cpt', '00400', 'Anesthesia for procedures on chest', 'تخدير لإجراءات على الصدر', 'Anesthesia');

-- 1. Findings catalogue
CREATE TABLE public.dental_findings_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  cdt_code text,
  name text NOT NULL,
  name_ar text,
  name_ur text,
  category text NOT NULL DEFAULT 'other',
  color text NOT NULL DEFAULT '#dc2626',
  scope text NOT NULL DEFAULT 'both',
  is_favourite boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX dental_findings_catalog_global_key ON public.dental_findings_catalog (key) WHERE organization_id IS NULL;
CREATE UNIQUE INDEX dental_findings_catalog_org_key ON public.dental_findings_catalog (organization_id, key) WHERE organization_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_findings_catalog TO authenticated;
GRANT ALL ON public.dental_findings_catalog TO service_role;
ALTER TABLE public.dental_findings_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read findings catalog" ON public.dental_findings_catalog
  FOR SELECT TO authenticated
  USING (organization_id IS NULL OR organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Staff manage own org findings" ON public.dental_findings_catalog
  FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER trg_dental_findings_catalog_updated BEFORE UPDATE ON public.dental_findings_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Charted findings (multi-finding per tooth/surface)
CREATE TABLE public.dental_chart_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid NOT NULL,
  tooth_number integer NOT NULL,
  surface text,
  dentition text NOT NULL DEFAULT 'permanent',
  finding_key text NOT NULL,
  finding_name text,
  cdt_code text,
  color text,
  status text NOT NULL DEFAULT 'finding',
  notes text,
  charted_by uuid,
  charted_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dental_chart_findings_patient_idx ON public.dental_chart_findings (organization_id, patient_id, tooth_number);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_chart_findings TO authenticated;
GRANT ALL ON public.dental_chart_findings TO service_role;
ALTER TABLE public.dental_chart_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org staff manage chart findings" ON public.dental_chart_findings
  FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER trg_dental_chart_findings_updated BEFORE UPDATE ON public.dental_chart_findings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Speciality clinical records
CREATE TABLE public.dental_clinical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid NOT NULL,
  doctor_id uuid,
  record_type text NOT NULL,
  tooth_number integer,
  title text,
  status text NOT NULL DEFAULT 'open',
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dental_clinical_records_lookup ON public.dental_clinical_records (organization_id, patient_id, record_type);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_clinical_records TO authenticated;
GRANT ALL ON public.dental_clinical_records TO service_role;
ALTER TABLE public.dental_clinical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org staff manage dental clinical records" ON public.dental_clinical_records
  FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER trg_dental_clinical_records_updated BEFORE UPDATE ON public.dental_clinical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Consents
CREATE TABLE public.dental_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid NOT NULL,
  consent_type text NOT NULL,
  title text NOT NULL,
  body text,
  tooth_numbers text,
  signed_by_name text,
  signature_data text,
  signed_at timestamptz,
  witnessed_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_consents TO authenticated;
GRANT ALL ON public.dental_consents TO service_role;
ALTER TABLE public.dental_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org staff manage dental consents" ON public.dental_consents
  FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER trg_dental_consents_updated BEFORE UPDATE ON public.dental_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Dental lab orders
CREATE TABLE public.dental_lab_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  branch_id uuid,
  patient_id uuid NOT NULL,
  doctor_id uuid,
  lab_name text,
  work_type text NOT NULL,
  tooth_numbers text,
  shade text,
  instructions text,
  sent_date date,
  due_date date,
  received_date date,
  fitted_date date,
  cost numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_lab_orders TO authenticated;
GRANT ALL ON public.dental_lab_orders TO service_role;
ALTER TABLE public.dental_lab_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org staff manage dental lab orders" ON public.dental_lab_orders
  FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER trg_dental_lab_orders_updated BEFORE UPDATE ON public.dental_lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Seed the global findings catalogue (CDT codes)
INSERT INTO public.dental_findings_catalog (organization_id, key, cdt_code, name, name_ar, name_ur, category, color, scope, is_favourite, sort_order) VALUES
(NULL,'caries','D0601','Caries','تسوس','کیریز','diagnostic','#dc2626','surface',true,1),
(NULL,'filling_composite','D2391','Composite restoration','حشوة تجميلية','کمپوزٹ فلنگ','restorative','#60a5fa','surface',true,2),
(NULL,'filling_amalgam','D2140','Amalgam restoration','حشوة ملغم','املگم فلنگ','restorative','#64748b','surface',true,3),
(NULL,'crown','D2740','Crown','تاج','کراؤن','prosthodontic','#eab308','tooth',true,4),
(NULL,'root_canal','D3310','Root canal treatment','علاج عصب','روٹ کینال','endodontic','#ec4899','tooth',true,5),
(NULL,'missing','D0000','Missing tooth','سن مفقود','غائب دانت','diagnostic','#9ca3af','tooth',true,6),
(NULL,'healthy',NULL,'Healthy','سليم','صحت مند','diagnostic','#e8e2d5','both',false,7),
(NULL,'sealant','D1351','Sealant','مادة مانعة للتسرب','سیلنٹ','preventive','#34d399','surface',false,8),
(NULL,'fluoride','D1206','Fluoride varnish','ورنيش الفلورايد','فلورائیڈ','preventive','#22d3ee','tooth',false,9),
(NULL,'scaling','D4346','Scaling','تقليح','اسکیلنگ','periodontic','#0ea5e9','tooth',false,10),
(NULL,'fracture','D2999','Fractured tooth','سن مكسور','ٹوٹا دانت','diagnostic','#f97316','both',false,11),
(NULL,'attrition',NULL,'Attrition / wear','تآكل','گھساؤ','diagnostic','#d97706','surface',false,12),
(NULL,'abrasion',NULL,'Abrasion','تسحج','ابریشن','diagnostic','#f59e0b','surface',false,13),
(NULL,'erosion',NULL,'Erosion','تحلل','ایروژن','diagnostic','#fbbf24','surface',false,14),
(NULL,'discoloration',NULL,'Discoloration','تصبغ','رنگت کی خرابی','diagnostic','#a3a3a3','tooth',false,15),
(NULL,'inlay','D2610','Inlay','حشوة داخلية','ان لے','restorative','#38bdf8','surface',false,16),
(NULL,'onlay','D2542','Onlay','حشوة خارجية','آن لے','restorative','#0284c7','surface',false,17),
(NULL,'veneer','D2962','Veneer','قشرة تجميلية','وینیر','prosthodontic','#fcd34d','tooth',false,18),
(NULL,'bridge_pontic','D6240','Bridge pontic','جسر - سن معلق','برج پونٹک','prosthodontic','#fb923c','tooth',false,19),
(NULL,'bridge_abutment','D6740','Bridge abutment','جسر - دعامة','برج ابٹمنٹ','prosthodontic','#c2761b','tooth',false,20),
(NULL,'implant','D6010','Implant','زراعة','امپلانٹ','implantology','#a855f7','tooth',false,21),
(NULL,'implant_crown','D6058','Implant crown','تاج زرعي','امپلانٹ کراؤن','implantology','#c084fc','tooth',false,22),
(NULL,'post_core','D2954','Post and core','دعامة ولب','پوسٹ اینڈ کور','endodontic','#db2777','tooth',false,23),
(NULL,'apicoectomy','D3410','Apicoectomy','قطع ذروة الجذر','ایپیکو ایکٹومی','endodontic','#be185d','tooth',false,24),
(NULL,'pulpotomy','D3220','Pulpotomy','بتر اللب','پلپوٹومی','pediatric','#f472b6','tooth',false,25),
(NULL,'stainless_crown','D2930','Stainless steel crown','تاج فولاذي','اسٹین لیس کراؤن','pediatric','#94a3b8','tooth',false,26),
(NULL,'extraction_simple','D7140','Extraction (simple)','خلع بسيط','سادہ نکالنا','oral_surgery','#b91c1c','tooth',false,27),
(NULL,'extraction_surgical','D7210','Extraction (surgical)','خلع جراحي','سرجیکل نکالنا','oral_surgery','#991b1b','tooth',false,28),
(NULL,'to_extract',NULL,'To be extracted','مقرر خلعه','نکالا جانا ہے','oral_surgery','#ef4444','tooth',false,29),
(NULL,'extracted',NULL,'Extracted','مخلوع','نکالا گیا','oral_surgery','#6b7280','tooth',false,30),
(NULL,'impacted','D7220','Impacted tooth','سن منطمر','پھنسا دانت','oral_surgery','#7c3aed','tooth',false,31),
(NULL,'unerupted',NULL,'Unerupted','غير بازغ','غیر نمودار','diagnostic','#94a3b8','tooth',false,32),
(NULL,'supernumerary',NULL,'Supernumerary','سن زائد','اضافی دانت','diagnostic','#14b8a6','tooth',false,33),
(NULL,'mobility',NULL,'Mobility','حركة السن','دانت کی حرکت','periodontic','#0891b2','tooth',false,34),
(NULL,'recession',NULL,'Gingival recession','انحسار اللثة','مسوڑھا سکڑاؤ','periodontic','#f87171','tooth',false,35),
(NULL,'periapical_lesion',NULL,'Periapical lesion','خراج ذروي','پیری ایپیکل لیژن','endodontic','#dc2626','tooth',false,36),
(NULL,'denture_partial','D5213','Partial denture','طقم جزئي','جزوی ڈینچر','prosthodontic','#fda4af','tooth',false,37),
(NULL,'denture_complete','D5110','Complete denture','طقم كامل','مکمل ڈینچر','prosthodontic','#fecdd3','tooth',false,38),
(NULL,'ortho_bracket','D8080','Orthodontic bracket','حاصرة تقويم','بریکٹ','orthodontic','#8b5cf6','tooth',false,39),
(NULL,'space_maintainer','D1510','Space maintainer','حافظ مسافة','اسپیس مینٹینر','pediatric','#2dd4bf','tooth',false,40),
(NULL,'watch',NULL,'Watch / monitor','مراقبة','نگرانی','diagnostic','#facc15','both',false,41);
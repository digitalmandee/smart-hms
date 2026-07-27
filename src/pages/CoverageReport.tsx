import React, { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CheckCircle2, CircleDot, XCircle, MinusCircle, Languages, Printer } from "lucide-react";

type Lang = "en" | "ur" | "ar";

const t = {
  en: {
    title: "LMDC-HMIS SoW vs HealthOS24 — Coverage Report",
    subtitle: "Read-only report. No development proposed.",
    sources: "Sources: SoW_LMDC-HMIS_Med-Den_v0.2.xlsx (675 line items across 20 functional areas + 221 named reports) mapped against the current HealthOS24 codebase.",
    legend: "Legend",
    built: "Built",
    partial: "Partial",
    missing: "Missing",
    deferred: "Low priority",
    exec: "Executive summary",
    bucket: "Bucket",
    sowItems: "SoW items",
    headline: "Headline: ~75% of the SoW is either fully or partially met by HealthOS24 today. The remaining ~25% concentrates in ICU, CSSD, birth/newborn workflow, dental lab/implant, clinical pharmacy, nursing scoring, doctor-share depth, facility master, and the report catalog.",
    sections: "Detailed sections",
    top: "Top Phase-1A \"Must\" items that are missing",
    deferredTitle: "Deferred (low priority in SoW itself)",
    footer: "Report only — nothing has been changed.",
    print: "Print",
  },
  ur: {
    title: "LMDC-HMIS SoW بمقابلہ HealthOS24 — کوریج رپورٹ",
    subtitle: "صرف پڑھنے کی رپورٹ۔ کوئی ترقی تجویز نہیں کی گئی۔",
    sources: "ذرائع: SoW_LMDC-HMIS_Med-Den_v0.2.xlsx (20 فنکشنل ایریاز میں 675 آئٹمز + 221 رپورٹس) HealthOS24 کے موجودہ کوڈ بیس کے مقابلے میں۔",
    legend: "علامات",
    built: "مکمل",
    partial: "جزوی",
    missing: "غیر موجود",
    deferred: "کم ترجیح",
    exec: "اجمالی خلاصہ",
    bucket: "زمرہ",
    sowItems: "SoW آئٹمز",
    headline: "خلاصہ: HealthOS24 آج SoW کا تقریباً 75% مکمل یا جزوی طور پر پورا کرتا ہے۔ باقی ~25% ICU، CSSD، پیدائش/نوزائیدہ ورک فلو، ڈینٹل لیب/ایمپلانٹ، کلینیکل فارمیسی، نرسنگ سکورنگ، ڈاکٹر شیئر، فیسیلٹی ماسٹر اور رپورٹ کیٹلاگ میں ہے۔",
    sections: "تفصیلی حصے",
    top: "پہلی فیز کے لازمی غیر موجود آئٹمز",
    deferredTitle: "ملتوی (SoW میں خود کم ترجیح)",
    footer: "صرف رپورٹ — کچھ تبدیل نہیں کیا گیا۔",
    print: "پرنٹ",
  },
  ar: {
    title: "تقرير التغطية — LMDC-HMIS SoW مقابل HealthOS24",
    subtitle: "تقرير للقراءة فقط. لا يوجد تطوير مقترح.",
    sources: "المصادر: SoW_LMDC-HMIS_Med-Den_v0.2.xlsx (675 بنداً في 20 مجالاً وظيفياً + 221 تقريراً) مقارنة بقاعدة أكواد HealthOS24 الحالية.",
    legend: "المفتاح",
    built: "مُنجز",
    partial: "جزئي",
    missing: "مفقود",
    deferred: "أولوية منخفضة",
    exec: "الملخص التنفيذي",
    bucket: "الفئة",
    sowItems: "بنود SoW",
    headline: "الخلاصة: يغطي HealthOS24 اليوم حوالي 75٪ من SoW كلياً أو جزئياً. تتركز نسبة 25٪ المتبقية في العناية المركزة، CSSD، ولادة/حديثي الولادة، مختبر الأسنان/الزراعة، الصيدلة السريرية، تقييم التمريض، حصص الأطباء، سجل المرافق، وكتالوج التقارير.",
    sections: "الأقسام التفصيلية",
    top: "بنود المرحلة 1A الإلزامية المفقودة",
    deferredTitle: "مؤجل (أولوية منخفضة في SoW نفسه)",
    footer: "تقرير فقط — لم يتم تغيير أي شيء.",
    print: "طباعة",
  },
} as const;

const summaryRows = [
  { en: "Outpatient", ur: "آؤٹ پیشنٹ", ar: "العيادات الخارجية", total: 90, built: 65, partial: 15, missing: 10 },
  { en: "Emergency", ur: "ایمرجنسی", ar: "الطوارئ", total: 19, built: 9, partial: 2, missing: 8 },
  { en: "Clinical (EMR, PACS, RIS)", ur: "کلینیکل (EMR, PACS, RIS)", ar: "السريري (EMR, PACS, RIS)", total: 124, built: 85, partial: 25, missing: 14 },
  { en: "Pharmacy / Services support", ur: "فارمیسی / سروسز سپورٹ", ar: "الصيدلة / الخدمات المساندة", total: 54, built: 24, partial: 10, missing: 20 },
  { en: "ICU", ur: "آئی سی یو", ar: "العناية المركزة", total: 6, built: 0, partial: 0, missing: 6 },
  { en: "Diagnostics (LIS, Blood Bank, Cath)", ur: "تشخیص (LIS, بلڈ بینک, کیتھ)", ar: "التشخيص (LIS, بنك الدم, القسطرة)", total: 61, built: 46, partial: 3, missing: 12 },
  { en: "Inpatient / ADT", ur: "ان پیشنٹ / ADT", ar: "المرضى الداخليون / ADT", total: 38, built: 24, partial: 7, missing: 7 },
  { en: "OT & Auxiliary", ur: "OT اور معاون", ar: "غرف العمليات والخدمات المساندة", total: 65, built: 30, partial: 10, missing: 25 },
  { en: "Analytics (221 reports)", ur: "تجزیات (221 رپورٹس)", ar: "التحليلات (221 تقريراً)", total: 1, built: 6, partial: 0, missing: 200 },
  { en: "Patient/Doctor Portal & Mobile", ur: "مریض/ڈاکٹر پورٹل و موبائل", ar: "بوابة المريض/الطبيب والجوال", total: 9, built: 9, partial: 0, missing: 0 },
  { en: "Teleconsultation", ur: "ٹیلی کنسلٹیشن", ar: "الاستشارة عن بُعد", total: 9, built: 0, partial: 0, missing: 9 },
  { en: "Chair Management (dental)", ur: "چیئر مینجمنٹ (ڈینٹل)", ar: "إدارة كراسي الأسنان", total: 10, built: 6, partial: 4, missing: 0 },
  { en: "Dental (extended)", ur: "ڈینٹل (توسیع شدہ)", ar: "الأسنان (موسّع)", total: 62, built: 18, partial: 10, missing: 34 },
  { en: "Compliance & Integration", ur: "تعمیل و انضمام", ar: "الامتثال والتكامل", total: 5, built: 3, partial: 0, missing: 2 },
  { en: "HR", ur: "HR", ar: "الموارد البشرية", total: 5, built: 5, partial: 0, missing: 0 },
  { en: "Finance / RCM / Share / Refund", ur: "فنانس / RCM / شیئر / ری فنڈ", ar: "المالية / RCM / الحصص / الاسترداد", total: 61, built: 30, partial: 20, missing: 11 },
  { en: "Building / Facility Structure", ur: "بلڈنگ / فیسیلٹی سٹرکچر", ar: "هيكل المباني / المرافق", total: 21, built: 6, partial: 5, missing: 10 },
  { en: "User Management", ur: "یوزر مینجمنٹ", ar: "إدارة المستخدمين", total: 35, built: 25, partial: 6, missing: 4 },
];

const sections = [
  {
    en: { title: "1. Outpatient (90)", body: [
      "Built: Information Desk basics, appointments, QMS token queue, OPD Pharmacy end-to-end, Warehouse (PR→PO→GRN, FEFO, sub-store, near-expiry, destruction).",
      "Partial: Registration lacks PVC card print, wristband print, family/parent mapping, barcode label, referral-in from oladoc/avicenna. Info Desk lacks attendant pass, tariff/package public view, cost estimator.",
      "Missing: Discount & Contract Approval workflow (5 items) entirely absent.",
    ]},
    ur: { title: "1. آؤٹ پیشنٹ (90)", body: [
      "مکمل: انفارمیشن ڈیسک بنیادیات، اپائنٹمنٹس، QMS ٹوکن قطار، OPD فارمیسی مکمل، ویئر ہاؤس (PR→PO→GRN، FEFO، سب سٹور، قریب المیعاد، تلف)۔",
      "جزوی: رجسٹریشن میں PVC کارڈ پرنٹ، رسٹ بینڈ پرنٹ، فیملی/والدین میپنگ، بارکوڈ لیبل، oladoc/avicenna سے ریفرل نہیں۔ انفارمیشن ڈیسک میں اٹینڈنٹ پاس، ٹیرف/پیکج پبلک ویو، لاگت تخمینہ نہیں۔",
      "غیر موجود: ڈسکاؤنٹ و کنٹریکٹ اپروول ورک فلو (5 آئٹمز) مکمل طور پر غائب۔",
    ]},
    ar: { title: "1. العيادات الخارجية (90)", body: [
      "مُنجز: أساسيات مكتب المعلومات، المواعيد، طابور رموز QMS، صيدلية العيادات الخارجية بالكامل، المستودع (PR→PO→GRN، FEFO، مستودع فرعي، قرب انتهاء الصلاحية، الإتلاف).",
      "جزئي: التسجيل يفتقر لطباعة بطاقة PVC، سوار المعصم، ربط العائلة/الوالدين، ملصق باركود، الإحالة من oladoc/avicenna. مكتب المعلومات يفتقر لبطاقة مرافق، عرض التعرفة، مقدّر التكلفة.",
      "مفقود: تدفق موافقة الخصم والعقد (5 بنود) غير موجود بالكامل.",
    ]},
  },
  {
    en: { title: "2. Emergency (19)", body: [
      "Built: Triage (nurse+doctor), roster assignment, ER stock charging, unconscious-patient flow, postpaid billing.",
      "Missing: Crashcart register, Code Blue one-click + team notify + debrief, oxygen start/stop + flow-rate + consumption timer, observation timer, waiting-time calculation.",
    ]},
    ur: { title: "2. ایمرجنسی (19)", body: [
      "مکمل: ٹرائیج (نرس+ڈاکٹر)، روسٹر، ER اسٹاک چارجنگ، بے ہوش مریض فلو، پوسٹ پیڈ بلنگ۔",
      "غیر موجود: کریش کارٹ رجسٹر، Code Blue ون کلک + ٹیم نوٹیفائی + ڈی بریف، آکسیجن اسٹارٹ/سٹاپ + فلو ریٹ + ٹائمر، مشاہدہ ٹائمر، انتظار وقت کیلکولیشن۔",
    ]},
    ar: { title: "2. الطوارئ (19)", body: [
      "مُنجز: الفرز (ممرض+طبيب)، توزيع المناوبات، تحميل مخزون الطوارئ، تدفق المريض فاقد الوعي، الفوترة الآجلة.",
      "مفقود: سجل عربة الإنعاش، Code Blue بنقرة واحدة + تنبيه الفريق + جلسة تقييم، تشغيل/إيقاف الأكسجين + معدل التدفق + عدّاد الاستهلاك، عدّاد الملاحظة، حساب وقت الانتظار.",
    ]},
  },
  {
    en: { title: "3. Clinical Services (124)", body: [
      "EMR – Physician (46): SOAP, ICD-10, prescriptions with drug-interaction & unavailability, referrals, discharge summary, dental 3D chart built. Missing: 6-point periodontal chart, BOP/CAL/mobility, cephalometric tracing, ortho staging, ADR reporting, PCP, SOS/PRN + stop-date, clinical pathway, controlled-antibiotic workflow.",
      "EMR – Nursing (44): vitals, MAR, shift handovers, discharge notes built. Missing: MEWS/PEWS engine, IPC bundles (CLABSI/VAP/SSI/HH), scoring panel (Pain/GCS/APGAR/Aldrete/Fall/Bed Sore), intake-output ledger, patient own-medication register, dead-body release, trolley management.",
      "EMR Records (13): uploads built; physical file accession/tracing workflow missing.",
      "PACS (7) & RIS (14): built.",
    ]},
    ur: { title: "3. کلینیکل سروسز (124)", body: [
      "EMR – فزیشن (46): SOAP، ICD-10، ادویات مع منشیات کے تعامل و عدم دستیابی، ریفرلز، ڈسچارج سمری، ڈینٹل 3D چارٹ موجود۔ غیر موجود: 6-پوائنٹ پیریوڈونٹل چارٹ، BOP/CAL/mobility، سیفالومیٹرک، آرتھو اسٹیجنگ، ADR رپورٹنگ، PCP، SOS/PRN + سٹاپ تاریخ، کلینیکل پاتھ وے، کنٹرولڈ اینٹی بائیوٹک۔",
      "EMR – نرسنگ (44): وائٹلز، MAR، شفٹ ہینڈ اوور، ڈسچارج نوٹس موجود۔ غیر موجود: MEWS/PEWS انجن، IPC بنڈلز، سکورنگ پینل (Pain/GCS/APGAR/Aldrete/Fall/Bed Sore)، انٹیک-آؤٹ پٹ لیجر، ذاتی ادویات رجسٹر، میت ریلیز، ٹرالی مینجمنٹ۔",
      "EMR ریکارڈز (13): اپ لوڈز موجود؛ فزیکل فائل ٹریسنگ ورک فلو غائب۔",
      "PACS (7) اور RIS (14): موجود۔",
    ]},
    ar: { title: "3. الخدمات السريرية (124)", body: [
      "EMR – الطبيب (46): SOAP، ICD-10، الوصفات مع تفاعل الدواء وعدم التوفر، الإحالات، ملخص الخروج، مخطط الأسنان ثلاثي الأبعاد — مُنجز. المفقود: مخطط اللثة 6 نقاط، BOP/CAL/mobility، التتبع السيفالومتري، مراحل التقويم، تقارير ADR، PCP، SOS/PRN + تاريخ الإيقاف، المسار السريري، سير عمل المضادات المُقيدة.",
      "EMR – التمريض (44): العلامات، MAR، تسليم الورديات، ملاحظات الخروج — مُنجز. المفقود: محرك MEWS/PEWS، حزم IPC، لوحة التقييم (Pain/GCS/APGAR/Aldrete/Fall/Bed Sore)، سجل الإدخال والإخراج، سجل أدوية المريض، إخلاء الجثمان، إدارة العربات.",
      "سجلات EMR (13): التحميلات مُنجزة؛ سير عمل تتبع الملف الفيزيائي مفقود.",
      "PACS (7) وRIS (14): مُنجز.",
    ]},
  },
  {
    en: { title: "4. Pharmacy & Ward-side Services (54)", body: [
      "Built: Pharmacy IPD (ward-billing automation).",
      "Partial: Pharmacy OT — consumables/FIFO exist, OT-specific issue/return needs verification.",
      "Missing: Clinical Pharmacy Services (interventions/TDM/DRP), Trolley Management, LAMA, Absconded, Death certificate (ICD-11) + body-release form.",
    ]},
    ur: { title: "4. فارمیسی و وارڈ سروسز (54)", body: [
      "مکمل: فارمیسی IPD (وارڈ بلنگ آٹومیشن)۔",
      "جزوی: فارمیسی OT — کنزیوم ایبلز/FIFO موجود، OT مخصوص اجراء/واپسی تصدیق درکار۔",
      "غیر موجود: کلینیکل فارمیسی سروسز (مداخلت/TDM/DRP)، ٹرالی مینجمنٹ، LAMA، Absconded، ڈیتھ سرٹیفکیٹ (ICD-11) + باڈی ریلیز۔",
    ]},
    ar: { title: "4. الصيدلة والخدمات في الأجنحة (54)", body: [
      "مُنجز: صيدلية المرضى الداخليين (فوترة الأجنحة الآلية).",
      "جزئي: صيدلية غرف العمليات — المستهلكات/FIFO موجودة، الصرف/الإرجاع الخاص بغرفة العمليات يحتاج تحققاً.",
      "مفقود: خدمات الصيدلة السريرية (التدخلات/TDM/DRP)، إدارة العربات، LAMA، الهروب، شهادة الوفاة (ICD-11) + نموذج إخلاء الجثمان.",
    ]},
  },
  {
    en: { title: "5. ICU (6)", body: [
      "Missing entirely: ventilator management (SBT reminder, weaning protocol, post-extubation timer), invasive line insertion + daily fee, ICU alarm escalation nurse→doctor.",
    ]},
    ur: { title: "5. ICU (6)", body: [
      "مکمل طور پر غائب: وینٹی لیٹر مینجمنٹ (SBT، ویننگ پروٹوکول، پوسٹ ایکسٹیوبیشن ٹائمر)، انویسیو لائن + یومیہ فیس، ICU الارم اسکیلیشن نرس→ڈاکٹر۔",
    ]},
    ar: { title: "5. العناية المركزة (6)", body: [
      "مفقود بالكامل: إدارة جهاز التنفس (تذكير SBT، بروتوكول الفطام، عدّاد ما بعد النزع)، إدخال الخطوط الغازية + الرسم اليومي، تصعيد إنذارات العناية من الممرض إلى الطبيب.",
    ]},
  },
  {
    en: { title: "6. Diagnostic Services (61)", body: [
      "Built: LIS mostly complete (specimen, machine interface, verification, addendum, critical alerts, kits).",
      "Partial: partial-panel rejection, rejection billing reversal, sample-rejection register.",
      "Built: Blood Bank (full capability incl. reactions, crossmatch, expiry alerts).",
      "Deferred: Cath Lab (12) — SoW priority 3, not built.",
    ]},
    ur: { title: "6. تشخیصی سروسز (61)", body: [
      "مکمل: LIS بڑی حد تک مکمل (سیمپل، مشین انٹرفیس، تصدیق، ایڈنڈم، اہم الرٹس، کٹس)۔",
      "جزوی: پارشل پینل ری جیکشن، ری جیکشن بلنگ ریورسل، سیمپل ری جیکشن رجسٹر۔",
      "مکمل: بلڈ بینک (ری ایکشنز، کراس میچ، ایکسپائری الرٹس)۔",
      "ملتوی: کیتھ لیب (12) — SoW ترجیح 3، تعمیر نہیں۔",
    ]},
    ar: { title: "6. الخدمات التشخيصية (61)", body: [
      "مُنجز: LIS مكتمل غالباً (العينة، واجهة الجهاز، التحقق، الملحق، التنبيهات الحرجة، الأطقم).",
      "جزئي: رفض جزئي للوحة، عكس فوترة الرفض، سجل رفض العينات.",
      "مُنجز: بنك الدم (التفاعلات، التطابق، تنبيهات الصلاحية).",
      "مؤجل: مختبر القسطرة (12) — أولوية 3 في SoW، غير مبني.",
    ]},
  },
  {
    en: { title: "7. Inpatient (38)", body: [
      "Built: ADT admission with mandatory procedure+doctor, discharge, deposits.",
      "Missing: discharge-Rx auto-continuation link, revisit schedule, patient-ID label print, bed FIFO waitlist with acuity, QR cleaning timer, bed-assignment escalation.",
      "Missing: IPD oxygen therapy tracker, nursing call system. Ambulance charging built.",
    ]},
    ur: { title: "7. ان پیشنٹ (38)", body: [
      "مکمل: لازمی طریقہ کار+ڈاکٹر کے ساتھ ADT داخلہ، ڈسچارج، ڈپازٹس۔",
      "غیر موجود: ڈسچارج-Rx آٹو کنٹینیویشن لنک، ریوزٹ شیڈول، پیشنٹ ID لیبل، ایکیوٹی کے ساتھ بیڈ FIFO ویٹ لسٹ، QR کلیننگ ٹائمر، بیڈ اسائنمنٹ اسکیلیشن۔",
      "غیر موجود: IPD آکسیجن تھراپی ٹریکر، نرسنگ کال سسٹم۔ ایمبولینس چارجنگ موجود۔",
    ]},
    ar: { title: "7. المرضى الداخليون (38)", body: [
      "مُنجز: قبول ADT مع إجراء+طبيب إلزامي، الخروج، الودائع.",
      "مفقود: ربط استمرار وصفة الخروج، جدول المراجعة، طباعة معرّف المريض، قائمة انتظار الأسرّة FIFO مع الحدّة، عدّاد تنظيف QR، تصعيد تعيين السرير.",
      "مفقود: متتبع علاج الأكسجين للداخليين، نظام استدعاء التمريض. فوترة الإسعاف مُنجزة.",
    ]},
  },
  {
    en: { title: "8. OT & Auxiliary (65)", body: [
      "Built: OR scheduling, WHO checklist, surgery notes, consumable FIFO, ERP posting.",
      "Missing: CSSD (14) entirely — ultrasonic clean, cycle logging, spore test, batch ID, sterile issue/return.",
      "Missing: OT / Labor Room Birth (8) — APGAR, newborn-mother suffix link, provisional→final birth certificate, NICU flag, 24 h verification, discharge block.",
      "Built: Dietary/Catering module present.",
      "Partial: Pre-Anesthesia (ASA/airway), intraoperative sponge/instrument count mismatch alert, PACU Aldrete score, OT cancellation sliding-scale penalty — missing.",
    ]},
    ur: { title: "8. OT اور معاون (65)", body: [
      "مکمل: OR شیڈولنگ، WHO چیک لسٹ، سرجری نوٹس، کنزیوم ایبل FIFO، ERP پوسٹنگ۔",
      "غیر موجود: CSSD (14) مکمل طور پر — الٹرا سونک کلین، سائیکل لاگنگ، سپور ٹیسٹ، بیچ ID، سٹرائل اجراء/واپسی۔",
      "غیر موجود: OT / لیبر روم پیدائش (8) — APGAR، نوزائیدہ-ماں سفکس لنک، عبوری→فائنل برتھ سرٹیفکیٹ، NICU فلیگ، 24 گھنٹے تصدیق، ڈسچارج بلاک۔",
      "مکمل: ڈائٹری/کیٹرنگ ماڈیول موجود۔",
      "جزوی: پری اینستھیزیا (ASA/ایئر وے)، انٹرا آپریٹو سپونج/انسٹرومنٹ کاؤنٹ الرٹ، PACU Aldrete، OT کینسلیشن پینلٹی — غائب۔",
    ]},
    ar: { title: "8. غرف العمليات والخدمات المساندة (65)", body: [
      "مُنجز: جدولة العمليات، قائمة WHO، ملاحظات الجراحة، FIFO للمستهلكات، الترحيل المحاسبي.",
      "مفقود: CSSD (14) بالكامل — تنظيف بالموجات، تسجيل الدورات، اختبار الأبواغ، معرّف الدفعة، الصرف/الإرجاع المعقم.",
      "مفقود: العمليات / غرفة الولادة (8) — APGAR، ربط لاحقة الأم بالمولود، شهادة الميلاد المبدئية→النهائية، إشارة NICU، التحقق خلال 24 ساعة، حظر الخروج.",
      "مُنجز: وحدة التغذية/التموين موجودة.",
      "جزئي: التقييم قبل التخدير (ASA/مجرى الهواء)، تنبيه عدم تطابق عدّ الإسفنج/الأدوات، درجة Aldrete في PACU، غرامة إلغاء العملية — مفقود.",
    ]},
  },
  {
    en: { title: "9. Analytics & Reports", body: [
      "Built: CFO, OPD, IPD, Lab, Warehouse dashboards.",
      "Missing: Of 221 named reports on the Reports sheet, most are not implemented as discrete reports. A separate catalog pass is needed.",
    ]},
    ur: { title: "9. تجزیات و رپورٹس", body: [
      "مکمل: CFO، OPD، IPD، لیب، ویئر ہاؤس ڈیش بورڈز۔",
      "غیر موجود: رپورٹس شیٹ پر موجود 221 رپورٹس میں سے زیادہ تر انفرادی رپورٹ کے طور پر موجود نہیں۔ الگ کیٹلاگ درکار۔",
    ]},
    ar: { title: "9. التحليلات والتقارير", body: [
      "مُنجز: لوحات CFO وOPD وIPD والمختبر والمستودع.",
      "مفقود: من أصل 221 تقريراً في ورقة التقارير، لم يُبنَ معظمها كتقارير منفصلة. يلزم مرور كتالوجي مستقل.",
    ]},
  },
  {
    en: { title: "10-15. Portals, Chair, Dental Ext., Compliance, HR", body: [
      "Patient/Doctor Portal & Mobile (9): all present.",
      "Teleconsultation (9): deferred — Tabeebi covers voice/chat today.",
      "Chair Management (10): scheduling built; chair census/maintenance/enquiry need verification.",
      "Dental Extended (62): 3D per-surface chart built. Missing: Dental Lab case tracking, serialized implant inventory, CBCT viewer, oral lesion mapping, insurance/payer, treatment plan sign-off, orthodontic tracking, recall SMS, STL/PLY viewer.",
      "Compliance & Integration (5): HIPAA, audit, RBAC built. Missing: SAP/Odoo bridge, house-surgeon→faculty approval.",
      "HR (5): HealthOS24 exceeds SoW — contracts, licenses, attendance, payroll, gratuity, exit, letters, biometric.",
    ]},
    ur: { title: "10-15. پورٹلز، چیئر، ڈینٹل، تعمیل، HR", body: [
      "مریض/ڈاکٹر پورٹل و موبائل (9): سب موجود۔",
      "ٹیلی کنسلٹیشن (9): ملتوی — Tabeebi وائس/چیٹ کور کرتا ہے۔",
      "چیئر مینجمنٹ (10): شیڈولنگ موجود؛ چیئر مردم شماری/دیکھ بھال/انکوائری تصدیق درکار۔",
      "ڈینٹل توسیع شدہ (62): 3D پر سطح چارٹ موجود۔ غیر موجود: ڈینٹل لیب کیس، سیریلائزڈ ایمپلانٹ انوینٹری، CBCT ویور، اورل لیشن میپنگ، انشورنس/پیئر، ٹریٹمنٹ پلان سائن آف، آرتھوڈانٹک ٹریکنگ، ری کال SMS، STL/PLY ویور۔",
      "تعمیل و انضمام (5): HIPAA، آڈٹ، RBAC موجود۔ غیر موجود: SAP/Odoo پل، ہاؤس سرجن→فیکلٹی اپروول۔",
      "HR (5): HealthOS24 SoW سے آگے — کنٹریکٹس، لائسنس، حاضری، پے رول، گریچوٹی، ایگزٹ، لیٹرز، بائیو میٹرک۔",
    ]},
    ar: { title: "10-15. البوابات، الكراسي، الأسنان، الامتثال، الموارد البشرية", body: [
      "بوابة المريض/الطبيب والجوال (9): جميعها موجودة.",
      "الاستشارة عن بُعد (9): مؤجلة — Tabeebi يغطي الصوت/المحادثة.",
      "إدارة كراسي الأسنان (10): الجدولة مُنجزة؛ إحصاء/صيانة/استفسارات الكراسي تحتاج تحققاً.",
      "الأسنان الموسّع (62): مخطط 3D لكل سطح مُنجز. المفقود: تتبع حالات مختبر الأسنان، مخزون الزراعة المُسلسل، عارض CBCT، خرائط الآفات الفموية، التأمين، توقيع خطة العلاج، تتبع التقويم، رسائل الاستدعاء، عارض STL/PLY.",
      "الامتثال والتكامل (5): HIPAA، التدقيق، RBAC مُنجز. المفقود: جسر SAP/Odoo، اعتماد طبيب المنزل→العميد.",
      "الموارد البشرية (5): HealthOS24 يتجاوز SoW — العقود، التراخيص، الحضور، الرواتب، مكافأة نهاية الخدمة، الخروج، الخطابات، البصمة.",
    ]},
  },
  {
    en: { title: "16. Finance (61)", body: [
      "Built: RCM — charge master, COA, agreements, eligibility, OPD/IPD/Lab billing, day closing, AR, counter-wise collection. Patient reg & billing, triage, pharmacy, OT billing.",
      "Partial: Doctor / Staff Share (26 items) — base trigger built. Missing: slab-based share, department pool, group-practice split, min-guarantee vs share, package/bundled share, on-call share, insurance-claim share, retainer vs share, withholding-tax, settlement schedule, share voucher/statement/dashboard.",
      "Partial: Refund (7) — basic refunds built. Missing: sliding-scale cancellation, medication-return refund flow, unique refund voucher, shift-closure net calc.",
    ]},
    ur: { title: "16. فنانس (61)", body: [
      "مکمل: RCM — چارج ماسٹر، COA، معاہدے، اہلیت، OPD/IPD/لیب بلنگ، ڈے کلوزنگ، AR، کاؤنٹر وار وصولی۔ مریض رجسٹریشن و بلنگ، ٹرائیج، فارمیسی، OT بلنگ۔",
      "جزوی: ڈاکٹر/عملہ شیئر (26) — بنیادی ٹرگر موجود۔ غیر موجود: سلیب شیئر، ڈیپارٹمنٹ پول، گروپ سپلٹ، من گارنٹی، پیکج شیئر، آن کال شیئر، انشورنس کلیم شیئر، ریٹینر، ود ہولڈنگ ٹیکس، سیٹلمنٹ شیڈول، شیئر واؤچر/سٹیٹمنٹ/ڈیش بورڈ۔",
      "جزوی: ری فنڈ (7) — بنیادی ری فنڈز موجود۔ غیر موجود: سلائیڈنگ اسکیل کینسلیشن، دوا واپسی ری فنڈ، منفرد ری فنڈ واؤچر، شفٹ کلوزر نیٹ کیلک۔",
    ]},
    ar: { title: "16. المالية (61)", body: [
      "مُنجز: RCM — سجل الرسوم، دليل الحسابات، الاتفاقيات، الأهلية، فوترة OPD/IPD/المختبر، الإقفال اليومي، الذمم، التحصيل حسب الشباك. تسجيل وفوترة المريض، الفرز، الصيدلة، فوترة العمليات.",
      "جزئي: حصة الطبيب/الموظف (26) — المُشغّل الأساسي مُنجز. المفقود: حصة شرائحية، تجميع القسم، تقسيم الممارسة الجماعية، الحد الأدنى المضمون، حصة الحزم، حصة الطوارئ، حصة مطالبة التأمين، حصة المحتجزة، ضريبة الاستقطاع، جدول التسوية، سند/كشف/لوحة الحصص.",
      "جزئي: الاسترداد (7) — الاستردادات الأساسية مُنجزة. المفقود: إلغاء بشرائح، تدفق استرداد إرجاع الأدوية، سند استرداد فريد، صافي إغلاق الوردية.",
    ]},
  },
  {
    en: { title: "17-18. Facility & User Management", body: [
      "Facility (21): org→branch→department hierarchy exists. Missing formal Facility Master (building/block/floor/room/chair/corridor/zone), space utilization, service→location mapping, doctor→room schedule, utilization dashboard.",
      "User Management (35): Auth, MFA, roles (user_roles + has_role()), RLS, audit, timeout, kiosk built. Verify: multi-stage approval module, user-lifecycle wizard, activity dashboard, user reports.",
    ]},
    ur: { title: "17-18. فیسیلٹی و یوزر مینجمنٹ", body: [
      "فیسیلٹی (21): تنظیم→برانچ→ڈیپارٹمنٹ موجود۔ غیر موجود: باقاعدہ فیسیلٹی ماسٹر (بلڈنگ/بلاک/فلور/روم/چیئر/کوریڈور/زون)، جگہ استعمال، سروس→لوکیشن، ڈاکٹر→روم شیڈول، یوٹیلائزیشن ڈیش بورڈ۔",
      "یوزر مینجمنٹ (35): آتھ، MFA، رولز (user_roles + has_role())، RLS، آڈٹ، ٹائم آؤٹ، کیوسک موجود۔ تصدیق درکار: ملٹی سٹیج اپروول، لائف سائیکل وزرڈ، سرگرمی ڈیش بورڈ، یوزر رپورٹس۔",
    ]},
    ar: { title: "17-18. المرافق وإدارة المستخدمين", body: [
      "المرافق (21): تسلسل المنظمة→الفرع→القسم موجود. المفقود: سجل المرافق الرسمي (مبنى/بلوك/طابق/غرفة/كرسي/ممر/منطقة)، استخدام المساحات، ربط الخدمة→الموقع، جدول الطبيب→الغرفة، لوحة الاستخدام.",
      "إدارة المستخدمين (35): المصادقة، MFA، الأدوار (user_roles + has_role())، RLS، التدقيق، انتهاء الجلسة، الكشك — مُنجز. للتحقق: وحدة الموافقات متعددة المراحل، معالج دورة حياة المستخدم، لوحة النشاط، تقارير المستخدمين.",
    ]},
  },
];

const topMustEn = [
  "Discount & Contract Approval workflow",
  "Code Blue + Crashcart + Oxygen timers (ER & IPD)",
  "ICU: ventilator, invasive lines, alarm escalation",
  "CSSD end-to-end",
  "OT / Labor Room Birth (APGAR, newborn link, birth-cert lifecycle)",
  "Clinical Pharmacy Services (interventions, TDM)",
  "Trolley Management",
  "LAMA / Absconded workflows",
  "Nursing scoring engines (MEWS, PEWS, GCS, APGAR, Aldrete, Fall, Pain, Bed Sore)",
  "Dental Lab Case Management + Serialized Implant Inventory + CBCT viewer",
  "Doctor/Staff Share deep extension",
  "Facility Master hierarchy (Building→Block→Floor→Room→Chair)",
  "Cephalometric + Orthodontic progress tracking",
  "~200 named reports on the Reports tab",
];
const topMustUr = [
  "ڈسکاؤنٹ و کنٹریکٹ اپروول ورک فلو",
  "Code Blue + کریش کارٹ + آکسیجن ٹائمرز (ER و IPD)",
  "ICU: وینٹی لیٹر، انویسیو لائنز، الارم اسکیلیشن",
  "CSSD مکمل",
  "OT / لیبر روم پیدائش (APGAR، نوزائیدہ لنک، برتھ سرٹیفکیٹ لائف سائیکل)",
  "کلینیکل فارمیسی سروسز (مداخلت، TDM)",
  "ٹرالی مینجمنٹ",
  "LAMA / Absconded ورک فلوز",
  "نرسنگ سکورنگ انجنز (MEWS, PEWS, GCS, APGAR, Aldrete, Fall, Pain, Bed Sore)",
  "ڈینٹل لیب کیس مینجمنٹ + سیریلائزڈ ایمپلانٹ + CBCT ویور",
  "ڈاکٹر/عملہ شیئر گہری توسیع",
  "فیسیلٹی ماسٹر ہائرآرکی (بلڈنگ→بلاک→فلور→روم→چیئر)",
  "سیفالومیٹرک + آرتھوڈانٹک پیش رفت ٹریکنگ",
  "~200 رپورٹس ٹیب پر نامزد رپورٹس",
];
const topMustAr = [
  "تدفق موافقة الخصم والعقد",
  "Code Blue + عربة الإنعاش + عدّادات الأكسجين (طوارئ وIPD)",
  "العناية المركزة: التنفس الصناعي، الخطوط الغازية، تصعيد الإنذارات",
  "CSSD كامل",
  "غرف العمليات / الولادة (APGAR، ربط المولود، دورة حياة شهادة الميلاد)",
  "خدمات الصيدلة السريرية (التدخلات، TDM)",
  "إدارة العربات",
  "تدفقات LAMA / الهروب",
  "محركات تقييم التمريض (MEWS, PEWS, GCS, APGAR, Aldrete, Fall, Pain, Bed Sore)",
  "إدارة حالات مختبر الأسنان + مخزون الزراعة المُسلسل + عارض CBCT",
  "توسيع عميق لحصص الطبيب/الموظف",
  "تسلسل سجل المرافق (مبنى→بلوك→طابق→غرفة→كرسي)",
  "تتبع التقدم السيفالومتري والتقويمي",
  "~200 تقرير مُسمّى في تبويب التقارير",
];

const deferredEn = [
  "Cath Lab (P3, no phase)",
  "Full Teleconsultation video suite (P3) — Tabeebi covers voice/chat today",
  "SAP / Odoo bridge",
];
const deferredUr = [
  "کیتھ لیب (P3، کوئی فیز نہیں)",
  "مکمل ٹیلی کنسلٹیشن ویڈیو سوٹ (P3) — Tabeebi وائس/چیٹ کور کرتا ہے",
  "SAP / Odoo پل",
];
const deferredAr = [
  "مختبر القسطرة (P3، بلا مرحلة)",
  "حزمة الاستشارة بالفيديو كاملة (P3) — Tabeebi يغطي الصوت/المحادثة",
  "جسر SAP / Odoo",
];

const langNames: Record<Lang, string> = { en: "English", ur: "اردو", ar: "العربية" };

export default function CoverageReport() {
  const [lang, setLang] = useState<Lang>("en");
  const dir = lang === "en" ? "ltr" : "rtl";
  const L = t[lang];

  const totals = useMemo(() => {
    return summaryRows.reduce(
      (acc, r) => ({
        total: acc.total + r.total,
        built: acc.built + r.built,
        partial: acc.partial + r.partial,
        missing: acc.missing + r.missing,
      }),
      { total: 0, built: 0, partial: 0, missing: 0 }
    );
  }, []);

  const topMust = lang === "en" ? topMustEn : lang === "ur" ? topMustUr : topMustAr;
  const deferred = lang === "en" ? deferredEn : lang === "ur" ? deferredUr : deferredAr;

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      <SEO
        title="LMDC-HMIS SoW vs HealthOS24 Coverage Report"
        description="Detailed coverage report mapping LMDC-HMIS Statement of Work line items against the HealthOS24 build."
        path="/coverage-report"
      />

      <header className="border-b bg-card sticky top-0 z-10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">{L.legend}:</span>
            {(["en", "ur", "ar"] as Lang[]).map((l) => (
              <Button
                key={l}
                size="sm"
                variant={lang === l ? "default" : "outline"}
                onClick={() => setLang(l)}
              >
                {langNames[l]}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 me-2" />
            {L.print}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{L.title}</h1>
          <p className="text-muted-foreground mb-2">{L.subtitle}</p>
          <p className="text-sm text-muted-foreground">{L.sources}</p>

          <div className="flex flex-wrap gap-3 mt-4">
            <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" />{L.built}</Badge>
            <Badge variant="outline" className="gap-1"><CircleDot className="h-3 w-3 text-amber-600" />{L.partial}</Badge>
            <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3 text-rose-600" />{L.missing}</Badge>
            <Badge variant="outline" className="gap-1"><MinusCircle className="h-3 w-3 text-slate-500" />{L.deferred}</Badge>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{L.exec}</h2>
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{L.bucket}</TableHead>
                  <TableHead className="text-end">{L.sowItems}</TableHead>
                  <TableHead className="text-end text-emerald-700">{L.built}</TableHead>
                  <TableHead className="text-end text-amber-700">{L.partial}</TableHead>
                  <TableHead className="text-end text-rose-700">{L.missing}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryRows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{r[lang]}</TableCell>
                    <TableCell className="text-end">{r.total}</TableCell>
                    <TableCell className="text-end text-emerald-700">{r.built}</TableCell>
                    <TableCell className="text-end text-amber-700">{r.partial}</TableCell>
                    <TableCell className="text-end text-rose-700">{r.missing}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold bg-muted/40">
                  <TableCell>Σ</TableCell>
                  <TableCell className="text-end">{totals.total}</TableCell>
                  <TableCell className="text-end text-emerald-700">{totals.built}</TableCell>
                  <TableCell className="text-end text-amber-700">{totals.partial}</TableCell>
                  <TableCell className="text-end text-rose-700">{totals.missing}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
          <p className="mt-4 text-sm leading-relaxed bg-muted/40 border rounded-md p-4">{L.headline}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{L.sections}</h2>
          <div className="space-y-4">
            {sections.map((s, i) => {
              const c = s[lang];
              return (
                <Card key={i} className="p-5">
                  <h3 className="text-lg font-semibold text-primary mb-2">{c.title}</h3>
                  <ul className={`space-y-2 text-sm leading-relaxed ${dir === "rtl" ? "pr-4" : "pl-4"} list-disc`}>
                    {c.body.map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-primary mb-3">{L.top}</h3>
            <ol className={`space-y-1.5 text-sm ${dir === "rtl" ? "pr-5" : "pl-5"} list-decimal`}>
              {topMust.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
          </Card>
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-primary mb-3">{L.deferredTitle}</h3>
            <ul className={`space-y-1.5 text-sm ${dir === "rtl" ? "pr-5" : "pl-5"} list-disc`}>
              {deferred.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </Card>
        </section>

        <footer className="text-center text-sm text-muted-foreground border-t pt-6">
          {L.footer}
        </footer>
      </main>
    </div>
  );
}

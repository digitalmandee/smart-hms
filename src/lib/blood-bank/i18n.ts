import { useTranslation } from "@/lib/i18n";

type Dict = Record<string, string>;

const en: Dict = {
  startDonation: "Start New Donation", startDonationDesc: "Check eligibility, then register the donation",
  back: "Back", backToDonations: "Back to Donations", donorSelection: "Donor Selection", registerDonor: "Register New Donor",
  searchDonors: "Search donors by name, phone, or donor number...", noActiveDonors: "No active donors found",
  change: "Change", lastDonation: "Last donation", donations: "donations",
  donationDetails: "Donation Details", donationDate: "Donation Date", donationTime: "Donation Time", donationType: "Donation Type",
  hb: "Hemoglobin (g/dL)", weight: "Weight (kg)", bagNumber: "Bag Number", volume: "Volume Collected (ml)",
  bp: "Blood Pressure", pulse: "Pulse", temp: "Temperature (°C)", resp: "Respiration",
  questionnaire: "Donor Health Questionnaire", notes: "Notes", cancel: "Cancel", saving: "Saving...",
  checkEligibility: "Check eligibility", eligible: "Donor is eligible", notEligible: "Donor is not eligible",
  deferDonor: "Defer donor", deferredFor: "Donor deferred for {n} days", startBtn: "Start Donation",
  q_feeling_well: "Feeling well and healthy today", q_recent_illness: "Fever, cold or illness in the last 2 weeks",
  q_antibiotics: "Took antibiotics in the last 7 days", q_malaria_travel: "Malaria or travel to a malaria area in the last 3 months",
  q_tattoo_piercing: "Tattoo, piercing or acupuncture in the last 6 months", q_pregnancy: "Pregnant, or gave birth in the last 6 months",
  q_recent_surgery: "Surgery or blood transfusion in the last 6 months", q_high_risk: "Any high-risk exposure (hepatitis/HIV contact, injecting drugs)",
  r_permanently_deferred: "Permanently deferred", r_deferred_until: "Still within a deferral period", r_age: "Age must be 18–60",
  r_weight: "Weight under 50 kg", r_hemoglobin: "Hemoglobin under 12.5 g/dL", r_interval: "Too soon since last donation (56 days, 112 for double red cells)",
  r_not_well: "Not feeling well", r_recent_illness: "Recent illness", r_antibiotics: "Recent antibiotics", r_malaria_travel: "Malaria risk",
  r_tattoo_piercing: "Recent tattoo or piercing", r_pregnancy: "Pregnancy or recent birth", r_recent_surgery: "Recent surgery or transfusion",
  r_high_risk: "High-risk exposure", r_donor_not_found: "Donor not found",
  t_voluntary: "Voluntary", t_replacement: "Replacement", t_directed: "Directed", t_autologous: "Autologous", t_double_rbc: "Double red cells (apheresis)",
  workflow: "Donation Workflow", s_screening: "Screening", s_collecting: "Collecting", s_processing: "Processing", s_completed: "Completed", s_rejected: "Rejected",
  moveTo: "Move to", reject: "Reject Donation", viewInventory: "View in Inventory", donor: "Donor", viewDonor: "View Donor Profile",
  actions: "Actions", bloodGroup: "Blood Group", notFound: "Donation not found", eligibility: "Eligibility", passed: "Passed", failed: "Failed",
  prepareComponents: "Prepare components", prepareDesc: "Choose which products this bag is separated into. Each gets its own expiry and starts in quarantine until screening passes.",
  c_whole_blood: "Whole blood (35 days)", c_packed_rbc: "Packed red cells (42 days)", c_fresh_frozen_plasma: "Fresh frozen plasma (1 year)",
  c_platelet_concentrate: "Platelets (5 days)", c_cryoprecipitate: "Cryoprecipitate (1 year)", completeAndSplit: "Complete & create bags",
  issueBlood: "Issue Blood", issuing: "Issuing...", issuedOk: "{n} unit(s) issued. Bill created for {total}.", issuedNoBill: "{n} unit(s) issued.",
  noMatched: "No cross-matched bags are held for this request. Do a compatible cross-match first.",
  vitals: "Transfusion Vitals", pre: "Before", mid: "At 15 minutes", post: "After", saveVitals: "Save vitals", vitalsSaved: "Vitals saved",
  viewBill: "View bill",
};

const ur: Dict = {
  startDonation: "نیا عطیہ شروع کریں", startDonationDesc: "پہلے اہلیت چیک کریں، پھر عطیہ درج کریں",
  back: "واپس", backToDonations: "عطیات پر واپس", donorSelection: "عطیہ دہندہ کا انتخاب", registerDonor: "نیا عطیہ دہندہ درج کریں",
  searchDonors: "نام، فون یا ڈونر نمبر سے تلاش کریں...", noActiveDonors: "کوئی فعال عطیہ دہندہ نہیں ملا",
  change: "تبدیل کریں", lastDonation: "آخری عطیہ", donations: "عطیات",
  donationDetails: "عطیہ کی تفصیل", donationDate: "عطیہ کی تاریخ", donationTime: "عطیہ کا وقت", donationType: "عطیہ کی قسم",
  hb: "ہیموگلوبن (g/dL)", weight: "وزن (کلو)", bagNumber: "بیگ نمبر", volume: "جمع شدہ مقدار (ml)",
  bp: "بلڈ پریشر", pulse: "نبض", temp: "درجہ حرارت (°C)", resp: "سانس",
  questionnaire: "عطیہ دہندہ صحت سوالنامہ", notes: "نوٹس", cancel: "منسوخ", saving: "محفوظ ہو رہا ہے...",
  checkEligibility: "اہلیت چیک کریں", eligible: "عطیہ دہندہ اہل ہے", notEligible: "عطیہ دہندہ اہل نہیں ہے",
  deferDonor: "عطیہ دہندہ مؤخر کریں", deferredFor: "عطیہ دہندہ {n} دن کے لیے مؤخر", startBtn: "عطیہ شروع کریں",
  q_feeling_well: "آج طبیعت ٹھیک اور صحت مند ہے", q_recent_illness: "پچھلے 2 ہفتوں میں بخار، نزلہ یا بیماری",
  q_antibiotics: "پچھلے 7 دن میں اینٹی بائیوٹک لی", q_malaria_travel: "پچھلے 3 ماہ میں ملیریا یا ملیریا والے علاقے کا سفر",
  q_tattoo_piercing: "پچھلے 6 ماہ میں ٹیٹو، چھیدنا یا آکوپنکچر", q_pregnancy: "حاملہ، یا پچھلے 6 ماہ میں زچگی",
  q_recent_surgery: "پچھلے 6 ماہ میں آپریشن یا خون لگا", q_high_risk: "کوئی زیادہ خطرے والا رابطہ (ہیپاٹائٹس/ایچ آئی وی، نشہ کے انجکشن)",
  r_permanently_deferred: "مستقل طور پر مؤخر", r_deferred_until: "ابھی مؤخر مدت میں ہے", r_age: "عمر 18 سے 60 ہونی چاہیے",
  r_weight: "وزن 50 کلو سے کم", r_hemoglobin: "ہیموگلوبن 12.5 سے کم", r_interval: "پچھلے عطیہ کو کم وقت ہوا (56 دن، ڈبل ریڈ سیل کے لیے 112)",
  r_not_well: "طبیعت ٹھیک نہیں", r_recent_illness: "حالیہ بیماری", r_antibiotics: "حالیہ اینٹی بائیوٹک", r_malaria_travel: "ملیریا کا خطرہ",
  r_tattoo_piercing: "حالیہ ٹیٹو یا چھیدنا", r_pregnancy: "حمل یا حالیہ زچگی", r_recent_surgery: "حالیہ آپریشن یا خون",
  r_high_risk: "زیادہ خطرے والا رابطہ", r_donor_not_found: "عطیہ دہندہ نہیں ملا",
  t_voluntary: "رضاکارانہ", t_replacement: "متبادل", t_directed: "مخصوص مریض کے لیے", t_autologous: "اپنے لیے", t_double_rbc: "ڈبل ریڈ سیل (ایفیریسس)",
  workflow: "عطیہ کا مرحلہ وار عمل", s_screening: "جانچ", s_collecting: "خون لینا", s_processing: "پروسیسنگ", s_completed: "مکمل", s_rejected: "مسترد",
  moveTo: "اگلا مرحلہ:", reject: "عطیہ مسترد کریں", viewInventory: "اسٹاک میں دیکھیں", donor: "عطیہ دہندہ", viewDonor: "عطیہ دہندہ کی پروفائل",
  actions: "اقدامات", bloodGroup: "بلڈ گروپ", notFound: "عطیہ نہیں ملا", eligibility: "اہلیت", passed: "کامیاب", failed: "ناکام",
  prepareComponents: "اجزاء تیار کریں", prepareDesc: "منتخب کریں کہ یہ بیگ کن اجزاء میں تقسیم ہو۔ ہر ایک کی اپنی میعاد ہوگی اور ٹیسٹ پاس ہونے تک قرنطینہ میں رہے گا۔",
  c_whole_blood: "مکمل خون (35 دن)", c_packed_rbc: "پیکڈ ریڈ سیل (42 دن)", c_fresh_frozen_plasma: "فریش فروزن پلازما (1 سال)",
  c_platelet_concentrate: "پلیٹلیٹس (5 دن)", c_cryoprecipitate: "کرائیو (1 سال)", completeAndSplit: "مکمل کریں اور بیگ بنائیں",
  issueBlood: "خون جاری کریں", issuing: "جاری ہو رہا ہے...", issuedOk: "{n} یونٹ جاری۔ {total} کا بل بن گیا۔", issuedNoBill: "{n} یونٹ جاری۔",
  noMatched: "اس درخواست کے لیے کوئی کراس میچ شدہ بیگ محفوظ نہیں۔ پہلے مطابقت والا کراس میچ کریں۔",
  vitals: "خون لگانے کے دوران وائٹلز", pre: "پہلے", mid: "15 منٹ پر", post: "بعد میں", saveVitals: "وائٹلز محفوظ کریں", vitalsSaved: "وائٹلز محفوظ ہو گئے",
  viewBill: "بل دیکھیں",
};

const ar: Dict = {
  startDonation: "بدء تبرع جديد", startDonationDesc: "تحقق من الأهلية ثم سجّل التبرع",
  back: "رجوع", backToDonations: "العودة إلى التبرعات", donorSelection: "اختيار المتبرع", registerDonor: "تسجيل متبرع جديد",
  searchDonors: "ابحث بالاسم أو الهاتف أو رقم المتبرع...", noActiveDonors: "لا يوجد متبرعون نشطون",
  change: "تغيير", lastDonation: "آخر تبرع", donations: "تبرعات",
  donationDetails: "تفاصيل التبرع", donationDate: "تاريخ التبرع", donationTime: "وقت التبرع", donationType: "نوع التبرع",
  hb: "الهيموغلوبين (g/dL)", weight: "الوزن (كغ)", bagNumber: "رقم الكيس", volume: "الحجم المجمّع (مل)",
  bp: "ضغط الدم", pulse: "النبض", temp: "الحرارة (°م)", resp: "التنفس",
  questionnaire: "استبيان صحة المتبرع", notes: "ملاحظات", cancel: "إلغاء", saving: "جارٍ الحفظ...",
  checkEligibility: "تحقق من الأهلية", eligible: "المتبرع مؤهل", notEligible: "المتبرع غير مؤهل",
  deferDonor: "تأجيل المتبرع", deferredFor: "تم تأجيل المتبرع {n} يومًا", startBtn: "بدء التبرع",
  q_feeling_well: "يشعر بصحة جيدة اليوم", q_recent_illness: "حمى أو زكام أو مرض خلال أسبوعين",
  q_antibiotics: "تناول مضادًا حيويًا خلال 7 أيام", q_malaria_travel: "ملاريا أو سفر لمنطقة ملاريا خلال 3 أشهر",
  q_tattoo_piercing: "وشم أو ثقب أو وخز بالإبر خلال 6 أشهر", q_pregnancy: "حامل أو ولادة خلال 6 أشهر",
  q_recent_surgery: "جراحة أو نقل دم خلال 6 أشهر", q_high_risk: "تعرض عالي الخطورة (التهاب كبد/إيدز، حقن مخدرات)",
  r_permanently_deferred: "مؤجل نهائيًا", r_deferred_until: "ما زال ضمن فترة التأجيل", r_age: "العمر يجب أن يكون 18–60",
  r_weight: "الوزن أقل من 50 كغ", r_hemoglobin: "الهيموغلوبين أقل من 12.5", r_interval: "مدة قصيرة منذ آخر تبرع (56 يومًا، 112 للكريات المزدوجة)",
  r_not_well: "لا يشعر بصحة جيدة", r_recent_illness: "مرض حديث", r_antibiotics: "مضاد حيوي حديث", r_malaria_travel: "خطر الملاريا",
  r_tattoo_piercing: "وشم أو ثقب حديث", r_pregnancy: "حمل أو ولادة حديثة", r_recent_surgery: "جراحة أو نقل دم حديث",
  r_high_risk: "تعرض عالي الخطورة", r_donor_not_found: "المتبرع غير موجود",
  t_voluntary: "طوعي", t_replacement: "تعويضي", t_directed: "موجّه", t_autologous: "ذاتي", t_double_rbc: "كريات حمراء مزدوجة (فصادة)",
  workflow: "مراحل التبرع", s_screening: "الفحص", s_collecting: "السحب", s_processing: "المعالجة", s_completed: "مكتمل", s_rejected: "مرفوض",
  moveTo: "الانتقال إلى", reject: "رفض التبرع", viewInventory: "عرض في المخزون", donor: "المتبرع", viewDonor: "ملف المتبرع",
  actions: "الإجراءات", bloodGroup: "فصيلة الدم", notFound: "التبرع غير موجود", eligibility: "الأهلية", passed: "ناجح", failed: "فاشل",
  prepareComponents: "تحضير المكونات", prepareDesc: "اختر المنتجات التي يُفصل إليها هذا الكيس. لكل منها صلاحية خاصة ويبقى في الحجر حتى نجاح الفحص.",
  c_whole_blood: "دم كامل (35 يومًا)", c_packed_rbc: "كريات حمراء مركزة (42 يومًا)", c_fresh_frozen_plasma: "بلازما طازجة مجمدة (سنة)",
  c_platelet_concentrate: "صفائح (5 أيام)", c_cryoprecipitate: "راسب بارد (سنة)", completeAndSplit: "إكمال وإنشاء الأكياس",
  issueBlood: "صرف الدم", issuing: "جارٍ الصرف...", issuedOk: "تم صرف {n} وحدة. أُنشئت فاتورة بقيمة {total}.", issuedNoBill: "تم صرف {n} وحدة.",
  noMatched: "لا توجد أكياس مطابقة محجوزة لهذا الطلب. أجرِ اختبار توافق أولًا.",
  vitals: "العلامات الحيوية أثناء النقل", pre: "قبل", mid: "بعد 15 دقيقة", post: "بعد", saveVitals: "حفظ العلامات", vitalsSaved: "تم حفظ العلامات",
  viewBill: "عرض الفاتورة",
};

const DICTS: Record<string, Dict> = { en, ur, ar };

export function useBBT() {
  const { language } = useTranslation() as { language?: string };
  const lang = language === "ur" || language === "ar" ? language : "en";
  const d = DICTS[lang];
  const tt = (k: string, vars?: Record<string, string | number>) => {
    let s = d[k] ?? en[k] ?? k;
    if (vars) Object.entries(vars).forEach(([key, v]) => { s = s.replace(`{${key}}`, String(v)); });
    return s;
  };
  return { tt, lang, rtl: lang !== "en" };
}

export const QUESTION_KEYS = [
  "feeling_well", "recent_illness", "antibiotics", "malaria_travel",
  "tattoo_piercing", "pregnancy", "recent_surgery", "high_risk",
] as const;

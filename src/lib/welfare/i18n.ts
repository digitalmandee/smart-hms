import { useTranslation } from "@/lib/i18n";

export const FUNDS = ["zakat", "sadaqah", "fitrana", "general", "patient_welfare", "sponsorship", "building_fund", "equipment", "other"] as const;
export const WELFARE_FUNDS = ["any", "zakat", "sadaqah", "fitrana", "general", "patient_welfare", "sponsorship"] as const;

const dict = {
  en: {
    funds: "Fund Balances", fundsDesc: "Money received, spent on patients and remaining, per donation category",
    received: "Received", spent: "Spent on patients", balance: "Balance", donations: "Donations", utilizations: "Patient bills paid",
    any: "Any eligible fund", zakat: "Zakat", sadaqah: "Sadaqah", fitrana: "Fitrana", general: "Atiyat / General", patient_welfare: "Patient Welfare",
    sponsorship: "Sponsorship", building_fund: "Building Fund", equipment: "Equipment", other: "Other (restricted)",
    welfareReport: "Welfare Report", welfareReportDesc: "Patients helped per fund and department",
    patients: "Patients helped", totalSpent: "Total spent", department: "Department", fund: "Fund", amount: "Amount", date: "Date", patient: "Patient", invoice: "Invoice",
    frontDesk: "Front Desk", frontDeskDesc: "Find or add a patient, choose the visit, take payment — on one screen",
    search: "Search by name, MR number or phone", newPatient: "New patient", firstName: "First name", lastName: "Last name", phone: "Phone",
    gender: "Gender", male: "Male", female: "Female", child: "Child", guardian: "Guardian name", guardianPhone: "Guardian phone",
    needsWelfare: "Needs welfare (charity care)", payingFund: "Paying fund", coverage: "Coverage %", savePatient: "Save patient",
    visitType: "Visit type", opd: "OPD visit", ipd: "IPD admission / deposit", lab: "Lab test", pharmacy: "Pharmacy", bloodbank: "Blood bank", procedure: "Procedure",
    service: "Service", price: "Price", addService: "Add", total: "Total", fundShare: "Paid by fund", patientShare: "Patient pays",
    paymentMethod: "Payment method", collect: "Create bill & collect", fundLow: "Not enough money in this fund. Remaining:",
    done: "Bill created", printReceipt: "Print receipt", selected: "Selected patient", change: "Change", noResults: "No patients found",
    welfareBadge: "Welfare", fundAvailable: "Fund available", items: "Items", remove: "Remove", noFundMoney: "No fund has enough money",
  },
  ur: {
    funds: "فنڈ بیلنس", fundsDesc: "ہر عطیہ کیٹیگری میں موصول، مریضوں پر خرچ اور باقی رقم",
    received: "موصول", spent: "مریضوں پر خرچ", balance: "بیلنس", donations: "عطیات", utilizations: "ادا شدہ مریض بل",
    any: "کوئی بھی اہل فنڈ", zakat: "زکوٰۃ", sadaqah: "صدقہ", fitrana: "فطرانہ", general: "عطیات / عمومی", patient_welfare: "مریض فلاح",
    sponsorship: "کفالت", building_fund: "بلڈنگ فنڈ", equipment: "آلات", other: "دیگر (مخصوص)",
    welfareReport: "فلاحی رپورٹ", welfareReportDesc: "ہر فنڈ اور شعبے کے لحاظ سے مدد یافتہ مریض",
    patients: "مدد یافتہ مریض", totalSpent: "کل خرچ", department: "شعبہ", fund: "فنڈ", amount: "رقم", date: "تاریخ", patient: "مریض", invoice: "بل",
    frontDesk: "فرنٹ ڈیسک", frontDeskDesc: "مریض تلاش یا شامل کریں، وزٹ منتخب کریں، ادائیگی لیں — ایک ہی اسکرین پر",
    search: "نام، ایم آر نمبر یا فون سے تلاش کریں", newPatient: "نیا مریض", firstName: "پہلا نام", lastName: "آخری نام", phone: "فون",
    gender: "جنس", male: "مرد", female: "عورت", child: "بچہ", guardian: "سرپرست کا نام", guardianPhone: "سرپرست کا فون",
    needsWelfare: "فلاحی امداد درکار", payingFund: "ادا کرنے والا فنڈ", coverage: "کوریج %", savePatient: "مریض محفوظ کریں",
    visitType: "وزٹ کی قسم", opd: "او پی ڈی وزٹ", ipd: "داخلہ / ڈپازٹ", lab: "لیب ٹیسٹ", pharmacy: "فارمیسی", bloodbank: "بلڈ بینک", procedure: "پروسیجر",
    service: "سروس", price: "قیمت", addService: "شامل کریں", total: "کل", fundShare: "فنڈ سے ادا", patientShare: "مریض ادا کرے",
    paymentMethod: "ادائیگی کا طریقہ", collect: "بل بنائیں اور وصول کریں", fundLow: "اس فنڈ میں کافی رقم نہیں۔ باقی:",
    done: "بل بن گیا", printReceipt: "رسید پرنٹ کریں", selected: "منتخب مریض", change: "تبدیل کریں", noResults: "کوئی مریض نہیں ملا",
    welfareBadge: "فلاحی", fundAvailable: "فنڈ دستیاب", items: "آئٹمز", remove: "ہٹائیں", noFundMoney: "کسی فنڈ میں کافی رقم نہیں",
  },
  ar: {
    funds: "أرصدة الصناديق", fundsDesc: "المبالغ المستلمة والمصروفة على المرضى والمتبقية لكل فئة تبرع",
    received: "المستلم", spent: "المصروف على المرضى", balance: "الرصيد", donations: "التبرعات", utilizations: "فواتير مرضى مدفوعة",
    any: "أي صندوق مؤهل", zakat: "زكاة", sadaqah: "صدقة", fitrana: "زكاة الفطر", general: "عطايا / عام", patient_welfare: "رعاية المرضى",
    sponsorship: "كفالة", building_fund: "صندوق البناء", equipment: "المعدات", other: "أخرى (مقيدة)",
    welfareReport: "تقرير الرعاية", welfareReportDesc: "المرضى المستفيدون حسب الصندوق والقسم",
    patients: "المرضى المستفيدون", totalSpent: "إجمالي المصروف", department: "القسم", fund: "الصندوق", amount: "المبلغ", date: "التاريخ", patient: "المريض", invoice: "الفاتورة",
    frontDesk: "مكتب الاستقبال", frontDeskDesc: "ابحث عن مريض أو أضفه، اختر الزيارة، واستلم الدفع — في شاشة واحدة",
    search: "ابحث بالاسم أو رقم الملف أو الهاتف", newPatient: "مريض جديد", firstName: "الاسم الأول", lastName: "اسم العائلة", phone: "الهاتف",
    gender: "الجنس", male: "ذكر", female: "أنثى", child: "طفل", guardian: "اسم ولي الأمر", guardianPhone: "هاتف ولي الأمر",
    needsWelfare: "يحتاج رعاية خيرية", payingFund: "الصندوق الدافع", coverage: "نسبة التغطية %", savePatient: "حفظ المريض",
    visitType: "نوع الزيارة", opd: "زيارة عيادة", ipd: "تنويم / عربون", lab: "تحليل مختبر", pharmacy: "صيدلية", bloodbank: "بنك الدم", procedure: "إجراء",
    service: "الخدمة", price: "السعر", addService: "إضافة", total: "الإجمالي", fundShare: "يدفعه الصندوق", patientShare: "يدفعه المريض",
    paymentMethod: "طريقة الدفع", collect: "إنشاء الفاتورة والتحصيل", fundLow: "لا يوجد رصيد كافٍ في هذا الصندوق. المتبقي:",
    done: "تم إنشاء الفاتورة", printReceipt: "طباعة الإيصال", selected: "المريض المحدد", change: "تغيير", noResults: "لا يوجد مرضى",
    welfareBadge: "رعاية", fundAvailable: "الرصيد المتاح", items: "البنود", remove: "إزالة", noFundMoney: "لا يوجد صندوق برصيد كافٍ",
  },
} as const;

export type WelfareKey = keyof typeof dict.en;

export function useWelfareT() {
  const { language } = useTranslation();
  const lang = (language === "ar" || language === "ur" ? language : "en") as keyof typeof dict;
  const t = (k: string) => (dict[lang] as Record<string, string>)[k] ?? (dict.en as Record<string, string>)[k] ?? k;
  return { t, rtl: lang !== "en", lang };
}

import { useTranslation } from "@/lib/i18n";

type Dict = Record<string, string>;
const en: Dict = {
  camps: "Blood Camps", campsDesc: "Plan outdoor blood drives, register donors on site and receive the bags at the blood bank",
  newCamp: "New Camp", noCamps: "No camps yet", name: "Camp name", location: "Location", address: "Address", date: "Date",
  start: "Start time", end: "End time", organiser: "Organiser / partner", contact: "Contact person", phone: "Phone",
  inCharge: "Camp in-charge", target: "Target bags", bagsSent: "Empty bags / kits sent", kits: "Kits & supplies notes",
  save: "Save", cancel: "Cancel", open: "Open",
  st_planned: "Planned", st_ongoing: "Ongoing", st_closed: "Closed", st_received: "Received",
  tabDetails: "Details", tabTeam: "Team & Kits", tabDonors: "Donors & Bags", tabTransport: "Transport", tabReceiving: "Receiving", tabReport: "Report",
  startCamp: "Start camp", closeCamp: "Close camp", closingNotes: "In-charge sign-off notes",
  addMember: "Add member", role: "Role", r_doctor: "Doctor", r_phlebotomist: "Phlebotomist", r_nurse: "Nurse", r_driver: "Driver", r_volunteer: "Volunteer",
  registerDonor: "Register donor at camp", donor: "Donor", group: "Group", bag: "Bag", volume: "Volume", status: "Status", time: "Time",
  registered: "Registered", deferred: "Deferred", collected: "Collected", leftover: "Bags left over",
  addTrip: "Record transport", departed: "Departed", depTemp: "Temp at departure (°C)", arrived: "Arrived", arrTemp: "Temp on arrival (°C)",
  carrier: "Carried by", bagCount: "Bags in box", ok: "OK", f_temperature_out_of_range: "Temperature outside 1–10 °C", f_bag_count_mismatch: "Bag count doesn't match",
  receiveDesc: "Tick each bag that arrived in good condition. Mark damaged or missing bags with a reason. Accepted bags go to testing.",
  accept: "Accept", rejectBag: "Reject", reason: "Reason", rs_damaged: "Damaged / leaking", rs_missing: "Missing", rs_cold_chain: "Cold chain broken", rs_clotted: "Clotted", rs_underfilled: "Under-filled",
  confirmReceipt: "Confirm receipt", received: "Bags received", nothingToReceive: "No bags waiting to be received",
  r_pending: "Awaiting receipt", r_accepted: "Accepted", r_rejected: "Rejected",
  accepted: "Accepted", rejectedBags: "Rejected", failedTests: "Failed tests", discarded: "Discarded", issued: "Issued to patients", inStock: "In stock",
  costPerBag: "Cost per bag", campCost: "Camp cost", deferralReasons: "Deferral reasons", thankDonors: "Thank donors (WhatsApp)",
  expenses: "Camp expenses", addExpense: "Add expense", amount: "Amount", notes: "Notes", category: "Type", totalExpenses: "Total expenses",
  costPerCollected: "Cost per bag collected", costPerUsable: "Cost per usable bag", income: "Income from issued bags",
  profit: "Profit / loss", profitPerIssued: "Profit per bag issued", byType: "Expenses by type", lockedNote: "Expenses are locked after the camp is received",
  ex_transport: "Transport / vehicle", ex_staff: "Staff allowance", ex_refreshments: "Donor refreshments", ex_bags: "Bags & kits", ex_venue: "Tent / venue", ex_publicity: "Publicity", ex_other: "Other",
  thankMsg: "Thank you {name} for donating blood at {camp}. You can donate again after {date}.", processBag: "Process",
  goTesting: "Go to blood testing",
};
const ur: Dict = {
  camps: "بلڈ کیمپس", campsDesc: "بیرونی خون عطیہ کیمپ کی منصوبہ بندی، موقع پر عطیہ دہندگان کا اندراج، اور بلڈ بینک میں بیگ وصولی",
  newCamp: "نیا کیمپ", noCamps: "ابھی کوئی کیمپ نہیں", name: "کیمپ کا نام", location: "مقام", address: "پتہ", date: "تاریخ",
  start: "آغاز", end: "اختتام", organiser: "منتظم / شراکت دار", contact: "رابطہ شخص", phone: "فون",
  inCharge: "کیمپ انچارج", target: "ہدف بیگ", bagsSent: "بھیجے گئے خالی بیگ / کٹس", kits: "کٹس اور سامان نوٹس",
  save: "محفوظ کریں", cancel: "منسوخ", open: "کھولیں",
  st_planned: "منصوبہ بند", st_ongoing: "جاری", st_closed: "بند", st_received: "وصول",
  tabDetails: "تفصیل", tabTeam: "ٹیم اور کٹس", tabDonors: "عطیہ دہندگان اور بیگ", tabTransport: "ترسیل", tabReceiving: "وصولی", tabReport: "رپورٹ",
  startCamp: "کیمپ شروع کریں", closeCamp: "کیمپ بند کریں", closingNotes: "انچارج کے دستخطی نوٹس",
  addMember: "رکن شامل کریں", role: "کردار", r_doctor: "ڈاکٹر", r_phlebotomist: "خون لینے والا", r_nurse: "نرس", r_driver: "ڈرائیور", r_volunteer: "رضاکار",
  registerDonor: "کیمپ پر عطیہ دہندہ درج کریں", donor: "عطیہ دہندہ", group: "گروپ", bag: "بیگ", volume: "مقدار", status: "حالت", time: "وقت",
  registered: "درج شدہ", deferred: "مؤخر", collected: "جمع شدہ", leftover: "بچے ہوئے بیگ",
  addTrip: "ترسیل درج کریں", departed: "روانگی", depTemp: "روانگی پر درجہ حرارت (°C)", arrived: "آمد", arrTemp: "آمد پر درجہ حرارت (°C)",
  carrier: "لے جانے والا", bagCount: "ڈبے میں بیگ", ok: "ٹھیک", f_temperature_out_of_range: "درجہ حرارت 1–10 °C سے باہر", f_bag_count_mismatch: "بیگ کی تعداد مختلف",
  receiveDesc: "ہر صحیح حالت میں پہنچنے والے بیگ پر نشان لگائیں۔ خراب یا گمشدہ بیگ وجہ کے ساتھ مسترد کریں۔ قبول شدہ بیگ ٹیسٹ میں جائیں گے۔",
  accept: "قبول", rejectBag: "مسترد", reason: "وجہ", rs_damaged: "خراب / رساؤ", rs_missing: "گمشدہ", rs_cold_chain: "ٹھنڈک ٹوٹ گئی", rs_clotted: "جما ہوا", rs_underfilled: "کم بھرا",
  confirmReceipt: "وصولی کی تصدیق", received: "بیگ وصول ہو گئے", nothingToReceive: "وصولی کے لیے کوئی بیگ نہیں",
  r_pending: "وصولی باقی", r_accepted: "قبول", r_rejected: "مسترد",
  accepted: "قبول شدہ", rejectedBags: "مسترد", failedTests: "ٹیسٹ میں ناکام", discarded: "ضائع", issued: "مریضوں کو جاری", inStock: "اسٹاک میں",
  costPerBag: "فی بیگ لاگت", campCost: "کیمپ کی لاگت", deferralReasons: "مؤخر کرنے کی وجوہات", thankDonors: "عطیہ دہندگان کا شکریہ (واٹس ایپ)",
  expenses: "کیمپ کے اخراجات", addExpense: "خرچ شامل کریں", amount: "رقم", notes: "نوٹس", category: "قسم", totalExpenses: "کل اخراجات",
  costPerCollected: "فی جمع شدہ بیگ لاگت", costPerUsable: "فی قابل استعمال بیگ لاگت", income: "جاری کردہ بیگز سے آمدنی",
  profit: "منافع / نقصان", profitPerIssued: "فی جاری بیگ منافع", byType: "قسم کے لحاظ سے اخراجات", lockedNote: "کیمپ وصول ہونے کے بعد اخراجات مقفل ہیں",
  ex_transport: "ٹرانسپورٹ / گاڑی", ex_staff: "عملے کا الاؤنس", ex_refreshments: "عطیہ دہندگان کے لیے ریفریشمنٹ", ex_bags: "بیگز اور کٹس", ex_venue: "خیمہ / جگہ", ex_publicity: "تشہیر", ex_other: "دیگر",
  thankMsg: "{name}، {camp} میں خون کا عطیہ دینے کا شکریہ۔ آپ {date} کے بعد دوبارہ عطیہ دے سکتے ہیں۔", processBag: "پروسیس کریں",
  goTesting: "بلڈ ٹیسٹنگ پر جائیں",
};
const ar: Dict = {
  camps: "حملات التبرع بالدم", campsDesc: "خطط لحملات التبرع الخارجية، سجّل المتبرعين في الموقع واستلم الأكياس في بنك الدم",
  newCamp: "حملة جديدة", noCamps: "لا توجد حملات بعد", name: "اسم الحملة", location: "الموقع", address: "العنوان", date: "التاريخ",
  start: "وقت البدء", end: "وقت الانتهاء", organiser: "المنظم / الشريك", contact: "الشخص المسؤول للتواصل", phone: "الهاتف",
  inCharge: "مسؤول الحملة", target: "الأكياس المستهدفة", bagsSent: "الأكياس / العدد المرسلة", kits: "ملاحظات المستلزمات",
  save: "حفظ", cancel: "إلغاء", open: "فتح",
  st_planned: "مخطط", st_ongoing: "جارية", st_closed: "مغلقة", st_received: "مستلمة",
  tabDetails: "التفاصيل", tabTeam: "الفريق والمستلزمات", tabDonors: "المتبرعون والأكياس", tabTransport: "النقل", tabReceiving: "الاستلام", tabReport: "التقرير",
  startCamp: "بدء الحملة", closeCamp: "إغلاق الحملة", closingNotes: "ملاحظات اعتماد المسؤول",
  addMember: "إضافة عضو", role: "الدور", r_doctor: "طبيب", r_phlebotomist: "فني سحب دم", r_nurse: "ممرض", r_driver: "سائق", r_volunteer: "متطوع",
  registerDonor: "تسجيل متبرع في الحملة", donor: "المتبرع", group: "الفصيلة", bag: "الكيس", volume: "الحجم", status: "الحالة", time: "الوقت",
  registered: "مسجلون", deferred: "مؤجلون", collected: "تم جمعها", leftover: "أكياس متبقية",
  addTrip: "تسجيل النقل", departed: "المغادرة", depTemp: "الحرارة عند المغادرة (°م)", arrived: "الوصول", arrTemp: "الحرارة عند الوصول (°م)",
  carrier: "الناقل", bagCount: "عدد الأكياس في الصندوق", ok: "سليم", f_temperature_out_of_range: "الحرارة خارج 1–10 °م", f_bag_count_mismatch: "عدد الأكياس غير مطابق",
  receiveDesc: "حدد كل كيس وصل بحالة جيدة. ارفض التالف أو المفقود مع ذكر السبب. الأكياس المقبولة تنتقل للفحص.",
  accept: "قبول", rejectBag: "رفض", reason: "السبب", rs_damaged: "تالف / مسرّب", rs_missing: "مفقود", rs_cold_chain: "انقطاع سلسلة التبريد", rs_clotted: "متخثر", rs_underfilled: "ناقص التعبئة",
  confirmReceipt: "تأكيد الاستلام", received: "تم استلام الأكياس", nothingToReceive: "لا توجد أكياس بانتظار الاستلام",
  r_pending: "بانتظار الاستلام", r_accepted: "مقبول", r_rejected: "مرفوض",
  accepted: "مقبولة", rejectedBags: "مرفوضة", failedTests: "فشلت في الفحص", discarded: "متلفة", issued: "صُرفت للمرضى", inStock: "في المخزون",
  costPerBag: "التكلفة لكل كيس", campCost: "تكلفة الحملة", deferralReasons: "أسباب التأجيل", thankDonors: "شكر المتبرعين (واتساب)",
  expenses: "مصاريف الحملة", addExpense: "إضافة مصروف", amount: "المبلغ", notes: "ملاحظات", category: "النوع", totalExpenses: "إجمالي المصاريف",
  costPerCollected: "التكلفة لكل كيس مجموع", costPerUsable: "التكلفة لكل كيس صالح", income: "الإيراد من الأكياس المصروفة",
  profit: "الربح / الخسارة", profitPerIssued: "الربح لكل كيس مصروف", byType: "المصاريف حسب النوع", lockedNote: "المصاريف مقفلة بعد استلام الحملة",
  ex_transport: "النقل / المركبة", ex_staff: "بدل الموظفين", ex_refreshments: "ضيافة المتبرعين", ex_bags: "الأكياس والمستلزمات", ex_venue: "الخيمة / المكان", ex_publicity: "الدعاية", ex_other: "أخرى",
  thankMsg: "شكرًا {name} على تبرعك بالدم في {camp}. يمكنك التبرع مجددًا بعد {date}.", processBag: "معالجة",
  goTesting: "الانتقال إلى فحص الدم",
};
const D: Record<string, Dict> = { en, ur, ar };

export function useCampT() {
  const { language } = useTranslation() as { language?: string };
  const lang = language === "ur" || language === "ar" ? language : "en";
  const tc = (k: string, vars?: Record<string, string | number>) => {
    let s = D[lang][k] ?? en[k] ?? k;
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, String(b));
    return s;
  };
  return { tc, lang, rtl: lang !== "en" };
}

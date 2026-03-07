// NPHIES Denial Code Map — common Saudi NPHIES rejection codes
// with multilingual descriptions and auto-correction suggestions

export interface DenialCodeInfo {
  code: string;
  display: { en: string; ar: string; ur: string };
  category: 'clinical' | 'administrative' | 'eligibility' | 'coding';
  severity: 'error' | 'warning';
  suggestedAction: { en: string; ar: string; ur: string };
}

export const NPHIES_DENIAL_CODES: Record<string, DenialCodeInfo> = {
  // ── Clinical ──
  "clinical-missing-diagnosis": {
    code: "clinical-missing-diagnosis",
    display: {
      en: "Missing diagnosis codes",
      ar: "رموز التشخيص مفقودة",
      ur: "تشخیص کوڈز غائب ہیں",
    },
    category: "clinical",
    severity: "error",
    suggestedAction: {
      en: "Add valid ICD-10 diagnosis codes to the claim",
      ar: "أضف رموز تشخيص ICD-10 صالحة للمطالبة",
      ur: "کلیم میں درست ICD-10 تشخیص کوڈز شامل کریں",
    },
  },
  "clinical-invalid-diagnosis": {
    code: "clinical-invalid-diagnosis",
    display: {
      en: "Invalid diagnosis code format",
      ar: "تنسيق رمز التشخيص غير صالح",
      ur: "تشخیص کوڈ فارمیٹ غلط ہے",
    },
    category: "clinical",
    severity: "error",
    suggestedAction: {
      en: "Verify ICD-10 codes follow the correct format (letter + 2-7 characters)",
      ar: "تحقق من أن رموز ICD-10 تتبع التنسيق الصحيح",
      ur: "ICD-10 کوڈز کا درست فارمیٹ چیک کریں",
    },
  },
  "clinical-insufficient-documentation": {
    code: "clinical-insufficient-documentation",
    display: {
      en: "Insufficient clinical documentation",
      ar: "توثيق سريري غير كافٍ",
      ur: "طبی دستاویزات ناکافی ہیں",
    },
    category: "clinical",
    severity: "error",
    suggestedAction: {
      en: "Attach supporting clinical documents, lab results, or physician notes",
      ar: "أرفق المستندات السريرية الداعمة أو نتائج المختبر أو ملاحظات الطبيب",
      ur: "معاون طبی دستاویزات، لیب نتائج، یا ڈاکٹر کے نوٹس منسلک کریں",
    },
  },
  "clinical-medical-necessity": {
    code: "clinical-medical-necessity",
    display: {
      en: "Medical necessity not established",
      ar: "لم يتم إثبات الضرورة الطبية",
      ur: "طبی ضرورت ثابت نہیں ہوئی",
    },
    category: "clinical",
    severity: "error",
    suggestedAction: {
      en: "Provide clinical justification and medical necessity documentation",
      ar: "قدم التبرير السريري ووثائق الضرورة الطبية",
      ur: "طبی جواز اور ضرورت کی دستاویزات فراہم کریں",
    },
  },

  // ── Administrative ──
  "admin-duplicate-claim": {
    code: "admin-duplicate-claim",
    display: {
      en: "Duplicate claim detected",
      ar: "تم اكتشاف مطالبة مكررة",
      ur: "ڈپلیکیٹ کلیم کا پتا چلا",
    },
    category: "administrative",
    severity: "error",
    suggestedAction: {
      en: "Check for existing claims with same patient, date, and services. Cancel duplicate if needed",
      ar: "تحقق من المطالبات الحالية بنفس المريض والتاريخ والخدمات",
      ur: "اسی مریض، تاریخ اور خدمات کے ساتھ موجود کلیمز چیک کریں",
    },
  },
  "admin-missing-preauth": {
    code: "admin-missing-preauth",
    display: {
      en: "Pre-authorization required but not obtained",
      ar: "الموافقة المسبقة مطلوبة ولكن لم يتم الحصول عليها",
      ur: "پیشگی اجازت ضروری ہے لیکن حاصل نہیں ہوئی",
    },
    category: "administrative",
    severity: "error",
    suggestedAction: {
      en: "Submit a pre-authorization request before resubmitting the claim",
      ar: "قدم طلب موافقة مسبقة قبل إعادة تقديم المطالبة",
      ur: "کلیم دوبارہ جمع کرانے سے پہلے پیشگی اجازت کی درخواست جمع کرائیں",
    },
  },
  "admin-expired-preauth": {
    code: "admin-expired-preauth",
    display: {
      en: "Pre-authorization has expired",
      ar: "انتهت صلاحية الموافقة المسبقة",
      ur: "پیشگی اجازت کی مدت ختم ہو گئی ہے",
    },
    category: "administrative",
    severity: "error",
    suggestedAction: {
      en: "Request a new pre-authorization before resubmitting",
      ar: "اطلب موافقة مسبقة جديدة قبل إعادة التقديم",
      ur: "دوبارہ جمع کرانے سے پہلے نئی پیشگی اجازت حاصل کریں",
    },
  },
  "admin-timely-filing": {
    code: "admin-timely-filing",
    display: {
      en: "Claim submitted past filing deadline",
      ar: "تم تقديم المطالبة بعد الموعد النهائي",
      ur: "کلیم جمع کرانے کی آخری تاریخ گزر گئی",
    },
    category: "administrative",
    severity: "error",
    suggestedAction: {
      en: "Appeal with documentation showing reason for late submission",
      ar: "قدم استئنافاً مع وثائق توضح سبب التأخير",
      ur: "تاخیر کی وجہ دکھانے والی دستاویزات کے ساتھ اپیل کریں",
    },
  },
  "admin-missing-referral": {
    code: "admin-missing-referral",
    display: {
      en: "Missing referral authorization",
      ar: "تفويض الإحالة مفقود",
      ur: "ریفرل کی اجازت غائب ہے",
    },
    category: "administrative",
    severity: "warning",
    suggestedAction: {
      en: "Obtain and attach referral letter before resubmitting",
      ar: "احصل على خطاب الإحالة وأرفقه قبل إعادة التقديم",
      ur: "دوبارہ جمع کرانے سے پہلے ریفرل لیٹر حاصل کریں اور منسلک کریں",
    },
  },

  // ── Eligibility ──
  "eligibility-inactive-policy": {
    code: "eligibility-inactive-policy",
    display: {
      en: "Insurance policy is inactive or expired",
      ar: "بوليصة التأمين غير نشطة أو منتهية",
      ur: "انشورنس پالیسی غیر فعال یا ختم ہو گئی ہے",
    },
    category: "eligibility",
    severity: "error",
    suggestedAction: {
      en: "Verify patient insurance is active. Re-check eligibility before resubmitting",
      ar: "تحقق من أن تأمين المريض نشط. أعد التحقق من الأهلية قبل إعادة التقديم",
      ur: "مریض کی انشورنس فعال ہے اس کی تصدیق کریں۔ دوبارہ جمع کرانے سے پہلے اہلیت چیک کریں",
    },
  },
  "eligibility-invalid-member": {
    code: "eligibility-invalid-member",
    display: {
      en: "Invalid member ID or subscriber information",
      ar: "معرّف العضو أو معلومات المشترك غير صالحة",
      ur: "ممبر آئی ڈی یا سبسکرائبر کی معلومات غلط ہیں",
    },
    category: "eligibility",
    severity: "error",
    suggestedAction: {
      en: "Verify member ID and insurance details match the payer records",
      ar: "تحقق من أن معرّف العضو وتفاصيل التأمين تطابق سجلات الدافع",
      ur: "ممبر آئی ڈی اور انشورنس کی تفصیلات پیئر ریکارڈز سے مماثل ہیں تصدیق کریں",
    },
  },
  "eligibility-service-not-covered": {
    code: "eligibility-service-not-covered",
    display: {
      en: "Service not covered under patient's plan",
      ar: "الخدمة غير مشمولة في خطة المريض",
      ur: "خدمت مریض کے پلان میں شامل نہیں ہے",
    },
    category: "eligibility",
    severity: "error",
    suggestedAction: {
      en: "Verify service coverage. Consider alternative covered procedures or bill patient directly",
      ar: "تحقق من تغطية الخدمة. فكر في إجراءات بديلة مغطاة",
      ur: "خدمت کی کوریج کی تصدیق کریں۔ متبادل کوریج شدہ طریقہ کار پر غور کریں",
    },
  },
  "eligibility-max-benefit-reached": {
    code: "eligibility-max-benefit-reached",
    display: {
      en: "Maximum benefit limit reached",
      ar: "تم الوصول إلى الحد الأقصى للمنافع",
      ur: "زیادہ سے زیادہ فائدے کی حد پوری ہو گئی",
    },
    category: "eligibility",
    severity: "error",
    suggestedAction: {
      en: "Inform patient about benefit limit. Bill remaining to patient or arrange alternative coverage",
      ar: "أبلغ المريض عن حد المنافع. فاتر المتبقي للمريض",
      ur: "مریض کو فائدے کی حد سے آگاہ کریں۔ بقیہ رقم مریض سے وصول کریں",
    },
  },

  // ── Coding ──
  "coding-invalid-procedure": {
    code: "coding-invalid-procedure",
    display: {
      en: "Invalid or unrecognized procedure code",
      ar: "رمز الإجراء غير صالح أو غير معروف",
      ur: "طریقہ کار کا کوڈ غلط یا غیر تسلیم شدہ ہے",
    },
    category: "coding",
    severity: "error",
    suggestedAction: {
      en: "Verify CPT/procedure codes are valid and recognized by NPHIES",
      ar: "تحقق من أن رموز CPT/الإجراءات صالحة ومعترف بها من NPHIES",
      ur: "CPT/طریقہ کار کوڈز NPHIES کے مطابق درست ہیں تصدیق کریں",
    },
  },
  "coding-diagnosis-procedure-mismatch": {
    code: "coding-diagnosis-procedure-mismatch",
    display: {
      en: "Diagnosis does not support the procedure",
      ar: "التشخيص لا يدعم الإجراء",
      ur: "تشخیص طریقہ کار کی حمایت نہیں کرتا",
    },
    category: "coding",
    severity: "error",
    suggestedAction: {
      en: "Review and align diagnosis codes with procedures performed",
      ar: "راجع ووفق رموز التشخيص مع الإجراءات المنفذة",
      ur: "تشخیص کوڈز کو انجام دیے گئے طریقہ کار سے ہم آہنگ کریں",
    },
  },
  "coding-missing-modifier": {
    code: "coding-missing-modifier",
    display: {
      en: "Missing required modifier on procedure code",
      ar: "معدّل مطلوب مفقود على رمز الإجراء",
      ur: "طریقہ کار کوڈ پر مطلوبہ موڈیفائر غائب ہے",
    },
    category: "coding",
    severity: "warning",
    suggestedAction: {
      en: "Add appropriate modifiers to procedure codes as required by the payer",
      ar: "أضف المعدّلات المناسبة لرموز الإجراءات كما يتطلب الدافع",
      ur: "پیئر کی ضرورت کے مطابق طریقہ کار کوڈز میں مناسب موڈیفائرز شامل کریں",
    },
  },
  "coding-unbundling": {
    code: "coding-unbundling",
    display: {
      en: "Services should be bundled under a single code",
      ar: "يجب تجميع الخدمات تحت رمز واحد",
      ur: "خدمات کو ایک کوڈ کے تحت بنڈل کیا جانا چاہیے",
    },
    category: "coding",
    severity: "warning",
    suggestedAction: {
      en: "Review service codes for bundling requirements and combine as needed",
      ar: "راجع رموز الخدمات لمتطلبات التجميع وادمج حسب الحاجة",
      ur: "بنڈلنگ کی ضروریات کے لیے سروس کوڈز کا جائزہ لیں اور ضرورت کے مطابق ملائیں",
    },
  },
  "coding-invalid-service-code": {
    code: "coding-invalid-service-code",
    display: {
      en: "Invalid service code",
      ar: "رمز الخدمة غير صالح",
      ur: "سروس کوڈ غلط ہے",
    },
    category: "coding",
    severity: "error",
    suggestedAction: {
      en: "Use valid NPHIES-recognized service codes from the SBS coding system",
      ar: "استخدم رموز خدمة صالحة ومعترف بها من NPHIES",
      ur: "SBS کوڈنگ سسٹم سے NPHIES کے تسلیم شدہ سروس کوڈز استعمال کریں",
    },
  },

  // ── General ──
  "general-system-error": {
    code: "general-system-error",
    display: {
      en: "NPHIES system processing error",
      ar: "خطأ في معالجة نظام NPHIES",
      ur: "NPHIES سسٹم پروسیسنگ میں خرابی",
    },
    category: "administrative",
    severity: "error",
    suggestedAction: {
      en: "Wait and retry. If persistent, contact NPHIES support",
      ar: "انتظر وأعد المحاولة. إذا استمرت المشكلة، اتصل بدعم NPHIES",
      ur: "انتظار کریں اور دوبارہ کوشش کریں۔ مسئلہ برقرار رہے تو NPHIES سپورٹ سے رابطہ کریں",
    },
  },
};

// Map raw NPHIES error codes to our structured codes
const NPHIES_ERROR_CODE_MAP: Record<string, string> = {
  // FHIR ClaimResponse error codes
  "a]001": "clinical-missing-diagnosis",
  "a]002": "clinical-invalid-diagnosis",
  "a]003": "clinical-insufficient-documentation",
  "a]004": "clinical-medical-necessity",
  "b]001": "admin-duplicate-claim",
  "b]002": "admin-missing-preauth",
  "b]003": "admin-expired-preauth",
  "b]004": "admin-timely-filing",
  "b]005": "admin-missing-referral",
  "c]001": "eligibility-inactive-policy",
  "c]002": "eligibility-invalid-member",
  "c]003": "eligibility-service-not-covered",
  "c]004": "eligibility-max-benefit-reached",
  "d]001": "coding-invalid-procedure",
  "d]002": "coding-diagnosis-procedure-mismatch",
  "d]003": "coding-missing-modifier",
  "d]004": "coding-unbundling",
  "d]005": "coding-invalid-service-code",
  // Common text-based matches
  "missing-diagnosis": "clinical-missing-diagnosis",
  "invalid-diagnosis": "clinical-invalid-diagnosis",
  "duplicate": "admin-duplicate-claim",
  "preauth": "admin-missing-preauth",
  "inactive": "eligibility-inactive-policy",
  "not-covered": "eligibility-service-not-covered",
  "invalid-member": "eligibility-invalid-member",
};

export interface ParsedDenialReason {
  code: string;
  display: string;
  category: string;
  severity: string;
  suggested_action: string;
  raw_code?: string;
  raw_display?: string;
}

export function parseDenialReasonsFromResponse(
  claimResponseData: any,
  lang: 'en' | 'ar' | 'ur' = 'en'
): ParsedDenialReason[] {
  const reasons: ParsedDenialReason[] = [];
  const claimResponse = claimResponseData?.entry?.find(
    (e: any) => e.resource?.resourceType === "ClaimResponse"
  )?.resource;
  if (!claimResponse) return reasons;

  // Parse error[] entries
  const errors = claimResponse.error || [];
  for (const err of errors) {
    const rawCode = err.code?.coding?.[0]?.code || "";
    const rawDisplay = err.code?.coding?.[0]?.display || err.code?.text || "";
    const mapped = matchDenialCode(rawCode, rawDisplay);
    if (mapped) {
      reasons.push({
        code: mapped.code,
        display: mapped.display[lang],
        category: mapped.category,
        severity: mapped.severity,
        suggested_action: mapped.suggestedAction[lang],
        raw_code: rawCode,
        raw_display: rawDisplay,
      });
    } else {
      reasons.push({
        code: rawCode || "unknown",
        display: rawDisplay || "Unknown rejection reason",
        category: "administrative",
        severity: "error",
        suggested_action: lang === 'ar' ? "راجع تفاصيل المطالبة وأعد التقديم" :
          lang === 'ur' ? "کلیم کی تفصیلات کا جائزہ لیں اور دوبارہ جمع کرائیں" :
          "Review claim details and resubmit with corrections",
        raw_code: rawCode,
        raw_display: rawDisplay,
      });
    }
  }

  // Parse adjudication[].reason
  const adjudication = claimResponse.adjudication || [];
  for (const adj of adjudication) {
    if (adj.reason) {
      const rawCode = adj.reason.coding?.[0]?.code || "";
      const rawDisplay = adj.reason.coding?.[0]?.display || adj.reason.text || "";
      if (rawCode && !reasons.find(r => r.raw_code === rawCode)) {
        const mapped = matchDenialCode(rawCode, rawDisplay);
        if (mapped) {
          reasons.push({
            code: mapped.code,
            display: mapped.display[lang],
            category: mapped.category,
            severity: mapped.severity,
            suggested_action: mapped.suggestedAction[lang],
            raw_code: rawCode,
            raw_display: rawDisplay,
          });
        }
      }
    }
  }

  // Parse processNote[]
  const processNotes = claimResponse.processNote || [];
  for (const note of processNotes) {
    if (note.text && !reasons.find(r => r.raw_display === note.text)) {
      reasons.push({
        code: "process-note",
        display: note.text,
        category: "administrative",
        severity: "warning",
        suggested_action: lang === 'ar' ? "راجع ملاحظة المعالجة واتخذ الإجراء المناسب" :
          lang === 'ur' ? "پروسیس نوٹ کا جائزہ لیں اور مناسب کارروائی کریں" :
          "Review the process note and take appropriate action",
        raw_display: note.text,
      });
    }
  }

  return reasons;
}

function matchDenialCode(rawCode: string, rawDisplay: string): DenialCodeInfo | null {
  // Direct code match
  if (NPHIES_ERROR_CODE_MAP[rawCode]) {
    return NPHIES_DENIAL_CODES[NPHIES_ERROR_CODE_MAP[rawCode]] || null;
  }
  // Fuzzy text match
  const lowerDisplay = (rawDisplay || "").toLowerCase();
  for (const [keyword, mappedCode] of Object.entries(NPHIES_ERROR_CODE_MAP)) {
    if (lowerDisplay.includes(keyword)) {
      return NPHIES_DENIAL_CODES[mappedCode] || null;
    }
  }
  return null;
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'clinical': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'administrative': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'eligibility': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'coding': return 'text-orange-600 bg-orange-50 border-orange-200';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

export function getCategoryLabel(category: string, lang: 'en' | 'ar' | 'ur' = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    clinical: { en: 'Clinical', ar: 'سريري', ur: 'طبی' },
    administrative: { en: 'Administrative', ar: 'إداري', ur: 'انتظامی' },
    eligibility: { en: 'Eligibility', ar: 'الأهلية', ur: 'اہلیت' },
    coding: { en: 'Coding', ar: 'الترميز', ur: 'کوڈنگ' },
  };
  return labels[category]?.[lang] || category;
}

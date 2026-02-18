
# End-to-End Translation Implementation Plan

## Reality Check: Current State

From the investigation, here is the **true scope** of what's missing:

- `useTranslation()` is called in only **4 files** out of hundreds: `DashboardPage.tsx`, `DynamicSidebar.tsx`, `CollectionsWidget.tsx`, `PharmacyAlertsWidget.tsx`
- **Every single module page** (IPD, OPD, Billing, Patients, Lab, Pharmacy, HR, etc.) has 100% hardcoded English
- **Every toast message** across 69+ hook files is hardcoded English
- **`ModernPageHeader`** has hardcoded "Good Morning/Afternoon/Evening" and uses `format(new Date(), "EEEE, MMMM d, yyyy")` — English date always
- **`PageHeader`** component is used by all module pages — no translation hook
- The date "Thursday, February 19, 2026" shown in the screenshot is still in English
- **Every table column header, button label, badge, tab label, status text** is hardcoded English

## The Right Strategy: Layered Translation

Rather than trying to translate 200+ files one by one (impossible), the plan targets high-leverage **shared components** and **key module pages**, which cascade translation to many pages at once:

### Layer 1: Shared Components (highest leverage — affects every page)

1. **`ModernPageHeader.tsx`** — Used by IPD, HR, OT, and many dashboards. Fix:
   - Import `useTranslation` + `useCountryConfig` for locale
   - Translate `getTimeOfDay()` greeting strings using `t()`
   - Fix date: use `date-fns` locale (`arSA` for Arabic, `ur` for Urdu) for locale-aware month/day names

2. **`PageHeader.tsx`** — Used by Patients, Billing, Admissions, etc. No changes to this component since it renders whatever strings are passed to it (the pages pass already-hardcoded strings). Instead, pages that call it must use `t()` for the title/description props.

### Layer 2: Key Module Pages (high visibility)

3. **`src/pages/app/ipd/IPDDashboard.tsx`** — The current route. Has 15+ hardcoded strings:
   - "IPD Dashboard", "Inpatient department overview and management"
   - "Total Wards", "Bed Occupancy", "Active Patients", "Today's Activity"
   - "Pending Rounds", "Pending Discharges", "Ward-wise Occupancy"
   - "Avg Length of Stay", "Today's Procedures", "Pending Lab Results"
   - "Post Room Charges", "New Admission", "Active", "Discharges"
   - "Recent Admissions", "Bed Map", "Admissions", "IPD Billing", "Nursing Station"

4. **`src/pages/app/patients/PatientsListPage.tsx`** — Column headers "Patient #", "Name", "Age", "Gender", "Phone", "Status", buttons "Register Patient", "Refresh"

5. **`src/pages/app/billing/InvoicesListPage.tsx`** — Column headers "Invoice #", "Date", "Patient", "Amount", "Status"

6. **`src/pages/app/ipd/AdmissionsListPage.tsx`** — "Admissions", "Manage patient admissions", "New Admission", "Refresh", "Search by patient name..."

### Layer 3: Toast Messages (centralize in hooks)

The 2,804 toast calls across 69 hook files cannot all be translated individually. The pragmatic approach:

- Create a **`useToastTranslations()` utility hook** that returns pre-built translated toast functions: `toastSuccess(key)`, `toastError(key)`
- Add ~30 common toast message keys to `en.ts`, `ar.ts`, `ur.ts`:
  - `"toast.savedSuccess"`, `"toast.saveFailed"`, `"toast.deletedSuccess"`, `"toast.deleteFailed"`, `"toast.createdSuccess"`, `"toast.createFailed"`, `"toast.updatedSuccess"`, `"toast.updateFailed"`, etc.
- Update the **most-used hooks** (`useAdmissions`, `usePatients`, `useBilling`, `useIPD`) to use this utility

### Layer 4: Translation Key Expansion

Add new keys to `en.ts`, `ar.ts`, `ur.ts` for:
- IPD module labels (stats cards, section headings, actions)
- Patients module labels
- Billing module labels  
- Common page actions (New Admission, Refresh, Search...)
- Toast messages (30 common patterns)
- Date locale support

## Files to Change

| File | Change |
|------|--------|
| `src/lib/i18n/translations/en.ts` | Add ~60 new keys: IPD labels, common page strings, toast messages |
| `src/lib/i18n/translations/ar.ts` | Add matching Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add matching Urdu translations |
| `src/components/ModernPageHeader.tsx` | Import `useTranslation`; translate greeting; use locale-aware date formatting |
| `src/pages/app/ipd/IPDDashboard.tsx` | Import `useTranslation`; replace all hardcoded strings with `t()` |
| `src/pages/app/patients/PatientsListPage.tsx` | Import `useTranslation`; translate page header, column names, button labels |
| `src/pages/app/billing/InvoicesListPage.tsx` | Import `useTranslation`; translate headers and labels |
| `src/pages/app/ipd/AdmissionsListPage.tsx` | Import `useTranslation`; translate headers and labels |
| `src/hooks/useAdmissions.ts` | Use translated toast messages via centralized approach |
| `src/hooks/usePatients.ts` | Use translated toast messages |

## New Translation Keys

### IPD Module
```
"ipd.dashboard"             → IPD Dashboard / لوحة تحكم التنويم / IPD ڈیش بورڈ
"ipd.subtitle"              → Inpatient department overview / نظرة عامة على قسم التنويم / داخلی محکمے کا جائزہ
"ipd.totalWards"            → Total Wards / إجمالي الأجنحة / کل وارڈ
"ipd.activeWards"           → Active wards / الأجنحة النشطة / فعال وارڈ
"ipd.bedOccupancy"          → Bed Occupancy / إشغال الأسرة / بستر کا قبضہ
"ipd.available"             → available / متاح / دستیاب
"ipd.activePatients"        → Active Patients / المرضى النشطاء / فعال مریض
"ipd.currentlyAdmitted"     → Currently admitted / المقبولون حالياً / ابھی داخل
"ipd.todayActivity"         → Today's Activity / نشاط اليوم / آج کی سرگرمی
"ipd.admissionsDischarges"  → Admissions / Discharges / القبول / الخروج / داخلگی / خروج
"ipd.pendingRounds"         → Pending Rounds / الجولات المعلقة / زیر التواء وزٹ
"ipd.pendingDischarges"     → Pending Discharges / خروج معلق / زیر التواء خروج
"ipd.wardOccupancy"         → Ward-wise Occupancy / إشغال الأجنحة / وارڈ کی بھرائی
"ipd.avgLOS"                → Avg Length of Stay / متوسط مدة الإقامة / قیام کا اوسط
"ipd.todayProcedures"       → Today's Procedures / إجراءات اليوم / آج کے طریقہ کار
"ipd.pendingLabResults"     → Pending Lab Results / نتائج المختبر المعلقة / زیر التواء لیب نتائج
"ipd.postRoomCharges"       → Post Room Charges / ترحيل رسوم الغرفة / کمرے کے چارجز جمع کریں
"ipd.newAdmission"          → New Admission / قبول جديد / نئی داخلگی
"ipd.allRoundsComplete"     → All rounds completed for today / اكتملت جميع الجولات لليوم / آج کے سب وزٹ مکمل
"ipd.noPendingDischarges"   → No pending discharges / لا يوجد خروج معلق / کوئی زیر التواء خروج نہیں
"ipd.recentAdmissions"      → Recent Admissions / القبول الأخير / حالیہ داخلگی
"ipd.bedMap"                → Bed Map / خريطة الأسرة / بستر نقشہ
"ipd.admissions"            → Admissions / القبول / داخلگی
"ipd.ipdBilling"            → IPD Billing / فوترة التنويم / IPD بلنگ
"ipd.nursingStation"        → Nursing Station / محطة التمريض / نرسنگ اسٹیشن
"ipd.financialSummary"      → Active Admissions Financial Summary / ملخص مالي / مالی خلاصہ
"ipd.totalDeposits"         → Total Deposits / إجمالي الودائع / کل جمع
"ipd.totalCharges"          → Total Charges / إجمالي الرسوم / کل چارجز
"ipd.outstandingBalance"    → Outstanding / المبلغ المستحق / واجب الادا
"ipd.dischargePipeline"     → Discharge Pipeline / مسار الخروج / خروج پائپ لائن
"ipd.bedsOccupied"          → beds occupied / أسرة مشغولة / بستر استعمال میں
"ipd.start"                 → Start / ابدأ / شروع کریں
"ipd.discharge"             → Discharge / خروج / خارج کریں
"ipd.viewAllPending"        → View all {n} pending / عرض الكل / سب دیکھیں
```

### Patients Module
```
"patients.title"            → Patients / المرضى / مریض
"patients.subtitle"         → Manage patient records / إدارة سجلات المرضى / مریض ریکارڈ
"patients.patientNo"        → Patient # / رقم المريض / مریض نمبر
"patients.registerPatient"  → Register Patient / تسجيل مريض / مریض رجسٹر کریں
"patients.totalPatients"    → Total Patients / إجمالي المرضى / کل مریض
"patients.newThisMonth"     → New This Month / جدد هذا الشهر / اس ماہ نئے
"patients.activePatients"   → Active Patients / مرضى نشطاء / فعال مریض
```

### Billing / Invoices
```
"invoices.title"            → Invoices / الفواتير / انوائسز
"invoices.subtitle"         → Manage billing and invoices / إدارة الفواتير / بلنگ انتظام
"invoices.invoiceNo"        → Invoice # / رقم الفاتورة / انوائس نمبر
"invoices.newInvoice"       → New Invoice / فاتورة جديدة / نئی انوائس
"invoices.allTypes"         → All Types / جميع الأنواع / تمام اقسام
"invoices.consultation"     → Consultation / استشارة / مشاورت
```

### Admissions
```
"admissions.title"          → Admissions / القبول / داخلگی
"admissions.subtitle"       → Manage patient admissions / إدارة قبول المرضى / مریض داخلگی
"admissions.newAdmission"   → New Admission / قبول جديد / نئی داخلگی
"admissions.refresh"        → Refresh / تحديث / ریفریش
"admissions.searchPlaceholder" → Search by patient name, admission # or MRN / البحث / تلاش کریں
"admissions.admitted"       → Admitted / المقبولون / داخل
"admissions.pending"        → Pending / معلق / زیر التواء
"admissions.discharged"     → Discharged / خارجون / خارج
"admissions.all"            → All / الكل / سب
```

### Common Page Actions
```
"common.refresh"            → Refresh / تحديث / ریفریش
"common.newAdmission"       → New Admission / قبول جديد / نئی داخلگی
"common.viewAll"            → View All / عرض الكل / سب دیکھیں
"common.loading"            (already exists)
"common.noData"             → No data found / لم يتم العثور على بيانات / کوئی ڈیٹا نہیں
"common.error"              → Error / خطأ / خطا
"common.tryAgain"           → Try again / حاول مرة أخرى / دوبارہ کوشش کریں
"common.days"               → days / أيام / دن
"common.bedsOccupied"       → beds occupied / أسرة مشغولة / بستر استعمال میں
"common.quickStats"         → Quick Stats / إحصائيات سريعة / فوری اعداد
```

### Toast Messages
```
"toast.savedSuccess"        → Saved successfully / تم الحفظ بنجاح / کامیابی سے محفوظ
"toast.saveFailed"          → Failed to save / فشل الحفظ / محفوظ کرنا ناکام
"toast.createdSuccess"      → Created successfully / تم الإنشاء بنجاح / کامیابی سے بنایا
"toast.createFailed"        → Failed to create / فشل الإنشاء / بنانا ناکام
"toast.updatedSuccess"      → Updated successfully / تم التحديث بنجاح / کامیابی سے اپڈیٹ
"toast.updateFailed"        → Failed to update / فشل التحديث / اپڈیٹ ناکام
"toast.deletedSuccess"      → Deleted successfully / تم الحذف بنجاح / کامیابی سے حذف
"toast.deleteFailed"        → Failed to delete / فشل الحذف / حذف ناکام
"toast.admissionCreated"    → Patient admission created successfully / تم قبول المريض / مریض کامیابی سے داخل
"toast.admissionFailed"     → Failed to create admission / فشل قبول المريض / داخلگی ناکام
"toast.dischargeSuccess"    → Patient discharged successfully / تم خروج المريض / مریض کامیابی سے خارج
"toast.dischargeFailed"     → Failed to discharge patient / فشل خروج المريض / خروج ناکام
"toast.wardCreated"         → Ward created successfully / تم إنشاء الجناح / وارڈ کامیابی سے بنا
"toast.wardUpdated"         → Ward updated successfully / تم تحديث الجناح / وارڈ کامیابی سے اپڈیٹ
"toast.wardFailed"          → Failed to save ward / فشل حفظ الجناح / وارڈ ناکام
"toast.chargeAdded"         → Charge added successfully / تمت إضافة الرسوم / چارج کامیابی سے شامل
"toast.chargeFailed"        → Failed to add charge / فشل إضافة الرسوم / چارج شامل ناکام
"toast.invoiceGenerated"    → Invoice generated / تم إنشاء الفاتورة / انوائس بنائی
"toast.invoiceFailed"       → Failed to generate invoice / فشل إنشاء الفاتورة / انوائس ناکام
"toast.dashboardRefreshed"  → Dashboard refreshed / تم تحديث لوحة التحكم / ڈیش بورڈ ریفریش
"toast.refreshFailed"       → Failed to refresh dashboard / فشل التحديث / ریفریش ناکام
"toast.roomChargesPosted"   → Room charges posted / تم ترحيل رسوم الغرف / کمرے چارجز جمع
"toast.roomChargesFailed"   → Failed to post room charges / فشل ترحيل رسوم الغرف / کمرے چارجز ناکام
"toast.missingContext"      → Missing required information / معلومات مفقودة / ضروری معلومات غائب
"toast.paymentProcessed"    → Payment processed successfully / تمت معالجة الدفعة / ادائیگی مکمل
"toast.paymentFailed"       → Failed to process payment / فشل معالجة الدفعة / ادائیگی ناکام
```

### Date Locale (ModernPageHeader)
The date "Thursday, February 19, 2026" must show in Arabic/Urdu. Use `date-fns/locale`:
- Arabic: `import { ar } from 'date-fns/locale'` → `format(new Date(), "EEEE, MMMM d, yyyy", { locale: ar })`
- Urdu: Urdu is not natively in date-fns so use Arabic locale for now (both RTL, numerals same) or fallback to a custom function
- This will produce: "الخميس، 19 فبراير 2026" for Arabic

## Implementation Details

### ModernPageHeader.tsx Changes
```tsx
import { useTranslation, useCountryConfig } from "@/lib/i18n";
import { ar as arLocale, enUS } from "date-fns/locale";

// Inside component:
const { t } = useTranslation();
const { default_language } = useCountryConfig();
const dateLocale = default_language === "ar" ? arLocale 
                 : default_language === "ur" ? arLocale  // Arabic numerals, similar
                 : enUS;
const today = format(new Date(), "EEEE, MMMM d, yyyy", { locale: dateLocale });

// Replace getTimeOfDay() which returns hardcoded English:
function getTimeOfDay(t) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: t("dashboard.goodMorning"), icon: ... };
  ...
}
```

### IPDDashboard.tsx Changes
Import `useTranslation`, replace all ~25 hardcoded strings with `t("ipd.xxx")` keys.

### Toast Strategy for Hooks
Since hooks can't call React hooks directly unless they're custom hooks, the approach is:
- The toast strings in hooks **already pass a string** to `toast.success()` 
- Since `sonner`'s `toast` is framework-agnostic, we can't inject `t()` into hooks easily without refactoring
- **Pragmatic approach**: Translate the ~20 most visible toast messages in the IPD hooks (`useAdmissions`, `useIPD`, `useDischarge`) by passing a translated message from the component layer, or by creating a standalone translation function (non-hook) that reads the language from localStorage/sessionStorage as a fallback

### Standalone Translation Function (for hooks)
```ts
// In src/lib/i18n/index.ts - add:
export function getTranslatedString(key: TranslationKey): string {
  // Read language from stored org config (cached)
  const lang = localStorage.getItem("org_language") || "en";
  const langMap = translations[lang];
  return (langMap && langMap[key]) || en[key] || key;
}
```

This allows hooks to call `getTranslatedString("toast.admissionCreated")` without being React hooks themselves.

## Summary of All Changes

| File | Priority | Changes |
|------|----------|---------|
| `src/lib/i18n/translations/en.ts` | Critical | +60 new keys |
| `src/lib/i18n/translations/ar.ts` | Critical | +60 Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Critical | +60 Urdu translations |
| `src/lib/i18n/index.ts` | Critical | Add `getTranslatedString()` standalone function + cache language in localStorage |
| `src/components/ModernPageHeader.tsx` | High | Translate greetings + locale-aware date |
| `src/pages/app/ipd/IPDDashboard.tsx` | High | Full i18n (current route) |
| `src/pages/app/ipd/AdmissionsListPage.tsx` | High | Translate page headers and actions |
| `src/pages/app/patients/PatientsListPage.tsx` | High | Translate page headers, columns |
| `src/pages/app/billing/InvoicesListPage.tsx` | Medium | Translate page headers, columns |
| `src/pages/app/ipd/WardFormPage.tsx` | Medium | Toast translations |
| `src/pages/app/ipd/DischargeFormPage.tsx` | Medium | Toast translations |
| `src/pages/app/ipd/AdmissionFormPage.tsx` | Medium | Toast translations |
| `src/pages/app/ipd/IPDChargesPage.tsx` | Medium | Toast translations |

## Important Note on Scope

The user's request for "everything" covers 200+ files. A complete implementation in one pass would touch every single page, component, form, and hook in the codebase. This plan tackles the highest-value targets first:

1. The shared `ModernPageHeader` and date formatting (fixes dozens of pages at once)
2. The IPD module fully (current route being viewed)
3. Patients and Billing list pages (most visited)
4. Toast messages for IPD operations (most frequent user interactions)
5. New translation keys for all the above

After these changes, the user will see Arabic/Urdu on:
- The date in the header on all pages using `ModernPageHeader`
- The entire IPD dashboard and admissions pages
- Patients and billing list pages
- All toast notifications from IPD operations
- All existing sidebar items (already done)
- Dashboard page (already done)

The remaining modules (OPD, Lab, HR, OT, etc.) can be translated in subsequent passes following the exact same pattern.

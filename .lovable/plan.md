
# Arabic RTL Live Audit — Complete Findings & Fix Plan

## What Was Tested

Logged in as Receptionist (Shifa Medical Center), switched language to Arabic via the LanguageSwitcher, and navigated through: Reception Dashboard, Sidebar (expanded), Appointment Calendar, and inspected source files for all remaining pages.

---

## Confirmed Working Correctly ✅

- Sidebar RTL position (right side in Arabic) ✅
- Sidebar menu items in Arabic (المواعيد, المرضى, الأسرة والغرف, etc.) ✅
- Language switcher dropdown (shows عربي/اردو/English) ✅
- Reception Dashboard stat cards fully Arabic ✅
- Header greeting + date in Arabic ✅
- Quick action buttons in Arabic ✅
- AppointmentsListPage — uses `useTranslation` ✅
- AppointmentFormPage — uses `useTranslation` ✅
- PatientsListPage — uses `useTranslation` ✅
- BillingDashboard + InvoicesListPage — uses `useTranslation` ✅
- IPDDashboard + AdmissionsListPage — uses `useTranslation` ✅

---

## All Remaining Issues Found

### CRITICAL — App Crash

**`AppointmentFormPage.tsx` (new appointment route)**
- Crashes with `NotFoundError: Failed to execute 'removeChild' on 'Node'` from Radix UI Select.
- This is a known Radix UI Select unmount bug that occurs when the DOM `dir` attribute changes while a Select portal is still mounted.
- **Fix**: Add `key={language}` to any `<Select>` inside the form that renders in a portal, forcing full remount on language change. Alternatively wrap the form in a `key={language}` so the entire component remounts cleanly.

---

### HIGH — Reception Dashboard Sub-components (2 files)

**`src/components/reception/PendingSurgeryRequestsCard.tsx`** — Zero translations:
- "Surgeries to Process" (title appears twice)
- "No surgeries need processing"
- `ml-2` on Badge → `ms-2`
- `View All` link text — English

**`src/components/reception/TodayScheduleList.tsx`**:
- "No appointments scheduled for today" — hardcoded English

**Fix**: Add `useTranslation` to both files, add new keys `reception.surgeriesToProcess`, `reception.noSurgeriesNeeded`, `reception.noAppointmentsToday`, `common.viewAll`.

---

### HIGH — Appointment Calendar Page (1 file)

**`src/pages/app/appointments/AppointmentCalendarPage.tsx`** — Zero translations:
- `title="Appointment Calendar"` — hardcoded
- `description="View and manage appointments - click on any slot to book"` — hardcoded
- `"New Appointment"` button — hardcoded
- Breadcrumb labels `'Dashboard'` — hardcoded
- `"All Doctors"` Select placeholder — hardcoded
- `"Today"`, `"Month"`, `"Day"` filter buttons — hardcoded
- `"Time"` column header — hardcoded
- `<Plus className="h-4 w-4 mr-2" />` — physical `mr-2` → `me-2`
- Breadcrumbs: `Calendar > Appointments > Dashboard` — chevron `>` points wrong in RTL
- Navigation arrows `<` and `>` for prev/next week: not flipped in RTL

**`src/pages/app/appointments/DoctorSchedulePage.tsx`**, **`AppointmentQueuePage.tsx`**, **`QueueControlPage.tsx`** — All have `"All Doctors"` placeholder hardcoded.

**Fix**: Add `useTranslation` + `useIsRTL` to CalendarPage and all sub-pages. Add keys `apptCal.title`, `apptCal.description`, `apptCal.allDoctors`, `apptCal.today`, `apptCal.month`, `apptCal.day`, `apptCal.time`, `apptCal.newAppointment`.

---

### HIGH — Patient Form Page (1 file)

**`src/pages/app/patients/PatientFormPage.tsx`** — Zero translations:
- `title="Edit Patient"` / `"New Patient"` — hardcoded
- `breadcrumbs: "Patients", "Edit", "New"` — hardcoded
- `description="Fill in the patient details"` — hardcoded
- Form field labels: "First Name", "Last Name", "Date of Birth", "Gender", "Blood Group", "Phone", "Address", "City", "Emergency Contact", etc. — all hardcoded

---

### MEDIUM — All Other PageHeader Breadcrumb Labels (many files)

Almost every sub-page passes `label: "Patients"`, `label: "HR"`, `label: "Billing"`, `label: "Lab"` etc. as raw English strings to `PageHeader`. These appear in breadcrumb trails. The `PageHeader` component renders them as-is.

**Files affected** (sample):
- `PatientFormPage.tsx`: `{ label: "Patients", href: "/app/patients" }`
- `EmployeeDetailPage.tsx`: `{ label: "HR", href: "/app/hr" }`
- `PayrollPage.tsx`: `{ label: "HR", href: "/app/hr" }`
- `AttendanceSheetPage.tsx`: `{ label: "HR", href: "/app/hr" }`
- `ClaimsListPage.tsx`: `{ label: "Billing", href: "/app/billing" }`
- All lab sub-pages: `{ label: "Lab", href: "/app/lab" }`
- `AppointmentCalendarPage.tsx`: `{ label: "Dashboard", href: "/app" }`

**Fix**: All breadcrumb label strings that are module names should use `t('nav.xxx')` keys already in the translation files.

---

## New Translation Keys Required

```
# Reception sub-components
"reception.surgeriesToProcess"  → Surgeries to Process / العمليات للمعالجة / آپریشن پروسیس کرنے کے لیے
"reception.noSurgeriesNeeded"   → No surgeries need processing / لا توجد عمليات تحتاج معالجة / کوئی آپریشن پروسیس نہیں
"reception.noAppointmentsToday" → No appointments scheduled for today / لا مواعيد مجدولة اليوم / آج کوئی ملاقات شیڈول نہیں
"common.viewAll"                → View All / عرض الكل / سب دیکھیں

# Appointment Calendar
"apptCal.title"           → Appointment Calendar / تقويم المواعيد / ملاقاتوں کا کیلنڈر
"apptCal.description"     → View and manage appointments / عرض وإدارة المواعيد / ملاقاتیں دیکھیں اور منظم کریں
"apptCal.allDoctors"      → All Doctors / جميع الأطباء / تمام ڈاکٹر
"apptCal.today"           → Today / اليوم / آج
"apptCal.month"           → Month / شهر / مہینہ
"apptCal.day"             → Day / يوم / دن
"apptCal.time"            → Time / الوقت / وقت
"apptCal.newAppointment"  → New Appointment / موعد جديد / نئی ملاقات

# Patient Form
"patient.newPatient"      → New Patient / مريض جديد / نئے مریض
"patient.editPatient"     → Edit Patient / تعديل المريض / مریض تدوین
"patient.fillDetails"     → Fill in the patient details / أدخل بيانات المريض / مریض کی تفصیلات
"patient.firstName"       → First Name / الاسم الأول / پہلا نام
"patient.lastName"        → Last Name / اسم العائلة / آخری نام
"patient.dateOfBirth"     → Date of Birth / تاريخ الميلاد / تاریخ پیدائش
"patient.gender"          → Gender / الجنس / جنس
"patient.bloodGroup"      → Blood Group / فصيلة الدم / خون کا گروپ
"patient.phone"           → Phone / الهاتف / فون
"patient.address"         → Address / العنوان / پتہ
"patient.city"            → City / المدينة / شہر
"patient.emergencyContact" → Emergency Contact / جهة اتصال الطوارئ / ہنگامی رابطہ
"patient.edit"            → Edit / تعديل / ترمیم
"patient.new"             → New / جديد / نئی
```

---

## Files to Change

| File | Changes |
|------|---------|
| `src/lib/i18n/translations/en.ts` | Add ~25 new keys (reception sub-cards, apptCal.*, patient.*) |
| `src/lib/i18n/translations/ar.ts` | Arabic for all new keys |
| `src/lib/i18n/translations/ur.ts` | Urdu for all new keys |
| `src/components/reception/PendingSurgeryRequestsCard.tsx` | Add `useTranslation`, translate title/empty state, `ml-2` → `ms-2` |
| `src/components/reception/TodayScheduleList.tsx` | Add `useTranslation`, translate empty state |
| `src/pages/app/appointments/AppointmentCalendarPage.tsx` | Add `useTranslation` + `useIsRTL`, translate all strings, fix `mr-2` → `me-2`, flip nav arrows in RTL, add `key={language}` to Selects |
| `src/pages/app/appointments/DoctorSchedulePage.tsx` | Translate `"All Doctors"` placeholder |
| `src/pages/app/appointments/AppointmentQueuePage.tsx` | Translate `"All Doctors"` placeholder |
| `src/pages/app/appointments/QueueControlPage.tsx` | Translate `"All Doctors"` placeholder |
| `src/pages/app/appointments/AppointmentFormPage.tsx` | Add `key={language}` to fix crash; translate `'Update appointment details'` description |
| `src/pages/app/patients/PatientFormPage.tsx` | Add `useTranslation`, translate all labels, breadcrumbs, form fields |
| `src/pages/app/hr/EmployeeDetailPage.tsx` | Use `t('nav.hr')` in breadcrumbs |
| `src/pages/app/hr/payroll/PayrollPage.tsx` | Use `t('nav.hr')` in breadcrumbs |
| `src/pages/app/hr/attendance/AttendanceSheetPage.tsx` | Use `t('nav.hr')` in breadcrumbs |
| `src/pages/app/billing/ClaimsListPage.tsx` | Use `t('nav.billing')` in breadcrumbs |
| All lab sub-pages with `label: "Lab"` | Use `t('nav.lab')` in breadcrumbs |

---

## Crash Fix Detail

The `removeChild` crash in `AppointmentFormPage` happens because Radix Select uses a React portal, and when the `dir` attribute on the root changes (language switch), the portal's parent DOM node gets out of sync.

**Fix pattern** — add `key` tied to language at the component level:

```tsx
const { language } = useTranslation();

// On any Select inside the form:
<Select key={`branch-${language}`} value={...} onValueChange={...}>
```

Or wrap the entire form card in `<div key={language}>` to force full remount on language change.

---

## Summary of Impact

| Area | Current State | After Fix |
|------|--------------|-----------|
| Reception "Surgeries to Process" card | English | Arabic |
| Reception "No appointments today" | English | Arabic |
| Appointment Calendar page title/buttons | English | Arabic |
| Calendar nav arrows | Wrong direction in RTL | Correct |
| Patient Form all field labels | English | Arabic |
| Breadcrumb module names (HR, Lab, Billing) | English | Arabic |
| Appointment Form crash on language switch | Crashes | Fixed |
| `All Doctors` dropdown across 4 pages | English | Arabic |


# RTL Arabic/Urdu Audit Report — Complete Findings & Fix Plan

## Audit Summary

After reading through all major pages, shared components, and translation files, here is the precise state of what is working correctly and what still needs fixing.

---

## What is Already Working Correctly

- **IPD Dashboard** — 100% translated, all `t()` calls. No raw English strings found.
- **Billing Dashboard & Invoices List** — 100% translated.
- **HR Dashboard** — 100% translated. All stat cards, quick access tiles, alerts, and buttons use `t()`.
- **Pharmacy Dashboard, Lab Dashboard, OT Dashboard, Org Admin Dashboard** — All translated.
- **Main Dashboard** — Translated.
- **Appointments List & Form** — Translated (done in previous session).
- **Reception Dashboard & Quick Actions** — Translated (done in previous session).
- **Patients List** — Translated.
- **Admissions List (IPD)** — Translated.
- **DataTable** — RTL-aware: search icon flips, pagination icons flip, strings use `t()`.
- **PageHeader & ModernPageHeader** — Breadcrumb chevrons flip in RTL.
- **MobileHeader** — `flex-row-reverse` in RTL, badge position logical.
- **MobileSideMenu** — Opens from correct side (`isRTL ? "right" : "left"`), logical padding (`ps-*`, `pe-*`), translated "Dark Mode" / "Sign Out".
- **MobileFormWizard** — Chevrons and spacing RTL-corrected.
- **BottomNavigation** — Uses `t()` for all labels.
- **StatusBadge** — Translated.
- **DynamicSidebar** — 250+ DB menu items now in `SIDEBAR_NAME_TO_KEY` map; all three translation files updated.
- **DashboardLayout** — `dir={isRTL ? "rtl" : "ltr"}` applied to root, causing sidebar to move to the right in RTL automatically.

---

## What Still Needs Fixing (6 Issues)

### Issue 1 — OPD Doctor Dashboard: 100% Hardcoded English (HIGH)

`src/pages/app/opd/DoctorDashboard.tsx` has NO `useTranslation` import. All strings are hardcoded:
- `title="Doctor Dashboard"`, `description="Welcome, Dr. ..."`
- `"Find Patient"`, `"Search any patient by MR#, name, or phone..."`
- `"Today's Patients"`, `"Completed"`, `"Pending"`, `"In Queue"`
- `"Current Patient"`, `"Patient Queue"`, `"Continue Consultation"`, `"Start Consultation"`
- `"No patients in queue"`, `"No patients waiting"`, `"No patient in progress"`
- `"Chief Complaint:"`, `"View History"`, `"In Progress"`, `"Waiting"`, `"Emergency"`, `"Urgent"`
- Physical CSS: `mr-2` on `History` icon button (should be `me-2`), `left-3` not applicable here but icon buttons lack RTL-awareness

**Fix**: Add `useTranslation` + `useIsRTL`, create ~20 new `opd.*` keys, replace all hardcoded strings, fix `mr-2` → `me-2`.

### Issue 2 — OPD Nurse Dashboard: 100% Hardcoded English (HIGH)

`src/pages/app/opd/NurseDashboard.tsx` has NO `useTranslation`. All strings hardcoded:
- `title="Nurse Station"`, `description="Today, ..."`
- `"All Departments"`, `"Refresh"`, `"View Full Queue"`
- `"Quick Patient Search"`, `"Search by MR#, name, or phone..."`, `"Book Appointment"`, `"Searching..."`, `"No patients found"`
- `"Awaiting Vitals"`, `"Vitals Complete"`, `"In Consultation"`, `"Total Today"`, `"Ready for Doctor"`, `"Quick Actions"`, `"Active Consultations"`
- `"All patients have vitals recorded"`, `"No patients ready yet"`
- Priority labels: `'Emergency'`, `'Urgent'`, `'Normal'` (hardcoded in `priorityLabels` constant)
- Physical CSS: `mr-2` on Refresh button, `left-3` on search icon, `pl-9` on search Input, `ml-2` on dept name span

**Fix**: Add `useTranslation` + `useIsRTL`, create ~18 new `opd.*` keys, fix RTL CSS.

### Issue 3 — OPD Walk-in Page: 100% Hardcoded English (HIGH)

`src/pages/app/opd/OPDWalkInPage.tsx` is 1074 lines with zero translations. This is the main receptionist walk-in registration flow. Has many multi-step UI strings, form labels, payment step, and token slip strings.

**Fix**: Add `useTranslation`, create ~30 new `opd.walkIn.*` keys.

### Issue 4 — Physical CSS Remaining in HR Dashboard (LOW)

`src/pages/app/hr/HRDashboard.tsx` has two instances of physical CSS:
- Line 145: `<ChevronRight className="h-4 w-4 ml-1" />` on "View All" button → needs `ms-1` + RTL-aware icon
- Line 294: `<ChevronRight className="h-4 w-4 ml-1" />` same issue

These are `ChevronRight` navigation icons at end of "View All" / "Pending Leave Requests" buttons. In RTL they should flip to `ChevronLeft` and `ml-1` → `ms-1`.

### Issue 5 — Physical CSS in IPD Dashboard (LOW)

`src/pages/app/ipd/IPDDashboard.tsx` has:
- Line 90: `<RefreshCw className="h-4 w-4 mr-2" />` → `me-2`
- Line 94: `<Plus className="h-4 w-4 mr-2" />` → `me-2`
- Line 189: `<ArrowRight className="h-4 w-4 ml-1" />` → `ms-1` + flip in RTL
- Line 423: `<ArrowRight className="h-4 w-4 ml-1" />` → `ms-1` + flip in RTL
- Several `ml-2` on inline text spans (e.g., `ml-2` on bed number span, expected discharge)

### Issue 6 — Missing Translation Keys for OPD Doctor/Nurse Strings

Several key strings need new translation keys added to all three language files:

**New keys needed (en.ts → ar.ts → ur.ts):**

```
"opd.doctorDashboard"          → Doctor Dashboard / لوحة تحكم الطبيب / ڈاکٹر ڈیشبورڈ
"opd.welcomeDoctor"            → Welcome, Dr. / مرحباً يا دكتور / خوش آمدید، ڈاکٹر
"opd.findPatient"              → Find Patient / البحث عن مريض / مریض تلاش کریں
"opd.searchByMr"               → Search any patient by MR#, name, or phone... / ابحث بالرقم أو الاسم / MR# نام یا فون سے تلاش
"opd.todaysPatients"           → Today's Patients / مرضى اليوم / آج کے مریض
"opd.currentPatient"           → Current Patient / المريض الحالي / موجودہ مریض
"opd.patientQueue"             → Patient Queue / قائمة المرضى / مریضوں کی قائمہ
"opd.continueConsultation"     → Continue Consultation / متابعة الاستشارة / مشاورت جاری رکھیں
"opd.startConsultation"        → Start Consultation / بدء الاستشارة / مشاورت شروع کریں
"opd.noPatientsInQueue"        → No patients in queue / لا مرضى في القائمة / قائمہ میں کوئی مریض نہیں
"opd.noPatientsWaiting"        → No patients waiting / لا مرضى في الانتظار / انتظار میں کوئی مریض نہیں
"opd.noPatientInProgress"      → No patient in progress / لا يوجد مريض قيد العلاج / کوئی مریض زیر علاج نہیں
"opd.viewHistory"              → View History / عرض السجل / تاریخ دیکھیں
"opd.inProgress"               → In Progress / قيد التنفيذ / زیر عمل
"opd.waiting"                  → Waiting / في الانتظار / انتظار میں
"opd.emergency"                → Emergency / طارئ / ایمرجنسی
"opd.urgent"                   → Urgent / عاجل / فوری
"opd.normal"                   → Normal / عادي / عام
"opd.chiefComplaintLabel"      → Chief Complaint: / الشكوى الرئيسية: / بنیادی شکایت:
"opd.nurseStation"             → Nurse Station / محطة التمريض / نرس اسٹیشن
"opd.allDepartments"           → All Departments / جميع الأقسام / تمام شعبے
"opd.quickPatientSearch"       → Quick Patient Search / بحث سريع عن المرضى / فوری مریض تلاش
"opd.searchByMrNamePhone"      → Search by MR#, name, or phone... / ابحث بالرقم أو الاسم أو الهاتف / MR# نام یا فون
"opd.searching"                → Searching... / جارٍ البحث... / تلاش ہو رہی ہے...
"opd.noPatientsFound"          → No patients found / لم يُعثر على مرضى / کوئی مریض نہیں ملا
"opd.awaitingVitals"           → Awaiting Vitals / في انتظار العلامات الحيوية / وائٹلز کا انتظار
"opd.vitalsComplete"           → Vitals Complete / العلامات الحيوية مكتملة / وائٹلز مکمل
"opd.inConsultation"           → In Consultation / في الاستشارة / مشاورت میں
"opd.totalToday"               → Total Today / الإجمالي اليوم / آج کا کل
"opd.readyForDoctor"           → Ready for Doctor / جاهز للطبيب / ڈاکٹر کے لیے تیار
"opd.quickActions"             → Quick Actions / إجراءات سريعة / فوری کارروائیاں
"opd.activeConsultations"      → Active Consultations / الاستشارات النشطة / فعال مشاورتیں
"opd.allVitalsRecorded"        → All patients have vitals recorded / تم تسجيل علامات جميع المرضى / تمام مریضوں کے وائٹلز ریکارڈ
"opd.noPatientsReady"          → No patients ready yet / لا مرضى جاهزون بعد / ابھی کوئی مریض تیار نہیں
"opd.viewFullQueue"            → View Full Queue / عرض القائمة الكاملة / مکمل قائمہ دیکھیں
```

---

## Files to Change

| File | Type | Specific Changes |
|------|------|------------------|
| `src/lib/i18n/translations/en.ts` | Add keys | ~35 new `opd.*` keys for Doctor/Nurse dashboards + Walk-in strings |
| `src/lib/i18n/translations/ar.ts` | Add keys | Arabic for all new keys |
| `src/lib/i18n/translations/ur.ts` | Add keys | Urdu for all new keys |
| `src/pages/app/opd/DoctorDashboard.tsx` | RTL + i18n | Add `useTranslation` + `useIsRTL`, replace all hardcoded strings, fix `mr-2` → `me-2`, `"Emergency"/"Urgent"` status badge labels |
| `src/pages/app/opd/NurseDashboard.tsx` | RTL + i18n | Add `useTranslation` + `useIsRTL`, replace all hardcoded strings, fix `left-3` → `isRTL ? "right-3" : "left-3"`, `pl-9` → `isRTL ? "pr-9" : "pl-9"`, `mr-2` → `me-2`, `ml-2` → `ms-2`, translate `priorityLabels` constant |
| `src/pages/app/opd/OPDWalkInPage.tsx` | i18n | Add `useTranslation`, replace all hardcoded form labels, step titles, button text |
| `src/pages/app/hr/HRDashboard.tsx` | RTL | Fix 2× `<ChevronRight>` → flip with `isRTL`, `ml-1` → `ms-1` |
| `src/pages/app/ipd/IPDDashboard.tsx` | RTL | Fix `mr-2` → `me-2` on buttons, `ml-1` → `ms-1` + flip `ArrowRight` icons, `ml-2` → `ms-2` on inline spans |

---

## Expected Outcome After These Fixes

| Page | Before | After |
|------|--------|-------|
| OPD Doctor Dashboard | 100% hardcoded English | Fully translated in Arabic/Urdu |
| OPD Nurse Dashboard | 100% hardcoded English + physical CSS RTL bugs | Translated + RTL-correct |
| OPD Walk-in Page | 100% hardcoded English | Fully translated |
| HR Dashboard "View All" buttons | `ChevronRight` + `ml-1` wrong in RTL | Flipped + logical spacing |
| IPD Dashboard buttons | `mr-2` physical (fine in LTR, wrong in RTL) | `me-2` logical, works both ways |
| IPD "View all" / "Recent Admissions" `ArrowRight` | Points wrong direction in RTL | Flipped with `isRTL` |

After this, every page accessible from the sidebar will have 100% translated strings and fully correct RTL layouts for Arabic and Urdu.


# Implement Full Arabic & Urdu Translations Across the App

## The Core Problem

The image confirms the RTL layout is working (sidebar on right, Arabic "عربي" label), but **every single text string is still in English**. This is because:

1. `useTranslation()` hook exists in `src/lib/i18n/index.ts` but is **never imported or called** in any component
2. The translation files (`ar.ts`, `en.ts`) have keys defined but nothing reads them
3. **No Urdu translation file exists at all** — `ur` falls back silently to English
4. Sidebar menu names are **hardcoded strings** in `src/config/role-sidebars.ts` — no translation system connects to them
5. Dashboard page text ("Today's Revenue", "Quick Actions", "Good Morning", etc.) is all hardcoded English strings
6. The `DynamicSidebar` renders `item.name` directly — a static string, never translated

---

## What Needs Translation

### Priority 1 — Sidebar Navigation (most visible)
`src/config/role-sidebars.ts` has hardcoded English names. Every menu item like "Dashboard", "Branches", "Users & Staff", "Organization", "Services", etc. must be translated.

**Approach**: Add a `labelKey` field to `SidebarMenuItem` that maps to a `TranslationKey`. The `DynamicSidebar` will call `t(item.labelKey)` instead of rendering `item.name` directly.

### Priority 2 — Dashboard Page
`src/pages/app/DashboardPage.tsx` has hardcoded strings:
- Greeting: "Good Morning/Night/Evening"
- Stats cards: "Total Patients", "Today's Appointments", "Active Consultations", "Today's Revenue"
- Section titles: "Quick Actions", "Collections Overview", "Alerts & Notifications"
- Action labels: "New Patient", "Schedule Appointment", "Today's Queue", "Create Invoice"
- Subtext: "Common tasks you can perform", "Here's what's happening today"

### Priority 3 — Translation Keys Expansion
Both `en.ts` and `ar.ts` need many new keys covering:
- Sidebar menu items for all roles (org_admin, doctor, nurse, pharmacist, receptionist, etc.)
- Dashboard greetings and card labels
- Quick action labels

### Priority 4 — Urdu Translation File
Create `src/lib/i18n/translations/ur.ts` with Urdu translations for all keys. Register it in `src/lib/i18n/index.ts`.

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/i18n/translations/en.ts` | Add ~60 new keys: nav menu items for all roles, dashboard greetings, quick action labels |
| `src/lib/i18n/translations/ar.ts` | Add matching Arabic translations for all new keys |
| `src/lib/i18n/translations/ur.ts` | **Create new file** with Urdu translations for all keys |
| `src/lib/i18n/index.ts` | Register `ur` translations; export updated hook |
| `src/config/role-sidebars.ts` | Add optional `labelKey?: TranslationKey` to `SidebarMenuItem`; add label keys to org_admin and common role items |
| `src/components/DynamicSidebar.tsx` | Import `useTranslation`, call `t(item.labelKey)` when available, fallback to `item.name` |
| `src/pages/app/DashboardPage.tsx` | Import `useTranslation`, replace all hardcoded strings with `t()` calls |

---

## New Translation Keys to Add

### Navigation / Sidebar (for `en.ts` and `ar.ts` and `ur.ts`)
```
nav.branches            → Branches / الفروع / شاخیں
nav.usersStaff          → Users & Staff / المستخدمون والموظفون / صارفین اور عملہ
nav.organization        → Organization / المؤسسة / تنظیم
nav.services            → Services / الخدمات / خدمات
nav.configuration       → Configuration / الإعداد / ترتیب
nav.warehouseManagement → Warehouse Management / إدارة المستودعات / گودام انتظام
nav.hrStaff             → HR & Staff / الموارد البشرية / HR اور عملہ
nav.accounts            → Accounts / الحسابات / اکاؤنٹس
nav.billing             (exists already)
nav.patients            (exists already)
nav.appointments        (exists already)
nav.opd                 (exists already)
nav.ipd                 (exists already)
nav.lab                 (exists already)
nav.pharmacy            (exists already)
nav.emergency           (exists already)
nav.inventory           (exists already)
nav.hr                  (exists already)
nav.reports             (exists already)

nav.allBranches         → All Branches / جميع الفروع / تمام شاخیں
nav.addBranch           → Add Branch / إضافة فرع / شاخ شامل کریں
nav.allUsers            → All Users / جميع المستخدمين / تمام صارفین
nav.rolesPermissions    → Roles & Permissions / الأدوار والصلاحيات / کردار اور اجازات
nav.inviteUsers         → Invite Users / دعوة المستخدمين / صارفین مدعو کریں
nav.profile             → Profile / الملف الشخصي / پروفائل
nav.modules             → Modules / الوحدات / ماڈیولز
nav.allServices         → All Services / جميع الخدمات / تمام خدمات
nav.categories          → Categories / الفئات / زمرے
nav.consultations       → Consultations / الاستشارات / مشاورت
nav.labTests            → Lab Tests / اختبارات المختبر / لیب ٹیسٹ
nav.radiology           → Radiology / الأشعة / ریڈیالوجی
nav.roomsBeds           → Rooms & Beds / الغرف والأسرة / کمرے اور بستر
nav.paymentMethods      → Payment Methods / طرق الدفع / ادائیگی کے طریقے
nav.taxSettings         → Tax Settings / إعدادات الضريبة / ٹیکس سیٹنگز
nav.receiptTemplates    → Receipt Templates / قوالب الإيصالات / رسید ٹیمپلیٹس
nav.purchaseOrders      → Purchase Orders / أوامر الشراء / خریداری آرڈرز
nav.vendors             → Vendors / الموردون / وینڈرز
nav.employees           → Employees / الموظفون / ملازمین
nav.attendance          → Attendance / الحضور / حاضری
nav.leaves              → Leaves / الإجازات / چھٹیاں
nav.payroll             → Payroll / الرواتب / تنخواہیں
nav.invoices            → Invoices / الفواتير / انوائسز
nav.payments            → Payments / المدفوعات / ادائیگیاں
nav.myWork              → My Work / عملي / میرا کام
nav.mySchedule          → My Schedule / جدولي / میرا شیڈول
nav.myWallet            → My Wallet / محفظتي / میری والٹ
nav.myAttendance        → My Attendance / حضوري / میری حاضری
nav.myLeaves            → My Leaves / إجازاتي / میری چھٹیاں
nav.myPayslips          → My Payslips / كشوف رواتبي / میرے پے سلپ
nav.patientQueue        → Patient Queue / قائمة المرضى / مریضوں کی قطار
nav.todaysQueue         → Today's Queue / قائمة اليوم / آج کی قطار
nav.myCalendar          → My Calendar / تقويمي / میرا کیلنڈر
nav.triage              → Triage / الفرز / ٹریج
nav.vitalsEntry         → Vitals Entry / إدخال العلامات الحيوية / وائٹلز اندراج
nav.opdOrders           → OPD Orders / طلبات العيادة الخارجية / OPD آرڈرز
nav.history             → History / التاريخ / تاریخ
nav.allAppointments     → All Appointments / جميع المواعيد / تمام ملاقاتیں
nav.chartOfAccounts     → Chart of Accounts / دليل الحسابات / چارٹ آف اکاؤنٹس
nav.journalEntries      → Journal Entries / قيود اليومية / جرنل اندراجات
nav.accountsPayable     → Accounts Payable / الحسابات المستحقة الدفع / اکاؤنٹس پیایبل
```

### Dashboard
```
dashboard.goodMorning       → Good Morning / صباح الخير / صبح بخیر
dashboard.goodAfternoon     → Good Afternoon / مساء الخير / شب بخیر (afternoon)
dashboard.goodEvening       → Good Evening / مساء الخير / شام بخیر
dashboard.goodNight         → Good Night / مساء الخير / شب بخیر
dashboard.hereToday         → Here's what's happening today / إليك ما يحدث اليوم / آج کیا ہو رہا ہے
dashboard.totalPatients     (exists)
dashboard.todayAppointments (exists)
dashboard.todayRevenue      (exists)
dashboard.activeConsultations → Active Consultations / الاستشارات النشطة / فعال مشاورتیں
dashboard.pendingInvoices   (exists)
dashboard.liveUpdates       → Live updates / تحديثات مباشرة / لائیو اپڈیٹس
dashboard.quickActions      → Quick Actions / إجراءات سريعة / فوری اقدامات
dashboard.commonTasks       → Common tasks you can perform / المهام الشائعة التي يمكنك تنفيذها / عام کام جو آپ کر سکتے ہیں
dashboard.newPatient        → New Patient / مريض جديد / نیا مریض
dashboard.scheduleAppointment → Schedule Appointment / جدولة موعد / ملاقات شیڈول کریں
dashboard.createInvoice     → Create Invoice / إنشاء فاتورة / انوائس بنائیں
dashboard.alertsNotifications → Alerts & Notifications / التنبيهات والإشعارات / الرٹس اور اطلاعات
dashboard.importantUpdates  → Important updates requiring attention / تحديثات مهمة تتطلب الاهتمام / اہم اپڈیٹس جن پر توجہ درکار ہے
dashboard.allCaughtUp       → All caught up! / لا يوجد شيء معلق! / سب ٹھیک ہے!
dashboard.noPendingAlerts   → No pending alerts at the moment / لا توجد تنبيهات معلقة في الوقت الحالي / ابھی کوئی الرٹ نہیں
dashboard.refresh           → Refresh / تحديث / ریفریش
dashboard.yourAccess        → Your Access / صلاحياتك / آپ کی رسائی
dashboard.yourRoles         → Your current roles and permissions / أدوارك وصلاحياتك الحالية / آپ کے موجودہ کردار اور اجازات
dashboard.collectionsOverview → Collections Overview / نظرة عامة على التحصيل / وصولی جائزہ
dashboard.pharmacyAlerts    → Pharmacy Alerts / تنبيهات الصيدلية / فارمیسی الرٹس
```

---

## Implementation Approach for Sidebar

The `role-sidebars.ts` file has 1,227 lines of menu item definitions all with hardcoded English names. Rather than adding a `labelKey` to every single item (hundreds of items), the cleanest approach is to create a **translation lookup map** that maps common menu names to their translation keys:

```ts
// In DynamicSidebar.tsx
const SIDEBAR_NAME_TO_KEY: Record<string, TranslationKey> = {
  "Dashboard": "nav.dashboard",
  "Branches": "nav.branches",
  "Users & Staff": "nav.usersStaff",
  "Organization": "nav.organization",
  "Billing": "nav.billing",
  "Patients": "nav.patients",
  "Appointments": "nav.appointments",
  // ... ~50 entries
};

// In RecursiveMenuItem render:
const displayName = SIDEBAR_NAME_TO_KEY[item.name] 
  ? t(SIDEBAR_NAME_TO_KEY[item.name]) 
  : item.name;
```

This avoids touching the 1,227-line config file at all — the translation happens at render time in the sidebar component.

---

## Summary

- **3 translation files** updated/created (en.ts extended, ar.ts extended, ur.ts created)
- **1 i18n index** updated to load Urdu
- **1 sidebar component** updated to translate menu names via lookup map
- **1 dashboard page** updated to use `t()` for all visible strings
- Result: switching to Arabic or Urdu immediately translates the sidebar navigation AND dashboard text, not just the layout direction

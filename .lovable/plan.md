
# Fix: Complete Sidebar Translation — Missing Names in Lookup Map + Missing Sub-Item Keys

## Root Cause Analysis from Screenshot

The screenshot shows Arabic mode working for some items but 5 sidebar items remain in English:
- **"Reception"** — not in `SIDEBAR_NAME_TO_KEY` map
- **"Inpatient (IPD)"** — not in map (the map has "IPD" but the DB item name is "Inpatient (IPD)")
- **"Operation Theatre"** — not in map
- **"Blood Bank"** — not in map
- **"Accounts & Finance"** — not in map (map has "Accounts" but DB item is "Accounts & Finance")

These are **database menu items** (for branch_admin/dynamic menu users). The `SIDEBAR_NAME_TO_KEY` lookup map in `DynamicSidebar.tsx` only covers static-config item names but is missing the database menu item names which differ slightly.

Additionally, ALL child sub-items from `role-sidebars.ts` are untranslated because they have unique names not in the lookup map:
- "All Organizations", "Add Organization", "Branch Analytics", "Role Management" (super_admin children)
- "Branch Branding", "Branch Roles", "Branding & Logo", "Audit Logs", "Billing" (org_admin children)
- "OPD Departments", "Specializations", "Qualifications", "Items", "Stock Levels", "GRN", "Requisitions" (org_admin config children)
- "POS Terminal", "Transactions", "Sessions", "Returns", "Medicines", "Stock", "Add Stock", "Stock Alerts", "Movements", "Suppliers", "Add Vendor" (pharmacist children)
- "Sample Queue", "Test Templates" (lab_technician children)
- "Worklist", "Verification", "Archive", "Studies", "Modalities", "Procedures", "Report Templates" (radiology children)
- "Donor List", "Register Donor", "Donations", "Cross Match", "Requests", "Transfusions" (blood bank children)
- "Today's Schedule", "All Surgeries", "Surgery Requests", "Schedule Surgery", "PACU" (OT children)
- "Daily Attendance", "Attendance Sheet", "Biometric Setup", "Duty Roster", "OT Roster", "Emergency Roster", "On-Call Schedule", "Publish Roster", "Roster Reports", "Overtime" (HR children)
- "Leave Management", "Leave Requests", "Leave Balances" (HR children)
- "Recruitment", "Exit Management", "Compliance", "Directory", "Add Employee" etc. (HR children)
- "Accounting", "Receivables", "Payables", "Banking" (finance children)
- "All Warehouses", "Create Warehouse", "Store Transfers", "Rack Assignments" (warehouse children)
- "Register Patient", "Book Appointment", "Today's Schedule", "Queue", "Bed Availability", "Ward View", "New Admission", "Active Admissions" (receptionist children)
- Many more unique sub-items

## What Needs To Be Done

### 1. Add Missing Top-Level Names to SIDEBAR_NAME_TO_KEY

Add these to the lookup map in `DynamicSidebar.tsx` with new translation keys:
```
"Reception"           → "nav.reception"
"Inpatient (IPD)"     → "nav.inpatientIpd"
"Operation Theatre"   → "nav.operationTheatre"
"Blood Bank"          → "nav.bloodBank"
"Accounts & Finance"  → "nav.accountsFinance"
```

Also add other names from static configs not yet in map:
```
"Nursing"             → "nav.nursing"
"Recovery"            → "nav.recovery"
"OT Rooms"            → "nav.otRooms"
"OT Queue"            → "nav.otQueue"
"Accounting"          → "nav.accounting"
"Receivables"         → "nav.receivables"
"Payables"            → "nav.payables"
"Banking"             → "nav.banking"
"Stock"               → "nav.stock"
"Requests"            → "nav.requests"
"Leave Management"    → "nav.leaveManagement"
"Recruitment"         → "nav.recruitment"
"Exit Management"     → "nav.exitManagement"
"Compliance"          → "nav.compliance"
"OT Charges"          → "nav.otCharges"
"Beds & Rooms"        → already exists as "nav.bedsRooms"
"Surgeries"           → already exists as "nav.surgeries"
```

### 2. Add Missing Sub-Item Translation Keys

Add all unique child item names to `en.ts`, `ar.ts`, and `ur.ts`:

**New navigation sub-item keys:**
```
// Top-level missing items
"nav.reception"              → Reception / الاستقبال / ریسپشن
"nav.inpatientIpd"           → Inpatient (IPD) / المرضى الداخليون / داخلی مریض (IPD)
"nav.operationTheatre"       → Operation Theatre / غرفة العمليات / آپریشن تھیٹر
"nav.bloodBank"              → Blood Bank / بنك الدم / بلڈ بینک
"nav.accountsFinance"        → Accounts & Finance / الحسابات والمالية / اکاؤنٹس اور مالیات
"nav.nursing"                → Nursing / التمريض / نرسنگ
"nav.recovery"               → Recovery / التعافي / ریکوری
"nav.otQueue"                → OT Queue / قائمة غرفة العمليات / OT قطار
"nav.accounting"             → Accounting / المحاسبة / محاسبہ
"nav.receivables"            → Receivables / المستحقات / وصولیاں
"nav.payables"               → Payables / المدفوعات / ادائیگیاں
"nav.banking"                → Banking / الخدمات المصرفية / بینکنگ
"nav.stock"                  → Stock / المخزون / اسٹاک
"nav.requests"               → Requests / الطلبات / درخواستیں
"nav.leaveManagement"        → Leave Management / إدارة الإجازات / چھٹی انتظام
"nav.recruitment"            → Recruitment / التوظيف / بھرتی
"nav.exitManagement"         → Exit Management / إدارة الخروج / خروج انتظام
"nav.compliance"             → Compliance / الامتثال / تعمیل
"nav.otCharges"              → OT Charges / رسوم غرفة العمليات / OT چارجز
"nav.otRooms"                → OT Rooms / غرف العمليات / OT کمرے

// Sub-items for org_admin/branches
"nav.branchBranding"         → Branch Branding / علامة الفرع / برانچ برانڈنگ
"nav.branchRoles"            → Branch Roles / أدوار الفرع / برانچ کردار
"nav.brandingLogo"           → Branding & Logo / العلامة والشعار / برانڈنگ اور لوگو
"nav.auditLogs"              → Audit Logs / سجلات التدقيق / آڈٹ لاگز
"nav.opdDepartments"         → OPD Departments / أقسام العيادات الخارجية / OPD محکمے
"nav.specializations"        → Specializations / التخصصات / تخصصات
"nav.qualifications"         → Qualifications / المؤهلات / اہلیت
"nav.items"                  → Items / العناصر / اشیاء
"nav.stockLevels"            → Stock Levels / مستويات المخزون / اسٹاک سطح
"nav.grn"                    → GRN / إيصال البضاعة / GRN
"nav.requisitions"           → Requisitions / طلبات الشراء / درخواستیں
"nav.allWarehouses"          → All Warehouses / جميع المستودعات / تمام گودام
"nav.createWarehouse"        → Create Warehouse / إنشاء مستودع / گودام بنائیں
"nav.storeTransfers"         → Store Transfers / نقل المخزون / اسٹور منتقلی
"nav.subscriptionPlans"      → Subscription Plans / خطط الاشتراك / سبسکرپشن پلانز
"nav.organizationBilling"    → Organization Billing / فوترة المؤسسة / تنظیم بلنگ
"nav.platformSettings"       → Platform Settings / إعدادات المنصة / پلیٹ فارم سیٹنگز
"nav.moduleCatalog"          → Module Catalog / كتالوج الوحدات / ماڈیول کیٹالاگ
"nav.systemHealth"           → System Health / صحة النظام / سسٹم صحت
"nav.supportTickets"         → Support Tickets / تذاكر الدعم / سپورٹ ٹکٹ
"nav.allOrganizations"       → All Organizations / جميع المؤسسات / تمام تنظیمیں
"nav.addOrganization"        → Add Organization / إضافة مؤسسة / تنظیم شامل کریں
"nav.branchAnalytics"        → Branch Analytics / تحليلات الفرع / برانچ تجزیہ
"nav.roleManagement"         → Role Management / إدارة الأدوار / کردار انتظام

// Pharmacist sub-items
"nav.posTerminal"            → POS Terminal / نقطة البيع / POS ٹرمینل
"nav.transactions"           → Transactions / المعاملات / لین دین
"nav.sessions"               → Sessions / الجلسات / سیشنز
"nav.returns"                → Returns / المرتجعات / واپسی
"nav.medicines"              → Medicines / الأدوية / دوائیں
"nav.addStock"               → Add Stock / إضافة مخزون / اسٹاک شامل کریں
"nav.stockAlerts"            → Stock Alerts / تنبيهات المخزون / اسٹاک الرٹس
"nav.movements"              → Movements / الحركات / نقل و حرکت
"nav.suppliers"              → Suppliers / الموردون / سپلائرز
"nav.addVendor"              → Add Vendor / إضافة مورد / وینڈر شامل کریں
"nav.myWarehouses"           → My Warehouses / مستودعاتي / میرے گودام
"nav.rackAssignments"        → Rack Assignments / تخصيص الرفوف / ریک اسائنمنٹ

// Lab sub-items
"nav.sampleQueue"            → Sample Queue / قائمة العينات / نمونہ قطار
"nav.testTemplates"          → Test Templates / قوالب الاختبارات / ٹیسٹ ٹیمپلیٹ

// Radiology sub-items
"nav.worklist"               → Worklist / قائمة العمل / ورک لسٹ
"nav.verification"           → Verification / التحقق / تصدیق
"nav.archive"                → Archive / الأرشيف / آرکائیو
"nav.studies"                → Studies / الدراسات / مطالعات
"nav.modalities"             → Modalities / الوسائط / طریقے
"nav.procedures"             → Procedures / الإجراءات / طریق کار
"nav.reportTemplates"        → Report Templates / قوالب التقارير / رپورٹ ٹیمپلیٹ
"nav.schedule"               → Schedule / الجدول / شیڈول
"nav.setupGuide"             → Setup Guide / دليل الإعداد / سیٹ اپ گائیڈ

// Blood Bank sub-items
"nav.donorList"              → Donor List / قائمة المتبرعين / ڈونر فہرست
"nav.registerDonor"          → Register Donor / تسجيل متبرع / ڈونر رجسٹر کریں
"nav.donations"              → Donations / التبرعات / عطیات
"nav.crossMatch"             → Cross Match / مطابقة الدم / کراس میچ
"nav.transfusions"           → Transfusions / عمليات نقل الدم / منتقلی خون

// OT sub-items
"nav.todaysSchedule"         → Today's Schedule / جدول اليوم / آج کا شیڈول
"nav.allSurgeries"           → All Surgeries / جميع العمليات / تمام آپریشن
"nav.surgeryRequests"        → Surgery Requests / طلبات العمليات / آپریشن درخواستیں
"nav.scheduleSurgery"        → Schedule Surgery / جدولة عملية / آپریشن شیڈول کریں
"nav.pacu"                   → PACU / وحدة التعافي / PACU
"nav.intraNotes"             → Intra-Op Notes / ملاحظات العملية / آپریشن نوٹس
"nav.instrumentCount"        → Instrument Count / عد الأدوات / آلات کی گنتی
"nav.otRoomsItem"            → OT Rooms / غرف العمليات / OT کمرے
"nav.surgeryList"            → Surgery List / قائمة العمليات / آپریشن فہرست
"nav.medicationQueue"        → Medication Queue / قائمة الدواء / دوا قطار
"nav.medicationCharges"      → Medication Charges / رسوم الدواء / دوا چارجز

// HR sub-items
"nav.directory"              → Directory / الدليل / ڈائریکٹری
"nav.addEmployee"            → Add Employee / إضافة موظف / ملازم شامل کریں
"nav.doctors"                → Doctors / الأطباء / ڈاکٹرز
"nav.nurses"                 → Nurses / الممرضون / نرسیں
"nav.paramedicalStaff"       → Paramedical Staff / الطاقم شبه الطبي / پیراطبی عملہ
"nav.supportStaff"           → Support Staff / الطاقم الداعم / معاون عملہ
"nav.visitingDoctors"        → Visiting Doctors / الأطباء الزائرون / وزیٹنگ ڈاکٹرز
"nav.dailyAttendance"        → Daily Attendance / الحضور اليومي / روزانہ حاضری
"nav.attendanceSheet"        → Attendance Sheet / كشف الحضور / حاضری شیٹ
"nav.biometricSetup"         → Biometric Setup / إعداد البيومتري / بایومیٹرک سیٹ اپ
"nav.dutyRoster"             → Duty Roster / جدول الخدمة / ڈیوٹی روسٹر
"nav.otRoster"               → OT Roster / جدول غرفة العمليات / OT روسٹر
"nav.emergencyRoster"        → Emergency Roster / جدول الطوارئ / ایمرجنسی روسٹر
"nav.onCallSchedule"         → On-Call Schedule / جدول المناوبات / آن کال شیڈول
"nav.publishRoster"          → Publish Roster / نشر الجدول / روسٹر شائع کریں
"nav.rosterReports"          → Roster Reports / تقارير الجدول / روسٹر رپورٹس
"nav.overtime"               → Overtime / الأوقات الإضافية / اوور ٹائم
"nav.leaveRequests"          → Leave Requests / طلبات الإجازة / چھٹی درخواستیں
"nav.leaveBalances"          → Leave Balances / أرصدة الإجازة / چھٹی بیلنس
"nav.processPayroll"         → Process Payroll / معالجة الرواتب / تنخواہ پروسیس
"nav.employeeSalaries"       → Employee Salaries / رواتب الموظفين / ملازم تنخواہیں
"nav.doctorCompensation"     → Doctor Compensation / تعويض الطبيب / ڈاکٹر معاوضہ
"nav.doctorEarnings"         → Doctor Earnings / أرباح الطبيب / ڈاکٹر آمدنی
"nav.walletBalances"         → Wallet Balances / أرصدة المحفظة / والٹ بیلنس
"nav.loansAdvances"          → Loans & Advances / القروض والسلف / قرضے اور ایڈوانس
"nav.payslips"               → Payslips / كشوف الرواتب / پے سلپ
"nav.bankSheets"             → Bank Sheets / كشوف البنك / بینک شیٹس
"nav.jobOpenings"            → Job Openings / فرص العمل / ملازمت کے مواقع
"nav.applications"           → Applications / الطلبات / درخواستیں
"nav.resignations"           → Resignations / الاستقالات / استعفے
"nav.clearance"              → Clearance / التسوية / کلیئرنس
"nav.finalSettlement"        → Final Settlement / التسوية النهائية / حتمی تصفیہ
"nav.exitInterviews"         → Exit Interviews / مقابلات الخروج / ایگزٹ انٹرویوز
"nav.medicalFitness"         → Medical Fitness / اللياقة الطبية / طبی فٹنس
"nav.vaccinations"           → Vaccinations / التطعيمات / ویکسینیشن
"nav.disciplinary"           → Disciplinary / التأديبي / تادیبی
"nav.departments"            → Departments / الأقسام / محکمے
"nav.designations"           → Designations / المسميات الوظيفية / عہدے
"nav.employeeCategories"     → Employee Categories / فئات الموظفين / ملازم زمرے
"nav.leaveTypes"             → Leave Types / أنواع الإجازات / چھٹی کی اقسام
"nav.shifts"                 → Shifts / الوردیات / شفٹیں
"nav.holidays"               → Holidays / العطلات / تعطیلات

// Finance sub-items
"nav.generalLedger"          → General Ledger / دفتر الأستاذ / جنرل لیجر
"nav.outstanding"            → Outstanding / المبالغ المستحقة / واجب الادا
"nav.vendorBills"            → Vendor Bills / فواتير الموردين / وینڈر بلز
"nav.vendorPayments"         → Vendor Payments / مدفوعات الموردين / وینڈر ادائیگیاں
"nav.bankAccounts"           → Bank Accounts / الحسابات المصرفية / بینک اکاؤنٹس
"nav.budgets"                → Budgets / الميزانيات / بجٹ
"nav.financialReports"       → Financial Reports / التقارير المالية / مالی رپورٹس
"nav.trialBalance"           → Trial Balance / ميزان المراجعة / ٹرائل بیلنس
"nav.profitLoss"             → Profit & Loss / الأرباح والخسائر / نفع و نقصان
"nav.balanceSheet"           → Balance Sheet / الميزانية العمومية / بیلنس شیٹ
"nav.cashFlow"               → Cash Flow / التدفق النقدي / نقد کا بہاؤ
"nav.accountTypes"           → Account Types / أنواع الحسابات / اکاؤنٹ اقسام

// Inventory sub-items
"nav.search"                 → Search / بحث / تلاش

// Receptionist sub-items
"nav.bookAppointment"        → Book Appointment / حجز موعد / ملاقات بک کریں
"nav.queue"                  → Queue / قائمة الانتظار / قطار
"nav.bedAvailability"        → Bed Availability / توفر الأسرة / بستر دستیابی
"nav.wardView"               → Ward View / عرض الجناح / وارڈ منظر
"nav.newAdmission"           → New Admission / قبول جديد / نئی داخلگی
"nav.activeAdmissions"       → Active Admissions / القبول النشط / فعال داخلگی
"nav.opdCheckout"            → OPD Checkout / خروج العيادة الخارجية / OPD چیک آؤٹ
"nav.newInvoice"             → New Invoice / فاتورة جديدة / نئی انوائس

// OPD Children (for doctor role)
"nav.ipd_patients"           (use existing nav.myPatients)
"nav.requestDischarge"       → Request Discharge / طلب خروج / خروج کی درخواست

// Receptionist OT Charges children
"nav.medicationChargesItem"  → Medication Charges / رسوم الدواء / دوا چارجز

// Inventory organization sub-items
"nav.organizationReports"    → Organization Reports / تقارير المؤسسة / تنظیم رپورٹس
"nav.branchComparison"       → Branch Comparison / مقارنة الفروع / برانچ موازنہ
"nav.dayEndSummary"          → Day-End Summary / ملخص نهاية اليوم / دن کا اختتامی خلاصہ
```

## Files to Change

| File | Change |
|------|--------|
| `src/lib/i18n/translations/en.ts` | Add ~90 new sub-item nav keys |
| `src/lib/i18n/translations/ar.ts` | Add matching Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add matching Urdu translations |
| `src/components/DynamicSidebar.tsx` | Expand `SIDEBAR_NAME_TO_KEY` with ~95 additional entries for all missing names |

## Sidebar SIDEBAR_NAME_TO_KEY Additions

The lookup map needs these additions (beyond what's already there):

```ts
// Database menu item names (different from static config)
"Reception": "nav.reception",
"Inpatient (IPD)": "nav.inpatientIpd",
"Operation Theatre": "nav.operationTheatre",
"Blood Bank": "nav.bloodBank",
"Accounts & Finance": "nav.accountsFinance",

// Static config sub-items not yet mapped
"Branch Branding": "nav.branchBranding",
"Branch Roles": "nav.branchRoles",
"Branding & Logo": "nav.brandingLogo",
"Audit Logs": "nav.auditLogs",
"OPD Departments": "nav.opdDepartments",
"Specializations": "nav.specializations",
"Qualifications": "nav.qualifications",
"Items": "nav.items",
"Stock Levels": "nav.stockLevels",
"GRN": "nav.grn",
"Requisitions": "nav.requisitions",
"All Warehouses": "nav.allWarehouses",
"Create Warehouse": "nav.createWarehouse",
"Store Transfers": "nav.storeTransfers",
"Nursing": "nav.nursing",
"Recovery": "nav.recovery",
"OT Queue": "nav.otQueue",
"OT Charges": "nav.otCharges",
"OT Rooms": "nav.otRooms",
"Accounting": "nav.accounting",
"Receivables": "nav.receivables",
"Payables": "nav.payables",
"Banking": "nav.banking",
"Stock": "nav.stock",
"Requests": "nav.requests",
"Leave Management": "nav.leaveManagement",
"Recruitment": "nav.recruitment",
"Exit Management": "nav.exitManagement",
"Compliance": "nav.compliance",
"POS Terminal": "nav.posTerminal",
"Transactions": "nav.transactions",
"Sessions": "nav.sessions",
"Returns": "nav.returns",
"Medicines": "nav.medicines",
"Add Stock": "nav.addStock",
"Stock Alerts": "nav.stockAlerts",
"Movements": "nav.movements",
"Suppliers": "nav.suppliers",
"Add Vendor": "nav.addVendor",
"My Warehouses": "nav.myWarehouses",
"Rack Assignments": "nav.rackAssignments",
"Sample Queue": "nav.sampleQueue",
"Test Templates": "nav.testTemplates",
"Worklist": "nav.worklist",
"Verification": "nav.verification",
"Archive": "nav.archive",
"Studies": "nav.studies",
"Modalities": "nav.modalities",
"Procedures": "nav.procedures",
"Report Templates": "nav.reportTemplates",
"Schedule": "nav.schedule",
"Setup Guide": "nav.setupGuide",
"Donor List": "nav.donorList",
"Register Donor": "nav.registerDonor",
"Donations": "nav.donations",
"Cross Match": "nav.crossMatch",
"Transfusions": "nav.transfusions",
"Today's Schedule": "nav.todaysSchedule",
"All Surgeries": "nav.allSurgeries",
"Surgery Requests": "nav.surgeryRequests",
"Schedule Surgery": "nav.scheduleSurgery",
"PACU": "nav.pacu",
"Intra-Op Notes": "nav.intraNotes",
"Instrument Count": "nav.instrumentCount",
"Surgery List": "nav.surgeryList",
"Medication Queue": "nav.medicationQueue",
"Medication Charges": "nav.medicationCharges",
"Directory": "nav.directory",
"Add Employee": "nav.addEmployee",
"Doctors": "nav.doctors",
"Nurses": "nav.nurses",
"Paramedical Staff": "nav.paramedicalStaff",
"Support Staff": "nav.supportStaff",
"Visiting Doctors": "nav.visitingDoctors",
"Daily Attendance": "nav.dailyAttendance",
"Attendance Sheet": "nav.attendanceSheet",
"Biometric Setup": "nav.biometricSetup",
"Duty Roster": "nav.dutyRoster",
"OT Roster": "nav.otRoster",
"Emergency Roster": "nav.emergencyRoster",
"On-Call Schedule": "nav.onCallSchedule",
"Publish Roster": "nav.publishRoster",
"Roster Reports": "nav.rosterReports",
"Overtime": "nav.overtime",
"Leave Requests": "nav.leaveRequests",
"Leave Balances": "nav.leaveBalances",
"Process Payroll": "nav.processPayroll",
"Employee Salaries": "nav.employeeSalaries",
"Doctor Compensation": "nav.doctorCompensation",
"Doctor Earnings": "nav.doctorEarnings",
"Wallet Balances": "nav.walletBalances",
"Loans & Advances": "nav.loansAdvances",
"Payslips": "nav.payslips",
"Bank Sheets": "nav.bankSheets",
"Job Openings": "nav.jobOpenings",
"Applications": "nav.applications",
"Resignations": "nav.resignations",
"Clearance": "nav.clearance",
"Final Settlement": "nav.finalSettlement",
"Exit Interviews": "nav.exitInterviews",
"Medical Fitness": "nav.medicalFitness",
"Vaccinations": "nav.vaccinations",
"Disciplinary": "nav.disciplinary",
"Departments": "nav.departments",
"Designations": "nav.designations",
"Employee Categories": "nav.employeeCategories",
"Leave Types": "nav.leaveTypes",
"Shifts": "nav.shifts",
"Holidays": "nav.holidays",
"General Ledger": "nav.generalLedger",
"Outstanding": "nav.outstanding",
"Vendor Bills": "nav.vendorBills",
"Vendor Payments": "nav.vendorPayments",
"Bank Accounts": "nav.bankAccounts",
"Budgets": "nav.budgets",
"Financial Reports": "nav.financialReports",
"Trial Balance": "nav.trialBalance",
"Profit & Loss": "nav.profitLoss",
"Balance Sheet": "nav.balanceSheet",
"Cash Flow": "nav.cashFlow",
"Account Types": "nav.accountTypes",
"Book Appointment": "nav.bookAppointment",
"Queue": "nav.queue",
"Bed Availability": "nav.bedAvailability",
"Ward View": "nav.wardView",
"New Admission": "nav.newAdmission",
"Active Admissions": "nav.activeAdmissions",
"OPD Checkout": "nav.opdCheckout",
"New Invoice": "nav.newInvoice",
"Request Discharge": "nav.requestDischarge",
"Organization Reports": "nav.organizationReports",
"Branch Comparison": "nav.branchComparison",
"Day-End Summary": "nav.dayEndSummary",
"Subscription Plans": "nav.subscriptionPlans",
"Organization Billing": "nav.organizationBilling",
"Platform Settings": "nav.platformSettings",
"Module Catalog": "nav.moduleCatalog",
"System Health": "nav.systemHealth",
"Support Tickets": "nav.supportTickets",
"All Organizations": "nav.allOrganizations",
"Add Organization": "nav.addOrganization",
"Branch Analytics": "nav.branchAnalytics",
"Role Management": "nav.roleManagement",
"Beds": "nav.beds",
"Wards": "nav.wards",
"Housekeeping": "nav.housekeeping",
"Ward Rounds": "nav.wardRounds",
"Vitals": "nav.vitals",
"Nursing Notes": "nav.nursingNotes",
"Medication Chart": "nav.medicationChart",
"Search": "nav.search",
"IPD Patients": "nav.ipdPatients",
"ER Triage": "nav.erTriage",
"Pre-Anesthesia": "nav.preAnesthesia",
```

## What This Fixes

After this change:
- Every sidebar item for every role (org_admin, doctor, nurse, pharmacist, receptionist, lab_technician, radiologist, blood_bank_technician, surgeon, anesthetist, hr_manager, finance_manager, store_manager, etc.) will have its name translated to Arabic or Urdu
- The database menu items ("Reception", "Inpatient (IPD)", "Operation Theatre", "Blood Bank", "Accounts & Finance") will be correctly translated
- ALL child/sub-menu items will translate correctly since they now have entries in the lookup map
- Both static-config sidebars AND database-driven sidebars are covered

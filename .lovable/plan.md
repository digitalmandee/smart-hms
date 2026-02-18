
# Complete End-to-End Translation: Remaining Modules

## Current State (After Previous Work)
- Translation system: ✅ Working (`useTranslation`, `getTranslatedString`, localStorage caching)
- Sidebar items: ✅ All translated
- Dashboard (main): ✅ Translated
- IPD Dashboard + Admissions List: ✅ Translated
- Patients List + Invoices List: ✅ Translated
- CollectionsWidget + PharmacyAlertsWidget: ✅ Translated

## What Still Needs Translation (All Remaining Modules)

After deep reading every module dashboard and list page, here is the complete remaining work:

### 1. OPD Admin Dashboard (`src/pages/app/opd/OPDAdminDashboard.tsx`)
Hardcoded strings:
- "OPD Dashboard", "Today's outpatient department overview"
- "History", "Walk-in" (buttons)
- quickStats: "Patients", "Completed", "In Queue"
- Stats cards: "Total Patients", "Completed", "In Queue", "Revenue Today"
- "Department-wise Breakdown" section title
- Table headers: "Department", "Patients", "Completed", "Revenue"
- "No department data for today", "No patient flow data yet"
- "Hourly Patient Flow", "Doctor Performance"
- Table headers: "Doctor", "Patients", "Revenue"
- "No doctor data for today"
- "Revenue Breakdown" with "Paid", "Pending", "Cancelled/Waived"
- Quick navigation: "Walk-in", "Pending Checkout", "OPD Reports", "History"
- "Recent Consultations" with headers "Patient", "Doctor", "Status", "Time"
- "No consultations today"

### 2. Billing Dashboard (`src/pages/app/billing/BillingDashboard.tsx`)
Hardcoded strings:
- "Billing Dashboard", "Manage invoices, payments, and collections"
- "Create Invoice" (button)
- Stats: "Today's Collections", "Pending Invoices", "Outstanding Amount", "Invoices Today"
- "Quick Actions" section + "Open Billing Session", "Create New Invoice", "View Pending Invoices", "Daily Closing"
- "Recent Invoices", "View All"
- "No invoices yet"

### 3. HR Dashboard (`src/pages/app/hr/HRDashboard.tsx`)
Hardcoded strings:
- "HR Dashboard", subtitle with date
- Stats: "Total Employees", "Present Today", "On Leave Today", "Payroll Status"
- change labels: "Active workforce", "X late arrivals", "X pending requests", "This month"
- quickAccessItems: "Doctors", "Nurses", "Attendance", "Payroll" + subtitles
- "Pending Leave Requests", "View All", "No pending requests", "All leave requests have been processed"
- "Today's Attendance" with "Present", "Absent", "Late", "On Leave"
- "View Attendance"
- "Birthdays This Month", "No birthdays this month", "This month"
- "Alerts", "pending leave requests", "loan approvals pending", "licenses expiring soon"
- "No pending alerts"
- "Recent Employees", "View All", "No employees found", "Add First Employee"

### 4. Lab Dashboard (`src/pages/app/lab/LabDashboard.tsx`)
Hardcoded strings:
- "Laboratory", "Manage lab orders and results"
- "Enter Results", "View Queue" (buttons)
- quickStats: "Pending", "STAT", "Completed"
- STAT alert: "X STAT order(s) require immediate attention", "Process these high-priority orders first", "View STAT Orders"
- Stats: "Pending Orders", "STAT Orders", "Collected Today", "Completed Today"
- "Lab Queue", "View all pending orders", "Enter Results", "Record test results"
- Status badges: "Ordered", "Collected", "Processing", "Completed"
- Priority badges: "Urgent", "Routine"
- "Recent Orders", "View All", "No pending lab orders"
- "X test(s)"

### 5. Pharmacy Dashboard (`src/pages/app/pharmacy/PharmacyDashboard.tsx`)
Hardcoded strings:
- "Pharmacy", (no subtitle)
- "Inventory", "View Queue" (buttons)
- quickStats: "Pending", "Dispensed", "Low Stock"
- Stats: "Pending Prescriptions", "Dispensed Today", "Low Stock Items", "Expiring Soon"
- Quick actions: "Medicine Catalog", "Manage medicines", "Add Stock", "Add new inventory", "View Inventory", "Stock levels & batches"
- "Prescription Queue", "View All (X)", "No pending prescriptions"

### 6. OT Dashboard (`src/pages/app/ot/OTDashboard.tsx`)
Hardcoded strings:
- "Operation Theatre", "Manage surgical scheduling, OT rooms, and post-op recovery"
- "Refresh", "Schedule Surgery" (buttons)
- quickStats: "In Progress", "Completed", "Emergency"
- Stats: "Today's Surgeries", "X in progress", "Available Rooms", "OT rooms ready", "In PACU", "Recovering patients", "Emergency Cases", "Today"
- Quick stats row: "Scheduled this week", "Currently in progress", "Completed today"
- "OT Room Status", "Current status of all operating rooms", "Manage Rooms"
- "Today's Surgeries", "Surgery queue for today", "Full Schedule"
- "Upcoming Surgeries", "Scheduled for the next 30 days", "View Schedule"
- "No upcoming surgeries scheduled", "Schedule Surgery", "+X more surgeries"
- toast: "Dashboard refreshed"

### 7. Org Admin Dashboard (`src/pages/app/OrgAdminDashboardPage.tsx`)
Hardcoded strings:
- "Organization Overview"
- quickStats: "Branches", "Total Staff", "Today's Appointments"
- "Manage Branches"
- Stats: "Active Branches", "Across organization", "Total Patients", "All branches", "Staff Members", "Active users", "Today's Appointments", "In progress", "Active Consultations"
- "Branch Overview", "Quick view of all active branches in your organization"
- "No active branches found", "Create your first branch to get started", "Create Branch"

### 8. Appointments List Page (`src/pages/app/appointments/AppointmentsListPage.tsx`)
Hardcoded strings:
- "Appointments", "Manage patient appointments and scheduling"
- "Queue", "New Appointment" (buttons)
- Mobile header: "Appointments"
- statusLabels: "Scheduled", "Checked In", "In Progress", "Completed", "Cancelled", "No Show"
- typeLabels: "Walk-in", "Scheduled", "Follow-up"
- Stats: "Today's Appointments", "Waiting", "Completed", "Cancelled"
- Filter dropdowns: "All Statuses", "Scheduled", "Checked In"... "All Doctors"
- Table headers: "Token", "Patient", "Time", "Doctor", "Type", "Status", "Chief Complaint"
- "No appointments found", "Search patients..."
- Mobile filter chips: "All", "Scheduled", "Checked In"...
- "View Queue"

---

## Translation Keys to Add (~120 new keys)

### OPD Module
```
"opd.dashboard"               → OPD Dashboard / لوحة تحكم العيادات الخارجية / OPD ڈیش بورڈ
"opd.subtitle"                → Today's outpatient department overview / نظرة عامة على العيادات الخارجية / آج کے بیرونی مریضوں کا جائزہ
"opd.departmentBreakdown"     → Department-wise Breakdown / التوزيع حسب الأقسام / قسم کے مطابق تقسیم
"opd.hourlyFlow"              → Hourly Patient Flow / تدفق المرضى في الساعة / گھنٹے وار مریض کا بہاؤ
"opd.doctorPerformance"       → Doctor Performance / أداء الأطباء / ڈاکٹر کی کارکردگی
"opd.revenueBreakdown"        → Revenue Breakdown / تفصيل الإيرادات / آمدنی کی تفصیل
"opd.recentConsultations"     → Recent Consultations / الاستشارات الأخيرة / حالیہ مشاورتیں
"opd.noDeptData"              → No department data for today / لا بيانات للأقسام اليوم / آج قسم کا کوئی ڈیٹا نہیں
"opd.noFlowData"              → No patient flow data yet / لا بيانات تدفق المرضى / ابھی کوئی بہاؤ ڈیٹا نہیں
"opd.noDoctorData"            → No doctor data for today / لا بيانات الأطباء اليوم / آج ڈاکٹر کا کوئی ڈیٹا نہیں
"opd.noConsultations"         → No consultations today / لا استشارات اليوم / آج کوئی مشاورت نہیں
"opd.pendingCheckout"         → Pending Checkout / خروج معلق / زیر التواء چیک آؤٹ
"opd.opdReports"              → OPD Reports / تقارير العيادات الخارجية / OPD رپورٹس
"opd.walkIn"                  → Walk-in / حضور مباشر / واک ان
"opd.cancelled"               → Cancelled/Waived / ملغي / منسوخ
```

### Billing Module
```
"billing.dashboard"           → Billing Dashboard / لوحة تحكم الفوترة / بلنگ ڈیش بورڈ
"billing.dashboardSubtitle"   → Manage invoices, payments, and collections / إدارة الفواتير والمدفوعات / انوائسز اور ادائیگیاں
"billing.createInvoice"       → Create Invoice / إنشاء فاتورة / انوائس بنائیں
"billing.todayCollections"    → Today's Collections / تحصيلات اليوم / آج کی وصولیاں
"billing.pendingInvoices"     → Pending Invoices / الفواتير المعلقة / زیر التواء انوائسز
"billing.outstandingAmount"   → Outstanding Amount / المبلغ المستحق / واجب الادا رقم
"billing.invoicesToday"       → Invoices Today / فواتير اليوم / آج کی انوائسز
"billing.quickActions"        → Quick Actions / إجراءات سريعة / فوری کارروائیاں
"billing.openSession"         → Open Billing Session / فتح جلسة الفوترة / بلنگ سیشن کھولیں
"billing.createNewInvoice"    → Create New Invoice / إنشاء فاتورة جديدة / نئی انوائس بنائیں
"billing.viewPendingInvoices" → View Pending Invoices / عرض الفواتير المعلقة / زیر التواء انوائسز دیکھیں
"billing.dailyClosing"        → Daily Closing / الإغلاق اليومي / روزانہ بندش
"billing.recentInvoices"      → Recent Invoices / الفواتير الأخيرة / حالیہ انوائسز
"billing.noInvoicesYet"       → No invoices yet / لا توجد فواتير بعد / ابھی کوئی انوائس نہیں
```

### HR Module
```
"hr.dashboard"                → HR Dashboard / لوحة تحكم الموارد البشرية / HR ڈیش بورڈ
"hr.totalEmployees"           → Total Employees / إجمالي الموظفين / کل ملازمین
"hr.activeWorkforce"          → Active workforce / القوى العاملة النشطة / فعال افرادی قوت
"hr.presentToday"             → Present Today / الحضور اليوم / آج حاضر
"hr.lateArrivals"             → late arrivals / وصل متأخرون / دیر سے آنے والے
"hr.onLeaveToday"             → On Leave Today / في إجازة اليوم / آج چھٹی پر
"hr.pendingRequests"          → pending requests / طلبات معلقة / زیر التواء درخواستیں
"hr.payrollStatus"            → Payroll Status / حالة الرواتب / تنخواہ کی حالت
"hr.thisMonth"                → This month / هذا الشهر / اس ماہ
"hr.attendanceSubtitle"       → Track time / تتبع الوقت / وقت ٹریک کریں
"hr.payrollSubtitle"          → Salary processing / معالجة الرواتب / تنخواہ پروسیسنگ
"hr.pendingLeaveRequests"     → Pending Leave Requests / طلبات الإجازة المعلقة / زیر التواء چھٹی درخواستیں
"hr.noPendingRequests"        → No pending requests / لا طلبات معلقة / کوئی زیر التواء درخواست نہیں
"hr.allRequestsProcessed"     → All leave requests have been processed / تمت معالجة جميع الطلبات / تمام درخواستیں مکمل
"hr.todaysAttendance"         → Today's Attendance / حضور اليوم / آج کی حاضری
"hr.present"                  → Present / حاضر / حاضر
"hr.absent"                   → Absent / غائب / غیر حاضر
"hr.late"                     → Late / متأخر / دیر سے
"hr.onLeave"                  → On Leave / في إجازة / چھٹی پر
"hr.viewAttendance"           → View Attendance / عرض الحضور / حاضری دیکھیں
"hr.birthdaysThisMonth"       → Birthdays This Month / أعياد الميلاد هذا الشهر / اس ماہ سالگرہ
"hr.noBirthdays"              → No birthdays this month / لا أعياد ميلاد هذا الشهر / اس ماہ کوئی سالگرہ نہیں
"hr.alerts"                   → Alerts / التنبيهات / الرٹس
"hr.pendingLeaveAlerts"       → pending leave requests / طلبات إجازة معلقة / زیر التواء چھٹی درخواستیں
"hr.loanApprovalsPending"     → loan approvals pending / موافقات القروض المعلقة / زیر التواء قرض منظوری
"hr.licensesExpiringSoon"     → licenses expiring soon / رخص ستنتهي قريباً / جلد ختم ہونے والے لائسنس
"hr.noPendingAlerts"          → No pending alerts / لا تنبيهات معلقة / کوئی زیر التواء الرٹ نہیں
"hr.recentEmployees"          → Recent Employees / الموظفون الأخيرون / حالیہ ملازمین
"hr.noEmployeesFound"         → No employees found / لم يتم العثور على موظفين / کوئی ملازم نہیں ملا
"hr.addFirstEmployee"         → Add First Employee / أضف أول موظف / پہلا ملازم شامل کریں
"hr.urgent"                   → Urgent / عاجل / فوری
"hr.action"                   → Action / إجراء / کارروائی
```

### Lab Module
```
"lab.dashboard"               → Laboratory / المختبر / لیبارٹری
"lab.subtitle"                → Manage lab orders and results / إدارة طلبات المختبر والنتائج / لیب آرڈرز اور نتائج
"lab.enterResults"            → Enter Results / إدخال النتائج / نتائج درج کریں
"lab.viewQueue"               → View Queue / عرض القائمة / قائمہ دیکھیں
"lab.statAlert"               → STAT order(s) require immediate attention / طلبات STAT تستدعي الاهتمام الفوري / STAT آرڈرز فوری توجہ چاہتے ہیں
"lab.processStatFirst"        → Process these high-priority orders first / قم بمعالجة هذه الطلبات ذات الأولوية أولاً / یہ اہم آرڈرز پہلے پروسیس کریں
"lab.viewStatOrders"          → View STAT Orders / عرض طلبات STAT / STAT آرڈرز دیکھیں
"lab.pendingOrders"           → Pending Orders / الطلبات المعلقة / زیر التواء آرڈرز
"lab.statOrders"              → STAT Orders / طلبات STAT / STAT آرڈرز
"lab.collectedToday"          → Collected Today / تم جمعه اليوم / آج جمع ہوا
"lab.completedToday"          → Completed Today / اكتمل اليوم / آج مکمل
"lab.labQueue"                → Lab Queue / قائمة المختبر / لیب قائمہ
"lab.viewAllPending"          → View all pending orders / عرض جميع الطلبات المعلقة / تمام زیر التواء آرڈرز
"lab.enterResultsAction"      → Enter Results / إدخال النتائج / نتائج درج کریں
"lab.recordTestResults"       → Record test results / تسجيل نتائج الاختبار / ٹیسٹ نتائج ریکارڈ کریں
"lab.recentOrders"            → Recent Orders / الطلبات الأخيرة / حالیہ آرڈرز
"lab.noPendingOrders"         → No pending lab orders / لا طلبات مختبر معلقة / کوئی زیر التواء لیب آرڈر نہیں
"lab.tests"                   → test(s) / اختبار / ٹیسٹ
"lab.ordered"                 → Ordered / مطلوب / آرڈر کیا گیا
"lab.collected"               → Collected / تم الجمع / جمع کیا گیا
"lab.processing"              → Processing / قيد المعالجة / پروسیسنگ
"lab.completed"               → Completed / مكتمل / مکمل
"lab.urgent"                  → Urgent / عاجل / فوری
"lab.routine"                 → Routine / روتين / معمولی
```

### Pharmacy Module
```
"pharmacy.dashboard"          → Pharmacy / الصيدلية / فارمیسی
"pharmacy.inventory"          → Inventory / المخزون / انوینٹری
"pharmacy.pendingPrescriptions" → Pending Prescriptions / وصفات معلقة / زیر التواء نسخے
"pharmacy.dispensedToday"     → Dispensed Today / تم الصرف اليوم / آج دیا گیا
"pharmacy.lowStockItems"      → Low Stock Items / مواد منخفض المخزون / کم اسٹاک اشیاء
"pharmacy.expiringSoon"       → Expiring Soon / ستنتهي قريباً / جلد ختم ہونے والا
"pharmacy.medicineCatalog"    → Medicine Catalog / كتالوج الأدوية / دوا کیٹالاگ
"pharmacy.manageMedicines"    → Manage medicines / إدارة الأدوية / دوائیں منظم کریں
"pharmacy.addNewInventory"    → Add new inventory / إضافة مخزون جديد / نئی انوینٹری شامل کریں
"pharmacy.stockLevelsBatches" → Stock levels & batches / مستويات المخزون والدفعات / اسٹاک سطح اور بیچ
"pharmacy.prescriptionQueue"  → Prescription Queue / قائمة الوصفات / نسخوں کی قائمہ
"pharmacy.noPendingPrescriptions" → No pending prescriptions / لا وصفات معلقة / کوئی زیر التواء نسخہ نہیں
"pharmacy.viewAll"            → View All ({n}) / عرض الكل ({n}) / سب دیکھیں ({n})
```

### OT Module
```
"ot.dashboard"                → Operation Theatre / غرفة العمليات / آپریشن تھیٹر
"ot.subtitle"                 → Manage surgical scheduling, OT rooms, and post-op recovery / إدارة جدولة العمليات / آپریشن شیڈولنگ اور بعد آپریشن ریکوری
"ot.todaysSurgeries"          → Today's Surgeries / عمليات اليوم / آج کے آپریشن
"ot.inProgress"               → in progress / قيد التنفيذ / جاری ہے
"ot.availableRooms"           → Available Rooms / الغرف المتاحة / دستیاب کمرے
"ot.otRoomsReady"             → OT rooms ready / غرف العمليات جاهزة / OT کمرے تیار
"ot.inPacu"                   → In PACU / في وحدة التعافي / PACU میں
"ot.recoveringPatients"       → Recovering patients / مرضى في مرحلة التعافي / صحت یاب ہونے والے مریض
"ot.emergencyCases"           → Emergency Cases / حالات الطوارئ / ایمرجنسی کیسز
"ot.scheduledThisWeek"        → Scheduled this week / مجدولة هذا الأسبوع / اس ہفتے شیڈول
"ot.currentlyInProgress"      → Currently in progress / قيد التنفيذ حالياً / ابھی جاری ہے
"ot.completedToday"           → Completed today / اكتملت اليوم / آج مکمل
"ot.otRoomStatus"             → OT Room Status / حالة غرف العمليات / OT کمرے کی حالت
"ot.currentStatusAllRooms"    → Current status of all operating rooms / الحالة الراهنة لجميع غرف العمليات / تمام آپریشن کمروں کی حالت
"ot.manageRooms"              → Manage Rooms / إدارة الغرف / کمرے منظم کریں
"ot.surgeryQueue"             → Surgery queue for today / قائمة عمليات اليوم / آج کے آپریشن کی قائمہ
"ot.fullSchedule"             → Full Schedule / الجدول الكامل / مکمل شیڈول
"ot.upcomingSurgeries"        → Upcoming Surgeries / العمليات القادمة / آنے والے آپریشن
"ot.next30Days"               → Scheduled for the next 30 days / مجدولة للثلاثين يوماً القادمة / اگلے 30 دنوں میں شیڈول
"ot.viewSchedule"             → View Schedule / عرض الجدول / شیڈول دیکھیں
"ot.noUpcomingSurgeries"      → No upcoming surgeries scheduled / لا عمليات قادمة مجدولة / کوئی آنے والا آپریشن نہیں
"ot.scheduleSurgery"          → Schedule Surgery / جدولة عملية / آپریشن شیڈول کریں
"ot.moreSurgeries"            → more surgeries / عمليات أخرى / مزید آپریشن
"ot.room"                     → Room / الغرفة / کمرہ
"ot.dashboardRefreshed"       → Dashboard refreshed / تم تحديث لوحة التحكم / ڈیش بورڈ ریفریش ہوا
```

### Org Admin Dashboard
```
"org.overview"                → Organization Overview / نظرة عامة على المؤسسة / تنظیم کا جائزہ
"org.branches"                → Branches / الفروع / شاخیں
"org.totalStaff"              → Total Staff / إجمالي الطاقم / کل عملہ
"org.todaysAppointments"      → Today's Appointments / مواعيد اليوم / آج کی ملاقاتیں
"org.manageBranches"          → Manage Branches / إدارة الفروع / شاخیں منظم کریں
"org.activeBranches"          → Active Branches / الفروع النشطة / فعال شاخیں
"org.acrossOrganization"      → Across organization / عبر المؤسسة / پوری تنظیم میں
"org.allBranches"             → All branches / جميع الفروع / تمام شاخیں
"org.staffMembers"            → Staff Members / أفراد الطاقم / عملہ کے افراد
"org.activeUsers"             → Active users / المستخدمون النشطاء / فعال صارفین
"org.inProgress"              → In progress / قيد التنفيذ / جاری ہے
"org.activeConsultations"     → Active Consultations / الاستشارات النشطة / فعال مشاورتیں
"org.branchOverview"          → Branch Overview / نظرة عامة على الفروع / شاخوں کا جائزہ
"org.quickView"               → Quick view of all active branches / عرض سريع لجميع الفروع النشطة / تمام فعال شاخوں کا فوری جائزہ
"org.noActiveBranches"        → No active branches found / لم يتم العثور على فروع نشطة / کوئی فعال شاخ نہیں ملی
"org.createBranchPrompt"      → Create your first branch to get started / أنشئ أول فرع للبدء / شروع کرنے کے لیے پہلی شاخ بنائیں
"org.createBranch"            → Create Branch / إنشاء فرع / شاخ بنائیں
```

### Appointments Module
```
"appointments.title"          → Appointments / المواعيد / ملاقاتیں
"appointments.subtitle"       → Manage patient appointments and scheduling / إدارة مواعيد المرضى / مریض ملاقاتوں کا انتظام
"appointments.newAppointment" → New Appointment / موعد جديد / نئی ملاقات
"appointments.queue"          → Queue / قائمة الانتظار / قطار
"appointments.viewQueue"      → View Queue / عرض القائمة / قائمہ دیکھیں
"appointments.todaysAppointments" → Today's Appointments / مواعيد اليوم / آج کی ملاقاتیں
"appointments.waiting"        → Waiting / في الانتظار / انتظار میں
"appointments.completed"      → Completed / مكتمل / مکمل
"appointments.cancelled"      → Cancelled / ملغي / منسوخ
"appointments.allStatuses"    → All Statuses / جميع الحالات / تمام حالات
"appointments.scheduled"      → Scheduled / مجدول / شیڈول
"appointments.checkedIn"      → Checked In / تم تسجيل الوصول / چیک ان
"appointments.inProgress"     → In Progress / قيد التنفيذ / جاری ہے
"appointments.noShow"         → No Show / لم يحضر / نہیں آیا
"appointments.allDoctors"     → All Doctors / جميع الأطباء / تمام ڈاکٹرز
"appointments.token"          → Token / الرمز / ٹوکن
"appointments.patient"        → Patient / المريض / مریض
"appointments.doctor"         → Doctor / الطبيب / ڈاکٹر
"appointments.type"           → Type / النوع / قسم
"appointments.chiefComplaint" → Chief Complaint / الشكوى الرئيسية / اہم شکایت
"appointments.walkIn"         → Walk-in / حضور مباشر / واک ان
"appointments.followUp"       → Follow-up / متابعة / فالو اپ
"appointments.noFound"        → No appointments found / لم يتم العثور على مواعيد / کوئی ملاقات نہیں ملی
"appointments.searchPlaceholder" → Search patients... / البحث عن مرضى... / مریض تلاش کریں...
"appointments.today"          → Today / اليوم / آج
```

### Common additions
```
"common.paid"                 → Paid / مدفوع / ادا شدہ
"common.cancelled"            → Cancelled / ملغي / منسوخ
"common.viewAll"              (already exists)
"common.revenue"              → Revenue / الإيرادات / آمدنی
"common.collections"          → Collections / التحصيلات / وصولیاں
```

---

## Files to Change

| File | Changes |
|------|---------|
| `src/lib/i18n/translations/en.ts` | Add ~120 new keys across OPD, Billing, HR, Lab, Pharmacy, OT, Org Admin, Appointments modules |
| `src/lib/i18n/translations/ar.ts` | Matching Arabic translations for all new keys |
| `src/lib/i18n/translations/ur.ts` | Matching Urdu translations for all new keys |
| `src/pages/app/opd/OPDAdminDashboard.tsx` | `import useTranslation`; replace all ~25 hardcoded strings with `t()` |
| `src/pages/app/billing/BillingDashboard.tsx` | `import useTranslation`; replace all ~14 hardcoded strings |
| `src/pages/app/hr/HRDashboard.tsx` | `import useTranslation`; replace all ~30 hardcoded strings including the date subtitle |
| `src/pages/app/lab/LabDashboard.tsx` | `import useTranslation`; replace all ~20 hardcoded strings |
| `src/pages/app/pharmacy/PharmacyDashboard.tsx` | `import useTranslation`; replace all ~15 hardcoded strings |
| `src/pages/app/ot/OTDashboard.tsx` | `import useTranslation`; replace all ~25 hardcoded strings |
| `src/pages/app/OrgAdminDashboardPage.tsx` | `import useTranslation`; replace all ~15 hardcoded strings |
| `src/pages/app/appointments/AppointmentsListPage.tsx` | `import useTranslation`; replace all ~25 hardcoded strings, statusLabels, typeLabels |

## Implementation Approach

Each file will follow this exact pattern (already proven in IPDDashboard and others):

```tsx
import { useTranslation } from "@/lib/i18n";

export default function SomeDashboard() {
  const { t } = useTranslation();
  // ... rest of component
  
  // Replace: "OPD Dashboard"
  // With:    t("opd.dashboard")
  
  // For dynamic strings with variables:
  // Replace: `${count} in progress`
  // With:    `${count} ${t("ot.inProgress")}`
}
```

For `statusLabels` objects in Appointments, convert to use `t()`:
```tsx
const statusLabels: Record<string, string> = {
  scheduled: t("appointments.scheduled"),
  checked_in: t("appointments.checkedIn"),
  // etc.
};
```

## Result After This Implementation

After these changes are complete, every user switching to Arabic or Urdu will see translated text across:
- ✅ OPD Admin Dashboard (all stat cards, tables, section titles)
- ✅ Billing Dashboard (stats, quick actions, recent invoices section)
- ✅ HR Dashboard (all stats, attendance, leave requests, alerts, birthdays)
- ✅ Lab Dashboard (STAT alerts, stats, priority/status badges, queue section)
- ✅ Pharmacy Dashboard (stats, quick action cards, prescription queue)
- ✅ OT Dashboard (stats, room status, surgery queue, upcoming surgeries)
- ✅ Org Admin Dashboard (branch overview, stats, no-data states)
- ✅ Appointments List (table headers, status/type labels, filters, stats)

This represents the most heavily-visited pages for all user roles in the system.

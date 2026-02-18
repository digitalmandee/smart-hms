
# Complete RTL/LTR Fix + Remaining Translations Plan

## Current State Summary

After deep audit of the codebase, here is the exact state:

### Translation Coverage (What's Done)
- 13 files have `useTranslation`: IPD Dashboard, Admissions List, Patients List, Invoices List, OPD Dashboard, Billing Dashboard, HR Dashboard, Lab Dashboard, Pharmacy Dashboard, OT Dashboard, Org Admin Dashboard, Appointments List, Main Dashboard
- Sidebar: Fully translated
- `ModernPageHeader`: Greetings + date locale done
- Translation keys: ~600+ keys across en/ar/ur

### RTL Issues Found (What's Broken)

**Critical RTL layout bugs:**

1. **`DataTable.tsx` (shared component — affects every page)**
   - `Search` icon: `absolute left-3` → should be `start-3` (or conditionally `left-3`/`right-3`)
   - Input `pl-9` → `ps-9`
   - Pagination: `ChevronLeft`/`ChevronRight` icons — in RTL these must be **swapped** (Previous becomes `ChevronRight`, Next becomes `ChevronLeft`)
   - "Page X of Y" text: hardcoded English — add translation
   - "No results found." — hardcoded English

2. **`MobileSideMenu.tsx`**
   - `paddingLeft` uses physical `pl-3`, `pl-8`, `pl-12` → must use logical `ps-3`, `ps-8`, `ps-12`
   - `pr-3` in parent divs → `pe-3`
   - Sheet `side="left"` hardcoded → should use `isRTL ? "right" : "left"`
   - `SheetTitle` has `text-left` → `text-start`
   - Sign Out button: `<LogOut className="h-4 w-4 mr-2" />` → `me-2`
   - "Dark Mode", "Sign Out", version text: hardcoded English

3. **`MobileHeader.tsx`**
   - Left/Right button groups are hardcoded → must swap in RTL (Menu+Search on right, Notifications+Profile on left)
   - Badge position: `-right-0.5` → logic needs RTL awareness
   - `pl-1` on profile avatar container → `ps-1`

4. **`BottomNavigation.tsx`**
   - Labels are hardcoded English: "Home", "Schedule", "Tasks", "Pharmacy", "Lab", "Profile"

5. **`MobileFormWizard.tsx`**
   - Back button: `ChevronLeft` + `mr-1` → in RTL must use `ChevronRight` + `me-1`
   - Next button: `ChevronRight` + `ml-1` → in RTL must use `ChevronLeft` + `me-1`
   - `MobilePatientProfile.tsx`: Back arrow uses `ChevronLeft` → RTL should be `ChevronRight`

6. **`ModernPageHeader.tsx`**
   - Breadcrumb separator: `ChevronRight` is hardcoded → in RTL should be `ChevronLeft`
   - This shows as wrong arrow on every breadcrumb when in Arabic/Urdu

7. **`PageHeader.tsx`** (used by all list pages)
   - Same breadcrumb `ChevronRight` issue → needs RTL flip

8. **`DashboardLayout.tsx`**
   - Mobile layout branch is missing RTL context entirely — the `MobileProvider` does not inject RTL to mobile sidebar

9. **`MobileCalendarView.tsx` / `MobileConsultationHistory.tsx` / `AppointmentCard.tsx` etc.**
   - Many ChevronLeft/Right arrow icons that need to flip direction in RTL
   - Physical padding classes throughout

10. **`DynamicSidebar.tsx`** (collapsed badge)
    - `-right-1` and `-top-1` for badge position → needs RTL: `-start-1`/`-end-1`
    - "Expand sidebar"/"Collapse sidebar" tooltip text: hardcoded English

### Untranslated Pages/Components (What's Still Missing)

**Pages completely missing translations:**
- `ReceptionistDashboard.tsx` — "Reception Desk", stats titles, card titles, button labels
- `ReceptionQuickActions.tsx` — all 9 action labels and descriptions
- `StatusBadge.tsx` — status labels (Active, Inactive, Pending, Cancelled etc.)

**Missing Translation Keys:**
- `reception.desk`, `reception.schedule`, `reception.allSurgeries`, `reception.newPatient`
- `reception.todaysAppointments`, `reception.registeredToday`, `reception.registeredThisMonth`
- `reception.waitingScheduled`, `reception.todaysSchedule`, `reception.upcomingNext`
- `reception.quickActions`, `reception.recentlyRegistered`
- `reception.noUpcoming`, `reception.noRegistered`
- Quick action labels: `reception.registerPatient`, `reception.scheduleAppointment`, `reception.walkInPatient`...
- `status.active`, `status.inactive`, `status.pending`, `status.cancelled`, `status.suspended`
- `common.noResults`, `common.page`, `common.of`, `common.rows`, `common.darkMode`, `common.signOut`
- `nav.home`, `nav.schedule`, `nav.tasks`, `nav.profile` (BottomNavigation)
- `common.back`, `common.next` (MobileFormWizard)

## Files to Change

| File | Change Type | Changes |
|------|-------------|---------|
| `src/lib/i18n/translations/en.ts` | Add keys | ~35 new keys for reception, status badges, DataTable, BottomNav, MobileMenu |
| `src/lib/i18n/translations/ar.ts` | Add keys | Matching Arabic for all new keys |
| `src/lib/i18n/translations/ur.ts` | Add keys | Matching Urdu for all new keys |
| `src/components/DataTable.tsx` | RTL + i18n | Fix Search icon position, pagination icon direction flip, translate static strings |
| `src/components/PageHeader.tsx` | RTL | Fix breadcrumb ChevronRight → flip in RTL |
| `src/components/ModernPageHeader.tsx` | RTL | Fix breadcrumb ChevronRight → flip in RTL |
| `src/components/mobile/MobileSideMenu.tsx` | RTL + i18n | Fix physical padding → logical, Sheet side, SignOut button, Dark Mode label |
| `src/components/mobile/MobileHeader.tsx` | RTL | Fix badge position, left/right group swap |
| `src/components/mobile/BottomNavigation.tsx` | i18n | Translate all nav labels |
| `src/components/mobile/MobileFormWizard.tsx` | RTL | Swap chevron icons + spacing in RTL |
| `src/components/mobile/MobilePatientProfile.tsx` | RTL | Swap back arrow in RTL |
| `src/components/mobile/AppointmentCard.tsx` | RTL | ChevronRight flip |
| `src/components/mobile/TaskCard.tsx` | RTL | ChevronRight flip |
| `src/components/mobile/MobileNurseView.tsx` | RTL | ChevronRight flip |
| `src/components/mobile/MobileDoctorView.tsx` | RTL | ChevronRight, `ml-2` → `ms-2` |
| `src/components/mobile/MobileCalendarView.tsx` | RTL | Navigation arrows flip |
| `src/components/StatusBadge.tsx` | i18n | Translate status labels |
| `src/pages/app/reception/ReceptionistDashboard.tsx` | i18n | Full translation of all hardcoded strings |
| `src/components/reception/ReceptionQuickActions.tsx` | i18n | All action labels + descriptions |
| `src/components/DynamicSidebar.tsx` | RTL | Fix collapsed badge position (-right-1 → end), tooltip text translate |

## New Translation Keys

### Reception Module
```
"reception.desk"                  → Reception Desk / مكتب الاستقبال / ریسپشن ڈیسک
"reception.todaysAppointments"    → Today's Appointments / مواعيد اليوم / آج کی ملاقاتیں
"reception.registeredToday"       → Registered Today / مسجلون اليوم / آج رجسٹرڈ
"reception.registeredThisMonth"   → Registered This Month / مسجلون هذا الشهر / اس ماہ رجسٹرڈ
"reception.waitingScheduled"      → Waiting (Scheduled) / في الانتظار (مجدول) / انتظار میں (شیڈول)
"reception.todaysSchedule"        → Today's Schedule / جدول اليوم / آج کا شیڈول
"reception.upcomingNext"          → Upcoming (Next) / القادمة / آنے والی
"reception.quickActions"          → Quick Actions / إجراءات سريعة / فوری کارروائیاں
"reception.recentlyRegistered"    → Recently Registered / المسجلون مؤخراً / حال میں رجسٹرڈ
"reception.noUpcomingAppts"       → No upcoming appointments / لا مواعيد قادمة / کوئی آنے والی ملاقات نہیں
"reception.noRegisteredToday"     → No patients registered today / لم يُسجَّل مرضى اليوم / آج کوئی مریض رجسٹر نہیں
"reception.schedule"              → Schedule / الجدول / شیڈول
"reception.allSurgeries"          → All Surgeries / جميع العمليات / تمام آپریشن
"reception.newPatient"            → New Patient / مريض جديد / نئے مریض

# Reception Quick Actions
"reception.registerPatient"       → Register Patient / تسجيل مريض / مریض رجسٹر کریں
"reception.addNewPatient"         → Add new patient / إضافة مريض جديد / نیا مریض شامل کریں
"reception.scheduleAppointment"   → Schedule Appointment / تحديد موعد / ملاقات شیڈول کریں
"reception.bookAppointment"       → Book appointment / حجز موعد / ملاقات بک کریں
"reception.walkInPatient"         → Walk-in Patient / مريض حضوري / واک ان مریض
"reception.collectFee"            → Register & collect fee / التسجيل وتحصيل الرسوم / رجسٹر اور فیس وصول کریں
"reception.viewBeds"              → View Beds / عرض الأسرة / بستر دیکھیں
"reception.checkBedAvail"         → Check bed availability / التحقق من توفر الأسرة / بستر کی دستیابی
"reception.createLabTest"         → Create Lab Test / إنشاء اختبار مختبر / لیب ٹیسٹ بنائیں
"reception.orderLabTests"         → Order lab tests / طلب اختبارات مختبر / لیب ٹیسٹ آرڈر کریں
"reception.viewPatients"          → View Patients / عرض المرضى / مریض دیکھیں
"reception.patientDirectory"      → Patient directory / دليل المرضى / مریضوں کی فہرست
"reception.queueDisplay"          → Queue Display / عرض قائمة الانتظار / قائمہ ڈسپلے
"reception.tvDisplay"             → TV display / العرض التلفزيوني / ٹی وی ڈسپلے
"reception.todaysReport"          → Today's Report / تقرير اليوم / آج کی رپورٹ
"reception.appointmentsList"      → Appointments list / قائمة المواعيد / ملاقاتوں کی فہرست
"reception.aiIntake"              → AI Patient Intake / استقبال المريض بالذكاء الاصطناعي / AI مریض انٹیک
"reception.aiGuided"              → AI-guided intake / إدخال موجّه بالذكاء الاصطناعي / AI گائیڈڈ انٹیک
```

### Status Badges
```
"status.active"      → Active / نشط / فعال
"status.inactive"    → Inactive / غير نشط / غیر فعال
"status.pending"     → Pending / معلق / زیر التواء
"status.cancelled"   → Cancelled / ملغي / منسوخ
"status.suspended"   → Suspended / معلق / معطل
"status.trial"       → Trial / تجريبي / آزمائشی
"status.success"     → Success / نجاح / کامیاب
"status.warning"     → Warning / تحذير / خبردار
```

### DataTable / Common UI
```
"common.noResults"       → No results found / لم يتم العثور على نتائج / کوئی نتائج نہیں
"common.page"            → Page / صفحة / صفحہ
"common.of"              → of / من / میں سے
"common.rows"            → rows / صفوف / قطاریں
"common.darkMode"        → Dark Mode / الوضع الداكن / ڈارک موڈ
"common.signOut"         → Sign Out / تسجيل الخروج / سائن آؤٹ
```

### Bottom Navigation
```
"nav.home"       → Home / الرئيسية / ہوم
"nav.schedule"   → Schedule / الجدول / شیڈول
"nav.tasks"      → Tasks / المهام / کام
"nav.profile"    → Profile / الملف الشخصي / پروفائل
```

## RTL Implementation Details

### Pattern for Directional Chevron Icons
All files using `ChevronLeft`/`ChevronRight` as navigation arrows must flip direction:

```tsx
import { useIsRTL } from "@/lib/i18n";
const isRTL = useIsRTL();

// Previous page / Back:
{isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}

// Next page / Forward:
{isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
```

### Pattern for Physical → Logical CSS Spacing
Replace all instances in components:
```
pl-X  → ps-X  (padding start)
pr-X  → pe-X  (padding end)
ml-X  → ms-X  (margin start)
mr-X  → me-X  (margin end)
left-X → start-X (position start)
right-X → end-X (position end)
text-left → text-start
text-right → text-end
```

### MobileHeader RTL Group Swap
The header has Menu+Search on left, Notifications+Profile on right. In RTL this must reverse:
```tsx
const isRTL = useIsRTL();
<div className={cn("flex items-center justify-between h-14 px-4", isRTL && "flex-row-reverse")}>
```
This is a 1-line fix that automatically swaps all groups.

### MobileSideMenu Sheet Direction
```tsx
const isRTL = useIsRTL();
<SheetContent side={isRTL ? "right" : "left"} ...>
```

### DataTable Search Icon RTL
```tsx
const isRTL = useIsRTL();
<Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
<Input className={cn(isRTL ? "pr-9" : "pl-9")} />
```

## Summary of Impact

After these changes:

| Area | Before | After |
|------|--------|-------|
| DataTable pagination | ChevronLeft/Right wrong in RTL | Flipped correctly |
| DataTable search box | Icon on wrong side in RTL | Correct side |
| Breadcrumbs (all pages) | `>` arrow wrong in RTL | `<` in RTL |
| Mobile sidebar | Opens from wrong side in RTL | Opens from right in RTL |
| Mobile sidebar items | Physical padding (LTR only) | Logical padding (works both) |
| Mobile header | Groups don't swap in RTL | Groups swap correctly |
| Bottom nav labels | Hardcoded English | Translated |
| Status badges | Hardcoded English | Translated |
| Reception dashboard | 100% English | Fully translated |
| Quick actions | 100% English | Fully translated |
| Sign Out / Dark Mode label | English only | Translated |
| Form wizard arrows | Wrong direction in RTL | Correct in RTL |
| Badge dot positions | Fixed physical positions | Logical properties |

This covers all the RTL/LTR icon and layout issues across every screen a user will encounter when switching language to Arabic or Urdu.

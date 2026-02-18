
# Fix: Complete RTL Layout + End-to-End Translations

## Problems Identified from Screenshots

### 1. Sidebar on Wrong Side (Desktop)
The `DashboardLayout` uses `flex-row-reverse` for RTL. This works for the overall container, but the desktop sidebar is inside `<div className="hidden lg:block relative">` — the browser honours `flex-row-reverse` which should put it on the right. Looking more carefully at image-61, the sidebar IS on the left even on the larger screen. The reason: the `RecursiveMenuItem` has `justify-start` and `pl-3/pl-8/pl-12` padding — which in RTL mode puts the icon and text flush LEFT inside the sidebar, but in a RTL sidebar they should start from the RIGHT. The sidebar container itself is on the correct side (because of `flex-row-reverse`), but its internal alignment is wrong.

### 2. Sidebar Internal RTL Alignment (Critical)
Every button in `DynamicSidebar` has these hardcoded LTR values:
- `justify-start` → should be `justify-end` in RTL (or use `justify-start` which flips with `dir="rtl"`)
- `pl-3`, `pl-8`, `pl-12` → should be `pr-3`, `pr-8`, `pr-12` in RTL
- `text-left` → should be `text-right` in RTL
- `ml-auto` on the collapse toggle → should be `mr-auto` in RTL

The `RecursiveMenuItem` does not currently receive or use `isRTL`. This needs to be passed down.

### 3. Missing Translations in Widgets (CollectionsWidget + PharmacyAlertsWidget)
These two components contain entirely hardcoded English:

**CollectionsWidget needs:**
- "Collections Overview" → `dashboard.collectionsOverview` (key exists)
- "Today's pending and overdue invoices" → new key `dashboard.todaysPendingOverdue`
- "Collected Today" → new key `dashboard.collectedToday`
- "Pending Today" → new key `dashboard.pendingToday`
- "Overdue" → new key `dashboard.overdue`
- "View Reports" → new key `dashboard.viewReports`
- "Today's Pending" → new key `dashboard.todaysPending`
- "No overdue invoices" → new key `dashboard.noOverdueInvoices`
- "All payments are on track" → new key `dashboard.allPaymentsOnTrack`
- "d overdue" → new key `dashboard.daysOverdue`
- "View all X pending invoices" → new key `dashboard.viewAllPendingInvoices`
- "View all X overdue invoices" → new key `dashboard.viewAllOverdueInvoices`

**PharmacyAlertsWidget needs:**
- "Pharmacy Alerts" → `dashboard.pharmacyAlerts` (key exists)
- "Stock levels and expiry warnings" → new key `dashboard.stockLevelsExpiry`
- "View Inventory" → new key `dashboard.viewInventory`
- "Low Stock" → new key `dashboard.lowStock`
- "Expiring Soon" → new key `dashboard.expiringSoon`
- "To Dispense" → new key `dashboard.toDispense`
- "Low Stock Items" → new key `dashboard.lowStockItems`
- "Expiring Soon (30 days)" → new key `dashboard.expiringSoon30Days`
- "Inventory looks good!" → new key `dashboard.inventoryLooksGood`
- "No stock alerts at this time" → new key `dashboard.noStockAlerts`
- "left" (qty left) → new key `common.left`
- "Batch:", "Qty:" → new keys `common.batch`, `common.qty`
- "Expired" / "Today" → new keys `common.expired`, `common.today`

### 4. Dashboard Mixed Content
- The date is rendered via `format(new Date(), "EEEE, MMMM d, yyyy")` — English locale hardcoded. For Arabic/Urdu need to use locale-aware formatting or translate the date separately.
- "pending" / "in queue" / "+X today" change labels on stat cards are hardcoded English strings
- Role names at bottom are shown raw ("org_admin") not translated

### 5. Sidebar Toggle Button Text
- "Expand sidebar" / "Collapse sidebar" tooltip texts are hardcoded English

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/i18n/translations/en.ts` | Add ~25 new keys for widgets and common labels |
| `src/lib/i18n/translations/ar.ts` | Add Arabic translations for all new keys |
| `src/lib/i18n/translations/ur.ts` | Add Urdu translations for all new keys |
| `src/components/DynamicSidebar.tsx` | Pass `isRTL` into `RecursiveMenuItem`; fix padding direction, `text-left→text-start`, `justify-start` RTL flip, `ml-auto→ms-auto` for collapse toggle; fix logo section direction |
| `src/components/billing/CollectionsWidget.tsx` | Import `useTranslation`; replace all hardcoded English strings with `t()` calls |
| `src/components/pharmacy/PharmacyAlertsWidget.tsx` | Import `useTranslation`; replace all hardcoded English strings with `t()` calls |
| `src/pages/app/DashboardPage.tsx` | Fix the date format to use locale + translate stat card change labels |

---

## Detailed Changes

### New Translation Keys (en.ts / ar.ts / ur.ts)

```
// Collections widget
"dashboard.todaysPendingOverdue"  → "Today's pending and overdue invoices" / "فواتير اليوم المعلقة والمتأخرة" / "آج کی زیر التواء اور واجب الادا انوائسز"
"dashboard.collectedToday"        → "Collected Today" / "تم التحصيل اليوم" / "آج وصول ہوا"
"dashboard.pendingToday"          → "Pending Today" / "معلق اليوم" / "آج زیر التواء"
"dashboard.overdue"               → "Overdue" / "متأخر" / "واجب الادا"
"dashboard.viewReports"           → "View Reports" / "عرض التقارير" / "رپورٹس دیکھیں"
"dashboard.todaysPending"         → "Today's Pending" / "معلق اليوم" / "آج کے زیر التواء"
"dashboard.noOverdueInvoices"     → "No overdue invoices" / "لا توجد فواتير متأخرة" / "کوئی واجب الادا انوائس نہیں"
"dashboard.allPaymentsOnTrack"    → "All payments are on track" / "جميع المدفوعات في موعدها" / "تمام ادائیگیاں وقت پر ہیں"
"dashboard.daysOverdue"           → "d overdue" / "يوم متأخر" / "دن واجب الادا"
"dashboard.viewAllPending"        → "View all pending invoices" / "عرض جميع الفواتير المعلقة" / "تمام زیر التواء انوائسز دیکھیں"
"dashboard.viewAllOverdue"        → "View all overdue invoices" / "عرض جميع الفواتير المتأخرة" / "تمام واجب الادا انوائسز دیکھیں"

// Pharmacy widget
"dashboard.stockLevelsExpiry"     → "Stock levels and expiry warnings" / "مستويات المخزون وتحذيرات انتهاء الصلاحية" / "اسٹاک سطح اور میعاد ختم ہونے کی وارننگ"
"dashboard.viewInventory"         → "View Inventory" / "عرض المخزون" / "انوینٹری دیکھیں"
"dashboard.lowStock"              → "Low Stock" / "مخزون منخفض" / "کم اسٹاک"
"dashboard.expiringSoon"          → "Expiring Soon" / "ستنتهي قريباً" / "جلد ختم ہونے والا"
"dashboard.toDispense"            → "To Dispense" / "للصرف" / "فراہم کرنے کے لیے"
"dashboard.lowStockItems"         → "Low Stock Items" / "مواد منخفض المخزون" / "کم اسٹاک اشیاء"
"dashboard.expiringSoon30Days"    → "Expiring Soon (30 days)" / "ستنتهي قريباً (30 يوم)" / "جلد ختم ہونے والا (30 دن)"
"dashboard.inventoryLooksGood"    → "Inventory looks good!" / "المخزون جيد!" / "انوینٹری ٹھیک ہے!"
"dashboard.noStockAlerts"         → "No stock alerts at this time" / "لا توجد تنبيهات مخزون الآن" / "ابھی کوئی اسٹاک الرٹ نہیں"

// Common additions
"common.left"                     → "left" / "متبقي" / "باقی"
"common.batch"                    → "Batch" / "دفعة" / "بیچ"
"common.qty"                      → "Qty" / "الكمية" / "مقدار"
"common.expired"                  → "Expired" / "منتهي الصلاحية" / "ختم شدہ"
"common.today"                    → "Today" / "اليوم" / "آج"
"common.pending"                  → "pending" / "معلق" / "زیر التواء"
"common.inQueue"                  → "in queue" / "في الانتظار" / "قطار میں"
"common.newToday"                 → "new today" / "جديد اليوم" / "آج نیا"
```

### DynamicSidebar RTL Fix (Most Critical)

**Problem**: `RecursiveMenuItem` has `justify-start`, `pl-3/pl-8/pl-12`, `text-left` hardcoded.

**Fix**: Pass `isRTL` prop down through `RecursiveMenuItem`. Update `getLevelStyles()` to conditionally use `pr-` vs `pl-` padding. Update text alignment and button justification:

```tsx
// RecursiveMenuItem receives isRTL prop
interface RecursiveMenuItemProps {
  ...
  isRTL: boolean;
}

// getLevelStyles uses isRTL
const getLevelStyles = () => {
  const paddingClass = isRTL 
    ? { 0: "pr-3", 1: "pr-8", 2: "pr-12" }[level] || "pr-12"
    : { 0: "pl-3", 1: "pl-8", 2: "pl-12" }[level] || "pl-12";

  return {
    iconSize: "h-4 w-4",
    textStyle: "font-medium text-sm",
    hoverBg: "hover:bg-sidebar-accent",
    activeBg: "bg-sidebar-accent",
    padding: paddingClass,
  };
};

// Button class: replace justify-start with justify-start (this already flips with dir=rtl via flex)
// text-left → text-start (CSS logical property, auto-flips)
// The ChevronDown stays at the end naturally with flex

// Logo area: ml-auto → ms-auto (logical margin)
// Mobile close button: ml-auto → ms-auto
```

**Key insight**: `text-start` is a Tailwind CSS logical property that automatically means `text-left` in LTR and `text-right` in RTL. Similarly `ps-3` / `pe-3` are logical padding-start/end. This avoids needing `isRTL` at all for text direction — just using Tailwind logical classes fixes everything:

- `pl-3` → `ps-3` (padding-inline-start: auto-flips)
- `pl-8` → `ps-8`
- `pl-12` → `ps-12`
- `text-left` → `text-start`
- `ml-auto` → `ms-auto`
- `justify-start` stays as-is (flex already respects RTL direction)

This is cleaner: no `isRTL` prop needed in `RecursiveMenuItem`.

### CollectionsWidget — Replace All Hardcoded Text

Import `useTranslation`, replace:
- "Collections Overview" → `t("dashboard.collectionsOverview")`  
- "Today's pending and overdue invoices" → `t("dashboard.todaysPendingOverdue")`
- "View Reports" → `t("dashboard.viewReports")`
- "Collected Today" → `t("dashboard.collectedToday")`
- "Pending Today" → `t("dashboard.pendingToday")`
- `Today's Pending ({n})` → `` `${t("dashboard.todaysPending")} (${n})` ``
- `Overdue ({n})` → `` `${t("dashboard.overdue")} (${n})` ``
- `{n}d overdue` → `` `${n}${t("dashboard.daysOverdue")}` ``
- "View all X pending invoices" → `` `${t("dashboard.viewAllPending")} (${n})` ``
- "No overdue invoices" → `t("dashboard.noOverdueInvoices")`
- "All payments are on track" → `t("dashboard.allPaymentsOnTrack")`

### PharmacyAlertsWidget — Replace All Hardcoded Text

Import `useTranslation`, replace:
- "Pharmacy Alerts" → `t("dashboard.pharmacyAlerts")`
- "Stock levels and expiry warnings" → `t("dashboard.stockLevelsExpiry")`
- "View Inventory" → `t("dashboard.viewInventory")`
- "Low Stock" → `t("dashboard.lowStock")`
- "Expiring Soon" → `t("dashboard.expiringSoon")`
- "To Dispense" → `t("dashboard.toDispense")`
- "Low Stock Items" → `t("dashboard.lowStockItems")`
- "Expiring Soon (30 days)" → `t("dashboard.expiringSoon30Days")`
- "Inventory looks good!" → `t("dashboard.inventoryLooksGood")`
- "No stock alerts at this time" → `t("dashboard.noStockAlerts")`
- `{qty} left` → `` `${qty} ${t("common.left")}` ``
- "Batch:" → `` `${t("common.batch")}:` ``
- "Expired" / "Today" → `t("common.expired")` / `t("common.today")`

### DashboardPage — Fix Remaining English Strings

- Stat card `change` labels: `+${stats.newPatientsToday} today` → `` `+${stats.newPatientsToday} ${t("common.newToday")}` ``
- `${stats.pendingAppointments} pending` → `` `${stats.pendingAppointments} ${t("common.pending")}` ``
- `${stats.queueCount} in queue` → `` `${stats.queueCount} ${t("common.inQueue")}` ``
- "No roles assigned yet. Contact your administrator." → new key or hardcoded acceptable (rarely seen)

---

## Summary of All Files Changed

| File | Key Changes |
|------|-------------|
| `src/lib/i18n/translations/en.ts` | +23 new keys for widgets |
| `src/lib/i18n/translations/ar.ts` | +23 Arabic translations |
| `src/lib/i18n/translations/ur.ts` | +23 Urdu translations |
| `src/components/DynamicSidebar.tsx` | `pl-*` → `ps-*`, `text-left` → `text-start`, `ml-auto` → `ms-auto` (Tailwind logical properties — no isRTL prop needed) |
| `src/components/billing/CollectionsWidget.tsx` | Full i18n integration |
| `src/components/pharmacy/PharmacyAlertsWidget.tsx` | Full i18n integration |
| `src/pages/app/DashboardPage.tsx` | Translate stat card change labels |

## Result After Fix

- Sidebar: icons and text align from right-to-left in RTL; submenus indent from right; chevrons on correct side
- CollectionsWidget: fully in Arabic/Urdu when language is switched
- PharmacyAlertsWidget: fully in Arabic/Urdu when language is switched
- Dashboard stat change labels ("5 pending", "+3 today") translated
- All text direction follows `dir="rtl"` on the HTML element via Tailwind logical properties


# Complete RTL Fix & 100% Translation Coverage

## Root Cause Analysis

### Problem 1: Mobile Layout Missing `dir` Attribute (CRITICAL)
The screenshot is taken on an **iPad in mobile/browser mode** — the `DashboardLayout` renders the mobile branch (lines 27-48), which is:
```tsx
<div className="flex flex-col h-screen bg-background overflow-hidden">
```
This wrapper has **no `dir` attribute at all**. So when the user is in Urdu/Arabic on mobile, the entire mobile UI renders as LTR. The sidebar on desktop correctly gets `dir="rtl"` from the parent wrapper (line 53), but the **mobile layout completely lacks it**.

Additionally, looking at the sidebar `<aside>` element in the screenshot: icon is on LEFT, chevron on RIGHT — this is LTR behavior. This confirms `dir="rtl"` is NOT propagating to the sidebar in the mobile view.

### Problem 2: Sidebar Internal RTL Layout
Even when `dir="rtl"` is properly inherited, the sidebar has two sub-problems:
1. **`justify-start` on buttons** — in RTL this correctly puts items from the right edge, but the icon ORDER should be: `[chevron] [text] [icon]` from left-to-right in RTL. Currently it's `[icon] [text] [chevron]` which renders as icon on right, chevron on left — actually this IS correct in RTL when dir is applied.
2. **`PanelLeftClose` / `PanelLeft` icons** — hardcoded physical icons, not flipped for RTL.
3. **`ChevronDown` expand indicator** — currently always on the trailing end of the flex, which is correct logically but the `rotate-180` animation when open needs no fix.
4. **Level indentation using `ps-3`, `ps-8`, `ps-12`** — these ARE logical properties ✓. When `dir="rtl"`, `ps-*` becomes padding-right (START in RTL) = correct.

### Problem 3: PatientFormPage — 100% Hardcoded English (972 lines)
No `useTranslation` hook at all. All labels, placeholders, accordion titles, button text are English.

### Problem 4: `dir` Not Applied at HTML Level
For true native RTL behavior (input text direction, browser scrollbars on correct side, etc.), `dir` must be set on the `<html>` element. Currently it's only set on a sub-div in the desktop layout. This causes issues with:
- Portal-rendered components (Select dropdowns, Modals, Tooltips) that escape the `dir` context
- Input text alignment
- Browser scrollbar position

### Problem 5: Remaining Pages Without Full Translation
After the audit, pages that still have hardcoded English strings:
- `PatientFormPage.tsx` — ~80 hardcoded labels
- `src/pages/app/hr/EmployeeDetailPage.tsx` — breadcrumb `"HR"` label
- `src/pages/app/hr/payroll/PayrollPage.tsx` — breadcrumb `"HR"` label
- `src/pages/app/hr/attendance/AttendanceSheetPage.tsx` — breadcrumb `"HR"` label
- `src/pages/app/billing/ClaimsListPage.tsx` — breadcrumb `"Billing"` label
- Lab sub-pages — breadcrumb `"Lab"` labels
- `ProfilePage.tsx`, `NotificationsPage.tsx` — not yet audited

---

## Solution Architecture

### Fix 1: Apply `dir` to `<html>` Element Globally (MOST IMPORTANT)

Instead of applying `dir` only to sub-divs, we apply it to the HTML root element. This is the standard web approach and fixes ALL portal-rendered components (dropdowns, modals), scrollbar position, and input text direction simultaneously.

In a new `useDocumentDirection` hook (or directly in `CountryConfigContext`/`App.tsx`), use a `useEffect` to set `document.documentElement.dir` whenever the language changes:

```ts
// src/hooks/useDocumentDirection.ts
import { useEffect } from "react";
import { useIsRTL } from "@/lib/i18n";

export function useDocumentDirection() {
  const isRTL = useIsRTL();
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "ar" : "en"; // or "ur"
  }, [isRTL]);
}
```

This hook is called once in `App.tsx` (or the top-level layout). Then the `dir` attribute on the sub-div wrappers in `DashboardLayout` can be removed since `<html>` now handles it globally.

### Fix 2: Add `dir` to Mobile Layout Wrapper

In `DashboardLayout.tsx`, the mobile branch needs `dir` too:
```tsx
<div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col h-screen bg-background overflow-hidden">
```

### Fix 3: Fix Sidebar Toggle Icons for RTL

The `PanelLeft`/`PanelLeftClose` icons indicate "collapse left sidebar". In RTL, the sidebar is on the right, so these icons should flip:

```tsx
{isCollapsed ? (
  isRTL ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />
) : (
  isRTL ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />
)}
```

The sidebar needs to import `useIsRTL` and `PanelRight`, `PanelRightClose` from lucide-react.

### Fix 4: Translate PatientFormPage.tsx (100% Coverage)

Add `useTranslation` and replace all hardcoded English strings:

| Hardcoded | Translation Key |
|---|---|
| "Patient Information" | `patient.patientInformation` |
| "Show More Fields" / "Show Less" | `patient.showMore` / `patient.showLess` |
| "First Name *" | `patient.firstName` |
| "Last Name" | `patient.lastName` |
| "Phone Number" | `patient.phone` |
| "Gender" / "Select gender" | `patient.gender` |
| "Male" / "Female" / "Other" | `patient.male` / `patient.female` / `patient.other` |
| "Date of Birth" | `patient.dateOfBirth` |
| "Blood Group" | `patient.bloodGroup` |
| "City" / "Select city" | `patient.city` |
| "Personal Details" | `patient.personalDetails` |
| "Father/Husband Name" | `patient.fatherHusbandNameLabel` |
| "Marital Status" | `patient.maritalStatusLabel` |
| "Single"/"Married"/"Divorced"/"Widowed" | `patient.single`/etc. |
| "Number of Children" | `patient.numberOfChildren` |
| "Nationality" | `patient.nationalityLabel` |
| "Religion" | `patient.religion` |
| "Occupation" | `patient.occupationLabel` |
| "Preferred Language" | `patient.preferredLanguage` |
| "Passport Number" | `patient.passportNumber` |
| "Secondary Phone" | `patient.secondaryPhone` |
| "Contact Information" | `patient.contactInformation` |
| "Street Address" | `patient.streetAddress` |
| "Postal Code" | `patient.postalCode` |
| "Emergency Contact" section title | `patient.emergencyContact` |
| "Emergency Contact Name" | `patient.emergencyContactName` |
| "Relation" | `patient.emergencyRelation` |
| "Emergency Phone" | `patient.emergencyPhone` |
| "Insurance" section | `patient.insuranceSection` |
| "Insurance Provider" | `patient.insuranceProvider` |
| "Insurance ID" | `patient.insuranceId` |
| "Referral" section | `patient.referral` |
| "Referred By" | `patient.referredBy` |
| "Referral Details" | `patient.referralDetails` |
| "Additional Notes" | `patient.additionalNotes` |
| "Branch" | `patient.branch` |
| "Register New Patient" button | `patient.registerNew` |
| "Edit" breadcrumb | `patient.edit` |
| "New" breadcrumb | `patient.new` |
| Page title "New Patient" / "Edit Patient" | already have `patient.newPatient` / `patient.editPatient` |

The `ml-1` on ChevronDown inside PatientFormPage also needs to be `ms-1`.

### Fix 5: Fix Breadcrumbs in HR, Billing, Lab Sub-Pages

These pages have `useTranslation` imported but breadcrumbs still use raw English strings:

**EmployeeDetailPage.tsx:**
```tsx
// Before
{ label: "HR", href: "/app/hr" }
// After
{ label: t('nav.hr'), href: "/app/hr" }
```

**PayrollPage.tsx:**
```tsx
{ label: t('nav.hr'), href: "/app/hr" }
```

**AttendanceSheetPage.tsx:**
```tsx
{ label: t('nav.hr'), href: "/app/hr" }
```

**ClaimsListPage.tsx:**
```tsx
{ label: t('nav.billing'), href: "/app/billing" }
```

**Lab sub-pages** (need to find which files have `label: "Lab"`):
```tsx
{ label: t('nav.lab'), href: "/app/lab" }
```

### Fix 6: Fix `ChevronDown` `ml-1` → `ms-1` in PatientFormPage

Line 311: `className="h-4 w-4 ml-1 transition-transform"` → `"h-4 w-4 ms-1 transition-transform"`

---

## Files to Change

| File | Changes |
|---|---|
| `src/hooks/useDocumentDirection.ts` | NEW: global `dir` setter on `document.documentElement` |
| `src/App.tsx` | Call `useDocumentDirection()` at app root |
| `src/layouts/DashboardLayout.tsx` | Add `dir` to mobile layout wrapper; clean up redundant `dir` on desktop wrapper since HTML handles it now |
| `src/components/DynamicSidebar.tsx` | Import `useIsRTL`, flip `PanelLeft`/`PanelLeftClose` icons in RTL |
| `src/pages/app/patients/PatientFormPage.tsx` | Add `useTranslation`, replace ~35 hardcoded strings, fix `ml-1→ms-1` |
| `src/pages/app/hr/EmployeeDetailPage.tsx` | Wire `t('nav.hr')` in breadcrumb (import already added) |
| `src/pages/app/hr/payroll/PayrollPage.tsx` | Wire `t('nav.hr')` in breadcrumb |
| `src/pages/app/hr/attendance/AttendanceSheetPage.tsx` | Wire `t('nav.hr')` in breadcrumb |
| `src/pages/app/billing/ClaimsListPage.tsx` | Wire `t('nav.billing')` in breadcrumb |
| Lab sub-pages with `label: "Lab"` | Wire `t('nav.lab')` in breadcrumbs |

---

## Translation Completeness After This Plan

All translation keys already exist in `en.ts`, `ar.ts`, and `ur.ts` from previous sessions. No new keys need to be added. The only work is **wiring** the existing keys into the components that still use hardcoded strings.

### Why `useDocumentDirection` at HTML Level Is the Right Approach

When `dir="rtl"` is only set on a child `<div>`, React portals (Radix UI Select, Dialog, Tooltip, Popover — all rendered via `document.body`) **escape** that `div`'s dir context. This means dropdown menus and modals render in LTR even in Arabic/Urdu. Setting `dir` on `<html>` fixes ALL of these simultaneously without any component-level changes. It is the standard W3C recommendation for RTL web applications.

---

## Expected Outcome

| Area | Before | After |
|---|---|---|
| Mobile layout direction | LTR always (no `dir` on mobile wrapper) | RTL in Arabic/Urdu |
| Sidebar on mobile | Icons on left, text LTR, chevron on right | Correct RTL layout |
| Select/Dialog/Popover portals | Always LTR (escape div context) | RTL via `<html dir>` |
| Sidebar toggle icons | PanelLeft/PanelLeftClose (always left) | Flipped to PanelRight in RTL |
| PatientFormPage all labels | English only | Fully translated |
| HR/Lab/Billing breadcrumbs | "HR", "Lab", "Billing" hardcoded | Translated |
| Input text direction | LTR even in Arabic | RTL natively |
| Browser scrollbar | Always on right | Left side in RTL |

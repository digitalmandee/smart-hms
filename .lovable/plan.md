

# Deep RTL & Translation Fix — Sidebar, Global Direction, and Full Coverage

## Problem Summary

Looking at the screenshot, three core issues are visible:

1. **Sidebar icons are on the LEFT, text in the middle, chevrons on the RIGHT** -- this is LTR layout forced into Arabic text. In a proper RTL sidebar, icons should start from the RIGHT edge, with chevrons on the LEFT.
2. **The `dir` attribute is only set on wrapper `<div>` elements**, not on the `<html>` root. This means all portal-based components (dropdowns, modals, tooltips) render in LTR even in Arabic/Urdu.
3. **The MobileSideMenu does NOT translate menu items at all** -- it renders raw English `item.name` values without using the `SIDEBAR_NAME_TO_KEY` translation map. Role labels (e.g., "Receptionist") are also hardcoded English.

---

## Root Causes

### 1. No global `dir` on `<html>` element
The planned `useDocumentDirection` hook was never created. Without `document.documentElement.dir = "rtl"`, the browser treats the entire page as LTR. Only the wrapper div inside DashboardLayout has `dir="rtl"`, which does NOT affect:
- Radix UI portals (Select, Dialog, Popover, Toast)
- Browser scrollbar position
- Input text direction by default

### 2. Desktop layout uses `flex-row-reverse` hack
Line 53 of `DashboardLayout.tsx`:
```
className={cn("flex h-screen ...", isRTL && "flex-row-reverse")}
```
This is a hack. When `dir="rtl"` is properly applied at the HTML level, flexbox automatically reverses -- no `flex-row-reverse` needed. The hack causes double-reversal issues in some nested components.

### 3. MobileSideMenu renders untranslated names
`MobileSideMenu.tsx` line 324: `<span>{item.name}</span>` -- renders raw English sidebar item names. The `SIDEBAR_NAME_TO_KEY` translation map from `DynamicSidebar.tsx` is not imported or used here.

### 4. Role labels are hardcoded English
`ROLE_LABELS` in `src/constants/roles.ts` has entries like `receptionist: "Receptionist"`. The MobileSideMenu shows this directly at line 421: `const roleLabel = ROLE_LABELS[primaryRole]`.

---

## Implementation Plan

### Step 1: Create `useDocumentDirection` hook (NEW FILE)

Create `src/hooks/useDocumentDirection.ts` that sets `document.documentElement.dir` and `document.documentElement.lang` based on the current language. This is the W3C standard approach.

### Step 2: Wire the hook in App.tsx

Add a small wrapper component inside `CountryConfigProvider` that calls `useDocumentDirection()` once at the app root. This ensures ALL components (including portals) inherit RTL direction.

### Step 3: Clean up DashboardLayout.tsx

- Remove the `flex-row-reverse` hack from desktop layout (line 53) -- `dir="rtl"` on `<html>` handles this automatically
- Keep the `dir` attributes on wrappers as a safety net but they become redundant

### Step 4: Add translation to MobileSideMenu

Import `SIDEBAR_NAME_TO_KEY` from `DynamicSidebar.tsx` (export it first), then wrap all `item.name` renders with the translation lookup:
```
const displayName = SIDEBAR_NAME_TO_KEY[item.name] 
  ? t(SIDEBAR_NAME_TO_KEY[item.name]) 
  : item.name;
```

This needs to be done in the `MobileMenuItem` component (lines 293-373) for both parent and leaf items.

### Step 5: Translate role labels

Add translation keys for all role labels (`role.receptionist`, `role.doctor`, `role.nurse`, etc.) to all three language files, and use `t()` in `MobileSideMenu` instead of raw `ROLE_LABELS`.

### Step 6: Fix user profile name display

The username "Usman Ali Shah" and email shown in the sidebar are database values (not translatable), but the role label beneath it needs translation.

---

## Files to Change

| File | Action | Details |
|------|--------|---------|
| `src/hooks/useDocumentDirection.ts` | NEW | Sets `document.documentElement.dir` and `.lang` reactively |
| `src/App.tsx` | EDIT | Add `useDocumentDirection()` call inside a wrapper component |
| `src/layouts/DashboardLayout.tsx` | EDIT | Remove `flex-row-reverse` hack, keep `dir` on wrappers |
| `src/components/DynamicSidebar.tsx` | EDIT | Export `SIDEBAR_NAME_TO_KEY` so MobileSideMenu can use it |
| `src/components/mobile/MobileSideMenu.tsx` | EDIT | Import and use `SIDEBAR_NAME_TO_KEY` + `useTranslation` for all menu items; translate role label |
| `src/lib/i18n/translations/en.ts` | EDIT | Add ~20 role label keys (`role.superAdmin`, `role.doctor`, etc.) |
| `src/lib/i18n/translations/ar.ts` | EDIT | Arabic role labels |
| `src/lib/i18n/translations/ur.ts` | EDIT | Urdu role labels |

---

## New Translation Keys

```
"role.superAdmin"         -> Super Admin / مدير النظام / سپر ایڈمن
"role.orgAdmin"           -> Organization Admin / مدير المنظمة / تنظیم ایڈمن
"role.branchAdmin"        -> Branch Admin / مدير الفرع / برانچ ایڈمن
"role.doctor"             -> Doctor / طبيب / ڈاکٹر
"role.surgeon"            -> Surgeon / جراح / سرجن
"role.anesthetist"        -> Anesthetist / طبيب تخدير / اینستھیٹسٹ
"role.nurse"              -> Nurse / ممرضة / نرس
"role.opdNurse"           -> OPD Nurse / ممرضة العيادات / او پی ڈی نرس
"role.ipdNurse"           -> IPD Nurse / ممرضة الداخلي / آئی پی ڈی نرس
"role.otNurse"            -> OT Nurse / ممرضة العمليات / او ٹی نرس
"role.receptionist"       -> Receptionist / موظف الاستقبال / ریسپشنسٹ
"role.pharmacist"         -> Pharmacist / صيدلي / فارماسسٹ
"role.otPharmacist"       -> OT Pharmacist / صيدلي العمليات / او ٹی فارماسسٹ
"role.labTechnician"      -> Lab Technician / فني المختبر / لیب ٹیکنیشن
"role.radiologist"        -> Radiologist / أخصائي أشعة / ریڈیالوجسٹ
"role.radiologyTechnician"-> Radiology Technician / فني الأشعة / ریڈیالوجی ٹیکنیشن
"role.bloodBankTechnician"-> Blood Bank Technician / فني بنك الدم / بلڈ بینک ٹیکنیشن
"role.accountant"         -> Accountant / محاسب / اکاؤنٹنٹ
"role.financeManager"     -> Finance Manager / مدير المالية / فنانس مینیجر
"role.hrManager"          -> HR Manager / مدير الموارد البشرية / ایچ آر مینیجر
"role.hrOfficer"          -> HR Officer / مسؤول الموارد البشرية / ایچ آر آفیسر
"role.storeManager"       -> Store Manager / مدير المخزن / اسٹور مینیجر
"role.otTechnician"       -> OT Technician / فني العمليات / او ٹی ٹیکنیشن
```

---

## How the Sidebar Will Work After Fix

1. `<html dir="rtl">` is set globally when Arabic/Urdu is active
2. The sidebar `<aside>` naturally flows from RIGHT edge because of inherited `dir="rtl"`
3. `justify-start` on buttons means items start from the RIGHT (start edge in RTL)
4. Icon appears on RIGHT, then text, then chevron on LEFT -- proper native RTL
5. `ps-3`, `ps-8`, `ps-12` indentation automatically becomes right-padding in RTL
6. No `flex-row-reverse` hack needed -- flexbox handles it natively
7. All portal-based dropdowns (Select, Dialog) render RTL because `<html>` has `dir="rtl"`

---

## Expected Visual Outcome

| Element | Before (broken) | After (fixed) |
|---------|-----------------|---------------|
| Sidebar icons | Left side (LTR) | Right side (RTL native) |
| Sidebar chevrons | Right side | Left side |
| Menu item text | Left-aligned | Right-aligned (native) |
| Dropdown portals | LTR always | RTL when Arabic/Urdu |
| Role label "Receptionist" | English always | Arabic/Urdu translated |
| Mobile sidebar items | English always | Fully translated |
| Input text direction | LTR | RTL native |
| Browser scrollbar | Right side | Left side in RTL |


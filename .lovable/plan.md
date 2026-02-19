

# Complete RTL Sidebar Fix, Toast Translation & Breadcrumb Coverage

## Issues Identified from Screenshot

### 1. Sidebar Items Still LTR (CRITICAL)
The sidebar menu items show icons on the LEFT and chevrons on the RIGHT even in Arabic. The `RTLDirectionSetter` correctly sets `dir="rtl"` on `<html>`, and the `SheetContent` portal should inherit it. However, the `SheetContent` component uses Radix Dialog portal which renders at `document.body`. Since `<html>` has `dir="rtl"`, the portal SHOULD inherit it.

**Root cause investigation needed:** The `SheetContent` in `MobileSideMenu` needs an explicit `dir` attribute to guarantee RTL in the portal context. Add `dir={isRTL ? "rtl" : "ltr"}` to the `SheetContent` element.

Additionally, the close button in `sheet.tsx` uses hardcoded `right-4` positioning instead of logical `end-4`.

### 2. Date Still Shows "Friday, Fe..." in English
The `ModernPageHeader` uses `arLocale` (Arabic locale from date-fns) for Urdu too, but the format pattern `"EEEE, MMMM d, yyyy"` with `arLocale` should output Arabic day names. The screenshot shows partial English which may be a rendering/truncation issue, but we should also add Urdu date locale support.

### 3. Toast Messages — 888 Hardcoded English Strings
Found ~888 `toast.success()` / `toast.error()` calls across 61 files with hardcoded English strings like:
- "Dashboard refreshed"
- "Device updated successfully"
- "Failed to save device"
- "Please select employee and date"

These need to use `getTranslatedString()` (the non-hook utility) since many are in async callbacks outside React render context.

### 4. Breadcrumbs — 40+ HR Files Still Hardcoded
40 HR files still have `label: "HR"` instead of `label: t('nav.hr')`. Plus:
- 2 Lab files with `label: "Lab"`
- 1 Billing file with `label: "Billing"`

### 5. Form Fields, Placeholders, Select Options Still English
Many form pages beyond PatientFormPage still have hardcoded English labels, placeholders, and select options (gender values, blood groups, marital status labels, etc.).

---

## Implementation Plan

### Phase 1: Fix Sidebar RTL in Portal (HIGH PRIORITY)

**File: `src/components/mobile/MobileSideMenu.tsx`**
- Add `dir={isRTL ? "rtl" : "ltr"}` to `<SheetContent>` element to force RTL inside the portal

**File: `src/components/ui/sheet.tsx`**
- Change `right-4` on close button to `end-4` (logical property for RTL)

### Phase 2: Add Common Toast Translation Keys

**Files: `en.ts`, `ar.ts`, `ur.ts`**
Add ~30 common toast message keys:
```
"toast.saved"              -> Saved successfully / تم الحفظ بنجاح / کامیابی سے محفوظ
"toast.deleted"            -> Deleted successfully / تم الحذف بنجاح / کامیابی سے حذف
"toast.updated"            -> Updated successfully / تم التحديث بنجاح / کامیابی سے اپڈیٹ
"toast.created"            -> Created successfully / تم الإنشاء بنجاح / کامیابی سے بنایا گیا
"toast.error"              -> An error occurred / حدث خطأ / ایک خرابی ہوئی
"toast.saveFailed"         -> Failed to save / فشل في الحفظ / محفوظ کرنے میں ناکام
"toast.deleteFailed"       -> Failed to delete / فشل في الحذف / حذف کرنے میں ناکام
"toast.updateFailed"       -> Failed to update / فشل في التحديث / اپڈیٹ کرنے میں ناکام
"toast.fillRequired"       -> Please fill required fields / يرجى ملء الحقول المطلوبة / براہ کرم ضروری خانے بھریں
"toast.refreshed"          -> Refreshed / تم التحديث / ریفریش ہوگیا
"toast.refreshFailed"      -> Failed to refresh / فشل في التحديث / ریفریش ناکام
"toast.selectRequired"     -> Please select required items / يرجى اختيار العناصر المطلوبة / براہ کرم مطلوبہ آئٹمز منتخب کریں
"toast.copied"             -> Copied to clipboard / تم النسخ / کاپی ہوگیا
"toast.submitted"          -> Submitted successfully / تم الإرسال بنجاح / کامیابی سے جمع
"toast.approved"           -> Approved successfully / تم الموافقة بنجاح / کامیابی سے منظور
"toast.rejected"           -> Rejected / تم الرفض / مسترد
"toast.cancelled"          -> Cancelled / تم الإلغاء / منسوخ
"toast.deviceAdded"        -> Device added / تمت إضافة الجهاز / ڈیوائس شامل
"toast.deviceDeleted"      -> Device deleted / تم حذف الجهاز / ڈیوائس حذف
"toast.entryAdded"         -> Entry added / تمت الإضافة / اندراج شامل
"toast.loginRequired"      -> Please log in / يرجى تسجيل الدخول / براہ کرم لاگ ان کریں
"toast.noPermission"       -> You don't have permission / ليس لديك صلاحية / آپ کو اجازت نہیں
"toast.networkError"       -> Network error / خطأ في الشبكة / نیٹ ورک خرابی
"toast.invalidData"        -> Invalid data / بيانات غير صالحة / غلط ڈیٹا
"toast.statusUpdated"      -> Status updated / تم تحديث الحالة / حالت اپڈیٹ
"toast.reasonRequired"     -> Please provide a reason / يرجى تقديم السبب / براہ کرم وجہ بتائیں
```

### Phase 3: Wire Toast Messages in Key Pages

Replace hardcoded toast strings with `getTranslatedString()` in the most-used pages first:
- `DashboardPage.tsx`
- `BiometricDevicesPage.tsx`
- `OTMedicationChargesPage.tsx`
- `PublishRosterPage.tsx`
- `ReportTemplatesPage.tsx`
- `CategoriesPage.tsx` (inventory)
- `GRNFormPage.tsx`

Pattern:
```tsx
// Before
toast.success("Device updated successfully");
// After
toast.success(getTranslatedString("toast.updated"));
```

### Phase 4: Fix Breadcrumbs in 40+ HR Files

All 40 HR files need `label: "HR"` replaced with `label: t('nav.hr' as any)`. Each file needs:
1. Import `useTranslation` (if not already imported)
2. Add `const { t } = useTranslation();` (if not already present)
3. Replace `label: "HR"` with `label: t('nav.hr' as any)`

**HR files (40):** PayrollRunDetailPage, OvertimePage, LeaveBalancesPage, ParamedicalStaffPage, LeavesPage, AttendancePage, ApplicationsPage, OnCallSchedulePage, ExitInterviewsPage, EmployeePerformanceReport, SettlementsPage, EmergencyRosterPage, ClearancePage, LoansAdvancesPage, ResignationsPage, ProcessPayrollPage, DoctorsListPage, NursesListPage, SupportStaffPage, VisitingDoctorsPage, EmployeesListPage, EmployeeFormPage, DutyRosterPage, OTDutyRosterPage, PublishRosterPage, RosterReportsPage, AttendanceReportsPage, BiometricDevicesPage, HRReportsPage, DepartmentsPage, DesignationsPage, EmployeeCategoriesPage, ShiftsPage, LeaveTypesPage, HolidaysPage, SalaryComponentsPage, TaxSlabsPage, ComplianceDashboardPage, MedicalFitnessPage, VaccinationsPage, DisciplinaryPage, MedicalLicensesPage, EmployeeDocumentsPage, JobOpeningsPage, PayslipsPage, PayrollReportsPage, BankSheetPage, DoctorWalletBalancesPage, DailyCommissionReport, DoctorCompensationPage, DoctorEarningsPage, EmployeeSalariesPage

**Lab files (1):** LabTestTemplateFormPage — `label: "Lab"` to `label: t('nav.lab' as any)`

**Billing files (1):** InsuranceCompaniesPage — `label: "Billing"` to `label: t('nav.billing' as any)`

### Phase 5: Date Locale for Urdu

Currently `ModernPageHeader` falls back to `arLocale` for Urdu. This shows Arabic numerals/month names rather than Urdu. Since date-fns doesn't have a native Urdu locale, `arLocale` is the closest match and acceptable for now.

---

## Files to Change

| File | Action |
|------|--------|
| `src/components/mobile/MobileSideMenu.tsx` | Add `dir` to SheetContent |
| `src/components/ui/sheet.tsx` | `right-4` to `end-4` on close button |
| `src/lib/i18n/translations/en.ts` | Add ~26 toast keys |
| `src/lib/i18n/translations/ar.ts` | Arabic toast translations |
| `src/lib/i18n/translations/ur.ts` | Urdu toast translations |
| 40+ HR page files | Replace `label: "HR"` with `t('nav.hr')` |
| `src/pages/app/lab/LabTestTemplateFormPage.tsx` | Replace `label: "Lab"` with `t('nav.lab')` |
| `src/pages/app/billing/InsuranceCompaniesPage.tsx` | Replace `label: "Billing"` with `t('nav.billing')` |
| 7+ high-traffic pages | Replace hardcoded toast strings with `getTranslatedString()` |

---

## Expected Outcome

| Area | Before | After |
|------|--------|-------|
| Sidebar menu items in Arabic | Icons LEFT, chevrons RIGHT (LTR) | Icons RIGHT, chevrons LEFT (native RTL) |
| Sheet close button | Fixed `right-4` | Logical `end-4` |
| Toast "Device updated" | English always | Arabic/Urdu translated |
| Toast "Failed to save" | English always | Arabic/Urdu translated |
| 40 HR breadcrumbs "HR" | English always | Translated |
| Lab/Billing breadcrumbs | English always | Translated |


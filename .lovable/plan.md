
# Complete HMS Translation Audit — Untranslated Strings Remaining

## Summary of Findings

After scanning every `.tsx` file in the project, a massive number of hardcoded English strings remain across virtually every module. Here is the exact breakdown:

---

## Category 1: Toast Messages (~750 hardcoded strings in ~126 files)

| Type | Files | Matches |
|------|-------|---------|
| `toast.success("...")` | 61 files | 531 matches |
| `toast.error("...")` | 65 files | 659 matches |
| `toast({ title: "..." })` | 10 files | 122 matches |
| `toast.info("...")` | 5 files | 29 matches |

**Examples found in:**
- Settings: BranchRolesPage, UserInvitePage, PatientConfigPage, IPDConfigPage, HRConfigPage, LabSettingsPage, CountryRegionSettingsPage
- Billing: ClaimDetailPage, PaymentCollectionPage, AppointmentPaymentDialog
- Pharmacy: DispensingPage, POSTerminalPage
- IPD: DischargeSummaryForm, BedDetailCard, RoundNotesForm
- OT: PACUPage, PreAnesthesiaAssessmentPage, LiveSurgeryPage
- Lab: LabPaymentDialog
- HR: EmployeeFormPage, LeavesPage, PayslipsPage, SalaryComponentsPage, TaxSlabsPage
- Inventory: RequisitionDetailPage, CategoriesPage
- Radiology: ReportVerificationPage, ImageCapturePage
- Emergency: ERDischargeFormPage
- Blood Bank: multiple pages
- Mobile: MobileNursingStation

---

## Category 2: Page Titles and Descriptions (~3,200 hardcoded strings in ~267+ files)

| Type | Files | Matches |
|------|-------|---------|
| `title="English Text"` | 267 files | 1,946 matches |
| `description="English Text"` | 218 files | 1,268 matches |

**Every module's PageHeader** still uses hardcoded English for `title` and `description` props. This includes all pages in:
- Accounts (22 pages): BudgetsPage, BalanceSheetPage, PayablesPage, JournalEntriesPage, etc.
- Billing (14 pages): PaymentHistoryPage, ClaimFormPage, PaymentCollectionPage, InsuranceCompaniesPage
- IPD (31 pages): DischargeFormPage, BedTypesPage, IPDBillingDashboard, etc.
- OT (18 pages): OTRoomsPage, SurgeryFormPage, etc.
- Radiology (19 pages): ImageCapturePage, ModalitiesListPage, ReportingWorklistPage, etc.
- Lab (11 pages): LabTestTemplatesListPage, LabSettingsPage, etc.
- HR (all pages): ComplianceDashboardPage, VaccinationsPage, ProcessPayrollPage, etc.
- Settings (45 pages): ServiceTypesListPage, IPDConfigPage, HRConfigPage, CountryRegionSettingsPage, etc.
- Reports (8 pages): ReportsHubPage section titles
- Services, Reception, Clinic, Blood Bank, Inventory, Appointments, OPD, Patients
- Super Admin pages

---

## Category 3: Placeholders (~5,300+ hardcoded strings in ~338 files)

| Type | Files | Matches |
|------|-------|---------|
| `placeholder="English Text"` | 338 files | 5,369 matches |

These are input fields, search boxes, select triggers, and textareas like:
- `placeholder="Search branches..."`
- `placeholder="Select employee..."`
- `placeholder="e.g., 500mg"`
- `placeholder="Add any notes about this roster..."`
- `placeholder="All Doctors"`

---

## Category 4: Table Column Headers (~975 in ~30 files)

| Type | Files | Matches |
|------|-------|---------|
| `header: "English"` | 30 files | 975 matches |

Found in DataTable column definitions across Pharmacy, Radiology, Reports, HR, Accounts, etc.

---

## Category 5: Breadcrumb Labels (~1,661 in ~159 files)

| Type | Files | Matches |
|------|-------|---------|
| `label: "English"` | 159 files | 1,661 matches |

Breadcrumb items like `{ label: "Accounts", href: "/app/accounts" }`, `{ label: "Exit Management" }`, `{ label: "Vaccinations" }`

---

## Category 6: Search Placeholders and Empty Messages (~80 in ~14 files)

| Type | Files | Matches |
|------|-------|---------|
| `searchPlaceholder="..."` | 9 files | 50 matches |
| `emptyMessage="..."` | 5 files | 30 matches |

---

## Category 7: Select Option Labels, Badge Text, Status Labels

Found in static arrays like:
- `STATUS_OPTIONS = [{ value: "submitted", label: "Submitted" }, ...]` (ResignationsPage)
- `movementTypeConfig: { grn: { label: "GRN Receipt" }, ... }` (StockMovementsPage)
- Aging bucket labels: `"Current"`, `"31-60 Days"` (PayablesPage)

---

## Total Remaining Untranslated Strings

| Category | Approximate Count |
|----------|-------------------|
| Toast messages | ~1,340 |
| Page titles/descriptions | ~3,200 |
| Placeholders | ~5,300 |
| Table headers | ~975 |
| Breadcrumb labels | ~1,660 |
| Search/empty messages | ~80 |
| Status/option labels | ~300 |
| **Grand Total** | **~12,855 hardcoded English strings** |

---

## Implementation Plan

Due to the enormous scale, this must be done systematically in batches. Each batch will:
1. Add required translation keys to `en.ts`, `ar.ts`, `ur.ts`
2. Update files to use `useTranslation` hook with `t('key' as any)`
3. Use `getTranslatedString()` for toast messages in async contexts

### Batch Execution Order (continuing from where we left off)

**Batch 3: Pharmacy Remaining + Radiology Keys (~100 files)**
- Complete pharmacy: StockMovementsPage, StockAlertsPage, PrescriptionHistoryPage, POSSessionsPage, WarehousesListPage, PharmacyReportsPage, PharmacySettingsPage, CategoriesPage, DispensingPage, PharmacyReturnsPage, RackManagementPage, RackAssignmentsPage
- Complete pharmacy components: POSQuickActions, POSRecentProducts, POSCartCompanion, POSTodaySummary, DailySalesSummary, PharmacyAlertsWidget, RackLocationBadge, RefundMethodSelector, ReturnItemSelector, POSCategoryFilter, POSReceipt
- Add ~180 Radiology keys

**Batch 4: Radiology Pages + OT Keys (~35 files)**
- All 19 Radiology pages + 14 components
- Add ~250 OT keys

**Batch 5: OT Pages + IPD Keys (~65 files)**
- All 18 OT pages + key components
- Add ~300 IPD keys

**Batch 6: IPD Pages + Components (~73 files)**
- All 31 IPD pages + 42 components

**Batch 7: Billing + Emergency + Lab (~52 files)**
- 14 Billing pages + 22 components
- 11 Emergency pages + 13 components
- 11 Lab pages + 5 components

**Batch 8: Blood Bank + Inventory (~54 files)**
- 15 Blood Bank pages + 5 components
- 24 Inventory pages + 10 components

**Batch 9: Accounts (~22 files)**
- All 22 Accounts pages

**Batch 10: Settings (~45 files)**
- All 45 Settings pages

**Batch 11: OPD + Appointments + Reports + Services + Reception + Clinic (~45 files)**
- All remaining clinical and operational modules

**Batch 12: Mobile Views + Standalone Pages + HR remaining (~40 files)**
- All 28 mobile components + standalone pages

**Batch 13: Toast Message Sweep (~126 files)**
- Convert all `toast.success/error/info("English")` calls across every file to use `getTranslatedString()`

**Batch 14: Final Placeholder + Select Options Sweep**
- Any remaining `placeholder=`, `label:`, status labels, empty messages

### Technical Approach

For page files:
```
import { useTranslation } from "@/lib/i18n";
const { t } = useTranslation();

// PageHeader
title={t('moduleName.pageTitle' as any)}
description={t('moduleName.pageDesc' as any)}

// Breadcrumbs  
{ label: t('nav.moduleName' as any), href: "..." }

// Table headers
header: t('common.name' as any)

// Placeholders
placeholder={t('common.searchPlaceholder' as any)}
```

For toast messages (async context):
```
import { getTranslatedString } from "@/lib/i18n";
toast.success(getTranslatedString('toast.savedSuccessfully'));
toast.error(getTranslatedString('toast.failedToSave'));
```

Shall I proceed with Batch 3 (completing Pharmacy module + adding Radiology translation keys)?

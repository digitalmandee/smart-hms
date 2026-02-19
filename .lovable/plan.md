

# Complete HMS Translation — Every Module, Every Page, Every String

## Problem Summary

After auditing all 300+ files across every HMS module, approximately **200+ files** still contain hardcoded English strings. This includes page titles, descriptions, breadcrumbs, table column headers, button labels, placeholders, badge values, stats card titles, form labels, select options, dialog text, and mobile view strings.

Additionally, the **tablet sidebar** in `DashboardLayout.tsx` (line 75) is missing `dir={isRTL ? "rtl" : "ltr"}` on its `SheetContent`, which causes RTL layout issues on tablet-sized screens.

---

## Sidebar Fix (CRITICAL)

**File:** `src/layouts/DashboardLayout.tsx` line 75

The tablet/small-desktop sidebar `SheetContent` is missing the `dir` attribute. The mobile `MobileSideMenu.tsx` already has it (line 485), but the tablet one does not.

**Fix:** Add `dir={isRTL ? "rtl" : "ltr"}` to the `SheetContent` at line 75.

---

## Full Module Audit Results

### Module 1: Pharmacy (24 pages + 26 components)
**Hardcoded strings in:** MedicinesListPage, MedicineFormPage, InventoryPage, WarehousesListPage, WarehouseFormPage, WarehouseDetailPage, StockEntryPage, StockMovementsPage, StockAlertsPage, CategoriesPage, POSTerminalPage, POSTransactionsPage, POSTransactionDetailPage, POSSessionsPage, PrescriptionQueuePage, PrescriptionHistoryPage, DispensingPage, PharmacyReturnsPage, PharmacyReportsPage, PharmacySettingsPage, RackManagementPage, RackAssignmentsPage, OTMedicationQueuePage

**Components:** POSCart, POSProductSearch, POSPaymentModal, POSReceiptPreview, POSPatientSearch, POSHeldTransactions, POSOrderReview, POSQuickActions, POSRecentProducts, POSMedicineAlternatives, POSCartCompanion, POSTodaySummary, DailySalesSummary, ExpiryAlert, LowStockAlert, InventoryAdjustmentModal, BatchSelector, PharmacyAlertsWidget, PrescriptionQueueCard, RackLocationBadge, RackSelector, RefundMethodSelector, ReturnItemSelector, StockLevelBadge, POSCategoryFilter, POSReceipt

**Estimated new keys:** ~200

### Module 2: Radiology (19 pages + 14 components)
**Hardcoded strings in:** RadiologyDashboard, ImagingOrdersListPage, ImagingOrderFormPage, ImagingOrderDetailPage, ImagingSchedulePage, TechnicianWorklistPage, ReportingWorklistPage, ReportEntryPage, ReportVerificationPage, RadiologyArchivePage, RadiologyReportsPage, ModalitiesListPage, ProceduresListPage, ImagingReportTemplatesPage, PACSSettingsPage, PACSSetupGuidePage, PACSServersPage, PACSStudiesPage, ImageCapturePage

**Components:** ImageViewer, ImagingDetailDialog, ImagingOrderCard, ImagingPriorityBadge, ImagingStatusBadge, InvoiceLinkDialog, ModalityBadge, PACSConfigurationForm, PACSServerFormDialog, PACSViewer, PaymentStatusBadge, PrintableImagingReport, ReportTemplateForm, TechnicianWorklistCard

**Estimated new keys:** ~180

### Module 3: OT / Surgery (18 pages + 45 components)
**Hardcoded strings in:** OTDashboard, SurgeryRequestsPage, SurgeriesListPage, SurgeryFormPage, SurgeryDetailPage, OTSchedulePage, OTRoomsPage, OTRoomFormPage, OTReportsPage, PACUPage, PreOpAssessmentPage, PreAnesthesiaAssessmentPage, AnesthesiaDashboard, AnesthesiaRecordPage, IntraOpNotesPage, LiveSurgeryPage, OTNursingNotesPage, OTInstrumentCountPage

**Components:** 45 OT components (surgery cards, team lists, WHO checklist, consent forms, timers, etc.)

**Estimated new keys:** ~250

### Module 4: IPD / Inpatient (31 pages + 42 components)
**Hardcoded strings in:** IPDDashboard, AdmissionFormPage, AdmissionDetailPage, AdmissionHistoryPage, AdmissionsListPage, DischargeFormPage, DoctorDischargePage, DischargesPage, WardFormPage, WardsListPage, BedsPage, BedFormPage, BedProfilePage, BedDashboardPage, BedTransfersPage, BirthRecordFormPage, BirthRecordsPage, DeathRecordsPage, CarePlansPage, DailyRoundsPage, RoundDetailPage, DietManagementPage, HousekeepingQueuePage, IPDBillingDashboard, IPDChargesPage, IPDReportsPage, IPDVitalsPage, MedicationChartPage, NursingNotesPage, NursingStationPage + 5 setup pages

**Components:** 42 IPD components (admission cards, bed maps, discharge forms, printables, etc.)

**Estimated new keys:** ~300

### Module 5: Billing (14 pages + 22 components)
**Hardcoded strings in:** BillingDashboard, InvoicesListPage, InvoiceFormPage, InvoiceDetailPage, PaymentCollectionPage, PaymentHistoryPage, DailyClosingPage, BillingReportsPage, ClaimsListPage, ClaimFormPage, ClaimDetailPage, ClaimsReportPage, InsuranceCompaniesPage, InsurancePlansPage

**Components:** 22 billing components (invoice builder, payment selectors, receipt printables, session management, etc.)

**Estimated new keys:** ~180

### Module 6: Emergency (11 pages + 13 components)
**Hardcoded strings in:** EmergencyDashboard, ERQueuePage, ERQueueDisplayPage, ERRegistrationPage, ERDetailPage, ERDischargeFormPage, ERReportsPage, TriagePage, QuickAdmissionPage, AmbulanceAlertsPage, MLCRecordsPage

**Components:** 13 ER components (triage forms, patient cards, queue boards, printables, etc.)

**Estimated new keys:** ~120

### Module 7: Lab (11 pages + 5 components)
**Hardcoded strings in:** LabDashboard, LabQueuePage, LabTestCategoriesPage, LabTestTemplatesListPage, LabTestTemplateFormPage, LabAnalyzersPage, LabAnalyzerFormPage, LabAnalyzerMappingPage, CreateLabOrderPage, LabResultEntryPage, LabReportsPage

**Components:** LabOrderCard, LabPaymentDialog, LabResultsPreview, PrintableLabReport, TestResultForm

**Estimated new keys:** ~100

### Module 8: Blood Bank (15 pages + 5 components)
**Hardcoded strings in:** BloodBankDashboard, DonorsListPage, DonorFormPage, DonationsPage, DonationFormPage, DonationDetailPage, RequestsListPage, BloodRequestFormPage, BloodRequestDetailPage, CrossMatchPage, CrossMatchFormPage, TransfusionsPage, TransfusionFormPage, TransfusionDetailPage, InventoryPage

**Components:** BloodGroupBadge, BloodStockWidget, DonationStatusBadge, DonorCard, RequestCard

**Estimated new keys:** ~120

### Module 9: Inventory (24 pages + 10 components)
**Hardcoded strings in:** InventoryDashboard, ItemsListPage, ItemFormPage, ItemDetailPage, CategoriesPage, StoresListPage, StoreFormPage, StockLevelsPage, POListPage, POFormPage, PODetailPage, GRNListPage, GRNFormPage, GRNDetailPage, RequisitionsListPage, RequisitionFormPage, RequisitionDetailPage, TransfersListPage, TransferFormPage, TransferDetailPage, VendorsListPage, VendorFormPage, VendorDetailPage, InventoryReportsPage

**Components:** GRNStatusBadge, LowStockAlertWidget, POItemsBuilder, POStatusBadge, PrintableGRN, PrintablePO, RequisitionStatusBadge, StockLevelIndicator, StoreSelector, UnifiedPOItemsBuilder

**Estimated new keys:** ~200

### Module 10: Accounts (22 pages)
**Hardcoded strings in:** AccountsDashboard, ChartOfAccountsPage, AccountFormPage, AccountDetailPage, AccountTypesPage, AccountTypeFormPage, AccountSettingsPage, JournalEntriesPage, JournalEntryDetailPage, GeneralLedgerPage, BankAccountsPage, PayablesPage, ReceivablesPage, FinancialReportsPage, BalanceSheetPage, ProfitLossPage, TrialBalancePage, CashFlowPage, BudgetsPage, VendorPaymentsListPage, VendorPaymentFormPage, VendorPaymentDetailPage

**Estimated new keys:** ~180

### Module 11: Settings (45 pages)
**Hardcoded strings in:** OrganizationSettingsPage, OrganizationBrandingPage, OrgModulesPage, BranchesListPage, BranchFormPage, BranchBrandingPage, BranchRolesPage, BranchModulesPage, UsersListPage, UserDetailPage, UserInvitePage, StaffCreatePage, RolesPermissionsPage, DoctorFeesPage, SurgeonFeesPage, SpecializationsPage, QualificationsPage, OTConfigPage, SMSSettingsPage, EmailSettingsPage, EmailTemplatesPage, NotificationSettingsPage, KiosksListPage, KioskFormPage, KioskSessionsPage, KioskActivityPage, QueueDisplaysListPage, QueueDisplayFormPage, ServiceTypesListPage, ServiceTypeFormPage, ServicesPage, PaymentMethodsListPage, PaymentMethodFormPage, ReceiptTemplatesPage, ReportTemplatesPage, BillingSettingsPage, CountryRegionSettingsPage, ClinicalConfigPage, HRConfigPage, IPDConfigPage, LabSettingsPage, OPDDepartmentsPage, PatientConfigPage, TaxSettingsPage, AuditLogsPage

**Estimated new keys:** ~300

### Module 12: OPD (13 pages + 5 components)
**Hardcoded strings in:** DoctorDashboard, NurseDashboard, OPDAdminDashboard, ConsultationPage, ConsultationDetailPage, ConsultationHistoryPage, OPDVitalsPage, OPDOrdersPage, OPDCheckoutPage, OPDWalkInPage, PendingCheckoutPage, DoctorReportsPage, GynecologyDashboard

**Components:** OPDDepartmentBadge, OPDDepartmentForm, OPDDepartmentSelector, OPDDepartmentSpecializations, TokenResetButton

**Estimated new keys:** ~150

### Module 13: Appointments (13 pages)
**Hardcoded strings in:** AppointmentsListPage, AppointmentFormPage, AppointmentDetailPage, AppointmentCalendarPage, AppointmentQueuePage, AppointmentReportsPage, DoctorSchedulePage, MyCalendarPage, CheckInPage, TokenKioskPage, KioskSetupPage, QueueControlPage, QueueDisplayPage

**Estimated new keys:** ~120

### Module 14: Reports (8 pages)
**Hardcoded strings in:** ReportsHubPage, ExecutiveDashboardReport, OPDDepartmentReport, DepartmentRevenueReport, ShiftWiseCollectionReport, BranchComparisonPage, DayEndSummaryReport, OrganizationReportsPage

**Estimated new keys:** ~100

### Module 15: Patients (4 pages)
**Hardcoded strings in:** PatientsListPage, PatientDetailPage, PatientReportsPage (PatientFormPage already translated)

**Estimated new keys:** ~50

### Module 16: Services (4 pages)
**Hardcoded strings in:** ServiceCategoriesPage, ServicesListPage, ServiceFormPage, CategoryServicesPage

**Estimated new keys:** ~40

### Module 17: Reception (2 pages + 6 components)
**Hardcoded strings in:** ReceptionistDashboard, OTMedicationChargesPage

**Components:** PendingSurgeryRequestsCard, RecentRegistrationCard, ReceptionQuickActions, TodayScheduleList, UpcomingAppointmentCard, UpcomingSurgeriesCard

**Estimated new keys:** ~60

### Module 18: Clinic (3 pages)
**Hardcoded strings in:** ClinicDashboard, ClinicTokenPage, ClinicReportsPage

**Estimated new keys:** ~40

### Module 19: Mobile Views (28 components)
**Hardcoded strings in:** MobileDoctorView, MobileNurseView, MobilePharmacyView, MobileLabView, MobileLabQueue, MobileIPDDashboard, MobileOTDashboard, MobileNursingStation, MobilePatientList, MobilePatientProfile, MobileInvoiceList, MobileConsultationHistory, MobileMedicationChart, MobileVitalsView, MobileOrdersList, MobileCalendarView, MobileMySchedule, MobileQueueView, MobileFormWizard, MobileAppointmentCard, AppointmentCard, BottomNavigation, QuickActionCard, TaskCard, MobileStatsCard, PullToRefresh

**Estimated new keys:** ~150

### Module 20: Standalone Pages
**Hardcoded strings in:** DashboardPage, ProfilePage, NotificationsPage, OrgAdminDashboardPage, MyAttendancePage, MyLeavesPage, MyPayslipsPage, MySchedulePage, MyWalletPage, MorePage, CertificatesPage, AIChatPage

**Estimated new keys:** ~80

---

## Total Scope

| Category | Count |
|----------|-------|
| Page files to translate | ~250 |
| Component files to translate | ~190 |
| New translation keys needed (en.ts) | ~2,800 |
| New translation keys needed (ar.ts) | ~2,800 |
| New translation keys needed (ur.ts) | ~2,800 |
| **Total files to modify** | **~443** |

---

## Implementation Strategy

Due to the massive scale (~440 files, ~8,400 key entries), this will be executed in **10-12 batches** over multiple messages:

### Batch 1: Sidebar Fix + Translation Keys for Modules 1-5
- Fix `DashboardLayout.tsx` tablet sidebar `dir` attribute
- Add ~800 new keys to en.ts, ar.ts, ur.ts for Pharmacy, Radiology, OT, IPD, Billing

### Batch 2: Pharmacy Pages + Components (50 files)
- Add `useTranslation` hook and replace all hardcoded strings in 24 pages + 26 components

### Batch 3: Radiology + OT Pages + Components (77 files)
- Translate 19 Radiology pages + 14 components
- Translate 18 OT pages + key components (prioritized)

### Batch 4: IPD Pages + Components (73 files)
- Translate 31 IPD pages + 42 components

### Batch 5: Translation Keys for Modules 6-12
- Add ~700 new keys to all three language files for Billing, Emergency, Lab, Blood Bank, Inventory, Accounts, Settings

### Batch 6: Billing + Emergency + Lab (52 files)
- Translate 14 Billing pages + 22 components
- Translate 11 Emergency pages + 13 components
- Translate 11 Lab pages + 5 components

### Batch 7: Blood Bank + Inventory (54 files)
- Translate 15 Blood Bank pages + 5 components
- Translate 24 Inventory pages + 10 components

### Batch 8: Translation Keys for Modules 13-20 + Accounts (22 pages)
- Add ~500 new keys for remaining modules
- Translate all 22 Accounts pages

### Batch 9: Settings (45 pages)
- Translate all Settings pages

### Batch 10: OPD + Appointments + Reports + Remaining (40+ files)
- Translate OPD, Appointments, Reports, Patients, Services, Reception, Clinic pages

### Batch 11: Mobile Views + Standalone (40 files)
- Translate all 28 mobile components
- Translate standalone pages (Dashboard, Profile, etc.)

### Batch 12: OT Components + Final Sweep (45 files)
- Complete remaining OT components
- Final verification pass

---

## Technical Pattern (Applied Consistently)

For every file:

```text
1. Import: import { useTranslation } from "@/lib/i18n";
2. Hook: const { t } = useTranslation();
3. Replace strings:
   - title="Medicine Catalog" -> title={t('pharmacy.medicineCatalog' as any)}
   - header: "Name" -> header: t('common.name' as any)
   - placeholder="Search..." -> placeholder={t('common.search' as any)}
   - breadcrumbs label: "Pharmacy" -> label: t('nav.pharmacy' as any)
   - Badge text "Active" -> t('common.active' as any)
   - Button text "Add New" -> t('common.add' as any)
```

For async/callback contexts (toast messages, mutation callbacks):
```text
import { getTranslatedString } from "@/lib/i18n";
toast.success(getTranslatedString("toast.saved"));
```

Shared common keys will be reused across modules (common.name, common.status, common.active, common.search, etc.) to minimize duplication.


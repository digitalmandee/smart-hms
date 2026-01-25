import { Toaster } from "@/components/ui/toaster";
// OPD Checkout Page import
import OPDCheckoutPage from "@/pages/app/opd/OPDCheckoutPage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { systemLogger } from "@/lib/logger";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TestCasesPage from "./pages/TestCasesPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { DashboardPage } from "./pages/app/DashboardPage";

// Clinic pages
import ClinicDashboard from "./pages/app/clinic/ClinicDashboard";
import ClinicTokenPage from "./pages/app/clinic/ClinicTokenPage";
import ClinicReportsPage from "./pages/app/clinic/ClinicReportsPage";

// Public display pages (no auth required)
import PublicQueueDisplay from "./pages/public/PublicQueueDisplay";
import PublicERDisplay from "./pages/public/PublicERDisplay";
import PublicTokenKiosk from "./pages/public/PublicTokenKiosk";

// Super Admin pages
import { SuperAdminDashboard } from "./pages/super-admin/SuperAdminDashboard";
import { OrganizationsListPage } from "./pages/super-admin/OrganizationsListPage";
import { CreateOrganizationPage } from "./pages/super-admin/CreateOrganizationPage";
import { OrganizationDetailPage } from "./pages/super-admin/OrganizationDetailPage";
import { SystemSettingsPage } from "./pages/super-admin/SystemSettingsPage";
import { PlatformUsersPage } from "./pages/super-admin/PlatformUsersPage";
import { PlatformAuditLogsPage } from "./pages/super-admin/PlatformAuditLogsPage";
import { ModuleCatalogPage } from "./pages/super-admin/ModuleCatalogPage";
import AllBranchesListPage from "./pages/super-admin/AllBranchesListPage";
import OrgModulesPage from "./pages/app/settings/OrgModulesPage";
import UserInvitePage from "./pages/app/settings/UserInvitePage";
import OrganizationBrandingPage from "./pages/app/settings/OrganizationBrandingPage";
import BranchBrandingPage from "./pages/app/settings/BranchBrandingPage";
import BranchRolesPage from "./pages/app/settings/BranchRolesPage";
import BranchModulesPage from "./pages/app/settings/BranchModulesPage";
import BillingSettingsPage from "./pages/app/settings/BillingSettingsPage";
import TaxSettingsPage from "./pages/app/settings/TaxSettingsPage";
import ReceiptTemplatesPage from "./pages/app/settings/ReceiptTemplatesPage";
import OrgAdminDashboardPage from "./pages/app/OrgAdminDashboardPage";
import OrganizationReportsPage from "./pages/app/reports/OrganizationReportsPage";
import BranchComparisonPage from "./pages/app/reports/BranchComparisonPage";

// Settings pages
import { BranchesListPage } from "./pages/app/settings/BranchesListPage";
import { BranchFormPage } from "./pages/app/settings/BranchFormPage";
import { UsersListPage } from "./pages/app/settings/UsersListPage";
import { UserDetailPage } from "./pages/app/settings/UserDetailPage";
import StaffCreatePage from "./pages/app/settings/StaffCreatePage";
import { OrganizationSettingsPage } from "./pages/app/settings/OrganizationSettingsPage";
import { RolesPermissionsPage } from "./pages/app/settings/RolesPermissionsPage";
import ServicesListPage from "./pages/app/services/ServicesListPage";
import ServiceFormPage from "./pages/app/services/ServiceFormPage";
import ServiceCategoriesPage from "./pages/app/services/ServiceCategoriesPage";
import CategoryServicesPage from "./pages/app/services/CategoryServicesPage";

// Patient pages
import { PatientsListPage } from "./pages/app/patients/PatientsListPage";
import { PatientFormPage } from "./pages/app/patients/PatientFormPage";
import { PatientDetailPage } from "./pages/app/patients/PatientDetailPage";

// Appointment pages
import AppointmentsListPage from "./pages/app/appointments/AppointmentsListPage";
import AppointmentFormPage from "./pages/app/appointments/AppointmentFormPage";
import AppointmentDetailPage from "./pages/app/appointments/AppointmentDetailPage";
import AppointmentQueuePage from "./pages/app/appointments/AppointmentQueuePage";
import AppointmentCalendarPage from "./pages/app/appointments/AppointmentCalendarPage";
import MyCalendarPage from "./pages/app/appointments/MyCalendarPage";
import DoctorSchedulePage from "./pages/app/appointments/DoctorSchedulePage";
import CheckInPage from "./pages/app/appointments/CheckInPage";
import QueueDisplayPage from "./pages/app/appointments/QueueDisplayPage";
import TokenKioskPage from "./pages/app/appointments/TokenKioskPage";
import KioskSetupPage from "./pages/app/appointments/KioskSetupPage";
import QueueControlPage from "./pages/app/appointments/QueueControlPage";
import KiosksListPage from "./pages/app/settings/KiosksListPage";
import KioskFormPage from "./pages/app/settings/KioskFormPage";
import KioskSessionsPage from "./pages/app/settings/KioskSessionsPage";
import KioskActivityPage from "./pages/app/settings/KioskActivityPage";
import QueueDisplaysListPage from "./pages/app/settings/QueueDisplaysListPage";
import QueueDisplayFormPage from "./pages/app/settings/QueueDisplayFormPage";

// Kiosk authentication pages
import KioskLoginPage from "./pages/kiosk/KioskLoginPage";
import KioskTerminalPage from "./pages/kiosk/KioskTerminalPage";

// Filtered queue display page
import FilteredQueueDisplayPage from "./pages/display/FilteredQueueDisplayPage";
// OPD pages
import DoctorDashboard from "./pages/app/opd/DoctorDashboard";
import OPDWalkInPage from "./pages/app/opd/OPDWalkInPage";
import ConsultationPage from "./pages/app/opd/ConsultationPage";
import OPDVitalsPage from "./pages/app/opd/OPDVitalsPage";
import ConsultationHistoryPage from "./pages/app/opd/ConsultationHistoryPage";
import ConsultationDetailPage from "./pages/app/opd/ConsultationDetailPage";
import OPDOrdersPage from "./pages/app/opd/OPDOrdersPage";
import NurseDashboard from "./pages/app/opd/NurseDashboard";
import ReceptionistDashboard from "./pages/app/reception/ReceptionistDashboard";

// Lab pages
import LabDashboard from "./pages/app/lab/LabDashboard";
import LabQueuePage from "./pages/app/lab/LabQueuePage";
import LabResultEntryPage from "./pages/app/lab/LabResultEntryPage";
import LabTestTemplatesListPage from "./pages/app/lab/LabTestTemplatesListPage";
import LabTestTemplateFormPage from "./pages/app/lab/LabTestTemplateFormPage";
import LabTestCategoriesPage from "./pages/app/lab/LabTestCategoriesPage";
import CreateLabOrderPage from "./pages/app/lab/CreateLabOrderPage";
// Pharmacy pages
import PharmacyDashboard from "./pages/app/pharmacy/PharmacyDashboard";
import PrescriptionQueuePage from "./pages/app/pharmacy/PrescriptionQueuePage";
import PrescriptionHistoryPage from "./pages/app/pharmacy/PrescriptionHistoryPage";
import DispensingPage from "./pages/app/pharmacy/DispensingPage";
import MedicinesListPage from "./pages/app/pharmacy/MedicinesListPage";
import MedicineFormPage from "./pages/app/pharmacy/MedicineFormPage";
import InventoryPage from "./pages/app/pharmacy/InventoryPage";
import StockEntryPage from "./pages/app/pharmacy/StockEntryPage";
import POSTerminalPage from "./pages/app/pharmacy/POSTerminalPage";
import POSTransactionsPage from "./pages/app/pharmacy/POSTransactionsPage";
import POSTransactionDetailPage from "./pages/app/pharmacy/POSTransactionDetailPage";
import POSSessionsPage from "./pages/app/pharmacy/POSSessionsPage";
import PharmacyCategoriesPage from "./pages/app/pharmacy/CategoriesPage";
import StockAlertsPage from "./pages/app/pharmacy/StockAlertsPage";
import PharmacyReportsPage from "./pages/app/pharmacy/PharmacyReportsPage";
import StockMovementsPage from "./pages/app/pharmacy/StockMovementsPage";
import PharmacyReturnsPage from "./pages/app/pharmacy/PharmacyReturnsPage";
import PharmacySettingsPage from "./pages/app/pharmacy/PharmacySettingsPage";
import OTMedicationQueuePage from "./pages/app/pharmacy/OTMedicationQueuePage";

// Billing pages
import BillingDashboard from "./pages/app/billing/BillingDashboard";
import InvoicesListPage from "./pages/app/billing/InvoicesListPage";
import InvoiceFormPage from "./pages/app/billing/InvoiceFormPage";
import InvoiceDetailPage from "./pages/app/billing/InvoiceDetailPage";
import PaymentCollectionPage from "./pages/app/billing/PaymentCollectionPage";
import PaymentHistoryPage from "./pages/app/billing/PaymentHistoryPage";
import BillingReportsPage from "./pages/app/billing/BillingReportsPage";
import InsuranceCompaniesPage from "./pages/app/billing/InsuranceCompaniesPage";
import InsurancePlansPage from "./pages/app/billing/InsurancePlansPage";
import ClaimsListPage from "./pages/app/billing/ClaimsListPage";
import ClaimFormPage from "./pages/app/billing/ClaimFormPage";
import ClaimDetailPage from "./pages/app/billing/ClaimDetailPage";

// Settings management pages
import ServiceTypesListPage from "./pages/app/settings/ServiceTypesListPage";
import ServiceTypeFormPage from "./pages/app/settings/ServiceTypeFormPage";
import PaymentMethodsListPage from "./pages/app/settings/PaymentMethodsListPage";
import PaymentMethodFormPage from "./pages/app/settings/PaymentMethodFormPage";
import NotificationSettingsPage from "./pages/app/settings/NotificationSettingsPage";
import AuditLogsPage from "./pages/app/settings/AuditLogsPage";
import SMSSettingsPage from "./pages/app/settings/SMSSettingsPage";
import ReportTemplatesPage from "./pages/app/settings/ReportTemplatesPage";
import PublicLabReportPage from "./pages/public/PublicLabReportPage";
import EmailSettingsPage from "./pages/app/settings/EmailSettingsPage";
import EmailTemplatesPage from "./pages/app/settings/EmailTemplatesPage";
import SpecializationsPage from "./pages/app/settings/SpecializationsPage";
import QualificationsPage from "./pages/app/settings/QualificationsPage";
import DoctorFeesPage from "./pages/app/settings/DoctorFeesPage";
import ClinicalConfigPage from "./pages/app/settings/ClinicalConfigPage";
import LabSettingsPage from "./pages/app/settings/LabSettingsPage";
import PatientConfigPage from "./pages/app/settings/PatientConfigPage";
import HRConfigPage from "./pages/app/settings/HRConfigPage";
import SurgeonFeesPage from "./pages/app/settings/SurgeonFeesPage";
import IPDConfigPage from "./pages/app/settings/IPDConfigPage";

// HR pages
import HRDashboard from "./pages/app/hr/HRDashboard";
import EmployeesListPage from "./pages/app/hr/EmployeesListPage";
import EmployeeFormPage from "./pages/app/hr/EmployeeFormPage";
import EmployeeDetailPage from "./pages/app/hr/EmployeeDetailPage";
import DepartmentsPage from "./pages/app/hr/setup/DepartmentsPage";
import DesignationsPage from "./pages/app/hr/setup/DesignationsPage";
import EmployeeCategoriesPage from "./pages/app/hr/setup/EmployeeCategoriesPage";
import ShiftsPage from "./pages/app/hr/setup/ShiftsPage";
import LeaveTypesPage from "./pages/app/hr/setup/LeaveTypesPage";
import HolidaysPage from "./pages/app/hr/setup/HolidaysPage";
import AttendancePage from "./pages/app/hr/attendance/AttendancePage";
import AttendanceSheetPage from "./pages/app/hr/attendance/AttendanceSheetPage";
import LeavesPage from "./pages/app/hr/leaves/LeavesPage";
import LeaveBalancesPage from "./pages/app/hr/leaves/LeaveBalancesPage";
import PayrollPage from "./pages/app/hr/payroll/PayrollPage";
import ProcessPayrollPage from "./pages/app/hr/payroll/ProcessPayrollPage";
import EmployeeSalariesPage from "./pages/app/hr/payroll/EmployeeSalariesPage";
import LoansAdvancesPage from "./pages/app/hr/payroll/LoansAdvancesPage";
import PayslipsPage from "./pages/app/hr/payroll/PayslipsPage";
import PayrollReportsPage from "./pages/app/hr/payroll/PayrollReportsPage";
import PayrollRunDetailPage from "./pages/app/hr/payroll/PayrollRunDetailPage";
import BankSheetPage from "./pages/app/hr/payroll/BankSheetPage";
import DoctorsListPage from "./pages/app/hr/DoctorsListPage";
import NursesListPage from "./pages/app/hr/NursesListPage";
import HRReportsPage from "./pages/app/hr/HRReportsPage";
import AttendanceReportsPage from "./pages/app/hr/attendance/AttendanceReportsPage";
import BiometricDevicesPage from "./pages/app/hr/attendance/BiometricDevicesPage";
import SalaryComponentsPage from "./pages/app/hr/setup/SalaryComponentsPage";
import TaxSlabsPage from "./pages/app/hr/setup/TaxSlabsPage";
import DoctorCompensationPage from "./pages/app/hr/payroll/DoctorCompensationPage";
import DoctorEarningsPage from "./pages/app/hr/payroll/DoctorEarningsPage";
import JobOpeningsPage from "./pages/app/hr/recruitment/JobOpeningsPage";
import ApplicationsPage from "./pages/app/hr/recruitment/ApplicationsPage";
import ResignationsPage from "./pages/app/hr/exit/ResignationsPage";
import ComplianceDashboardPage from "./pages/app/hr/compliance/ComplianceDashboardPage";
import MedicalFitnessPage from "./pages/app/hr/compliance/MedicalFitnessPage";
import VaccinationsPage from "./pages/app/hr/compliance/VaccinationsPage";
import DisciplinaryPage from "./pages/app/hr/compliance/DisciplinaryPage";
import MedicalLicensesPage from "./pages/app/hr/compliance/MedicalLicensesPage";
import EmployeeDocumentsPage from "./pages/app/hr/compliance/EmployeeDocumentsPage";
import ClearancePage from "./pages/app/hr/exit/ClearancePage";
import SettlementsPage from "./pages/app/hr/exit/SettlementsPage";
import ExitInterviewsPage from "./pages/app/hr/exit/ExitInterviewsPage";
import ParamedicalStaffPage from "./pages/app/hr/ParamedicalStaffPage";
import SupportStaffPage from "./pages/app/hr/SupportStaffPage";
import VisitingDoctorsPage from "./pages/app/hr/VisitingDoctorsPage";
import DutyRosterPage from "./pages/app/hr/attendance/DutyRosterPage";
import OnCallSchedulePage from "./pages/app/hr/attendance/OnCallSchedulePage";
import OvertimePage from "./pages/app/hr/attendance/OvertimePage";
import OTDutyRosterPage from "./pages/app/hr/attendance/OTDutyRosterPage";
import EmergencyRosterPage from "./pages/app/hr/attendance/EmergencyRosterPage";
import PublishRosterPage from "./pages/app/hr/attendance/PublishRosterPage";
import RosterReportsPage from "./pages/app/hr/attendance/RosterReportsPage";
import MySchedulePage from "./pages/app/MySchedulePage";
import MyAttendancePage from "./pages/app/MyAttendancePage";
import MyPayslipsPage from "./pages/app/MyPayslipsPage";
import MyLeavesPage from "./pages/app/MyLeavesPage";

import IPDDashboard from "./pages/app/ipd/IPDDashboard";
import WardsListPage from "./pages/app/ipd/WardsListPage";
import WardFormPage from "./pages/app/ipd/WardFormPage";
import AdmissionsListPage from "./pages/app/ipd/AdmissionsListPage";
import AdmissionFormPage from "./pages/app/ipd/AdmissionFormPage";
import AdmissionDetailPage from "./pages/app/ipd/AdmissionDetailPage";
import BedsPage from "./pages/app/ipd/BedsPage";
import BedFormPage from "./pages/app/ipd/BedFormPage";
import BedProfilePage from "./pages/app/ipd/BedProfilePage";
import BedDashboardPage from "./pages/app/ipd/BedDashboardPage";
import HousekeepingQueuePage from "./pages/app/ipd/HousekeepingQueuePage";
import DailyRoundsPage from "./pages/app/ipd/DailyRoundsPage";
import RoundDetailPage from "./pages/app/ipd/RoundDetailPage";
import NursingStationPage from "./pages/app/ipd/NursingStationPage";
import DischargesPage from "./pages/app/ipd/DischargesPage";
import DischargeFormPage from "./pages/app/ipd/DischargeFormPage";
import DoctorDischargePage from "./pages/app/ipd/DoctorDischargePage";

// Emergency pages
import EmergencyDashboard from "./pages/app/emergency/EmergencyDashboard";
import ERRegistrationPage from "./pages/app/emergency/ERRegistrationPage";
import TriagePage from "./pages/app/emergency/TriagePage";
import ERDetailPage from "./pages/app/emergency/ERDetailPage";
import ERQueuePage from "./pages/app/emergency/ERQueuePage";
import ERQueueDisplayPage from "./pages/app/emergency/ERQueueDisplayPage";
import AmbulanceAlertsPage from "./pages/app/emergency/AmbulanceAlertsPage";
import QuickAdmissionPage from "./pages/app/emergency/QuickAdmissionPage";
import ERDischargeFormPage from "./pages/app/emergency/ERDischargeFormPage";
import ERReportsPage from "./pages/app/emergency/ERReportsPage";

// Report pages
import DoctorReportsPage from "./pages/app/opd/DoctorReportsPage";
import LabReportsPage from "./pages/app/lab/LabReportsPage";
import AppointmentReportsPage from "./pages/app/appointments/AppointmentReportsPage";
import PatientReportsPage from "./pages/app/patients/PatientReportsPage";
import ReportsHubPage from "./pages/app/reports/ReportsHubPage";
import ExecutiveDashboardReport from "./pages/app/reports/ExecutiveDashboardReport";
import EmployeePerformanceReport from "./pages/app/hr/reports/EmployeePerformanceReport";

// OT pages
import OTDashboard from "./pages/app/ot/OTDashboard";
import OTSchedulePage from "./pages/app/ot/OTSchedulePage";
import SurgeriesListPage from "./pages/app/ot/SurgeriesListPage";
import SurgeryFormPage from "./pages/app/ot/SurgeryFormPage";
import SurgeryDetailPage from "./pages/app/ot/SurgeryDetailPage";
import SurgeryRequestsPage from "./pages/app/ot/SurgeryRequestsPage";
import OTRoomsPage from "./pages/app/ot/OTRoomsPage";
import OTRoomFormPage from "./pages/app/ot/OTRoomFormPage";
import PACUPage from "./pages/app/ot/PACUPage";
import PreOpAssessmentPage from "./pages/app/ot/PreOpAssessmentPage";
import AnesthesiaRecordPage from "./pages/app/ot/AnesthesiaRecordPage";
import IntraOpNotesPage from "./pages/app/ot/IntraOpNotesPage";
import AnesthesiaDashboard from "./pages/app/ot/AnesthesiaDashboard";
import PreAnesthesiaAssessmentPage from "./pages/app/ot/PreAnesthesiaAssessmentPage";
import OTNursingNotesPage from "./pages/app/ot/OTNursingNotesPage";
import OTInstrumentCountPage from "./pages/app/ot/OTInstrumentCountPage";
import LiveSurgeryPage from "./pages/app/ot/LiveSurgeryPage";
import OTConfigPage from "./pages/app/settings/OTConfigPage";

// Reception pages
import OTMedicationChargesPage from "./pages/app/reception/OTMedicationChargesPage";

// Blood Bank pages
import BloodBankDashboard from "./pages/app/blood-bank/BloodBankDashboard";
import DonorsListPage from "./pages/app/blood-bank/DonorsListPage";
import DonorFormPage from "./pages/app/blood-bank/DonorFormPage";
import DonationsPage from "./pages/app/blood-bank/DonationsPage";
import DonationFormPage from "./pages/app/blood-bank/DonationFormPage";
import DonationDetailPage from "./pages/app/blood-bank/DonationDetailPage";
import BloodInventoryPage from "./pages/app/blood-bank/InventoryPage";
import BloodRequestsListPage from "./pages/app/blood-bank/RequestsListPage";
import BloodRequestFormPage from "./pages/app/blood-bank/BloodRequestFormPage";
import BloodRequestDetailPage from "./pages/app/blood-bank/BloodRequestDetailPage";
import CrossMatchPage from "./pages/app/blood-bank/CrossMatchPage";
import CrossMatchFormPage from "./pages/app/blood-bank/CrossMatchFormPage";
import TransfusionsPage from "./pages/app/blood-bank/TransfusionsPage";
import TransfusionDetailPage from "./pages/app/blood-bank/TransfusionDetailPage";
import TransfusionFormPage from "./pages/app/blood-bank/TransfusionFormPage";

// Radiology pages
import RadiologyDashboard from "./pages/app/radiology/RadiologyDashboard";
import ImagingOrdersListPage from "./pages/app/radiology/ImagingOrdersListPage";
import ImagingOrderFormPage from "./pages/app/radiology/ImagingOrderFormPage";
import ImagingOrderDetailPage from "./pages/app/radiology/ImagingOrderDetailPage";
import TechnicianWorklistPage from "./pages/app/radiology/TechnicianWorklistPage";
import ImageCapturePage from "./pages/app/radiology/ImageCapturePage";
import ImagingSchedulePage from "./pages/app/radiology/ImagingSchedulePage";
import ReportingWorklistPage from "./pages/app/radiology/ReportingWorklistPage";
import ReportEntryPage from "./pages/app/radiology/ReportEntryPage";
import ReportVerificationPage from "./pages/app/radiology/ReportVerificationPage";
import ModalitiesListPage from "./pages/app/radiology/ModalitiesListPage";
import ProceduresListPage from "./pages/app/radiology/ProceduresListPage";
import PACSStudiesPage from "./pages/app/radiology/PACSStudiesPage";
import PACSSettingsPage from "./pages/app/radiology/PACSSettingsPage";
import PACSSetupGuidePage from "./pages/app/radiology/PACSSetupGuidePage";
import RadiologyArchivePage from "./pages/app/radiology/RadiologyArchivePage";
import ImagingReportTemplatesPage from "./pages/app/radiology/ImagingReportTemplatesPage";

// Inventory pages
import InventoryDashboard from "./pages/app/inventory/InventoryDashboard";
import ItemsListPage from "./pages/app/inventory/ItemsListPage";
import ItemFormPage from "./pages/app/inventory/ItemFormPage";
import ItemDetailPage from "./pages/app/inventory/ItemDetailPage";
import CategoriesPage from "./pages/app/inventory/CategoriesPage";
import StockLevelsPage from "./pages/app/inventory/StockLevelsPage";
import VendorsListPage from "./pages/app/inventory/VendorsListPage";
import VendorFormPage from "./pages/app/inventory/VendorFormPage";
import VendorDetailPage from "./pages/app/inventory/VendorDetailPage";
import POListPage from "./pages/app/inventory/POListPage";
import POFormPage from "./pages/app/inventory/POFormPage";
import PODetailPage from "./pages/app/inventory/PODetailPage";
import GRNListPage from "./pages/app/inventory/GRNListPage";
import GRNFormPage from "./pages/app/inventory/GRNFormPage";
import GRNDetailPage from "./pages/app/inventory/GRNDetailPage";
import RequisitionsListPage from "./pages/app/inventory/RequisitionsListPage";
import RequisitionFormPage from "./pages/app/inventory/RequisitionFormPage";
import RequisitionDetailPage from "./pages/app/inventory/RequisitionDetailPage";
import InventoryReportsPage from "./pages/app/inventory/InventoryReportsPage";

// Accounts pages
import AccountsDashboard from "./pages/app/accounts/AccountsDashboard";
import ChartOfAccountsPage from "./pages/app/accounts/ChartOfAccountsPage";
import AccountFormPage from "./pages/app/accounts/AccountFormPage";
import AccountDetailPage from "./pages/app/accounts/AccountDetailPage";
import JournalEntriesPage from "./pages/app/accounts/JournalEntriesPage";
import JournalEntryDetailPage from "./pages/app/accounts/JournalEntryDetailPage";
import GeneralLedgerPage from "./pages/app/accounts/GeneralLedgerPage";
import ReceivablesPage from "./pages/app/accounts/ReceivablesPage";
import PayablesPage from "./pages/app/accounts/PayablesPage";
import VendorPaymentsListPage from "./pages/app/accounts/VendorPaymentsListPage";
import VendorPaymentFormPage from "./pages/app/accounts/VendorPaymentFormPage";
import VendorPaymentDetailPage from "./pages/app/accounts/VendorPaymentDetailPage";
import BankAccountsPage from "./pages/app/accounts/BankAccountsPage";
import BudgetsPage from "./pages/app/accounts/BudgetsPage";
import AccountSettingsPage from "./pages/app/accounts/AccountSettingsPage";
import AccountTypesPage from "./pages/app/accounts/AccountTypesPage";
import AccountTypeFormPage from "./pages/app/accounts/AccountTypeFormPage";
import FinancialReportsPage from "./pages/app/accounts/FinancialReportsPage";
import TrialBalancePage from "./pages/app/accounts/TrialBalancePage";
import ProfitLossPage from "./pages/app/accounts/ProfitLossPage";
import BalanceSheetPage from "./pages/app/accounts/BalanceSheetPage";
import CashFlowPage from "./pages/app/accounts/CashFlowPage";

// Additional IPD pages
import AdmissionHistoryPage from "./pages/app/ipd/AdmissionHistoryPage";
import IPDVitalsPage from "./pages/app/ipd/IPDVitalsPage";
import NursingNotesPage from "./pages/app/ipd/NursingNotesPage";
import CarePlansPage from "./pages/app/ipd/CarePlansPage";
import DietManagementPage from "./pages/app/ipd/DietManagementPage";
import IPDChargesPage from "./pages/app/ipd/IPDChargesPage";
import IPDBillingDashboard from "./pages/app/ipd/IPDBillingDashboard";
import BedTransfersPage from "./pages/app/ipd/BedTransfersPage";
import MedicationChartPage from "./pages/app/ipd/MedicationChartPage";
import IPDReportsPage from "./pages/app/ipd/IPDReportsPage";
import DietTypesPage from "./pages/app/ipd/setup/DietTypesPage";
import WardTypesPage from "./pages/app/ipd/setup/WardTypesPage";
import BedTypesPage from "./pages/app/ipd/setup/BedTypesPage";
import BedFeaturesPage from "./pages/app/ipd/setup/BedFeaturesPage";
import FloorsPage from "./pages/app/ipd/setup/FloorsPage";

// Gynecology & Certificates pages
import GynecologyDashboard from "./pages/app/opd/GynecologyDashboard";
import BirthRecordsPage from "./pages/app/ipd/BirthRecordsPage";
import BirthRecordFormPage from "./pages/app/ipd/BirthRecordFormPage";
import DeathRecordsPage from "./pages/app/ipd/DeathRecordsPage";
import CertificatesPage from "./pages/app/certificates/CertificatesPage";
import MLCRecordsPage from "./pages/app/emergency/MLCRecordsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      onError: (error: Error) => {
        systemLogger.error('Mutation failed globally', error, {
          errorName: error.name,
          errorMessage: error.message,
        });
      },
    },
  },
});

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
            
            {/* Public display routes - NO AUTH REQUIRED for TV displays and kiosks */}
            <Route path="/display/queue/:organizationId" element={<PublicQueueDisplay />} />
            <Route path="/display/er/:organizationId" element={<PublicERDisplay />} />
            <Route path="/display/:displayId" element={<FilteredQueueDisplayPage />} />
            <Route path="/kiosk/:organizationId" element={<PublicTokenKiosk />} />
            <Route path="/kiosk/:organizationId/:kioskId" element={<PublicTokenKiosk />} />
            
            {/* Public Lab Report Portal */}
            <Route path="/lab-reports" element={<PublicLabReportPage />} />
            
            {/* Test Cases Documentation (hidden - not linked from landing page) */}
            <Route path="/test-cases" element={<TestCasesPage />} />
            {/* Authenticated kiosk routes - separate login for kiosk devices */}
            <Route path="/kiosk/login" element={<KioskLoginPage />} />
            <Route path="/kiosk/terminal" element={<KioskTerminalPage />} />
            
            {/* Auth routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
            </Route>

            {/* Protected app routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Employee Self-Service */}
              <Route path="my-schedule" element={<MySchedulePage />} />
              <Route path="my-attendance" element={<MyAttendancePage />} />
              
              {/* Reports Hub */}
              <Route path="reports" element={<ReportsHubPage />} />
              <Route path="reports/organization" element={<OrganizationReportsPage />} />
              <Route path="reports/branches" element={<BranchComparisonPage />} />
              <Route path="reports/executive" element={<ExecutiveDashboardReport />} />
              
              {/* Organization Admin Dashboard */}
              <Route path="org-dashboard" element={<OrgAdminDashboardPage />} />
              
              {/* Employee Self-Service routes */}
              <Route path="my-schedule" element={<MySchedulePage />} />
              <Route path="my-attendance" element={<MyAttendancePage />} />
              <Route path="my-payslips" element={<MyPayslipsPage />} />
              <Route path="my-leaves" element={<MyLeavesPage />} />
              
              {/* Clinic routes */}
              <Route path="clinic" element={<ClinicDashboard />} />
              <Route path="clinic/token" element={<ClinicTokenPage />} />
              <Route path="clinic/reports" element={<ClinicReportsPage />} />
              
              {/* Patient routes */}
              <Route path="patients" element={<PatientsListPage />} />
              <Route path="patients/new" element={<PatientFormPage />} />
              <Route path="patients/:id" element={<PatientDetailPage />} />
              <Route path="patients/:id/edit" element={<PatientFormPage />} />
              <Route path="patients/reports" element={<PatientReportsPage />} />
              
              {/* Appointment routes */}
              <Route path="appointments" element={<AppointmentsListPage />} />
              <Route path="appointments/new" element={<AppointmentFormPage />} />
              <Route path="appointments/queue" element={<AppointmentQueuePage />} />
              <Route path="appointments/calendar" element={<AppointmentCalendarPage />} />
              <Route path="appointments/my-calendar" element={<MyCalendarPage />} />
              <Route path="appointments/schedules" element={<DoctorSchedulePage />} />
              <Route path="appointments/display" element={<QueueDisplayPage />} />
              <Route path="appointments/token-display" element={<TokenKioskPage />} />
              <Route path="appointments/kiosk-setup" element={<KioskSetupPage />} />
              <Route path="appointments/queue-control" element={<QueueControlPage />} />
              <Route path="appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="appointments/:id/edit" element={<AppointmentFormPage />} />
              <Route path="appointments/:id/check-in" element={<CheckInPage />} />
              <Route path="appointments/reports" element={<AppointmentReportsPage />} />

              {/* Blood Bank routes */}
              <Route path="blood-bank" element={<BloodBankDashboard />} />
              <Route path="blood-bank/donors" element={<DonorsListPage />} />
              <Route path="blood-bank/donors/new" element={<DonorFormPage />} />
              <Route path="blood-bank/donors/:id" element={<DonorFormPage />} />
              <Route path="blood-bank/donations" element={<DonationsPage />} />
              <Route path="blood-bank/donations/new" element={<DonationFormPage />} />
              <Route path="blood-bank/donations/:id" element={<DonationDetailPage />} />
              <Route path="blood-bank/inventory" element={<BloodInventoryPage />} />
              <Route path="blood-bank/requests" element={<BloodRequestsListPage />} />
              <Route path="blood-bank/requests/new" element={<BloodRequestFormPage />} />
              <Route path="blood-bank/requests/:id" element={<BloodRequestDetailPage />} />
              <Route path="blood-bank/cross-match" element={<CrossMatchPage />} />
              <Route path="blood-bank/cross-match/new" element={<CrossMatchFormPage />} />
              <Route path="blood-bank/transfusions" element={<TransfusionsPage />} />
              <Route path="blood-bank/transfusions/new" element={<TransfusionFormPage />} />
              <Route path="blood-bank/transfusions/:id" element={<TransfusionDetailPage />} />

              {/* OPD routes */}
              <Route path="opd" element={<DoctorDashboard />} />
              <Route path="opd/walk-in" element={<OPDWalkInPage />} />
              <Route path="opd/nursing" element={<NurseDashboard />} />
              
              {/* Reception routes */}
              <Route path="reception" element={<ReceptionistDashboard />} />
              <Route path="opd/nursing" element={<NurseDashboard />} />
              <Route path="opd/consultation/:appointmentId" element={<ConsultationPage />} />
              <Route path="opd/vitals" element={<OPDVitalsPage />} />
              <Route path="opd/orders" element={<OPDOrdersPage />} />
              <Route path="opd/checkout/:appointmentId" element={<OPDCheckoutPage />} />
              <Route path="opd/history" element={<ConsultationHistoryPage />} />
              <Route path="opd/consultations/:id" element={<ConsultationDetailPage />} />
              <Route path="opd/gynecology" element={<GynecologyDashboard />} />
              <Route path="opd/reports" element={<DoctorReportsPage />} />
              
              {/* Pharmacy routes */}
              <Route path="pharmacy" element={<PharmacyDashboard />} />
              <Route path="pharmacy/pos" element={<POSTerminalPage />} />
              <Route path="pharmacy/pos/transactions" element={<POSTransactionsPage />} />
              <Route path="pharmacy/pos/transactions/:id" element={<POSTransactionDetailPage />} />
              <Route path="pharmacy/pos/sessions" element={<POSSessionsPage />} />
              <Route path="pharmacy/queue" element={<PrescriptionQueuePage />} />
              <Route path="pharmacy/history" element={<PrescriptionHistoryPage />} />
              <Route path="pharmacy/dispense/:prescriptionId" element={<DispensingPage />} />
              <Route path="pharmacy/medicines" element={<MedicinesListPage />} />
              <Route path="pharmacy/medicines/new" element={<MedicineFormPage />} />
              <Route path="pharmacy/medicines/:id/edit" element={<MedicineFormPage />} />
              <Route path="pharmacy/categories" element={<PharmacyCategoriesPage />} />
              <Route path="pharmacy/inventory" element={<InventoryPage />} />
              <Route path="pharmacy/inventory/add" element={<StockEntryPage />} />
              <Route path="pharmacy/alerts" element={<StockAlertsPage />} />
              <Route path="pharmacy/reports" element={<PharmacyReportsPage />} />
              <Route path="pharmacy/stock-movements" element={<StockMovementsPage />} />
              <Route path="pharmacy/returns" element={<PharmacyReturnsPage />} />
              <Route path="pharmacy/ot-queue" element={<OTMedicationQueuePage />} />
              <Route path="pharmacy/settings" element={<PharmacySettingsPage />} />
              
              {/* IPD routes */}
              <Route path="ipd" element={<IPDDashboard />} />
              <Route path="ipd/wards" element={<WardsListPage />} />
              <Route path="ipd/wards/new" element={<WardFormPage />} />
              <Route path="ipd/wards/:id/edit" element={<WardFormPage />} />
              <Route path="ipd/beds" element={<BedsPage />} />
              <Route path="ipd/beds/new" element={<BedFormPage />} />
              <Route path="ipd/beds/:bedId/profile" element={<BedProfilePage />} />
              <Route path="ipd/beds/:id/edit" element={<BedFormPage />} />
              <Route path="ipd/bed-dashboard" element={<BedDashboardPage />} />
              <Route path="ipd/housekeeping" element={<HousekeepingQueuePage />} />
              <Route path="ipd/admissions" element={<AdmissionsListPage />} />
              <Route path="ipd/admissions/new" element={<AdmissionFormPage />} />
              <Route path="ipd/admissions/:id" element={<AdmissionDetailPage />} />
              <Route path="ipd/rounds" element={<DailyRoundsPage />} />
              <Route path="ipd/rounds/:admissionId" element={<RoundDetailPage />} />
              <Route path="ipd/nursing" element={<NursingStationPage />} />
              <Route path="ipd/nursing-notes" element={<NursingNotesPage />} />
              <Route path="ipd/discharges" element={<DischargesPage />} />
              <Route path="ipd/discharge/:id" element={<DischargeFormPage />} />
              <Route path="ipd/doctor-discharge/:id" element={<DoctorDischargePage />} />
              <Route path="ipd/discharge-summaries" element={<DischargesPage />} />
              <Route path="ipd/discharge-billing" element={<DischargesPage />} />
              <Route path="ipd/transfers" element={<BedTransfersPage />} />
              <Route path="ipd/care-plans" element={<CarePlansPage />} />
              <Route path="ipd/diet" element={<DietManagementPage />} />
              <Route path="ipd/vitals" element={<IPDVitalsPage />} />
              <Route path="ipd/charges" element={<IPDChargesPage />} />
              <Route path="ipd/billing" element={<IPDBillingDashboard />} />
              <Route path="ipd/medication-chart" element={<MedicationChartPage />} />
              <Route path="ipd/emar" element={<MedicationChartPage />} />
              <Route path="ipd/history" element={<AdmissionHistoryPage />} />
              <Route path="ipd/reports" element={<IPDReportsPage />} />
              <Route path="ipd/birth-records" element={<BirthRecordsPage />} />
              <Route path="ipd/birth-records/new" element={<BirthRecordFormPage />} />
              <Route path="ipd/death-records" element={<DeathRecordsPage />} />
              
              {/* Emergency routes */}
              <Route path="emergency" element={<EmergencyDashboard />} />
              <Route path="emergency/register" element={<ERRegistrationPage />} />
              <Route path="emergency/triage" element={<TriagePage />} />
              <Route path="emergency/queue" element={<ERQueuePage />} />
              <Route path="emergency/display" element={<ERQueueDisplayPage />} />
              <Route path="emergency/ambulance-alerts" element={<AmbulanceAlertsPage />} />
              <Route path="emergency/:id" element={<ERDetailPage />} />
              <Route path="emergency/:id/admit" element={<QuickAdmissionPage />} />
              <Route path="emergency/:id/discharge" element={<ERDischargeFormPage />} />
              <Route path="emergency/mlc" element={<MLCRecordsPage />} />
              <Route path="emergency/reports" element={<ERReportsPage />} />
              
              {/* OT routes */}
              <Route path="ot" element={<OTDashboard />} />
              <Route path="ot/schedule" element={<OTSchedulePage />} />
              <Route path="ot/requests" element={<SurgeryRequestsPage />} />
              <Route path="ot/surgeries" element={<SurgeriesListPage />} />
              <Route path="ot/surgeries/new" element={<SurgeryFormPage />} />
              <Route path="ot/surgeries/:id" element={<SurgeryDetailPage />} />
              <Route path="ot/surgeries/:id/edit" element={<SurgeryFormPage />} />
              <Route path="ot/surgeries/:id/pre-op" element={<PreOpAssessmentPage />} />
              <Route path="ot/surgeries/:id/anesthesia" element={<AnesthesiaRecordPage />} />
              <Route path="ot/surgeries/:id/pre-anesthesia" element={<PreAnesthesiaAssessmentPage />} />
              <Route path="ot/surgeries/:id/op-notes" element={<IntraOpNotesPage />} />
              <Route path="ot/surgeries/:id/live" element={<LiveSurgeryPage />} />
              <Route path="ot/anesthesia" element={<AnesthesiaDashboard />} />
              <Route path="ot/rooms" element={<OTRoomsPage />} />
              <Route path="ot/rooms/new" element={<OTRoomFormPage />} />
              <Route path="ot/rooms/:id/edit" element={<OTRoomFormPage />} />
              <Route path="ot/pacu" element={<PACUPage />} />
              <Route path="ot/nursing-notes" element={<OTNursingNotesPage />} />
              <Route path="ot/instruments" element={<OTInstrumentCountPage />} />
              
              {/* Reception OT Charges */}
              <Route path="reception/ot-charges" element={<OTMedicationChargesPage />} />
              
              {/* Radiology routes */}
              <Route path="radiology" element={<RadiologyDashboard />} />
              <Route path="radiology/orders" element={<ImagingOrdersListPage />} />
              <Route path="radiology/orders/new" element={<ImagingOrderFormPage />} />
              <Route path="radiology/orders/:id" element={<ImagingOrderDetailPage />} />
              <Route path="radiology/worklist" element={<TechnicianWorklistPage />} />
              <Route path="radiology/capture/:id" element={<ImageCapturePage />} />
              <Route path="radiology/schedule" element={<ImagingSchedulePage />} />
              <Route path="radiology/reporting" element={<ReportingWorklistPage />} />
              <Route path="radiology/report/:id" element={<ReportEntryPage />} />
              <Route path="radiology/verification" element={<ReportVerificationPage />} />
              <Route path="radiology/archive" element={<RadiologyArchivePage />} />
              <Route path="radiology/modalities" element={<ModalitiesListPage />} />
              <Route path="radiology/procedures" element={<ProceduresListPage />} />
              <Route path="radiology/pacs" element={<PACSStudiesPage />} />
              <Route path="radiology/pacs/settings" element={<PACSSettingsPage />} />
              <Route path="radiology/pacs/guide" element={<PACSSetupGuidePage />} />
              <Route path="radiology/templates" element={<ImagingReportTemplatesPage />} />
              
              {/* Lab routes */}
              <Route path="lab" element={<LabDashboard />} />
              <Route path="lab/queue" element={<LabQueuePage />} />
              <Route path="lab/create-order" element={<CreateLabOrderPage />} />
              <Route path="lab/orders/:orderId" element={<LabResultEntryPage />} />
              <Route path="lab/templates" element={<LabTestTemplatesListPage />} />
              <Route path="lab/templates/new" element={<LabTestTemplateFormPage />} />
              <Route path="lab/templates/:id/edit" element={<LabTestTemplateFormPage />} />
              <Route path="lab/categories" element={<LabTestCategoriesPage />} />
              <Route path="lab/reports" element={<LabReportsPage />} />
              
              {/* Inventory routes */}
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="inventory/items" element={<ItemsListPage />} />
              <Route path="inventory/items/new" element={<ItemFormPage />} />
              <Route path="inventory/items/:id" element={<ItemDetailPage />} />
              <Route path="inventory/items/:id/edit" element={<ItemFormPage />} />
              <Route path="inventory/categories" element={<CategoriesPage />} />
              <Route path="inventory/stock" element={<StockLevelsPage />} />
              <Route path="inventory/vendors" element={<VendorsListPage />} />
              <Route path="inventory/vendors/new" element={<VendorFormPage />} />
              <Route path="inventory/vendors/:id" element={<VendorDetailPage />} />
              <Route path="inventory/vendors/:id/edit" element={<VendorFormPage />} />
              <Route path="inventory/purchase-orders" element={<POListPage />} />
              <Route path="inventory/purchase-orders/new" element={<POFormPage />} />
              <Route path="inventory/purchase-orders/:id" element={<PODetailPage />} />
              <Route path="inventory/purchase-orders/:id/edit" element={<POFormPage />} />
              <Route path="inventory/grn" element={<GRNListPage />} />
              <Route path="inventory/grn/new" element={<GRNFormPage />} />
              <Route path="inventory/grn/:id" element={<GRNDetailPage />} />
              <Route path="inventory/requisitions" element={<RequisitionsListPage />} />
              <Route path="inventory/requisitions/new" element={<RequisitionFormPage />} />
              <Route path="inventory/requisitions/:id" element={<RequisitionDetailPage />} />
              <Route path="inventory/reports" element={<InventoryReportsPage />} />
              
              {/* Billing routes */}
              <Route path="billing" element={<BillingDashboard />} />
              <Route path="billing/invoices" element={<InvoicesListPage />} />
              <Route path="billing/invoices/new" element={<InvoiceFormPage />} />
              <Route path="billing/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="billing/invoices/:id/edit" element={<InvoiceFormPage />} />
              <Route path="billing/invoices/:id/pay" element={<PaymentCollectionPage />} />
              <Route path="billing/payments" element={<PaymentHistoryPage />} />
              <Route path="billing/reports" element={<BillingReportsPage />} />
              <Route path="billing/insurance/companies" element={<InsuranceCompaniesPage />} />
              <Route path="billing/insurance/plans" element={<InsurancePlansPage />} />
              <Route path="billing/claims" element={<ClaimsListPage />} />
              <Route path="billing/claims/new" element={<ClaimFormPage />} />
              <Route path="billing/claims/:id" element={<ClaimDetailPage />} />
              
              {/* Accounts routes */}
              <Route path="accounts" element={<AccountsDashboard />} />
              <Route path="accounts/chart-of-accounts" element={<ChartOfAccountsPage />} />
              <Route path="accounts/chart-of-accounts/new" element={<AccountFormPage />} />
              <Route path="accounts/chart-of-accounts/:id" element={<AccountDetailPage />} />
              <Route path="accounts/chart-of-accounts/:id/edit" element={<AccountFormPage />} />
              <Route path="accounts/journal-entries" element={<JournalEntriesPage />} />
              <Route path="accounts/journal-entries/:id" element={<JournalEntryDetailPage />} />
              <Route path="accounts/ledger" element={<GeneralLedgerPage />} />
              <Route path="accounts/receivables" element={<ReceivablesPage />} />
              <Route path="accounts/payables" element={<PayablesPage />} />
              <Route path="accounts/vendor-payments" element={<VendorPaymentsListPage />} />
              <Route path="accounts/vendor-payments/new" element={<VendorPaymentFormPage />} />
              <Route path="accounts/vendor-payments/:id" element={<VendorPaymentDetailPage />} />
              <Route path="accounts/bank-accounts" element={<BankAccountsPage />} />
              <Route path="accounts/budgets" element={<BudgetsPage />} />
              <Route path="accounts/types" element={<AccountTypesPage />} />
              <Route path="accounts/types/new" element={<AccountTypeFormPage />} />
              <Route path="accounts/types/:id/edit" element={<AccountTypeFormPage />} />
              <Route path="accounts/reports" element={<FinancialReportsPage />} />
              <Route path="accounts/reports/trial-balance" element={<TrialBalancePage />} />
              <Route path="accounts/reports/profit-loss" element={<ProfitLossPage />} />
              <Route path="accounts/reports/balance-sheet" element={<BalanceSheetPage />} />
              <Route path="accounts/reports/cash-flow" element={<CashFlowPage />} />
              
              {/* Additional IPD routes */}
              <Route path="ipd/history" element={<AdmissionHistoryPage />} />
              <Route path="ipd/vitals" element={<IPDVitalsPage />} />
              <Route path="ipd/nursing-notes" element={<NursingNotesPage />} />
              <Route path="ipd/care-plans" element={<CarePlansPage />} />
              <Route path="ipd/charges" element={<IPDChargesPage />} />
              <Route path="ipd/beds/transfers" element={<BedTransfersPage />} />
              <Route path="ipd/care/medications" element={<MedicationChartPage />} />
              <Route path="ipd/reports" element={<IPDReportsPage />} />
              <Route path="ipd/diet" element={<DietManagementPage />} />
              <Route path="ipd/births" element={<BirthRecordsPage />} />
              <Route path="ipd/births/new" element={<BirthRecordFormPage />} />
              <Route path="ipd/deaths" element={<DeathRecordsPage />} />
              <Route path="ipd/setup/diet-types" element={<DietTypesPage />} />
              <Route path="ipd/setup/ward-types" element={<WardTypesPage />} />
              <Route path="ipd/setup/bed-types" element={<BedTypesPage />} />
              <Route path="ipd/setup/bed-features" element={<BedFeaturesPage />} />
              <Route path="ipd/setup/floors" element={<FloorsPage />} />
              
              {/* Certificates routes */}
              <Route path="certificates" element={<CertificatesPage />} />
              
              {/* HR routes */}
              <Route path="hr" element={<HRDashboard />} />
              <Route path="hr/employees" element={<EmployeesListPage />} />
              <Route path="hr/employees/new" element={<EmployeeFormPage />} />
              <Route path="hr/employees/:id" element={<EmployeeDetailPage />} />
              <Route path="hr/employees/:id/edit" element={<EmployeeFormPage />} />
              <Route path="hr/attendance" element={<AttendancePage />} />
              <Route path="hr/attendance/sheet" element={<AttendanceSheetPage />} />
              <Route path="hr/attendance/biometric" element={<BiometricDevicesPage />} />
              <Route path="hr/leaves" element={<LeavesPage />} />
              <Route path="hr/leaves/balances" element={<LeaveBalancesPage />} />
              <Route path="hr/payroll" element={<PayrollPage />} />
              <Route path="hr/payroll/process" element={<ProcessPayrollPage />} />
              <Route path="hr/payroll/salaries" element={<EmployeeSalariesPage />} />
              <Route path="hr/payroll/loans" element={<LoansAdvancesPage />} />
              <Route path="hr/payroll/slips" element={<PayslipsPage />} />
              <Route path="hr/payroll/bank-sheet" element={<BankSheetPage />} />
              <Route path="hr/payroll/reports" element={<PayrollReportsPage />} />
              <Route path="hr/payroll/:id" element={<PayrollRunDetailPage />} />
              <Route path="hr/doctors" element={<DoctorsListPage />} />
              <Route path="hr/nurses" element={<NursesListPage />} />
              <Route path="hr/setup/departments" element={<DepartmentsPage />} />
              <Route path="hr/setup/designations" element={<DesignationsPage />} />
              <Route path="hr/setup/categories" element={<EmployeeCategoriesPage />} />
              <Route path="hr/setup/shifts" element={<ShiftsPage />} />
              <Route path="hr/setup/leave-types" element={<LeaveTypesPage />} />
              <Route path="hr/setup/holidays" element={<HolidaysPage />} />
              <Route path="hr/reports" element={<HRReportsPage />} />
              <Route path="hr/reports/performance" element={<EmployeePerformanceReport />} />
              <Route path="hr/attendance/reports" element={<AttendanceReportsPage />} />
              <Route path="hr/setup/salary-components" element={<SalaryComponentsPage />} />
              <Route path="hr/setup/tax-slabs" element={<TaxSlabsPage />} />
              <Route path="hr/payroll/doctor-compensation" element={<DoctorCompensationPage />} />
              <Route path="hr/payroll/doctor-earnings" element={<DoctorEarningsPage />} />
              <Route path="hr/recruitment/jobs" element={<JobOpeningsPage />} />
              <Route path="hr/recruitment/applications" element={<ApplicationsPage />} />
              <Route path="hr/exit/resignations" element={<ResignationsPage />} />
              <Route path="hr/exit/clearance" element={<ClearancePage />} />
              <Route path="hr/exit/settlements" element={<SettlementsPage />} />
              <Route path="hr/exit/interviews" element={<ExitInterviewsPage />} />
              <Route path="hr/compliance" element={<ComplianceDashboardPage />} />
              <Route path="hr/compliance/medical-fitness" element={<MedicalFitnessPage />} />
              <Route path="hr/compliance/vaccinations" element={<VaccinationsPage />} />
              <Route path="hr/compliance/disciplinary" element={<DisciplinaryPage />} />
              <Route path="hr/compliance/licenses" element={<MedicalLicensesPage />} />
              <Route path="hr/compliance/documents" element={<EmployeeDocumentsPage />} />
              <Route path="hr/paramedical" element={<ParamedicalStaffPage />} />
              <Route path="hr/support-staff" element={<SupportStaffPage />} />
              <Route path="hr/visiting-doctors" element={<VisitingDoctorsPage />} />
              <Route path="hr/attendance/roster" element={<DutyRosterPage />} />
              <Route path="hr/attendance/on-call" element={<OnCallSchedulePage />} />
              <Route path="hr/attendance/overtime" element={<OvertimePage />} />
              <Route path="hr/attendance/ot-roster" element={<OTDutyRosterPage />} />
              <Route path="hr/attendance/emergency-roster" element={<EmergencyRosterPage />} />
              <Route path="hr/attendance/publish" element={<PublishRosterPage />} />
              <Route path="hr/attendance/roster-reports" element={<RosterReportsPage />} />
              
              {/* Settings routes */}
              <Route path="settings/branches" element={<BranchesListPage />} />
              <Route path="settings/branches/new" element={<BranchFormPage />} />
              <Route path="settings/branches/:id" element={<BranchFormPage />} />
              <Route path="settings/users" element={<UsersListPage />} />
              <Route path="settings/users/new" element={<StaffCreatePage />} />
              <Route path="settings/staff/new" element={<StaffCreatePage />} />
              <Route path="settings/users/:id" element={<UserDetailPage />} />
              <Route path="settings/organization" element={<OrganizationSettingsPage />} />
              <Route path="settings/roles" element={<RolesPermissionsPage />} />
              
              {/* Services routes - top level */}
              <Route path="services" element={<ServicesListPage />} />
              <Route path="services/new" element={<ServiceFormPage />} />
              <Route path="services/categories" element={<ServiceCategoriesPage />} />
              <Route path="services/category/:categoryCode" element={<CategoryServicesPage />} />
              <Route path="services/:id" element={<ServiceFormPage />} />
              <Route path="services/doctor-fees" element={<DoctorFeesPage />} />
              
              {/* Legacy redirect */}
              <Route path="settings/services" element={<Navigate to="/app/services" replace />} />
              <Route path="settings/services/*" element={<Navigate to="/app/services" replace />} />
              
              <Route path="settings/kiosks" element={<KiosksListPage />} />
              <Route path="settings/kiosks/new" element={<KioskFormPage />} />
              <Route path="settings/kiosks/:id" element={<KioskFormPage />} />
              <Route path="settings/kiosks/sessions" element={<KioskSessionsPage />} />
              <Route path="settings/kiosks/activity" element={<KioskActivityPage />} />
              <Route path="settings/queue-displays" element={<QueueDisplaysListPage />} />
              <Route path="settings/queue-displays/new" element={<QueueDisplayFormPage />} />
              <Route path="settings/queue-displays/:id" element={<QueueDisplayFormPage />} />
              <Route path="settings/payment-methods" element={<PaymentMethodsListPage />} />
              <Route path="settings/payment-methods/new" element={<PaymentMethodFormPage />} />
              <Route path="settings/payment-methods/:id" element={<PaymentMethodFormPage />} />
              <Route path="settings/notifications" element={<NotificationSettingsPage />} />
              <Route path="settings/sms" element={<SMSSettingsPage />} />
              <Route path="settings/email" element={<EmailSettingsPage />} />
              <Route path="settings/email-templates" element={<EmailTemplatesPage />} />
              <Route path="settings/audit-logs" element={<AuditLogsPage />} />
              <Route path="settings/report-templates" element={<ReportTemplatesPage />} />
              <Route path="settings/specializations" element={<SpecializationsPage />} />
              <Route path="settings/qualifications" element={<QualificationsPage />} />
              <Route path="settings/doctor-fees" element={<DoctorFeesPage />} />
              <Route path="settings/modules" element={<OrgModulesPage />} />
              <Route path="settings/branch-modules" element={<BranchModulesPage />} />
              <Route path="settings/branch-roles" element={<BranchRolesPage />} />
              <Route path="settings/branch-branding" element={<BranchBrandingPage />} />
              <Route path="settings/organization/branding" element={<OrganizationBrandingPage />} />
              <Route path="settings/users/invite" element={<UserInvitePage />} />
              <Route path="settings/billing" element={<BillingSettingsPage />} />
              <Route path="settings/tax" element={<TaxSettingsPage />} />
              <Route path="settings/receipts" element={<ReceiptTemplatesPage />} />
              <Route path="settings/clinical" element={<ClinicalConfigPage />} />
              <Route path="settings/lab" element={<LabSettingsPage />} />
              <Route path="settings/patient-config" element={<PatientConfigPage />} />
              <Route path="settings/hr-config" element={<HRConfigPage />} />
              <Route path="settings/ipd-config" element={<IPDConfigPage />} />
              <Route path="settings/ot-config" element={<OTConfigPage />} />
              <Route path="settings/surgeon-fees" element={<SurgeonFeesPage />} />
            </Route>

            {/* Super Admin routes */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="organizations" element={<OrganizationsListPage />} />
              <Route path="organizations/new" element={<CreateOrganizationPage />} />
              <Route path="organizations/:id" element={<OrganizationDetailPage />} />
              <Route path="settings" element={<SystemSettingsPage />} />
              <Route path="users" element={<PlatformUsersPage />} />
              <Route path="audit-logs" element={<PlatformAuditLogsPage />} />
              <Route path="modules" element={<ModuleCatalogPage />} />
              <Route path="branches" element={<AllBranchesListPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;

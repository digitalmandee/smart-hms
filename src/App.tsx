import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { DashboardPage } from "./pages/app/DashboardPage";

// Super Admin pages
import { SuperAdminDashboard } from "./pages/super-admin/SuperAdminDashboard";
import { OrganizationsListPage } from "./pages/super-admin/OrganizationsListPage";
import { CreateOrganizationPage } from "./pages/super-admin/CreateOrganizationPage";
import { OrganizationDetailPage } from "./pages/super-admin/OrganizationDetailPage";
import { SystemSettingsPage } from "./pages/super-admin/SystemSettingsPage";
import { PlatformUsersPage } from "./pages/super-admin/PlatformUsersPage";

// Settings pages
import { BranchesListPage } from "./pages/app/settings/BranchesListPage";
import { BranchFormPage } from "./pages/app/settings/BranchFormPage";
import { UsersListPage } from "./pages/app/settings/UsersListPage";
import { UserDetailPage } from "./pages/app/settings/UserDetailPage";
import { OrganizationSettingsPage } from "./pages/app/settings/OrganizationSettingsPage";
import { RolesPermissionsPage } from "./pages/app/settings/RolesPermissionsPage";

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
import DoctorSchedulePage from "./pages/app/appointments/DoctorSchedulePage";
import CheckInPage from "./pages/app/appointments/CheckInPage";
import QueueDisplayPage from "./pages/app/appointments/QueueDisplayPage";
// OPD pages
import DoctorDashboard from "./pages/app/opd/DoctorDashboard";
import ConsultationPage from "./pages/app/opd/ConsultationPage";
import ConsultationHistoryPage from "./pages/app/opd/ConsultationHistoryPage";
import ConsultationDetailPage from "./pages/app/opd/ConsultationDetailPage";
import NurseDashboard from "./pages/app/opd/NurseDashboard";
import ReceptionistDashboard from "./pages/app/reception/ReceptionistDashboard";

// Lab pages
import LabQueuePage from "./pages/app/lab/LabQueuePage";
import LabResultEntryPage from "./pages/app/lab/LabResultEntryPage";
// Pharmacy pages
import PharmacyDashboard from "./pages/app/pharmacy/PharmacyDashboard";
import PrescriptionQueuePage from "./pages/app/pharmacy/PrescriptionQueuePage";
import DispensingPage from "./pages/app/pharmacy/DispensingPage";
import MedicinesListPage from "./pages/app/pharmacy/MedicinesListPage";
import MedicineFormPage from "./pages/app/pharmacy/MedicineFormPage";
import InventoryPage from "./pages/app/pharmacy/InventoryPage";
import StockEntryPage from "./pages/app/pharmacy/StockEntryPage";

// Billing pages
import BillingDashboard from "./pages/app/billing/BillingDashboard";
import InvoicesListPage from "./pages/app/billing/InvoicesListPage";
import InvoiceFormPage from "./pages/app/billing/InvoiceFormPage";
import InvoiceDetailPage from "./pages/app/billing/InvoiceDetailPage";
import PaymentCollectionPage from "./pages/app/billing/PaymentCollectionPage";
import PaymentHistoryPage from "./pages/app/billing/PaymentHistoryPage";
import BillingReportsPage from "./pages/app/billing/BillingReportsPage";

// Settings management pages
import ServiceTypesListPage from "./pages/app/settings/ServiceTypesListPage";
import ServiceTypeFormPage from "./pages/app/settings/ServiceTypeFormPage";
import PaymentMethodsListPage from "./pages/app/settings/PaymentMethodsListPage";
import PaymentMethodFormPage from "./pages/app/settings/PaymentMethodFormPage";
import NotificationSettingsPage from "./pages/app/settings/NotificationSettingsPage";

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
import PayrollPage from "./pages/app/hr/payroll/PayrollPage";
import DoctorsListPage from "./pages/app/hr/DoctorsListPage";
import NursesListPage from "./pages/app/hr/NursesListPage";

// IPD pages
import IPDDashboard from "./pages/app/ipd/IPDDashboard";
import WardsListPage from "./pages/app/ipd/WardsListPage";
import WardFormPage from "./pages/app/ipd/WardFormPage";
import AdmissionsListPage from "./pages/app/ipd/AdmissionsListPage";
import AdmissionFormPage from "./pages/app/ipd/AdmissionFormPage";
import AdmissionDetailPage from "./pages/app/ipd/AdmissionDetailPage";
import BedsPage from "./pages/app/ipd/BedsPage";
import BedFormPage from "./pages/app/ipd/BedFormPage";
import HousekeepingQueuePage from "./pages/app/ipd/HousekeepingQueuePage";
import DailyRoundsPage from "./pages/app/ipd/DailyRoundsPage";
import NursingStationPage from "./pages/app/ipd/NursingStationPage";
import DischargesPage from "./pages/app/ipd/DischargesPage";
import DischargeFormPage from "./pages/app/ipd/DischargeFormPage";

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

// OT pages
import OTDashboard from "./pages/app/ot/OTDashboard";
import OTSchedulePage from "./pages/app/ot/OTSchedulePage";
import SurgeriesListPage from "./pages/app/ot/SurgeriesListPage";
import SurgeryFormPage from "./pages/app/ot/SurgeryFormPage";
import SurgeryDetailPage from "./pages/app/ot/SurgeryDetailPage";
import OTRoomsPage from "./pages/app/ot/OTRoomsPage";
import OTRoomFormPage from "./pages/app/ot/OTRoomFormPage";
import PACUPage from "./pages/app/ot/PACUPage";
import PreOpAssessmentPage from "./pages/app/ot/PreOpAssessmentPage";
import AnesthesiaRecordPage from "./pages/app/ot/AnesthesiaRecordPage";
import IntraOpNotesPage from "./pages/app/ot/IntraOpNotesPage";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
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
              
              {/* Patient routes */}
              <Route path="patients" element={<PatientsListPage />} />
              <Route path="patients/new" element={<PatientFormPage />} />
              <Route path="patients/:id" element={<PatientDetailPage />} />
              <Route path="patients/:id/edit" element={<PatientFormPage />} />
              
              {/* Appointment routes */}
              <Route path="appointments" element={<AppointmentsListPage />} />
              <Route path="appointments/new" element={<AppointmentFormPage />} />
              <Route path="appointments/queue" element={<AppointmentQueuePage />} />
              <Route path="appointments/calendar" element={<AppointmentCalendarPage />} />
              <Route path="appointments/schedules" element={<DoctorSchedulePage />} />
              <Route path="appointments/display" element={<QueueDisplayPage />} />
              <Route path="appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="appointments/:id/edit" element={<AppointmentFormPage />} />
              <Route path="appointments/:id/check-in" element={<CheckInPage />} />

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
              <Route path="blood-bank/transfusions/:id" element={<TransfusionDetailPage />} />

              {/* OPD routes */}
              <Route path="opd" element={<DoctorDashboard />} />
              <Route path="opd/nursing" element={<NurseDashboard />} />
              
              {/* Reception routes */}
              <Route path="reception" element={<ReceptionistDashboard />} />
              <Route path="opd/nursing" element={<NurseDashboard />} />
              <Route path="opd/consultation/:appointmentId" element={<ConsultationPage />} />
              <Route path="opd/history" element={<ConsultationHistoryPage />} />
              <Route path="opd/consultations/:id" element={<ConsultationDetailPage />} />
              
              {/* Pharmacy routes */}
              <Route path="pharmacy" element={<PharmacyDashboard />} />
              <Route path="pharmacy/queue" element={<PrescriptionQueuePage />} />
              <Route path="pharmacy/dispense/:prescriptionId" element={<DispensingPage />} />
              <Route path="pharmacy/medicines" element={<MedicinesListPage />} />
              <Route path="pharmacy/medicines/new" element={<MedicineFormPage />} />
              <Route path="pharmacy/medicines/:id/edit" element={<MedicineFormPage />} />
              <Route path="pharmacy/inventory" element={<InventoryPage />} />
              <Route path="pharmacy/inventory/add" element={<StockEntryPage />} />
              
              {/* IPD routes */}
              <Route path="ipd" element={<IPDDashboard />} />
              <Route path="ipd/wards" element={<WardsListPage />} />
              <Route path="ipd/wards/new" element={<WardFormPage />} />
              <Route path="ipd/wards/:id/edit" element={<WardFormPage />} />
              <Route path="ipd/beds" element={<BedsPage />} />
              <Route path="ipd/beds/new" element={<BedFormPage />} />
              <Route path="ipd/beds/:id/edit" element={<BedFormPage />} />
              <Route path="ipd/housekeeping" element={<HousekeepingQueuePage />} />
              <Route path="ipd/admissions" element={<AdmissionsListPage />} />
              <Route path="ipd/admissions/new" element={<AdmissionFormPage />} />
              <Route path="ipd/admissions/:id" element={<AdmissionDetailPage />} />
              <Route path="ipd/rounds" element={<DailyRoundsPage />} />
              <Route path="ipd/rounds/:admissionId" element={<DailyRoundsPage />} />
              <Route path="ipd/nursing" element={<NursingStationPage />} />
              <Route path="ipd/discharges" element={<DischargesPage />} />
              <Route path="ipd/discharge/:id" element={<DischargeFormPage />} />
              
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
              
              {/* OT routes */}
              <Route path="ot" element={<OTDashboard />} />
              <Route path="ot/schedule" element={<OTSchedulePage />} />
              <Route path="ot/surgeries" element={<SurgeriesListPage />} />
              <Route path="ot/surgeries/new" element={<SurgeryFormPage />} />
              <Route path="ot/surgeries/:id" element={<SurgeryDetailPage />} />
              <Route path="ot/surgeries/:id/edit" element={<SurgeryFormPage />} />
              <Route path="ot/surgeries/:id/pre-op" element={<PreOpAssessmentPage />} />
              <Route path="ot/surgeries/:id/anesthesia" element={<AnesthesiaRecordPage />} />
              <Route path="ot/surgeries/:id/op-notes" element={<IntraOpNotesPage />} />
              <Route path="ot/rooms" element={<OTRoomsPage />} />
              <Route path="ot/rooms/new" element={<OTRoomFormPage />} />
              <Route path="ot/rooms/:id/edit" element={<OTRoomFormPage />} />
              <Route path="ot/pacu" element={<PACUPage />} />
              
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
              <Route path="radiology/modalities" element={<ModalitiesListPage />} />
              <Route path="radiology/procedures" element={<ProceduresListPage />} />
              
              {/* Lab routes */}
              <Route path="lab/queue" element={<LabQueuePage />} />
              <Route path="lab/orders/:orderId" element={<LabResultEntryPage />} />
              
              {/* Billing routes */}
              <Route path="billing" element={<BillingDashboard />} />
              <Route path="billing/invoices" element={<InvoicesListPage />} />
              <Route path="billing/invoices/new" element={<InvoiceFormPage />} />
              <Route path="billing/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="billing/invoices/:id/edit" element={<InvoiceFormPage />} />
              <Route path="billing/invoices/:id/pay" element={<PaymentCollectionPage />} />
              <Route path="billing/payments" element={<PaymentHistoryPage />} />
              <Route path="billing/reports" element={<BillingReportsPage />} />
              
              {/* HR routes */}
              <Route path="hr" element={<HRDashboard />} />
              <Route path="hr/employees" element={<EmployeesListPage />} />
              <Route path="hr/employees/new" element={<EmployeeFormPage />} />
              <Route path="hr/employees/:id" element={<EmployeeDetailPage />} />
              <Route path="hr/employees/:id/edit" element={<EmployeeFormPage />} />
              <Route path="hr/attendance" element={<AttendancePage />} />
              <Route path="hr/attendance/sheet" element={<AttendanceSheetPage />} />
              <Route path="hr/leaves" element={<LeavesPage />} />
              <Route path="hr/payroll" element={<PayrollPage />} />
              <Route path="hr/doctors" element={<DoctorsListPage />} />
              <Route path="hr/nurses" element={<NursesListPage />} />
              <Route path="hr/setup/departments" element={<DepartmentsPage />} />
              <Route path="hr/setup/designations" element={<DesignationsPage />} />
              <Route path="hr/setup/categories" element={<EmployeeCategoriesPage />} />
              <Route path="hr/setup/shifts" element={<ShiftsPage />} />
              <Route path="hr/setup/leave-types" element={<LeaveTypesPage />} />
              <Route path="hr/setup/holidays" element={<HolidaysPage />} />
              
              {/* Settings routes */}
              <Route path="settings/branches" element={<BranchesListPage />} />
              <Route path="settings/branches/new" element={<BranchFormPage />} />
              <Route path="settings/branches/:id" element={<BranchFormPage />} />
              <Route path="settings/users" element={<UsersListPage />} />
              <Route path="settings/users/:id" element={<UserDetailPage />} />
              <Route path="settings/organization" element={<OrganizationSettingsPage />} />
              <Route path="settings/roles" element={<RolesPermissionsPage />} />
              <Route path="settings/services" element={<ServiceTypesListPage />} />
              <Route path="settings/services/new" element={<ServiceTypeFormPage />} />
              <Route path="settings/services/:id" element={<ServiceTypeFormPage />} />
              <Route path="settings/payment-methods" element={<PaymentMethodsListPage />} />
              <Route path="settings/payment-methods/new" element={<PaymentMethodFormPage />} />
              <Route path="settings/payment-methods/:id" element={<PaymentMethodFormPage />} />
              <Route path="settings/notifications" element={<NotificationSettingsPage />} />
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
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;

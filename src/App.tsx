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

const queryClient = new QueryClient();

const App = () => (
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

export default App;

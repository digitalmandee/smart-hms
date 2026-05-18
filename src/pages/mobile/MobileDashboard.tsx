import { useAuth } from "@/contexts/AuthContext";
import DoctorMobileDashboard from "./DoctorMobileDashboard";
import NurseMobileDashboard from "./NurseMobileDashboard";
import PatientMobileDashboard from "./PatientMobileDashboard";
import StaffMobileDashboard from "./StaffMobileDashboard";
import { resolveMobilePersona } from "@/constants/roles";

export default function MobileDashboard() {
  const { roles, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const persona = resolveMobilePersona(roles);

  switch (persona) {
    case "doctor":
      return <DoctorMobileDashboard />;
    case "nurse":
      return <NurseMobileDashboard />;
    case "patient":
      return <PatientMobileDashboard />;
    case "admin":
    case "pharmacist":
    case "lab":
    case "reception":
    case "staff":
    default:
      return <StaffMobileDashboard />;
  }
}

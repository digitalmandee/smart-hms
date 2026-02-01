import { useAuth } from "@/contexts/AuthContext";
import DoctorMobileDashboard from "./DoctorMobileDashboard";
import NurseMobileDashboard from "./NurseMobileDashboard";
import PatientMobileDashboard from "./PatientMobileDashboard";
import StaffMobileDashboard from "./StaffMobileDashboard";
import { CLINICAL_ROLES, NURSING_ROLES } from "@/constants/roles";

export default function MobileDashboard() {
  const { roles } = useAuth();

  // Determine which dashboard to show based on user roles
  const hasClinicialRole = roles.some(role => CLINICAL_ROLES.includes(role));
  const hasNursingRole = roles.some(role => NURSING_ROLES.includes(role));
  const isPatient = roles.length === 0 || roles.includes('patient' as any);

  if (hasClinicialRole) {
    return <DoctorMobileDashboard />;
  }

  if (hasNursingRole) {
    return <NurseMobileDashboard />;
  }

  if (isPatient) {
    return <PatientMobileDashboard />;
  }

  // Default to staff dashboard for other roles
  return <StaffMobileDashboard />;
}

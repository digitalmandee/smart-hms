import { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface RoleDefinition {
  value: AppRole;
  label: string;
  description: string;
}

export interface RoleCategory {
  label: string;
  roles: RoleDefinition[];
}

export const ROLE_CATEGORIES: Record<string, RoleCategory> = {
  administrative: {
    label: "Administrative",
    roles: [
      { value: "org_admin", label: "Organization Admin", description: "Full access to organization settings" },
      { value: "branch_admin", label: "Branch Admin", description: "Manage branch operations" },
      { value: "receptionist", label: "Receptionist", description: "Appointments and patient registration" },
    ],
  },
  clinical: {
    label: "Clinical",
    roles: [
      { value: "doctor", label: "Doctor", description: "Consultations and prescriptions" },
      { value: "surgeon", label: "Surgeon", description: "Surgical procedures and OT access" },
      { value: "anesthetist", label: "Anesthetist", description: "Anesthesia administration" },
    ],
  },
  nursing: {
    label: "Nursing",
    roles: [
      { value: "nurse", label: "General Nurse", description: "Basic nursing duties" },
      { value: "opd_nurse", label: "OPD Nurse", description: "Outpatient nursing care" },
      { value: "ipd_nurse", label: "IPD Nurse", description: "Inpatient ward nursing care" },
      { value: "ot_nurse", label: "OT Nurse", description: "Operation theatre nursing" },
    ],
  },
  pharmacy: {
    label: "Pharmacy",
    roles: [
      { value: "pharmacist", label: "Main Pharmacist", description: "Pharmacy and medicine dispensing" },
      { value: "ot_pharmacist", label: "OT Pharmacist", description: "OT pharmacy and emergency meds" },
    ],
  },
  diagnostics: {
    label: "Diagnostics",
    roles: [
      { value: "lab_technician", label: "Lab Technician", description: "Laboratory tests and results" },
      { value: "radiologist", label: "Radiologist", description: "Radiology interpretation" },
      { value: "radiology_technician", label: "Radiology Technician", description: "Imaging procedures" },
      { value: "blood_bank_technician", label: "Blood Bank Technician", description: "Blood services" },
    ],
  },
  support: {
    label: "Support & Finance",
    roles: [
      { value: "hr_manager", label: "HR Manager", description: "Staff management and payroll" },
      { value: "hr_officer", label: "HR Officer", description: "HR operations and attendance" },
      { value: "accountant", label: "Accountant", description: "Billing and financial reports" },
      { value: "finance_manager", label: "Finance Manager", description: "Financial oversight" },
      { value: "store_manager", label: "Store Manager", description: "Inventory management" },
      { value: "ot_technician", label: "OT Technician", description: "OT equipment and support" },
    ],
  },
};

// Flat list of all roles for dropdown/select components
export const ALL_ROLES: RoleDefinition[] = Object.values(ROLE_CATEGORIES).flatMap(
  (category) => category.roles
);

// Role labels for display
export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  org_admin: "Organization Admin",
  branch_admin: "Branch Admin",
  doctor: "Doctor",
  surgeon: "Surgeon",
  anesthetist: "Anesthetist",
  nurse: "Nurse",
  opd_nurse: "OPD Nurse",
  ipd_nurse: "IPD Nurse",
  ot_nurse: "OT Nurse",
  receptionist: "Receptionist",
  pharmacist: "Pharmacist",
  ot_pharmacist: "OT Pharmacist",
  lab_technician: "Lab Technician",
  radiologist: "Radiologist",
  radiology_technician: "Radiology Technician",
  blood_bank_technician: "Blood Bank Technician",
  accountant: "Accountant",
  finance_manager: "Finance Manager",
  hr_manager: "HR Manager",
  hr_officer: "HR Officer",
  store_manager: "Store Manager",
  ot_technician: "OT Technician",
};

// Roles that indicate clinical staff (doctor/nurse/etc.)
export const CLINICAL_ROLES: AppRole[] = ["doctor", "surgeon", "anesthetist"];
export const NURSING_ROLES: AppRole[] = ["nurse", "opd_nurse", "ipd_nurse", "ot_nurse"];
export const PHARMACY_ROLES: AppRole[] = ["pharmacist", "ot_pharmacist"];

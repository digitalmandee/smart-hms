import { supabase } from "@/integrations/supabase/client";

export interface OPDTokenResult {
  token_number: number;
  token_display: string;
}

/**
 * Generate a department-prefixed OPD token
 * Format: {DEPT_CODE}-{TOKEN_NUMBER} (e.g., MED-001, SURG-015)
 */
export async function generateOPDToken(params: {
  opdDepartmentId: string;
  appointmentDate: string;
  branchId: string;
}): Promise<OPDTokenResult> {
  const { data, error } = await supabase.rpc("generate_opd_token", {
    p_opd_department_id: params.opdDepartmentId,
    p_appointment_date: params.appointmentDate,
    p_branch_id: params.branchId,
  });

  if (error) throw error;

  // RPC returns array, get first item
  const result = Array.isArray(data) ? data[0] : data;
  return result as OPDTokenResult;
}

/**
 * Find the OPD department for a doctor based on their specialization
 */
export async function findOPDDepartmentByDoctor(
  doctorId: string,
  branchId: string
): Promise<{ id: string; code: string; name: string } | null> {
  // Get doctor's specialization (text field)
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("specialization")
    .eq("id", doctorId)
    .single();

  if (doctorError || !doctor?.specialization) return null;

  // Find specialization ID by name
  const { data: spec, error: specError } = await supabase
    .from("specializations")
    .select("id")
    .ilike("name", doctor.specialization)
    .limit(1)
    .maybeSingle();

  if (specError || !spec) return null;

  // Find OPD department containing this specialization
  const { data: deptSpec, error: deptError } = await supabase
    .from("opd_department_specializations")
    .select(`
      opd_department:opd_departments!inner(
        id,
        code,
        name,
        branch_id,
        is_active
      )
    `)
    .eq("specialization_id", spec.id)
    .eq("opd_department.branch_id", branchId)
    .eq("opd_department.is_active", true)
    .limit(1)
    .maybeSingle();

  if (deptError || !deptSpec) return null;

  return (deptSpec as any).opd_department as { id: string; code: string; name: string };
}

/**
 * Get legacy token for backwards compatibility (when no OPD department)
 * Generates token based on doctor + date
 */
export async function generateLegacyToken(
  doctorId: string,
  appointmentDate: string
): Promise<number> {
  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("token_number")
    .eq("doctor_id", doctorId)
    .eq("appointment_date", appointmentDate)
    .order("token_number", { ascending: false })
    .limit(1);

  return existingAppointments && existingAppointments.length > 0
    ? (existingAppointments[0].token_number || 0) + 1
    : 1;
}

/**
 * Format a token number with optional department code
 */
export function formatTokenDisplay(
  tokenNumber: number | null,
  departmentCode?: string | null
): string {
  if (!tokenNumber) return "-";
  
  const paddedToken = String(tokenNumber).padStart(3, "0");
  
  if (departmentCode) {
    return `${departmentCode}-${paddedToken}`;
  }
  
  return paddedToken;
}

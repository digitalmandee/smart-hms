import { format } from "date-fns";

/**
 * Generate a standardized OPD Visit ID
 * Format: OPD-YYYYMMDD-TOKEN (e.g., OPD-20260122-015)
 */
export function generateVisitId(appointment: {
  appointment_date: string;
  token_number: number | null;
  branch_code?: string;
}): string {
  const date = format(new Date(appointment.appointment_date), "yyyyMMdd");
  const prefix = appointment.branch_code || "OPD";
  const token = appointment.token_number
    ? String(appointment.token_number).padStart(3, "0")
    : "000";
  return `${prefix}-${date}-${token}`;
}

/**
 * Format Visit ID for display with better readability
 */
export function formatVisitId(visitId: string): string {
  return visitId;
}

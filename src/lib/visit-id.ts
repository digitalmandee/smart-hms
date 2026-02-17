/**
 * Generate a standardized OPD Visit ID
 * Format: OPD-YYYYMMDD-TOKEN (e.g., OPD-20260122-015)
 */
export function generateVisitId(appointment: {
  appointment_date: string;
  token_number: number | null;
  branch_code?: string;
}): string {
  // Parse date string directly to avoid timezone shifts
  const datePart = appointment.appointment_date.slice(0, 10).replace(/-/g, "");
  const prefix = appointment.branch_code || "OPD";
  const token = appointment.token_number
    ? String(appointment.token_number).padStart(3, "0")
    : "000";
  return `${prefix}-${datePart}-${token}`;
}

/**
 * Format Visit ID for display with better readability
 */
export function formatVisitId(visitId: string): string {
  return visitId;
}

export type PortalPayStatus = "paid" | "partial" | "pending" | "cancelled";

export function invoicePayStatus(inv?: { status?: string | null; total_amount?: number | string | null; paid_amount?: number | string | null } | null): PortalPayStatus {
  if (!inv) return "pending";
  if (inv.status === "cancelled") return "cancelled";
  const total = Number(inv.total_amount ?? 0);
  const paid = Number(inv.paid_amount ?? 0);
  if (inv.status === "paid" || (total > 0 && paid >= total) || total === 0) return "paid";
  if (paid > 0) return "partial";
  return "pending";
}

export const payStatusVariant: Record<PortalPayStatus, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  partial: "secondary",
  pending: "destructive",
  cancelled: "outline",
};

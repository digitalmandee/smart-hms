import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type RequisitionStatus = Database["public"]["Enums"]["requisition_status"];

const statusConfig: Record<RequisitionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  partially_issued: { label: "Partially Issued", variant: "secondary" },
  issued: { label: "Issued", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

interface RequisitionStatusBadgeProps {
  status: RequisitionStatus;
}

export function RequisitionStatusBadge({ status }: RequisitionStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type GRNStatus = Database["public"]["Enums"]["grn_status"];

const statusConfig: Record<GRNStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  pending_verification: { label: "Pending Verification", variant: "secondary" },
  verified: { label: "Verified", variant: "default" },
  posted: { label: "Posted", variant: "default" },
};

interface GRNStatusBadgeProps {
  status: GRNStatus;
}

export function GRNStatusBadge({ status }: GRNStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}

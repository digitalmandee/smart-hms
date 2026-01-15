import { Badge } from "@/components/ui/badge";
import type { DonationStatus } from "@/hooks/useBloodBank";

interface DonationStatusBadgeProps {
  status: DonationStatus;
}

const statusConfig: Record<DonationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  registered: { label: "Registered", variant: "outline" },
  screening: { label: "Screening", variant: "secondary" },
  collecting: { label: "Collecting", variant: "default" },
  collected: { label: "Collected", variant: "default" },
  processing: { label: "Processing", variant: "secondary" },
  completed: { label: "Completed", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function DonationStatusBadge({ status }: DonationStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

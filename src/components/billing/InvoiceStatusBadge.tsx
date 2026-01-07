import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  pending: { label: "Pending", variant: "secondary" },
  partially_paid: { label: "Partial", variant: "default" },
  paid: { label: "Paid", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  refunded: { label: "Refunded", variant: "outline" },
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus | null;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={
        status === "paid"
          ? "bg-success text-success-foreground"
          : status === "partially_paid"
          ? "bg-warning text-warning-foreground"
          : ""
      }
    >
      {config.label}
    </Badge>
  );
}

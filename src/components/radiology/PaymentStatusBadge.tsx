import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, AlertCircle, CheckCircle } from "lucide-react";

type PaymentStatus = "pending" | "paid" | "partial" | "waived";

interface PaymentStatusBadgeProps {
  status?: PaymentStatus | string;
  showIcon?: boolean;
}

const statusConfig: Record<PaymentStatus, { label: string; className: string; icon: typeof DollarSign }> = {
  pending: {
    label: "Payment Pending",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  partial: {
    label: "Partially Paid",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: DollarSign,
  },
  waived: {
    label: "Waived",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: AlertCircle,
  },
};

export function PaymentStatusBadge({ status = "pending", showIcon = true }: PaymentStatusBadgeProps) {
  const config = statusConfig[status as PaymentStatus] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} gap-1`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

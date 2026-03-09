import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestTube, Clock, User, Stethoscope, FileInput, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { LabOrderWithItems } from "@/hooks/useLabOrders";
import { LabPaymentDialog } from "./LabPaymentDialog";
import { useLabSettings } from "@/hooks/useLabSettings";
import { cn } from "@/lib/utils";

interface LabOrderCardProps {
  order: LabOrderWithItems;
  canCollectPayment?: boolean;
  onPaymentComplete?: () => void;
}

const priorityConfig = {
  routine: { label: "Routine", className: "bg-blue-100 text-blue-800" },
  urgent: { label: "Urgent", className: "bg-orange-100 text-orange-800" },
  stat: { label: "STAT", className: "bg-red-100 text-red-800 font-bold" },
};

const statusConfig = {
  ordered: { label: "Ordered", className: "bg-yellow-100 text-yellow-800" },
  collected: { label: "Collected", className: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", className: "bg-purple-100 text-purple-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
};

const paymentStatusConfig = {
  pending: { label: "Awaiting Payment", className: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  paid: { label: "Paid", className: "bg-green-100 text-green-800", icon: CheckCircle },
  partial: { label: "Partial Payment", className: "bg-orange-100 text-orange-800", icon: AlertCircle },
  waived: { label: "Waived", className: "bg-gray-100 text-gray-800", icon: CheckCircle },
};

export function LabOrderCard({ order, canCollectPayment, onPaymentComplete }: LabOrderCardProps) {
  const navigate = useNavigate();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const { data: labSettings } = useLabSettings();
  
  const patient = order.patient;
  const doctor = order.doctor as { profile?: { full_name: string } } | undefined;

  const priority = priorityConfig[order.priority] || priorityConfig.routine;
  const status = statusConfig[order.status] || statusConfig.ordered;
  const paymentStatus = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig] || paymentStatusConfig.pending;
  const PaymentIcon = paymentStatus.icon;

  const testNames = order.items?.map((i) => i.test_name).join(", ") || "No tests";
  const completedCount = order.items?.filter((i) => i.status === "completed").length || 0;
  const totalCount = order.items?.length || 0;

  const isPaid = order.payment_status === "paid" || order.payment_status === "waived";
  const isPublished = (order as any).is_published === true;
  const allowUnpaid = labSettings?.allow_unpaid_processing ?? false;
  const canProceed = isPaid || allowUnpaid || order.status !== "ordered";

  const getButtonLabel = () => {
    if (order.status === "completed" && isPublished) return "View Report";
    if (order.status === "completed") return "View Results";
    if (order.status === "processing" || order.status === "collected") return "Enter Results";
    if (order.status === "ordered" && isPaid) return "Enter Results";
    if (order.status === "cancelled") return "View Order";
    return "View Order";
  };

  return (
    <>
      <Card className={cn(
        "hover:shadow-md transition-shadow",
        order.priority === "stat" && "border-red-300 border-2",
        order.priority === "urgent" && "border-orange-300",
        !isPaid && order.status === "ordered" && "border-yellow-300 bg-yellow-50/30"
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              {/* Header with order number and badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm">{order.order_number}</span>
                <Badge className={priority.className}>{priority.label}</Badge>
                <Badge className={status.className}>{status.label}</Badge>
                <Badge className={cn(paymentStatus.className, "flex items-center gap-1")}>
                  <PaymentIcon className="h-3 w-3" />
                  {paymentStatus.label}
                </Badge>
                {isPublished && (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Published
                  </Badge>
                )}
                {totalCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {completedCount}/{totalCount} done
                  </Badge>
                )}
              </div>

              {/* Patient info */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {patient?.first_name} {patient?.last_name}
                </span>
                <span className="text-muted-foreground">({patient?.patient_number})</span>
              </div>

              {/* Tests */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <TestTube className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{testNames}</span>
              </div>

              {/* Doctor and time */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Dr. {doctor?.profile?.full_name || "Unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              {!isPaid && canCollectPayment && order.status === "ordered" && (
                <Button
                  variant="outline"
                  onClick={() => setPaymentDialogOpen(true)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Collect Payment
                </Button>
              )}
              <Button
                onClick={() => navigate(`/app/lab/orders/${order.id}`)}
                disabled={!canProceed && order.status !== "completed" || order.status === "cancelled"}
                variant={canProceed || order.status === "completed" ? "default" : "secondary"}
              >
                <FileInput className="h-4 w-4 mr-2" />
                {order.status === "completed" ? "View Results" : isPaid ? "Enter Results" : "View Order"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LabPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        orderId={order.id}
        orderNumber={order.order_number}
        invoiceId={order.invoice_id || ""}
        totalAmount={0} // Will be fetched from invoice
        paidAmount={0}
        patientName={`${patient?.first_name || ""} ${patient?.last_name || ""}`}
        testNames={order.items?.map((i) => i.test_name) || []}
        onSuccess={() => {
          setPaymentDialogOpen(false);
          onPaymentComplete?.();
        }}
      />
    </>
  );
}

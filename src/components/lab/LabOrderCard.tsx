import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestTube, Clock, User, Stethoscope, FileInput } from "lucide-react";
import { LabOrderWithItems } from "@/hooks/useLabOrders";
import { cn } from "@/lib/utils";

interface LabOrderCardProps {
  order: LabOrderWithItems;
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

export function LabOrderCard({ order }: LabOrderCardProps) {
  const navigate = useNavigate();
  const patient = order.patient;
  const doctor = order.doctor as { profile?: { full_name: string } } | undefined;

  const priority = priorityConfig[order.priority] || priorityConfig.routine;
  const status = statusConfig[order.status] || statusConfig.ordered;

  const testNames = order.items?.map((i) => i.test_name).join(", ") || "No tests";
  const completedCount = order.items?.filter((i) => i.status === "completed").length || 0;
  const totalCount = order.items?.length || 0;

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      order.priority === "stat" && "border-red-300 border-2",
      order.priority === "urgent" && "border-orange-300"
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            {/* Header with order number and badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm">{order.order_number}</span>
              <Badge className={priority.className}>{priority.label}</Badge>
              <Badge className={status.className}>{status.label}</Badge>
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

          {/* Action button */}
          <Button
            onClick={() => navigate(`/app/lab/orders/${order.id}`)}
            className="flex-shrink-0"
            disabled={order.status === "completed" || order.status === "cancelled"}
          >
            <FileInput className="h-4 w-4 mr-2" />
            {order.status === "completed" ? "View Results" : "Enter Results"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

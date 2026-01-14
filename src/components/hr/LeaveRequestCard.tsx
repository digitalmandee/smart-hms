import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, FileText } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaveRequestCardProps {
  request: {
    id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    is_half_day?: boolean | null;
    reason?: string | null;
    status: string;
    created_at: string;
    employee?: {
      id: string;
      first_name: string;
      last_name?: string | null;
      employee_number: string;
      department?: { id: string; name: string } | null;
    } | null;
    leave_type?: {
      id: string;
      name: string;
      code: string;
      color?: string | null;
    } | null;
  };
  showEmployee?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onView?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/10 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-500/10 text-gray-500 border-gray-200",
  },
};

export function LeaveRequestCard({
  request,
  showEmployee = true,
  onApprove,
  onReject,
  onCancel,
  onView,
}: LeaveRequestCardProps) {
  const statusInfo = statusConfig[request.status] || statusConfig.pending;
  const employeeName = request.employee
    ? `${request.employee.first_name} ${request.employee.last_name || ""}`
    : "Unknown";
  const initials = request.employee
    ? `${request.employee.first_name[0]}${request.employee.last_name?.[0] || ""}`
    : "?";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {showEmployee && (
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 min-w-0">
              {showEmployee && (
                <div className="mb-1">
                  <span className="font-medium">{employeeName}</span>
                  {request.employee?.department && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {request.employee.department.name}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: request.leave_type?.color
                      ? `${request.leave_type.color}15`
                      : undefined,
                    borderColor: request.leave_type?.color || undefined,
                    color: request.leave_type?.color || undefined,
                  }}
                >
                  {request.leave_type?.name || "Leave"}
                </Badge>
                <Badge variant="outline" className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
                {request.is_half_day && (
                  <Badge variant="secondary" className="text-xs">
                    Half Day
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {format(new Date(request.start_date), "MMM d")}
                    {request.start_date !== request.end_date && (
                      <> - {format(new Date(request.end_date), "MMM d, yyyy")}</>
                    )}
                    {request.start_date === request.end_date && (
                      <>, {format(new Date(request.start_date), "yyyy")}</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{request.total_days} day{request.total_days !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {request.reason && (
                <div className="flex items-start gap-1 mt-2 text-sm text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{request.reason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {(onApprove || onReject || onCancel || onView) && (
        <CardFooter className="px-4 py-3 border-t bg-muted/30 gap-2">
          {onView && (
            <Button variant="ghost" size="sm" onClick={onView}>
              View
            </Button>
          )}
          {request.status === "pending" && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {request.status === "pending" && onReject && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={onReject}
            >
              Reject
            </Button>
          )}
          {request.status === "pending" && onApprove && (
            <Button size="sm" onClick={onApprove}>
              Approve
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

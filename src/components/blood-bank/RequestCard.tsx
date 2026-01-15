import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Clock, AlertTriangle, Package } from "lucide-react";
import { format, parseISO } from "date-fns";
import { BloodGroupBadge } from "./BloodGroupBadge";
import type { BloodRequest, BloodRequestStatus, BloodRequestPriority } from "@/hooks/useBloodBank";
import { cn } from "@/lib/utils";

interface RequestCardProps {
  request: BloodRequest;
  onProcess?: () => void;
  onView?: () => void;
  compact?: boolean;
}

const statusConfig: Record<BloodRequestStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  cross_matching: { label: "Cross-Matching", color: "bg-purple-100 text-purple-700" },
  ready: { label: "Ready", color: "bg-green-100 text-green-700" },
  issued: { label: "Issued", color: "bg-teal-100 text-teal-700" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const priorityConfig: Record<BloodRequestPriority, { label: string; color: string; icon?: boolean }> = {
  routine: { label: "Routine", color: "bg-muted text-muted-foreground" },
  urgent: { label: "Urgent", color: "bg-warning/10 text-warning", icon: true },
  emergency: { label: "Emergency", color: "bg-destructive/10 text-destructive", icon: true },
};

const componentLabels: Record<string, string> = {
  whole_blood: "Whole Blood",
  packed_rbc: "Packed RBC",
  fresh_frozen_plasma: "FFP",
  platelet_concentrate: "Platelets",
  cryoprecipitate: "Cryoprecipitate",
  granulocytes: "Granulocytes",
};

export function RequestCard({ request, onProcess, onView, compact = false }: RequestCardProps) {
  const statusInfo = statusConfig[request.status];
  const priorityInfo = priorityConfig[request.priority];
  const patientName = request.patient 
    ? `${request.patient.first_name} ${request.patient.last_name || ''}`.trim()
    : 'Unknown Patient';

  if (compact) {
    return (
      <Card className={cn(
        "hover:bg-muted/50 transition-colors cursor-pointer",
        request.priority === 'emergency' && "border-destructive/50"
      )} onClick={onView}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BloodGroupBadge group={request.blood_group} size="md" />
              <div>
                <p className="font-medium">{patientName}</p>
                <p className="text-xs text-muted-foreground">
                  {request.units_requested} units {componentLabels[request.component_type] || request.component_type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {priorityInfo.icon && <AlertTriangle className="h-4 w-4 text-destructive" />}
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      request.priority === 'emergency' && "border-destructive/50 bg-destructive/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{request.request_number}</span>
              <Badge className={priorityInfo.color}>
                {priorityInfo.icon && <AlertTriangle className="h-3 w-3 mr-1" />}
                {priorityInfo.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{patientName}</span>
              {request.patient && (
                <span className="text-xs">({request.patient.patient_number})</span>
              )}
            </div>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BloodGroupBadge group={request.blood_group} size="lg" />
            <div>
              <p className="font-medium">
                {request.units_requested} units
              </p>
              <p className="text-xs text-muted-foreground">
                {componentLabels[request.component_type] || request.component_type}
              </p>
            </div>
          </div>
          {request.units_issued > 0 && (
            <div className="flex items-center gap-1 text-sm text-success">
              <Package className="h-4 w-4" />
              {request.units_issued}/{request.units_requested} issued
            </div>
          )}
        </div>

        {request.indication && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            {request.indication}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {format(parseISO(request.requested_at), "MMM d, h:mm a")}
          </div>
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                View
              </Button>
            )}
            {onProcess && ['pending', 'processing'].includes(request.status) && (
              <Button size="sm" onClick={onProcess}>
                Process
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

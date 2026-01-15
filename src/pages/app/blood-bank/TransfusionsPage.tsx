import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { 
  useBloodTransfusions, 
  useActiveTransfusions,
  type TransfusionStatus 
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const transfusionStatuses: { value: TransfusionStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusConfig: Record<TransfusionStatus, { label: string; color: string; icon: any }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary', icon: Activity },
  completed: { label: 'Completed', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  stopped: { label: 'Stopped', color: 'bg-warning/10 text-warning', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function TransfusionsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TransfusionStatus | "all">("all");

  const { data: transfusions, isLoading } = useBloodTransfusions({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: activeTransfusions } = useActiveTransfusions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Transfusions"
        description="Monitor and manage blood transfusions"
        actions={
          <Button onClick={() => navigate('/app/blood-bank/transfusions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Transfusion
          </Button>
        }
      />

      {/* Active Transfusions Alert */}
      {activeTransfusions && activeTransfusions.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <div>
                <p className="font-medium">
                  {activeTransfusions.length} Active Transfusion{activeTransfusions.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Click to monitor vitals and progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TransfusionStatus | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {transfusionStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transfusions List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : transfusions && transfusions.length > 0 ? (
        <div className="space-y-3">
          {transfusions.map((transfusion) => {
            const statusInfo = statusConfig[transfusion.status];
            const StatusIcon = statusInfo.icon;
            const patientName = transfusion.patient 
              ? `${(transfusion.patient as any).first_name} ${(transfusion.patient as any).last_name || ''}`.trim()
              : 'Unknown Patient';

            return (
              <Card 
                key={transfusion.id}
                className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                  transfusion.status === 'in_progress' ? 'border-primary/50' : ''
                }`}
                onClick={() => navigate(`/app/blood-bank/transfusions/${transfusion.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <BloodGroupBadge 
                        group={(transfusion.blood_unit as any)?.blood_group || 'O+'} 
                        size="lg" 
                      />
                      <div>
                        <p className="font-medium">{patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {transfusion.transfusion_number} • Unit: {(transfusion.blood_unit as any)?.unit_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        {transfusion.started_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Started: {format(parseISO(transfusion.started_at), "h:mm a")}
                          </p>
                        )}
                      </div>
                      {transfusion.volume_transfused_ml && (
                        <div className="text-right">
                          <p className="font-medium">{transfusion.volume_transfused_ml} ml</p>
                          <p className="text-xs text-muted-foreground">Transfused</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No transfusions found</h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Schedule a transfusion from approved blood requests"}
          </p>
          <Button onClick={() => navigate('/app/blood-bank/requests')}>
            View Blood Requests
          </Button>
        </div>
      )}
    </div>
  );
}

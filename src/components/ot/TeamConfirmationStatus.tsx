import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Check, 
  X, 
  Clock, 
  Calendar,
  User,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useSurgeryTeamConfirmations, type ConfirmationStatus } from "@/hooks/useSurgeryConfirmation";
import { cn } from "@/lib/utils";

interface TeamConfirmationStatusProps {
  surgeryId: string;
  compact?: boolean;
  className?: string;
}

const roleLabels: Record<string, string> = {
  lead_surgeon: "Lead Surgeon",
  assistant_surgeon: "Assistant Surgeon",
  anesthetist: "Anesthetist",
  scrub_nurse: "Scrub Nurse",
  circulating_nurse: "Circulating Nurse",
  technician: "Technician",
};

const statusConfig: Record<ConfirmationStatus, { 
  icon: typeof Check; 
  label: string; 
  variant: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}> = {
  pending: { 
    icon: Clock, 
    label: "Pending", 
    variant: "text-yellow-600 bg-yellow-100",
    badgeVariant: "secondary"
  },
  accepted: { 
    icon: Check, 
    label: "Confirmed", 
    variant: "text-green-600 bg-green-100",
    badgeVariant: "default"
  },
  declined: { 
    icon: X, 
    label: "Declined", 
    variant: "text-red-600 bg-red-100",
    badgeVariant: "destructive"
  },
  rescheduled: { 
    icon: Calendar, 
    label: "Reschedule Requested", 
    variant: "text-orange-600 bg-orange-100",
    badgeVariant: "outline"
  },
};

export function TeamConfirmationStatus({ 
  surgeryId, 
  compact = false,
  className 
}: TeamConfirmationStatusProps) {
  const { data: teamMembers, isLoading } = useSurgeryTeamConfirmations(surgeryId);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground", className)}>
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No team members assigned</p>
      </div>
    );
  }

  // Get confirmation summary
  const total = teamMembers.length;
  const confirmed = teamMembers.filter(m => m.confirmation_status === 'accepted').length;
  const declined = teamMembers.filter(m => m.confirmation_status === 'declined').length;
  const pending = teamMembers.filter(m => m.confirmation_status === 'pending').length;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex -space-x-1">
          {teamMembers.slice(0, 4).map((member, idx) => {
            const status = statusConfig[member.confirmation_status as ConfirmationStatus] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <div
                key={member.id}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2 border-background",
                  status.variant
                )}
                title={`${roleLabels[member.role] || member.role}: ${status.label}`}
              >
                <StatusIcon className="h-3 w-3" />
              </div>
            );
          })}
          {teamMembers.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border-2 border-background text-xs font-medium">
              +{teamMembers.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {confirmed}/{total} confirmed
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Team Confirmation Status</CardTitle>
          <div className="flex items-center gap-1">
            {pending > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pending} pending
              </Badge>
            )}
            {confirmed > 0 && (
              <Badge variant="default" className="text-xs bg-green-600">
                {confirmed} confirmed
              </Badge>
            )}
            {declined > 0 && (
              <Badge variant="destructive" className="text-xs">
                {declined} declined
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {teamMembers.map((member) => {
          const status = statusConfig[member.confirmation_status as ConfirmationStatus] || statusConfig.pending;
          const StatusIcon = status.icon;
          const memberName = member.doctor?.profile?.full_name || 'Unknown';
          const specialization = member.doctor?.specialization;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  status.variant
                )}>
                  <StatusIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{memberName}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {roleLabels[member.role] || member.role}
                    </span>
                    {specialization && (
                      <span className="text-xs text-muted-foreground">
                        • {specialization}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <Badge variant={status.badgeVariant} className="text-xs">
                  {status.label}
                </Badge>
                {member.confirmation_status === 'accepted' && member.confirmed_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(member.confirmed_at), 'MMM d, h:mm a')}
                  </p>
                )}
                {member.confirmation_status === 'declined' && member.declined_reason && (
                  <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={member.declined_reason}>
                    {member.declined_reason}
                  </p>
                )}
                {member.confirmation_status === 'rescheduled' && member.proposed_reschedule_time && (
                  <p className="text-xs text-orange-600 mt-1">
                    Proposed: {format(new Date(member.proposed_reschedule_time), 'MMM d, h:mm a')}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* All confirmed indicator */}
        {confirmed === total && total > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">All team members confirmed</span>
          </div>
        )}

        {/* Has declines warning */}
        {declined > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {declined} team member(s) declined - reassignment needed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

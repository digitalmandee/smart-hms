import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePendingSurgeryRequests } from "@/hooks/useSurgeryRequests";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Scissors, 
  Calendar, 
  UserPlus, 
  AlertCircle, 
  Clock,
  ChevronRight,
  User
} from "lucide-react";
import { format, parseISO } from "date-fns";

const priorityConfig = {
  elective: { label: "Elective", variant: "secondary" as const, icon: Clock },
  urgent: { label: "Urgent", variant: "outline" as const, icon: AlertCircle },
  emergency: { label: "Emergency", variant: "destructive" as const, icon: AlertCircle },
};

interface PendingSurgeryRequestsCardProps {
  maxItems?: number;
}

export function PendingSurgeryRequestsCard({ maxItems = 5 }: PendingSurgeryRequestsCardProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: requests, isLoading } = usePendingSurgeryRequests(profile?.branch_id || undefined);

  const displayedRequests = requests?.slice(0, maxItems) || [];

  const handleCheckOT = (requestId: string) => {
    // Navigate to OT calendar with request context
    navigate(`/app/ot/schedule?surgeryRequestId=${requestId}`);
  };

  const handleAdmitPatient = (patientId: string, requestId: string) => {
    // Navigate to admission form with patient and surgery request context
    navigate(`/app/ipd/admissions/new?patientId=${patientId}&surgeryRequestId=${requestId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Scissors className="h-4 w-4 text-warning" />
            </div>
            Pending Surgery Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Scissors className="h-4 w-4 text-warning" />
            </div>
            Pending Surgery Requests
            {requests && requests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {requests.length}
              </Badge>
            )}
          </CardTitle>
          {requests && requests.length > maxItems && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/app/ot/requests")}
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {displayedRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-4">
            No pending surgery requests
          </p>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-1 p-4 pt-0">
              {displayedRequests.map((request) => {
                const priorityInfo = priorityConfig[request.priority as keyof typeof priorityConfig];
                const PriorityIcon = priorityInfo?.icon || Clock;
                const patient = request.patient;
                const doctor = request.doctor;

                return (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {/* Header: Patient + Priority */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {patient?.first_name} {patient?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient?.patient_number}
                          </p>
                        </div>
                      </div>
                      <Badge variant={priorityInfo?.variant || "secondary"} className="text-xs">
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {priorityInfo?.label || request.priority}
                      </Badge>
                    </div>

                    {/* Procedure */}
                    <div className="mb-2">
                      <p className="text-sm font-medium">{request.procedure_name}</p>
                      {request.diagnosis && (
                        <p className="text-xs text-muted-foreground">{request.diagnosis}</p>
                      )}
                    </div>

                    {/* Doctor & Date */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      {doctor && (
                        <span>
                          By: Dr. {doctor.profile?.full_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(request.recommended_date), "MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Preferred Date Range */}
                    {(request.preferred_date_from || request.preferred_date_to) && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Preferred: {request.preferred_date_from && format(parseISO(request.preferred_date_from), "MMM d")}
                        {request.preferred_date_from && request.preferred_date_to && " - "}
                        {request.preferred_date_to && format(parseISO(request.preferred_date_to), "MMM d, yyyy")}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCheckOT(request.id)}
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Check OT
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAdmitPatient(request.patient_id, request.id)}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Admit Patient
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

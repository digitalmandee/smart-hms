import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OTStatusBadge } from "./OTStatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { 
  Scissors, 
  Calendar, 
  User, 
  Building2,
  Plus,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { useSurgeries } from "@/hooks/useOT";

interface PatientSurgicalHistoryProps {
  patientId: string;
}

export function PatientSurgicalHistory({ patientId }: PatientSurgicalHistoryProps) {
  const navigate = useNavigate();
  const { data: surgeries, isLoading } = useSurgeries({ patientId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Surgical History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const sortedSurgeries = [...(surgeries || [])].sort((a, b) => 
    new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Surgical History
            </CardTitle>
            <CardDescription>
              Past and scheduled surgeries for this patient
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/app/ot/surgeries/new', { state: { patientId } })}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Surgery
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedSurgeries.length === 0 ? (
          <div className="text-center py-8">
            <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No surgical history</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/app/ot/surgeries/new', { state: { patientId } })}
            >
              Schedule First Surgery
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSurgeries.map(surgery => (
              <div 
                key={surgery.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{surgery.procedure_name}</h4>
                      <OTStatusBadge status={surgery.status} />
                      <PriorityBadge priority={surgery.priority} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(surgery.scheduled_date), 'MMM dd, yyyy')}
                      </div>
                      {surgery.lead_surgeon?.profile?.full_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {surgery.lead_surgeon.profile.full_name}
                        </div>
                      )}
                      {surgery.ot_room?.name && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {surgery.ot_room.name}
                        </div>
                      )}
                    </div>
                    {surgery.diagnosis && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Diagnosis: {surgery.diagnosis}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

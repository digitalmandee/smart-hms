import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scissors, Plus, Calendar, User } from "lucide-react";
import { useAdmissionSurgeries } from "@/hooks/useOT";
import { format } from "date-fns";

interface AdmissionOTChargesCardProps {
  admissionId: string;
  patientId: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  pre_op: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function AdmissionOTChargesCard({ admissionId, patientId }: AdmissionOTChargesCardProps) {
  const { data: surgeries, isLoading } = useAdmissionSurgeries(admissionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Surgeries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scissors className="h-5 w-5 text-primary" />
            Surgeries
            {surgeries && surgeries.length > 0 && (
              <Badge variant="secondary">{surgeries.length}</Badge>
            )}
          </CardTitle>
          <Link to={`/app/ot/schedule/new?patient=${patientId}`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {surgeries && surgeries.length > 0 ? (
          <div className="space-y-3">
            {surgeries.map((surgery) => (
              <div
                key={surgery.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{surgery.procedure_name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {surgery.actual_start_time && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(surgery.actual_start_time), "dd MMM")}
                        </span>
                      )}
                      {surgery.lead_surgeon?.profile?.full_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {surgery.lead_surgeon.profile.full_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={statusColors[surgery.status] || ""}>
                      {surgery.status.replace("_", " ")}
                    </Badge>
                    {surgery.estimated_cost > 0 && (
                      <p className="text-sm font-medium mt-1">
                        Rs. {surgery.estimated_cost.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Scissors className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No surgeries scheduled</p>
            <Link to={`/app/ot/schedule/new?patient=${patientId}`}>
              <Button variant="link" size="sm" className="mt-2">
                Schedule a surgery
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

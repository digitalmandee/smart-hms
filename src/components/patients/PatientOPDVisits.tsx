import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Eye,
  Stethoscope,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { generateVisitId } from "@/lib/visit-id";

interface PatientOPDVisitsProps {
  patientId: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ElementType }
> = {
  scheduled: { label: "Scheduled", variant: "outline", icon: Clock },
  checked_in: { label: "Checked In", variant: "secondary", icon: AlertCircle },
  in_progress: { label: "In Progress", variant: "default", icon: Stethoscope },
  completed: { label: "Completed", variant: "default", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
  no_show: { label: "No Show", variant: "destructive", icon: XCircle },
};

export function PatientOPDVisits({ patientId }: PatientOPDVisitsProps) {
  const { data: visits, isLoading } = useQuery({
    queryKey: ["patient-opd-visits", patientId],
    queryFn: async () => {
      // Get all appointments with consultation data
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          token_number,
          status,
          chief_complaint,
          check_in_at,
          doctor:doctors(
            id,
            specialization,
            profile:profiles(full_name)
          ),
          branch:branches(name, code),
          consultations(
            id,
            diagnosis,
            created_at
          )
        `)
        .eq("patient_id", patientId)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            OPD Visits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!visits || visits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            OPD Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No OPD visits yet</p>
            <Link to={`/app/appointments/new?patientId=${patientId}`}>
              <Button className="mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                Book First Visit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          OPD Visits ({visits.length})
        </CardTitle>
        <Link to={`/app/appointments/new?patientId=${patientId}`}>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Book Visit
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visit ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Complaint / Diagnosis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => {
              const status = statusConfig[visit.status || "scheduled"];
              const StatusIcon = status.icon;
              const consultation = (visit.consultations as any)?.[0];
              const doctor = visit.doctor as any;
              const branch = visit.branch as any;
              
              const visitId = generateVisitId({
                appointment_date: visit.appointment_date,
                token_number: visit.token_number,
                branch_code: branch?.code,
              });

              return (
                <TableRow key={visit.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {visitId}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(visit.appointment_date), "MMM d, yyyy")}
                      </span>
                      {visit.appointment_time && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(`2000-01-01T${visit.appointment_time}`), "h:mm a")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {doctor?.profile?.full_name ? (
                      <div className="flex flex-col">
                        <span>Dr. {doctor.profile.full_name}</span>
                        {doctor.specialization && (
                          <span className="text-xs text-muted-foreground">
                            {doctor.specialization}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {consultation?.diagnosis ? (
                      <span className="truncate block" title={consultation.diagnosis}>
                        {consultation.diagnosis}
                      </span>
                    ) : visit.chief_complaint ? (
                      <span className="text-muted-foreground truncate block" title={visit.chief_complaint}>
                        {visit.chief_complaint}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {consultation ? (
                      <Link to={`/app/opd/consultation/${consultation.id}/detail`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    ) : visit.status === "in_progress" || visit.status === "checked_in" ? (
                      <Link to={`/app/opd/consultation/${visit.id}`}>
                        <Button variant="ghost" size="sm">
                          <Stethoscope className="h-4 w-4 mr-1" />
                          Consult
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/app/appointments/${visit.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

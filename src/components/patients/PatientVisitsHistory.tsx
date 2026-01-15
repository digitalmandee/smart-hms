import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientConsultationHistory } from "@/hooks/useConsultations";
import { format } from "date-fns";
import { Stethoscope, Calendar, ExternalLink, FileText } from "lucide-react";

interface PatientVisitsHistoryProps {
  patientId: string;
}

export function PatientVisitsHistory({ patientId }: PatientVisitsHistoryProps) {
  const { data: consultations, isLoading } = usePatientConsultationHistory(patientId, 20);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultation History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultation History</CardTitle>
          <CardDescription>Past appointments and consultations</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No consultations yet</p>
          <Link to={`/app/appointments/new?patientId=${patientId}`}>
            <Button>Book Appointment</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Consultation History</CardTitle>
            <CardDescription>{consultations.length} consultation(s) on record</CardDescription>
          </div>
          <Link to={`/app/appointments/new?patientId=${patientId}`}>
            <Button size="sm">Book Appointment</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {consultations.map((consultation) => (
          <div
            key={consultation.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    Dr. {consultation.doctor?.profile?.full_name || 'Unknown'}
                  </p>
                  {consultation.doctor?.specialization && (
                    <Badge variant="outline" className="text-xs">
                      {consultation.doctor.specialization}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(consultation.created_at), "MMM dd, yyyy")}
                </div>
                {consultation.chief_complaint && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Complaint:</span> {consultation.chief_complaint}
                  </p>
                )}
                {consultation.diagnosis && (
                  <p className="text-sm">
                    <span className="font-medium">Diagnosis:</span> {consultation.diagnosis}
                  </p>
                )}
              </div>
            </div>
            <Link to={`/app/opd/consultations/${consultation.id}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

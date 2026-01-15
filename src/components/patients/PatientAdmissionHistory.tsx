import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { Bed, Calendar, ExternalLink, Clock } from "lucide-react";

interface PatientAdmissionHistoryProps {
  patientId: string;
}

const statusColors: Record<string, string> = {
  admitted: 'bg-blue-100 text-blue-800',
  discharged: 'bg-green-100 text-green-800',
  transferred: 'bg-purple-100 text-purple-800',
  expired: 'bg-gray-100 text-gray-800',
  lama: 'bg-red-100 text-red-800',
  absconded: 'bg-orange-100 text-orange-800',
};

function usePatientAdmissions(patientId: string) {
  return useQuery({
    queryKey: ["patient-admissions", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admissions")
        .select(`
          *,
          ward:wards(id, name),
          bed:beds(id, bed_number)
        `)
        .eq("patient_id", patientId)
        .order("admission_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
}

export function PatientAdmissionHistory({ patientId }: PatientAdmissionHistoryProps) {
  const { data: admissions, isLoading } = usePatientAdmissions(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IPD Admissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!admissions || admissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IPD Admissions</CardTitle>
          <CardDescription>Inpatient admission history</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Bed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No admissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IPD Admissions</CardTitle>
        <CardDescription>{admissions.length} admission(s) on record</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {admissions.map((admission) => {
          const stayDays = admission.actual_discharge_date
            ? differenceInDays(new Date(admission.actual_discharge_date), new Date(admission.admission_date))
            : differenceInDays(new Date(), new Date(admission.admission_date));

          return (
            <div
              key={admission.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bed className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{admission.admission_number}</p>
                    <Badge className={statusColors[admission.status || ''] || 'bg-muted'}>
                      {admission.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(admission.admission_date), "MMM dd, yyyy")}
                    {admission.actual_discharge_date && (
                      <>
                        <span>→</span>
                        {format(new Date(admission.actual_discharge_date), "MMM dd, yyyy")}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stayDays} day(s)
                    </span>
                    {(admission.ward as any)?.name && (
                      <span>Ward: {(admission.ward as any).name}</span>
                    )}
                    {(admission.bed as any)?.bed_number && (
                      <span>Bed: {(admission.bed as any).bed_number}</span>
                    )}
                  </div>
                  {admission.diagnosis_on_admission && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Diagnosis:</span> {admission.diagnosis_on_admission}
                    </p>
                  )}
                </div>
              </div>
              <Link to={`/app/ipd/admissions/${admission.id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

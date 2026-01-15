import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Siren, Calendar, ExternalLink, AlertTriangle } from "lucide-react";

interface PatientEmergencyHistoryProps {
  patientId: string;
}

const triageColors: Record<string, string> = {
  '1': 'bg-red-500 text-white',
  '2': 'bg-orange-500 text-white',
  '3': 'bg-yellow-500 text-black',
  '4': 'bg-green-500 text-white',
  '5': 'bg-blue-500 text-white',
};

const triageLabels: Record<string, string> = {
  '1': 'Resuscitation',
  '2': 'Emergent',
  '3': 'Urgent',
  '4': 'Less Urgent',
  '5': 'Non-Urgent',
};

const statusColors: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  in_triage: 'bg-blue-100 text-blue-800',
  in_treatment: 'bg-purple-100 text-purple-800',
  admitted: 'bg-green-100 text-green-800',
  discharged: 'bg-gray-100 text-gray-800',
  transferred: 'bg-cyan-100 text-cyan-800',
  expired: 'bg-gray-200 text-gray-800',
  lama: 'bg-red-100 text-red-800',
};

function usePatientERVisits(patientId: string) {
  return useQuery({
    queryKey: ["patient-er-visits", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_registrations")
        .select("*")
        .eq("patient_id", patientId)
        .order("arrival_time", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
}

export function PatientEmergencyHistory({ patientId }: PatientEmergencyHistoryProps) {
  const { data: erVisits, isLoading } = usePatientERVisits(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emergency Visits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!erVisits || erVisits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emergency Visits</CardTitle>
          <CardDescription>Emergency department visit history</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Siren className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No emergency visits</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Visits</CardTitle>
        <CardDescription>{erVisits.length} ER visit(s) on record</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {erVisits.map((visit) => (
          <div
            key={visit.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Siren className="h-5 w-5 text-destructive" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{visit.er_number}</p>
                  <Badge className={statusColors[visit.status] || 'bg-muted'}>
                    {visit.status?.replace('_', ' ')}
                  </Badge>
                  {visit.triage_level && (
                    <Badge className={triageColors[visit.triage_level]}>
                      {triageLabels[visit.triage_level]}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(visit.arrival_time), "MMM dd, yyyy HH:mm")}
                </div>
                {visit.chief_complaint && (
                  <p className="text-sm">
                    <span className="font-medium">Complaint:</span> {visit.chief_complaint}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs">
                  {visit.is_trauma && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Trauma
                    </Badge>
                  )}
                  {visit.is_mlc && (
                    <Badge variant="outline" className="text-xs">MLC</Badge>
                  )}
                </div>
              </div>
            </div>
            <Link to={`/app/emergency/${visit.id}`}>
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

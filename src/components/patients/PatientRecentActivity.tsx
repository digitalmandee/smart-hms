import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Stethoscope, 
  Pill, 
  TestTubes, 
  Bed, 
  Siren,
  Clock,
  FileCheck,
  Scissors
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "visit" | "prescription" | "lab_order" | "admission" | "discharge" | "emergency" | "surgery";
  title: string;
  subtitle: string | null;
  timestamp: string;
  status?: string;
}

interface PatientRecentActivityProps {
  patientId: string;
}

export function PatientRecentActivity({ patientId }: PatientRecentActivityProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["patient-recent-activity", patientId],
    queryFn: async (): Promise<ActivityItem[]> => {
      const allActivities: ActivityItem[] = [];

      // Fetch data from multiple tables in parallel
      const [consultations, prescriptions, labOrders, admissions, erVisits, surgeries] = await Promise.all([
        // Recent consultations
        supabase
          .from("consultations")
          .select(`
            id, created_at, chief_complaint, diagnosis,
            doctor:doctors(profile:profiles(full_name))
          `)
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(5),
        
        // Recent prescriptions
        supabase
          .from("prescriptions")
          .select(`
            id, prescription_number, created_at, status,
            doctor:doctors(profile:profiles(full_name))
          `)
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(5),
        
        // Recent lab orders
        supabase
          .from("lab_orders")
          .select("id, order_number, created_at, status")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(5),
        
        // Recent admissions
        supabase
          .from("admissions")
          .select(`
            id, admission_number, admission_date, actual_discharge_date, status,
            attending_doctor:doctors!admissions_attending_doctor_id_fkey(profile:profiles(full_name))
          `)
          .eq("patient_id", patientId)
          .order("admission_date", { ascending: false })
          .limit(5),
        
        // Recent ER visits
        supabase
          .from("emergency_registrations")
          .select("id, er_number, arrival_time, triage_level, status")
          .eq("patient_id", patientId)
          .order("arrival_time", { ascending: false })
          .limit(5),
        
        // Recent surgeries
        supabase
          .from("surgeries")
          .select(`
            id, surgery_number, scheduled_date, procedure_name, status,
            lead_surgeon:doctors(profile:profiles(full_name))
          `)
          .eq("patient_id", patientId)
          .order("scheduled_date", { ascending: false })
          .limit(5),
      ]);

      // Process consultations
      consultations.data?.forEach((item: any) => {
        allActivities.push({
          id: item.id,
          type: "visit",
          title: `OPD Visit${item.doctor?.profile?.full_name ? ` - Dr. ${item.doctor.profile.full_name}` : ""}`,
          subtitle: item.diagnosis || item.chief_complaint || null,
          timestamp: item.created_at,
        });
      });

      // Process prescriptions
      prescriptions.data?.forEach((item: any) => {
        allActivities.push({
          id: item.id,
          type: "prescription",
          title: `Prescription ${item.prescription_number}`,
          subtitle: item.doctor?.profile?.full_name ? `By Dr. ${item.doctor.profile.full_name}` : null,
          timestamp: item.created_at,
          status: item.status,
        });
      });

      // Process lab orders
      labOrders.data?.forEach((item: any) => {
        allActivities.push({
          id: item.id,
          type: "lab_order",
          title: `Lab Order ${item.order_number}`,
          subtitle: null,
          timestamp: item.created_at,
          status: item.status,
        });
      });

      // Process admissions
      admissions.data?.forEach((item: any) => {
        allActivities.push({
          id: item.id,
          type: "admission",
          title: `IPD Admission ${item.admission_number}`,
          subtitle: item.attending_doctor?.profile?.full_name 
            ? `Dr. ${item.attending_doctor.profile.full_name}` 
            : null,
          timestamp: item.admission_date,
          status: item.status,
        });
        
        // Add discharge event if discharged
        if (item.actual_discharge_date) {
          allActivities.push({
            id: `${item.id}-discharge`,
            type: "discharge",
            title: `Discharged from ${item.admission_number}`,
            subtitle: null,
            timestamp: item.actual_discharge_date,
          });
        }
      });

      // Process ER visits
      erVisits.data?.forEach((item: any) => {
        allActivities.push({
          id: item.id,
          type: "emergency",
          title: `Emergency Visit ${item.er_number}`,
          subtitle: item.triage_level ? `Triage: ${item.triage_level}` : null,
          timestamp: item.arrival_time,
          status: item.status,
        });
      });

      // Process surgeries
      surgeries.data?.forEach((item: any) => {
        allActivities.push({
          id: item.id,
          type: "surgery",
          title: `Surgery: ${item.procedure_name}`,
          subtitle: item.lead_surgeon?.profile?.full_name 
            ? `Surgeon: Dr. ${item.lead_surgeon.profile.full_name}` 
            : null,
          timestamp: item.scheduled_date,
          status: item.status,
        });
      });

      // Sort by timestamp descending
      return allActivities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10);
    },
    enabled: !!patientId,
    staleTime: 30000,
  });

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "visit":
        return <Stethoscope className="h-4 w-4 text-primary" />;
      case "prescription":
        return <Pill className="h-4 w-4 text-green-500" />;
      case "lab_order":
        return <TestTubes className="h-4 w-4 text-blue-500" />;
      case "admission":
        return <Bed className="h-4 w-4 text-orange-500" />;
      case "discharge":
        return <FileCheck className="h-4 w-4 text-green-600" />;
      case "emergency":
        return <Siren className="h-4 w-4 text-red-500" />;
      case "surgery":
        return <Scissors className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "secondary";
    switch (status.toLowerCase()) {
      case "completed":
      case "dispensed":
      case "discharged":
        return "default";
      case "in_progress":
      case "partially_dispensed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <ScrollArea className="max-h-80">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-muted flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      {activity.status && (
                        <Badge variant={getStatusColor(activity.status)} className="text-xs">
                          {activity.status.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                    {activity.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      <span className="mx-1">•</span>
                      {format(new Date(activity.timestamp), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity recorded
          </p>
        )}
      </CardContent>
    </Card>
  );
}

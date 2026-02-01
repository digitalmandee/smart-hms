import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, User, ChevronRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { cn } from "@/lib/utils";

export default function MobileAppointmentsPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");

  const branchId = profile?.branch_id;

  const { data: appointments, refetch, isLoading } = useQuery({
    queryKey: ["mobile-appointments", branchId, activeTab],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      let query = supabase
        .from("appointments")
        .select(`
          *,
          patient:patients!appointments_patient_id_fkey(id, first_name, last_name, phone),
          doctor:doctors!appointments_doctor_id_fkey(id, profiles(full_name))
        `);

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      if (activeTab === "upcoming") {
        query = query.gte("appointment_date", today).order("appointment_date", { ascending: true });
      } else {
        query = query.lt("appointment_date", today).order("appointment_date", { ascending: false });
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success border-success/20";
      case "checked_in":
        return "bg-info/10 text-info border-info/20";
      case "in_progress":
        return "bg-warning/10 text-warning border-warning/20";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Appointments</h1>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : appointments && appointments.length > 0 ? (
            appointments.map((apt) => (
              <Card key={apt.id} className="touch-manipulation active:scale-[0.98] transition-transform">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {apt.patient?.first_name} {apt.patient?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(apt.appointment_date), "MMM d")}
                        </span>
                        {apt.appointment_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {apt.appointment_time}
                          </span>
                        )}
                      </div>
                      {apt.doctor?.profiles?.full_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Dr. {apt.doctor.profiles.full_name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getStatusColor(apt.status || "scheduled"))}
                      >
                        {apt.status?.replace("_", " ") || "Scheduled"}
                      </Badge>
                      {apt.token_number && (
                        <span className="text-lg font-bold text-primary">
                          #{apt.token_number}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No {activeTab} appointments</p>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}

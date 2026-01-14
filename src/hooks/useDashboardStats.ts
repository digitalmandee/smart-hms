import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export interface DashboardStats {
  totalPatients: number;
  newPatientsToday: number;
  todayAppointments: number;
  pendingAppointments: number;
  activeConsultations: number;
  queueCount: number;
  todayRevenue: number;
}

export const useDashboardStats = () => {
  const { profile } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["dashboard-stats", profile?.organization_id, today],
    queryFn: async (): Promise<DashboardStats> => {
      if (!profile?.organization_id) {
        return {
          totalPatients: 0,
          newPatientsToday: 0,
          todayAppointments: 0,
          pendingAppointments: 0,
          activeConsultations: 0,
          queueCount: 0,
          todayRevenue: 0,
        };
      }

      const orgId = profile.organization_id;

      // Total patients
      const { count: totalPatients } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId);

      // New patients today
      const { count: newPatientsToday } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      // Today's appointments
      const { count: todayAppointments } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("appointment_date", today);

      // Pending appointments
      const { count: pendingAppointments } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "checked_in"]);

      // Active consultations
      const { count: activeConsultations } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("appointment_date", today)
        .eq("status", "in_progress");

      // Queue count
      const { count: queueCount } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("appointment_date", today)
        .eq("status", "checked_in");

      // Today's revenue
      const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("organization_id", orgId)
        .gte("payment_date", `${today}T00:00:00`)
        .lte("payment_date", `${today}T23:59:59`);

      const todayRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        totalPatients: totalPatients || 0,
        newPatientsToday: newPatientsToday || 0,
        todayAppointments: todayAppointments || 0,
        pendingAppointments: pendingAppointments || 0,
        activeConsultations: activeConsultations || 0,
        queueCount: queueCount || 0,
        todayRevenue,
      };
    },
    enabled: !!profile?.organization_id,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

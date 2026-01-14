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

      // Total patients count
      const { count: totalPatients } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      // New patients today
      const { count: newPatientsToday } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .gte("created_at", `${today}T00:00:00`);

      // Today's appointments
      const { count: todayAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("appointment_date", today);

      // Pending appointments
      const { data: pendingData } = await supabase
        .from("appointments")
        .select("id")
        .eq("organization_id", orgId)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "checked_in"]);
      const pendingAppointments = pendingData?.length ?? 0;

      // Active consultations
      const { data: activeData } = await supabase
        .from("appointments")
        .select("id")
        .eq("organization_id", orgId)
        .eq("appointment_date", today)
        .eq("status", "in_progress");
      const activeConsultations = activeData?.length ?? 0;

      // Queue count
      const { data: queueData } = await supabase
        .from("appointments")
        .select("id")
        .eq("organization_id", orgId)
        .eq("appointment_date", today)
        .eq("status", "checked_in");
      const queueCount = queueData?.length ?? 0;

      // Today's revenue - get from invoices instead since payments doesn't have org_id
      let todayRevenue = 0;
      try {
        const { data: invoices } = await supabase
          .from("invoices")
          .select("paid_amount")
          .eq("organization_id", orgId)
          .gte("invoice_date", today);
        
        if (invoices) {
          todayRevenue = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
        }
      } catch {
        todayRevenue = 0;
      }

      return {
        totalPatients: totalPatients ?? 0,
        newPatientsToday: newPatientsToday ?? 0,
        todayAppointments: todayAppointments ?? 0,
        pendingAppointments,
        activeConsultations,
        queueCount,
        todayRevenue,
      };
    },
    enabled: !!profile?.organization_id,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

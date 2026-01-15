import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export interface LabDashboardStats {
  pendingOrders: number;
  statOrders: number;
  collectedToday: number;
  completedToday: number;
}

export const useLabDashboardStats = () => {
  const { profile } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["lab-dashboard-stats", profile?.organization_id, today],
    queryFn: async (): Promise<LabDashboardStats> => {
      if (!profile?.organization_id) {
        return { pendingOrders: 0, statOrders: 0, collectedToday: 0, completedToday: 0 };
      }

      // Pending orders
      const { count: pendingOrders } = await supabase
        .from("lab_orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["ordered", "collected", "processing"]);

      // STAT orders
      const { count: statOrders } = await supabase
        .from("lab_orders")
        .select("*", { count: "exact", head: true })
        .eq("priority", "stat")
        .in("status", ["ordered", "collected", "processing"]);

      // Collected today
      const { count: collectedToday } = await supabase
        .from("lab_orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["collected", "processing", "completed"])
        .gte("created_at", `${today}T00:00:00`);

      // Completed today
      const { count: completedToday } = await supabase
        .from("lab_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", `${today}T00:00:00`);

      return {
        pendingOrders: pendingOrders ?? 0,
        statOrders: statOrders ?? 0,
        collectedToday: collectedToday ?? 0,
        completedToday: completedToday ?? 0,
      };
    },
    enabled: !!profile?.organization_id,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

interface LabOrderWithPatient {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  created_at: string;
  patient: { id: string; first_name: string; last_name: string; patient_number: string } | null;
  lab_order_items: Array<{ id: string; test_name: string; status: string }>;
}

export const useRecentLabOrders = (limit = 5) => {
  const { profile } = useAuth();

  return useQuery<LabOrderWithPatient[]>({
    queryKey: ["recent-lab-orders", profile?.organization_id, limit],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("lab_orders")
        .select(`id, order_number, status, priority, created_at, patient:patients(id, first_name, last_name, patient_number), lab_order_items(id, test_name, status)`)
        .in("status", ["ordered", "collected", "processing"])
        .order("created_at", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as unknown as LabOrderWithPatient[];
    },
    enabled: !!profile?.organization_id,
    staleTime: 30000,
  });
};

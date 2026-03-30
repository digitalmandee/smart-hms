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

export interface TATOrderInfo {
  id: string;
  order_number: string;
  priority: string;
  created_at: string;
  elapsed_hours: number;
  patient: { first_name: string; last_name: string; patient_number: string } | null;
  tests_count: number;
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

// TAT Tracker — shows active orders with elapsed time
export const useLabTATTracker = (targetHours = 24) => {
  const { profile } = useAuth();

  return useQuery<TATOrderInfo[]>({
    queryKey: ["lab-tat-tracker", profile?.organization_id, targetHours],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("lab_orders")
        .select(`id, order_number, priority, created_at, patient:patients(first_name, last_name, patient_number), lab_order_items(id)`)
        .in("status", ["ordered", "collected", "processing"])
        .order("created_at", { ascending: true });

      if (error) throw error;

      const now = new Date();
      return ((data ?? []) as unknown as any[])
        .map((order) => {
          const created = new Date(order.created_at);
          const elapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
          return {
            id: order.id,
            order_number: order.order_number,
            priority: order.priority,
            created_at: order.created_at,
            elapsed_hours: Math.round(elapsed * 10) / 10,
            patient: order.patient,
            tests_count: order.lab_order_items?.length || 0,
          } as TATOrderInfo;
        })
        .filter((o) => o.elapsed_hours >= targetHours * 0.5) // Show when >= 50% of target
        .sort((a, b) => b.elapsed_hours - a.elapsed_hours);
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

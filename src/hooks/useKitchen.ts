import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface KitchenOrder {
  id: string;
  patient_name: string;
  ward_name: string;
  bed_number: string;
  diet_type: string;
  meal_type: string;
  special_instructions: string | null;
  status: "pending" | "preparing" | "ready" | "delivered";
  admission_id: string;
}

export interface KitchenStats {
  total_meals_today: number;
  pending: number;
  preparing: number;
  delivered: number;
  diet_distribution: Record<string, number>;
}

export function useKitchenOrders(mealType?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["kitchen-orders", profile?.organization_id, mealType],
    queryFn: async () => {
      // Aggregate from active admissions with diet charts
      const { data, error } = await supabase
        .from("admissions")
        .select(`
          id,
          patient:patients(first_name, last_name),
          ward:wards(name),
          bed:beds(bed_number)
        `)
        .in("status", ["admitted", "confirmed"])
        .order("admission_date", { ascending: false });

      if (error) throw error;

      // Transform admissions into kitchen orders
      const orders: KitchenOrder[] = (data || []).map((adm: any) => ({
        id: adm.id,
        patient_name: `${adm.patient?.first_name || ""} ${adm.patient?.last_name || ""}`.trim(),
        ward_name: adm.ward?.name || "Unassigned",
        bed_number: adm.bed?.bed_number || "-",
        diet_type: "Regular", // Default, would come from diet_charts
        meal_type: getMealTypeForCurrentTime(),
        special_instructions: null,
        status: "pending",
        admission_id: adm.id,
      }));

      return orders;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useKitchenStats() {
  const { data: orders } = useKitchenOrders();

  const stats: KitchenStats = {
    total_meals_today: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    preparing: orders?.filter((o) => o.status === "preparing").length || 0,
    delivered: orders?.filter((o) => o.status === "delivered").length || 0,
    diet_distribution: {},
  };

  orders?.forEach((o) => {
    stats.diet_distribution[o.diet_type] = (stats.diet_distribution[o.diet_type] || 0) + 1;
  });

  return stats;
}

function getMealTypeForCurrentTime(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "Breakfast";
  if (hour < 14) return "Lunch";
  if (hour < 17) return "Snack";
  return "Dinner";
}

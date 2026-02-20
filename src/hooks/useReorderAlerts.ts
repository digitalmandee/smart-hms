import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReorderAlert {
  id: string;
  item_code: string;
  name: string;
  unit_of_measure: string;
  reorder_level: number;
  current_stock: number;
  deficit: number;
  category?: { id: string; name: string } | null;
}

export function useReorderAlerts() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["reorder-alerts", profile?.organization_id],
    queryFn: async () => {
      // Get all items with reorder levels
      const { data: items, error } = await supabase
        .from("inventory_items")
        .select(`
          id, item_code, name, unit_of_measure, reorder_level,
          category:inventory_categories(id, name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .gt("reorder_level", 0)
        .eq("is_active", true);

      if (error) throw error;

      // Get current stock for each item
      const alerts: ReorderAlert[] = [];
      for (const item of items || []) {
        const { data: stocks } = await supabase
          .from("inventory_stock")
          .select("quantity")
          .eq("item_id", item.id)
          .gt("quantity", 0);

        const currentStock = stocks?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;

        if (currentStock < (item.reorder_level || 0)) {
          alerts.push({
            id: item.id,
            item_code: item.item_code,
            name: item.name,
            unit_of_measure: item.unit_of_measure,
            reorder_level: item.reorder_level || 0,
            current_stock: currentStock,
            deficit: (item.reorder_level || 0) - currentStock,
            category: item.category as { id: string; name: string } | null,
          });
        }
      }

      return alerts.sort((a, b) => b.deficit - a.deficit);
    },
    enabled: !!profile?.organization_id,
  });
}

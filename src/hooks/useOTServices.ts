import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OTService {
  id: string;
  name: string;
  default_price: number;
  cost_price: number;
  is_active: boolean;
  category_id: string | null;
}

/**
 * Fetch all OT services (services under the 'ot' category code)
 */
export function useOTServices() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ot-services", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      // First get the OT category
      const { data: category } = await supabase
        .from("service_categories")
        .select("id")
        .eq("organization_id", profile.organization_id)
        .eq("code", "ot")
        .single();

      if (!category) {
        return [];
      }

      // Fetch services under OT category
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, default_price, is_active, category_id")
        .eq("organization_id", profile.organization_id)
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return (data || []) as OTService[];
    },
    enabled: !!profile?.organization_id,
  });
}

/**
 * Interface for OT service items in the builder
 */
export interface OTServiceItem {
  id: string; // Unique ID for the list item
  service_type_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/**
 * Calculate total from a list of OT service items
 */
export function calculateOTServicesTotal(items: OTServiceItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

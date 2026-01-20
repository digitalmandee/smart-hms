import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Medicine = Database["public"]["Tables"]["medicines"]["Row"];

export interface MedicineWithCategory extends Medicine {
  category?: {
    id: string;
    name: string;
  };
}

export function useMedicines(search?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["medicines", profile?.organization_id, search],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from("medicines")
        .select(`
          *,
          category:medicine_categories(id, name)
        `)
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("name");

      if (search && search.length > 0) {
        query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as MedicineWithCategory[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useMedicine(id: string | undefined) {
  return useQuery({
    queryKey: ["medicine", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("medicines")
        .select(`
          *,
          category:medicine_categories(id, name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as MedicineWithCategory;
    },
    enabled: !!id,
  });
}

// Re-export from useClinicConfig for backward compatibility
export { 
  DOSAGE_FREQUENCIES, 
  DURATION_OPTIONS, 
  INSTRUCTION_OPTIONS 
} from "./useClinicConfig";

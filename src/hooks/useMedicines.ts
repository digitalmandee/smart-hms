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

// Common dosage frequencies
export const DOSAGE_FREQUENCIES = [
  { value: "1-0-0", label: "Once daily (Morning)" },
  { value: "0-0-1", label: "Once daily (Night)" },
  { value: "1-0-1", label: "Twice daily (BD)" },
  { value: "1-1-1", label: "Three times daily (TDS)" },
  { value: "1-1-1-1", label: "Four times daily (QDS)" },
  { value: "SOS", label: "As needed (SOS)" },
  { value: "STAT", label: "Immediately (STAT)" },
  { value: "HS", label: "At bedtime (HS)" },
  { value: "AC", label: "Before meals (AC)" },
  { value: "PC", label: "After meals (PC)" },
] as const;

// Common durations
export const DURATION_OPTIONS = [
  { value: "3 days", label: "3 Days" },
  { value: "5 days", label: "5 Days" },
  { value: "7 days", label: "7 Days" },
  { value: "10 days", label: "10 Days" },
  { value: "14 days", label: "14 Days" },
  { value: "1 month", label: "1 Month" },
  { value: "2 months", label: "2 Months" },
  { value: "3 months", label: "3 Months" },
  { value: "Continuous", label: "Continuous" },
] as const;

// Common instructions
export const INSTRUCTION_OPTIONS = [
  "Take with water",
  "Take after meals",
  "Take before meals",
  "Take with food",
  "Take on empty stomach",
  "Avoid alcohol",
  "Avoid dairy products",
  "Do not crush or chew",
  "Apply topically",
  "Use as directed",
] as const;

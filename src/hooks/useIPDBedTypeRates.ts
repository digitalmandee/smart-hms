import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BedTypeRate {
  id: string;
  code: string;
  name: string;
  daily_rate: number;
  is_active: boolean;
}

/**
 * Hook to fetch bed type rates for the organization
 */
export function useIPDBedTypeRates() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-bed-type-rates", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from("ipd_bed_types")
        .select("id, code, name, daily_rate, is_active")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return (data || []) as BedTypeRate[];
    },
    enabled: !!profile?.organization_id,
  });
}

/**
 * Get the daily rate for a bed based on its bed_type code
 */
export function getBedDailyRate(
  bedTypeCode: string | null | undefined,
  bedTypeRates: BedTypeRate[] | undefined
): number {
  if (!bedTypeCode || !bedTypeRates) return 1500; // Default rate
  
  const matchedType = bedTypeRates.find(
    (t) => t.code.toLowerCase() === bedTypeCode.toLowerCase() ||
           t.name.toLowerCase() === bedTypeCode.toLowerCase()
  );
  
  return matchedType?.daily_rate || 1500;
}

/**
 * Calculate suggested deposit based on expected stay and daily rate
 */
export function calculateSuggestedDeposit(
  expectedDays: number,
  dailyRate: number,
  depositPercentage: number = 0.6
): number {
  const roomEstimate = expectedDays * dailyRate;
  return Math.ceil((roomEstimate * depositPercentage) / 100) * 100; // Round to nearest 100
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BranchSettings {
  tax_rate: number | null;
  receipt_header: string | null;
  receipt_footer: string | null;
  working_hours_start: string | null;
  working_hours_end: string | null;
  working_days: string[] | null;
  timezone: string | null;
}

export interface EffectiveBranchSettings {
  tax_rate: number;
  receipt_header: string;
  receipt_footer: string;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  timezone: string;
}

export function useBranchSettings(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch-settings", branchId],
    queryFn: async () => {
      if (!branchId) throw new Error("Branch ID is required");

      const { data, error } = await supabase
        .from("branches")
        .select(`
          tax_rate,
          receipt_header,
          receipt_footer,
          working_hours_start,
          working_hours_end,
          working_days,
          timezone,
          organization:organizations (
            default_tax_rate,
            receipt_header,
            receipt_footer,
            working_hours_start,
            working_hours_end,
            working_days
          )
        `)
        .eq("id", branchId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });
}

export function useEffectiveBranchSettings(branchId: string | undefined) {
  const { data: branchData, isLoading, error } = useBranchSettings(branchId);

  const effectiveSettings: EffectiveBranchSettings | undefined = branchData
    ? {
        tax_rate:
          branchData.tax_rate ??
          (branchData.organization as any)?.default_tax_rate ??
          17,
        receipt_header:
          branchData.receipt_header ??
          (branchData.organization as any)?.receipt_header ??
          "",
        receipt_footer:
          branchData.receipt_footer ??
          (branchData.organization as any)?.receipt_footer ??
          "Thank you for visiting!",
        working_hours_start:
          branchData.working_hours_start ??
          (branchData.organization as any)?.working_hours_start ??
          "08:00",
        working_hours_end:
          branchData.working_hours_end ??
          (branchData.organization as any)?.working_hours_end ??
          "20:00",
        working_days:
          branchData.working_days ??
          (branchData.organization as any)?.working_days ??
          ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        timezone: branchData.timezone ?? "Asia/Karachi",
      }
    : undefined;

  return { data: effectiveSettings, isLoading, error };
}

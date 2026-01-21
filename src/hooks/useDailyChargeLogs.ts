import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyChargeLog {
  id: string;
  run_date: string;
  organization_id: string;
  total_admissions: number;
  charges_posted: number;
  skipped: number;
  errors: number;
  error_details: string[] | null;
  created_at: string;
}

export function useLatestDailyChargeLog() {
  return useQuery({
    queryKey: ["ipd-daily-charge-log-latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ipd_daily_charge_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DailyChargeLog | null;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useDailyChargeLogs(days = 7) {
  return useQuery({
    queryKey: ["ipd-daily-charge-logs", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("ipd_daily_charge_logs")
        .select("*")
        .gte("run_date", startDate.toISOString().split("T")[0])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as DailyChargeLog[];
    },
  });
}

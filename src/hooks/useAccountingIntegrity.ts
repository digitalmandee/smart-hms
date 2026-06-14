import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TrialBalanceHealthRow {
  period_month: string;
  entries_count: number;
  total_debit: number;
  total_credit: number;
  difference: number;
  is_balanced: boolean;
}

export interface GlCoverageRow {
  source_type: string;
  source_label: string;
  expected_count: number;
  posted_count: number;
  orphan_count: number;
}

export interface PeriodLockStatus {
  is_locked: boolean;
  fiscal_year: string;
  closed_at: string | null;
}

export function useTrialBalanceHealth(startDate: string, endDate: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["gl-trial-balance-health", profile?.organization_id, startDate, endDate],
    queryFn: async (): Promise<TrialBalanceHealthRow[]> => {
      const { data, error } = await (supabase as any).rpc("gl_trial_balance_health", {
        _start_date: startDate,
        _end_date: endDate,
      });
      if (error) throw error;
      return (data || []) as TrialBalanceHealthRow[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useGlCoverageReport(startDate: string, endDate: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["gl-coverage-report", profile?.organization_id, startDate, endDate],
    queryFn: async (): Promise<GlCoverageRow[]> => {
      const { data, error } = await (supabase as any).rpc("gl_coverage_report", {
        _start_date: startDate,
        _end_date: endDate,
      });
      if (error) throw error;
      return (data || []) as GlCoverageRow[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePeriodLockStatus(checkDate: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["gl-period-lock-status", profile?.organization_id, checkDate],
    queryFn: async (): Promise<PeriodLockStatus | null> => {
      const { data, error } = await (supabase as any).rpc("gl_period_lock_status", {
        _check_date: checkDate,
      });
      if (error) throw error;
      const rows = (data || []) as PeriodLockStatus[];
      return rows[0] ?? null;
    },
    enabled: !!profile?.organization_id && !!checkDate,
  });
}

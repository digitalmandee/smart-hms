import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFiscalYears() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["fiscal-years", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useLockFiscalYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fiscalYearId: string) => {
      const { data, error } = await (supabase as any).rpc("lock_fiscal_year", {
        _fiscal_year_id: fiscalYearId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["fiscal-years"] });
      if (result?.status === "already_closed") {
        toast.info(`Fiscal year ${result.fiscal_year} is already closed`);
      } else {
        toast.success(`Fiscal year ${result.fiscal_year} locked`);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });
}

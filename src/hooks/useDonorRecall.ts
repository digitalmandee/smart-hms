import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DonorRecallCandidate {
  donor_id: string;
  organization_id: string | null;
  branch_id: string | null;
  donor_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  blood_group: string;
  last_donation_date: string | null;
  total_donations: number | null;
  status: string;
  eligible_from: string | null;
  days_since_eligible: number;
  available_units: number | null;
  low_stock: boolean | null;
}

export function useDonorRecallCandidates(opts?: { lowStockOnly?: boolean; bloodGroup?: string }) {
  return useQuery({
    queryKey: ["donor-recall-candidates", opts?.lowStockOnly ?? false, opts?.bloodGroup ?? "all"],
    queryFn: async (): Promise<DonorRecallCandidate[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = (supabase as any)
        .from("blood_donor_recall_candidates")
        .select("*")
        .order("low_stock", { ascending: false })
        .order("days_since_eligible", { ascending: false })
        .limit(500);
      if (opts?.lowStockOnly) q = q.eq("low_stock", true);
      if (opts?.bloodGroup) q = q.eq("blood_group", opts.bloodGroup);
      const { data, error } = await q;
      if (error) throw error;
      return (data as DonorRecallCandidate[]) ?? [];
    },
  });
}

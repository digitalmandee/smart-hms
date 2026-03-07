import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ReconciliationStatus = "unreconciled" | "matched" | "posted";

export interface ReconciliationClaim {
  id: string;
  claim_number: string;
  claim_date: string;
  total_amount: number;
  approved_amount: number;
  paid_amount: number;
  patient_responsibility: number;
  copay_amount: number;
  deductible_amount: number;
  status: string;
  nphies_status: string | null;
  payment_reference: string | null;
  payment_date: string | null;
  nphies_response: any;
  patient_insurance?: {
    patient?: {
      id: string;
      first_name: string;
      last_name: string;
      patient_number: string;
    };
    insurance_plan?: {
      name: string;
      insurance_company?: {
        name: string;
      };
    };
  };
}

export function useReconciliationClaims(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  settlementStatus?: ReconciliationStatus;
}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["reconciliation-claims", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("insurance_claims")
        .select(`
          id, claim_number, claim_date, total_amount, approved_amount, paid_amount,
          patient_responsibility, copay_amount, deductible_amount, status,
          nphies_status, payment_reference, payment_date, nphies_response,
          patient_insurance:patient_insurance(
            patient:patients(id, first_name, last_name, patient_number),
            insurance_plan:insurance_plans(
              name,
              insurance_company:insurance_companies(name)
            )
          )
        `)
        .in("status", ["approved", "partially_approved", "paid"])
        .order("claim_date", { ascending: false });

      if (filters?.dateFrom) query = query.gte("claim_date", filters.dateFrom);
      if (filters?.dateTo) query = query.lte("claim_date", filters.dateTo);

      const { data, error } = await query;
      if (error) throw error;

      let claims = (data || []) as unknown as ReconciliationClaim[];

      // Client-side filter by settlement status
      if (filters?.settlementStatus) {
        claims = claims.filter((c) => {
          const st = getSettlementStatus(c);
          return st === filters.settlementStatus;
        });
      }

      return claims;
    },
    enabled: !!profile?.organization_id,
  });
}

export function getSettlementStatus(claim: ReconciliationClaim): ReconciliationStatus {
  if (claim.paid_amount > 0 && claim.payment_reference) return "posted";
  if (claim.approved_amount > 0) return "matched";
  return "unreconciled";
}

export function getAdjustmentAmount(claim: ReconciliationClaim): number {
  return claim.total_amount - claim.approved_amount;
}

export function usePostToAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      // Mark as paid with payment reference
      const { error } = await supabase
        .from("insurance_claims")
        .update({
          status: "paid",
          paid_amount: (await supabase.from("insurance_claims").select("approved_amount").eq("id", claimId).single()).data?.approved_amount || 0,
          payment_date: new Date().toISOString().split("T")[0],
          payment_reference: `ERA-${Date.now()}`,
        })
        .eq("id", claimId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reconciliation-claims"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      toast.success("Payment posted to accounts");
    },
    onError: (e: Error) => toast.error("Failed to post: " + e.message),
  });
}

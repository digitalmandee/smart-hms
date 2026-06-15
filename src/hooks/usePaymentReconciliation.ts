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
  invoice_id: string | null;
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
          nphies_status, payment_reference, payment_date, nphies_response, invoice_id,
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

      if (filters?.settlementStatus) {
        claims = claims.filter((c) => getSettlementStatus(c) === filters.settlementStatus);
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

/**
 * Validates a payment/ERA reference. Rejects empty values and synthetic
 * timestamp-based refs that earlier versions of this code auto-generated.
 */
export function isValidPaymentReference(ref: string | null | undefined): boolean {
  if (!ref) return false;
  const trimmed = ref.trim();
  if (trimmed.length < 3) return false;
  // Block synthetic refs of the shape ERA-1700000000000
  if (/^ERA-\d{10,}$/i.test(trimmed)) return false;
  return true;
}

export interface PostClaimPaymentInput {
  claimId: string;
  paymentReference: string;
  paymentDate: string;
  paidAmount: number;
  paymentMethodId: string;
  notes?: string;
}

export function usePostToAccounts() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: PostClaimPaymentInput) => {
      const { claimId, paymentReference, paymentDate, paidAmount, paymentMethodId, notes } = input;

      if (!isValidPaymentReference(paymentReference)) {
        throw new Error("A real ERA / EFT / cheque reference is required");
      }
      if (!(paidAmount > 0)) {
        throw new Error("Paid amount must be greater than zero");
      }
      if (!paymentMethodId) {
        throw new Error("Payment method is required");
      }

      // Read the claim to get approved_amount and invoice_id
      const { data: claim, error: claimErr } = await supabase
        .from("insurance_claims")
        .select("id, invoice_id, approved_amount, organization_id")
        .eq("id", claimId)
        .maybeSingle();
      if (claimErr) throw claimErr;
      if (!claim) throw new Error("Claim not found");

      if (paidAmount > Number(claim.approved_amount || 0)) {
        throw new Error("Paid amount cannot exceed the approved amount");
      }

      // Write the payment row (linked to the underlying invoice when available).
      // The standard payment triggers post DR Cash/Bank, CR AR-Insurance.
      if (claim.invoice_id) {
        const { error: payErr } = await supabase
          .from("payments")
          .insert({
            invoice_id: claim.invoice_id,
            amount: paidAmount,
            payment_method_id: paymentMethodId,
            reference_number: paymentReference.trim(),
            notes: notes || `Insurance settlement for claim ${claimId}`,
            received_by: profile?.id,
          })
          .select();
        if (payErr) throw payErr;

        // Mirror the standard collection flow: update the invoice paid_amount/status
        const { data: inv, error: invFetchErr } = await supabase
          .from("invoices")
          .select("paid_amount, total_amount")
          .eq("id", claim.invoice_id)
          .maybeSingle();
        if (invFetchErr) throw invFetchErr;
        if (inv) {
          const newPaid = Number(inv.paid_amount || 0) + paidAmount;
          const total = Number(inv.total_amount || 0);
          const newStatus = newPaid >= total ? "paid" : "partially_paid";
          const { error: invErr } = await supabase
            .from("invoices")
            .update({
              paid_amount: newPaid,
              balance_amount: Math.max(0, total - newPaid),
              status: newStatus,
            })
            .eq("id", claim.invoice_id);
          if (invErr) throw invErr;
        }
      }

      // Stamp the claim
      const { data: updated, error: updErr } = await supabase
        .from("insurance_claims")
        .update({
          status: "paid",
          paid_amount: paidAmount,
          payment_date: paymentDate,
          payment_reference: paymentReference.trim(),
        })
        .eq("id", claimId)
        .select();
      if (updErr) throw updErr;

      return { claim: updated?.[0], invoiceId: claim.invoice_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["reconciliation-claims"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claim"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["patient-balance"] });
      queryClient.invalidateQueries({ queryKey: ["patient-statement"] });
      if (result?.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ["invoice", result.invoiceId] });
      }
      toast.success("Insurance payment posted");
    },
    onError: (e: Error) => toast.error("Failed to post: " + e.message),
  });
}

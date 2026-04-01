import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreateIPDDepositParams {
  patientId: string;
  amount: number;
  paymentMethodId?: string;
  referenceNumber?: string;
  notes?: string;
  wardName?: string;
  bedNumber?: string;
  status?: "completed" | "pending";
  billingSessionId?: string;
}

/**
 * Creates a patient_deposits record for IPD admission deposit.
 * GL posting (DR Cash, CR Patient Deposits Liability) is handled
 * automatically by the DB trigger `post_patient_deposit_journal`.
 */
export function useCreateIPDDeposit() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateIPDDepositParams) => {
      const depositStatus = params.status || "completed";
      const depositNotes = params.notes || 
        `IPD Admission Deposit - ${params.wardName || "IPD"} ${params.bedNumber ? `(Bed ${params.bedNumber})` : ""}`.trim();

      // Create patient_deposits record — DB trigger handles GL posting
      const { data: deposit, error: depositError } = await supabase
        .from("patient_deposits")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          patient_id: params.patientId,
          amount: params.amount,
          type: "deposit",
          status: depositStatus,
          payment_method_id: params.paymentMethodId || null,
          reference_number: params.referenceNumber || null,
          notes: depositNotes,
          created_by: profile!.id,
          billing_session_id: params.billingSessionId || null,
        })
        .select()
        .single();

      if (depositError) throw depositError;

      return deposit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["patient-balance"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-billing-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-dashboard-enhanced"] });
    },
    onError: (error) => {
      console.error("Failed to create IPD deposit:", error);
      toast.error("Failed to record deposit");
    },
  });
}

/**
 * Links admission to deposit by updating payment_status.
 */
export function useLinkAdmissionDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      admissionId: string;
      paymentStatus: "pending" | "paid" | "partial" | "pay_later" | "waived";
    }) => {
      const { error } = await supabase
        .from("admissions")
        .update({
          payment_status: params.paymentStatus,
        })
        .eq("id", params.admissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}

// Keep backward-compatible exports
export const useCreateDepositInvoice = useCreateIPDDeposit;
export const useRecordDepositPayment = () => {
  return useMutation({
    mutationFn: async (_params: any) => {
      console.warn("useRecordDepositPayment is deprecated. Payment is handled by useCreateIPDDeposit.");
      return null;
    },
  });
};
export const useLinkAdmissionInvoice = useLinkAdmissionDeposit;

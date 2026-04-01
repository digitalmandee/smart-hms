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
}

/**
 * Creates a patient_deposits record for IPD admission deposit.
 * If status is "completed" (paid now), also posts GL entry:
 *   DR CASH-001 (Cash in Hand)
 *   CR LIA-DEP-001 (Patient Deposits Liability)
 */
export function useCreateIPDDeposit() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateIPDDepositParams) => {
      const depositStatus = params.status || "completed";
      const depositNotes = params.notes || 
        `IPD Admission Deposit - ${params.wardName || "IPD"} ${params.bedNumber ? `(Bed ${params.bedNumber})` : ""}`.trim();

      // 1. Create patient_deposits record
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
        })
        .select()
        .single();

      if (depositError) throw depositError;

      // 2. If paid now, post GL entry: DR Cash, CR Patient Deposits Liability
      if (depositStatus === "completed" && params.paymentMethodId) {
        try {
          // Use get_or_create_default_account to ensure accounts exist
          const { data: cashAccountId } = await supabase.rpc("get_or_create_default_account", {
            p_organization_id: profile!.organization_id!,
            p_account_code: "CASH-001",
            p_account_name: "Cash in Hand",
            p_account_type_category: "asset",
          });

          const { data: depositLiabilityId } = await supabase.rpc("get_or_create_default_account", {
            p_organization_id: profile!.organization_id!,
            p_account_code: "LIA-DEP-001",
            p_account_name: "Patient Deposits Liability",
            p_account_type_category: "liability",
          });

          if (cashAccountId && depositLiabilityId) {
            // Create journal entry
            const { data: journalEntry, error: jeError } = await supabase
              .from("journal_entries")
              .insert({
                organization_id: profile!.organization_id!,
                branch_id: profile!.branch_id,
                entry_number: "", // trigger generates this
                entry_date: new Date().toISOString().split("T")[0],
                description: `Patient deposit collected - ${depositNotes}`,
                reference_type: "patient_deposit",
                reference_id: deposit.id,
                is_posted: true,
              })
              .select()
              .single();

            if (jeError) throw jeError;

            // Insert journal lines: DR Cash, CR Liability
            const { error: linesError } = await supabase
              .from("journal_entry_lines")
              .insert([
                {
                  journal_entry_id: journalEntry.id,
                  account_id: cashAccountId,
                  description: "Patient deposit received",
                  debit_amount: params.amount,
                  credit_amount: 0,
                },
                {
                  journal_entry_id: journalEntry.id,
                  account_id: depositLiabilityId,
                  description: "Patient deposit liability",
                  debit_amount: 0,
                  credit_amount: params.amount,
                },
              ]);

            if (linesError) throw linesError;

            // Link journal entry to deposit record
            await supabase
              .from("patient_deposits")
              .update({ journal_entry_id: journalEntry.id })
              .eq("id", deposit.id);
          }
        } catch (glError) {
          console.error("GL posting for deposit failed:", glError);
          // Don't fail the whole operation — deposit record is created
        }
      }

      return deposit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["patient-balance"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error) => {
      console.error("Failed to create IPD deposit:", error);
      toast.error("Failed to record deposit");
    },
  });
}

/**
 * Links admission to deposit by updating payment_status.
 * We no longer use admission_invoice_id for deposits.
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

// Keep backward-compatible exports for any other consumers
export const useCreateDepositInvoice = useCreateIPDDeposit;
export const useRecordDepositPayment = () => {
  // No-op — payment is now handled inline in useCreateIPDDeposit
  return useMutation({
    mutationFn: async (_params: any) => {
      console.warn("useRecordDepositPayment is deprecated. Payment is handled by useCreateIPDDeposit.");
      return null;
    },
  });
};
export const useLinkAdmissionInvoice = useLinkAdmissionDeposit;

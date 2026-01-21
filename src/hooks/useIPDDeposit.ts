import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreateDepositInvoiceParams {
  patientId: string;
  admissionId?: string;
  depositAmount: number;
  wardName?: string;
  bedNumber?: string;
  notes?: string;
}

interface RecordDepositPaymentParams {
  invoiceId: string;
  amount: number;
  paymentMethodId: string;
  referenceNumber?: string;
  notes?: string;
}

export function useCreateDepositInvoice() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateDepositInvoiceParams) => {
      // Generate invoice number
      const invoiceNumber = `DEP-${Date.now().toString(36).toUpperCase()}`;

      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          organization_id: profile!.organization_id,
          branch_id: profile!.branch_id!,
        patient_id: params.patientId,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split("T")[0],
        subtotal: params.depositAmount,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: params.depositAmount,
          paid_amount: 0,
          balance_amount: params.depositAmount,
          status: "pending",
          notes: params.notes || `Admission deposit for ${params.wardName || "IPD"} ${params.bedNumber ? `- Bed ${params.bedNumber}` : ""}`,
          created_by: profile!.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice item for deposit
      const { error: itemError } = await supabase
        .from("invoice_items")
        .insert({
          invoice_id: invoice.id,
          description: `Admission Deposit - ${params.wardName || "IPD"} ${params.bedNumber ? `(Bed ${params.bedNumber})` : ""}`,
          quantity: 1,
          unit_price: params.depositAmount,
          discount_percent: 0,
          total_price: params.depositAmount,
        });

      if (itemError) throw itemError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      console.error("Failed to create deposit invoice:", error);
      toast.error("Failed to create deposit invoice");
    },
  });
}

export function useRecordDepositPayment() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RecordDepositPaymentParams) => {
      // Record the payment
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          organization_id: profile!.organization_id,
          branch_id: profile!.branch_id!,
          invoice_id: params.invoiceId,
          amount: params.amount,
          payment_method_id: params.paymentMethodId,
          payment_date: new Date().toISOString().split("T")[0],
          reference_number: params.referenceNumber,
          notes: params.notes,
          status: "completed",
          received_by: profile!.id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update invoice paid amount and status
      const { data: invoice, error: fetchError } = await supabase
        .from("invoices")
        .select("paid_amount, total_amount")
        .eq("id", params.invoiceId)
        .single();

      if (fetchError) throw fetchError;

      const newPaidAmount = (invoice.paid_amount || 0) + params.amount;
      const newBalance = invoice.total_amount - newPaidAmount;
      const newStatus = newBalance <= 0 ? "paid" : "partially_paid";

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          paid_amount: newPaidAmount,
          balance_amount: Math.max(0, newBalance),
          status: newStatus,
        })
        .eq("id", params.invoiceId);

      if (updateError) throw updateError;

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment");
    },
  });
}

export function useLinkAdmissionInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      admissionId: string;
      invoiceId: string;
      paymentStatus: "pending" | "paid" | "partial" | "pay_later" | "waived";
    }) => {
      const { error } = await supabase
        .from("admissions")
        .update({
          admission_invoice_id: params.invoiceId,
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

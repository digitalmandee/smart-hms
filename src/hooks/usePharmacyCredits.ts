import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface PharmacyCredit {
  id: string;
  organization_id: string;
  branch_id: string;
  patient_id: string;
  transaction_id: string | null;
  amount: number;
  paid_amount: number;
  balance: number;
  status: "pending" | "partial" | "paid";
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  patient?: {
    first_name: string;
    last_name: string | null;
    patient_number: string;
    phone: string | null;
  };
  transaction?: {
    transaction_number: string;
    created_at: string;
  };
}

// Helper for raw SQL queries to tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryCreditsTable = (): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from("pharmacy_patient_credits");
};

// Fetch all credits for organization/branch
export function usePharmacyCredits(branchId?: string, status?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pharmacy-credits", targetBranchId, status],
    queryFn: async () => {
      if (!targetBranchId) return [];

      let query = queryCreditsTable()
        .select(`
          *,
          patient:patients!pharmacy_patient_credits_patient_id_fkey(
            first_name,
            last_name,
            patient_number,
            phone
          ),
          transaction:pharmacy_pos_transactions!pharmacy_patient_credits_transaction_id_fkey(
            transaction_number,
            created_at
          )
        `)
        .eq("branch_id", targetBranchId)
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PharmacyCredit[];
    },
    enabled: !!targetBranchId,
  });
}

// Fetch credits for a specific patient
export function usePatientPharmacyCredits(patientId?: string) {
  return useQuery({
    queryKey: ["pharmacy-credits", "patient", patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await queryCreditsTable()
        .select(`
          *,
          transaction:pharmacy_pos_transactions!pharmacy_patient_credits_transaction_id_fkey(
            transaction_number,
            created_at
          )
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PharmacyCredit[];
    },
    enabled: !!patientId,
  });
}

// Get total outstanding balance for a patient
export function usePatientCreditBalance(patientId?: string) {
  return useQuery({
    queryKey: ["pharmacy-credits", "balance", patientId],
    queryFn: async () => {
      if (!patientId) return { total: 0, count: 0 };

      const { data, error } = await queryCreditsTable()
        .select("amount, paid_amount")
        .eq("patient_id", patientId)
        .neq("status", "paid");

      if (error) throw error;

      const total = data?.reduce((sum: number, c: any) => sum + (c.amount - c.paid_amount), 0) || 0;
      return { total, count: data?.length || 0 };
    },
    enabled: !!patientId,
  });
}

// Record a payment against a credit
export function useRecordCreditPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      creditId,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    }: {
      creditId: string;
      amount: number;
      paymentMethod?: string;
      referenceNumber?: string;
      notes?: string;
    }) => {
      // Get current credit
      const { data: credit, error: fetchError } = await queryCreditsTable()
        .select("*")
        .eq("id", creditId)
        .single();

      if (fetchError) throw fetchError;

      const currentPaid = credit.paid_amount || 0;
      const newPaidAmount = currentPaid + amount;
      const balance = credit.amount - newPaidAmount;
      const newStatus = balance <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "pending";

      const { data, error } = await queryCreditsTable()
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
          paid_at: newStatus === "paid" ? new Date().toISOString() : null,
          paid_by: newStatus === "paid" ? profile?.id : null,
          notes: notes ? `${credit.notes || ""}\nPayment: Rs. ${amount} - ${notes}` : credit.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", creditId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-credits"] });
      toast({
        title: "Payment Recorded",
        description: "Credit payment has been recorded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get summary stats for pharmacy credits
export function usePharmacyCreditStats(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pharmacy-credits", "stats", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return { totalOutstanding: 0, pendingCount: 0, overdueCount: 0 };

      const { data, error } = await queryCreditsTable()
        .select("amount, paid_amount, status, due_date")
        .eq("branch_id", targetBranchId)
        .neq("status", "paid");

      if (error) throw error;

      const today = new Date().toISOString().split("T")[0];
      const totalOutstanding = data?.reduce((sum: number, c: any) => sum + (c.amount - c.paid_amount), 0) || 0;
      const pendingCount = data?.length || 0;
      const overdueCount = data?.filter((c: any) => c.due_date && c.due_date < today).length || 0;

      return { totalOutstanding, pendingCount, overdueCount };
    },
    enabled: !!targetBranchId,
  });
}

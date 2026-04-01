import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePatientDeposits(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["patient-deposits", profile?.organization_id, patientId],
    queryFn: async () => {
      let query = supabase
        .from("patient_deposits")
        .select("*, patients(first_name, last_name, patient_number)")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });
      if (patientId) query = query.eq("patient_id", patientId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useDepositBalance(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["patient-balance", profile?.organization_id, patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_deposits")
        .select("amount, type")
        .eq("organization_id", profile!.organization_id!)
        .eq("patient_id", patientId!)
        .eq("status", "completed");
      if (error) throw error;
      const deposits = (data || []).filter(d => d.type === "deposit").reduce((s, d) => s + Number(d.amount), 0);
      const refunds = (data || []).filter(d => d.type === "refund").reduce((s, d) => s + Number(d.amount), 0);
      const applied = (data || []).filter(d => d.type === "applied").reduce((s, d) => s + Number(d.amount), 0);
      return { deposits, refunds, applied, balance: deposits - refunds - applied };
    },
    enabled: !!profile?.organization_id && !!patientId,
  });
}

export function useCreatePatientDeposit() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      patient_id: string;
      amount: number;
      type?: string;
      payment_method_id?: string;
      reference_number?: string;
      notes?: string;
      invoice_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("patient_deposits")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          created_by: profile!.id,
          ...values,
          type: values.type || "deposit",
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-deposits"] });
      qc.invalidateQueries({ queryKey: ["patient-balance"] });
      toast.success("Deposit recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

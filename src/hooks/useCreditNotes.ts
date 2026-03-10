import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCreditNotes() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["credit-notes", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_notes")
        .select("*, invoices(invoice_number), patients(first_name, last_name)")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateCreditNote() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      invoice_id?: string;
      patient_id?: string;
      amount: number;
      tax_amount?: number;
      reason?: string;
      note_type?: string;
    }) => {
      const total = values.amount + (values.tax_amount || 0);
      const { data, error } = await supabase
        .from("credit_notes")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          invoice_id: values.invoice_id,
          patient_id: values.patient_id,
          amount: values.amount,
          tax_amount: values.tax_amount || 0,
          total_amount: total,
          reason: values.reason,
          note_type: values.note_type || "credit",
          created_by: profile!.id,
          status: "draft",
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credit-notes"] });
      toast.success("Credit note created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useApproveCreditNote() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("credit_notes")
        .update({
          status: "approved",
          approved_by: profile!.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credit-notes"] });
      toast.success("Credit note approved & posted to journal");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

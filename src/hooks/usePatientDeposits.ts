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

export interface PatientLedgerRow {
  id: string;
  date: string;
  type: "deposit" | "refund" | "applied";
  amount: number;
  signed_amount: number;
  running_balance: number;
  reference: string;
  invoice_id: string | null;
  invoice_number: string | null;
  payment_method_id: string | null;
  payment_method_name: string | null;
  notes: string | null;
  status: string;
  created_by: string | null;
}

export function usePatientLedger(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["patient-ledger", profile?.organization_id, patientId],
    queryFn: async (): Promise<PatientLedgerRow[]> => {
      const { data: deposits, error } = await supabase
        .from("patient_deposits")
        .select("id, created_at, type, amount, reference_number, invoice_id, payment_method_id, notes, status, created_by")
        .eq("organization_id", profile!.organization_id!)
        .eq("patient_id", patientId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = deposits || [];

      // Manual joins (no FK on invoice_id / payment_method_id guaranteed)
      const invoiceIds = Array.from(new Set(rows.map(r => r.invoice_id).filter(Boolean) as string[]));
      const methodIds = Array.from(new Set(rows.map(r => r.payment_method_id).filter(Boolean) as string[]));

      const [invRes, mthRes] = await Promise.all([
        invoiceIds.length
          ? supabase.from("invoices").select("id, invoice_number").in("id", invoiceIds)
          : Promise.resolve({ data: [] as any[], error: null }),
        methodIds.length
          ? supabase.from("payment_methods").select("id, name").in("id", methodIds)
          : Promise.resolve({ data: [] as any[], error: null }),
      ]);

      const invMap = new Map((invRes.data || []).map((i: any) => [i.id, i.invoice_number]));
      const mthMap = new Map((mthRes.data || []).map((m: any) => [m.id, m.name]));

      let balance = 0;
      return rows.map(r => {
        const amt = Number(r.amount);
        const signed = r.type === "deposit" ? amt : -amt; // refund & applied reduce
        balance += signed;
        return {
          id: r.id,
          date: r.created_at as string,
          type: r.type as PatientLedgerRow["type"],
          amount: amt,
          signed_amount: signed,
          running_balance: balance,
          reference: r.reference_number || "",
          invoice_id: r.invoice_id,
          invoice_number: r.invoice_id ? (invMap.get(r.invoice_id) ?? null) : null,
          payment_method_id: r.payment_method_id,
          payment_method_name: r.payment_method_id ? (mthMap.get(r.payment_method_id) ?? null) : null,
          notes: r.notes,
          status: r.status,
          created_by: r.created_by,
        };
      });
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
          payment_method_id: values.payment_method_id || null,
          invoice_id: values.invoice_id || null,
          type: values.type || "deposit",
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-deposits"] });
      qc.invalidateQueries({ queryKey: ["patient-balance"] });
      qc.invalidateQueries({ queryKey: ["patient-ledger"] });
      toast.success("Deposit recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useRefundPatientDeposit() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      patient_id: string;
      amount: number;
      available_balance: number;
      payment_method_id?: string;
      reference_number?: string;
      reason: string;
      notes?: string;
      parent_deposit_id?: string;
    }) => {
      if (!values.reason?.trim()) throw new Error("Refund reason is required");
      if (!(values.amount > 0)) throw new Error("Amount must be greater than 0");
      if (values.amount > values.available_balance) {
        throw new Error("Refund amount exceeds available deposit balance");
      }
      const composedNotes = [
        `Reason: ${values.reason.trim()}`,
        values.parent_deposit_id ? `Parent: ${values.parent_deposit_id}` : "",
        values.notes?.trim() || "",
      ].filter(Boolean).join("\n");

      const { data, error } = await supabase
        .from("patient_deposits")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          created_by: profile!.id,
          patient_id: values.patient_id,
          amount: values.amount,
          type: "refund",
          status: "completed",
          payment_method_id: values.payment_method_id || null,
          reference_number: values.reference_number || null,
          notes: composedNotes,
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-deposits"] });
      qc.invalidateQueries({ queryKey: ["patient-balance"] });
      qc.invalidateQueries({ queryKey: ["patient-ledger"] });
      toast.success("Refund recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const db = supabase as any;

// ── Findings catalogue ──────────────────────────────────────────────────────
export interface FindingDef {
  id: string;
  key: string;
  cdt_code: string | null;
  name: string;
  name_ar: string | null;
  name_ur: string | null;
  category: string;
  color: string;
  scope: "tooth" | "surface" | "both";
  is_favourite: boolean;
  sort_order: number;
}

export function useFindingsCatalog() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-findings-catalog", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("dental_findings_catalog")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as FindingDef[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Charted findings (multi per tooth / surface) ─────────────────────────────
export interface ChartFinding {
  id: string;
  patient_id: string;
  tooth_number: number;
  surface: string | null;
  finding_key: string;
  finding_name: string | null;
  cdt_code: string | null;
  color: string | null;
  status: string;
  notes: string | null;
  charted_at: string;
  closed_at: string | null;
}

export function useChartFindings(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-chart-findings", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("dental_chart_findings")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("organization_id", profile!.organization_id!)
        .order("charted_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ChartFinding[];
    },
    enabled: !!patientId && !!profile?.organization_id,
  });
}

export function useAddChartFinding() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (rows: Array<{
      patient_id: string;
      tooth_number: number;
      surface?: string | null;
      dentition?: string;
      finding_key: string;
      finding_name?: string;
      cdt_code?: string | null;
      color?: string | null;
      status?: string;
      notes?: string | null;
    }>) => {
      const payload = rows.map((r) => ({
        ...r,
        surface: r.surface || null,
        cdt_code: r.cdt_code || null,
        organization_id: profile!.organization_id!,
        branch_id: profile!.branch_id || null,
        charted_by: profile!.id,
      }));
      const { data, error } = await db.from("dental_chart_findings").insert(payload).select();
      if (error) throw error;
      return data || [];
    },
    onSuccess: (_d, rows) => {
      qc.invalidateQueries({ queryKey: ["dental-chart-findings", rows[0]?.patient_id] });
      toast.success("Charted");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateChartFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; patient_id: string; status?: string; notes?: string; closed_at?: string | null }) => {
      const { patient_id, ...rest } = values as any;
      const { data, error } = await db.from("dental_chart_findings").update(rest).eq("id", id).select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["dental-chart-findings", v.patient_id] }),
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteChartFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; patient_id: string }) => {
      const { error } = await db.from("dental_chart_findings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["dental-chart-findings", v.patient_id] }),
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Speciality clinical records ─────────────────────────────────────────────
export function useDentalRecords(patientId?: string, recordType?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-records", patientId, recordType, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("dental_clinical_records")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("record_type", recordType!)
        .eq("organization_id", profile!.organization_id!)
        .order("record_date", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!patientId && !!recordType && !!profile?.organization_id,
  });
}

export function useSaveDentalRecord() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      patient_id: string;
      record_type: string;
      tooth_number?: number | null;
      title?: string | null;
      status?: string;
      record_date?: string;
      data?: Record<string, any>;
      notes?: string | null;
    }) => {
      if (v.id) {
        const { id, patient_id, record_type, ...rest } = v;
        const { data, error } = await db.from("dental_clinical_records").update(rest).eq("id", id).select();
        if (error) throw error;
        return data?.[0];
      }
      const { data, error } = await db
        .from("dental_clinical_records")
        .insert([{
          ...v,
          tooth_number: v.tooth_number ?? null,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id || null,
          created_by: profile!.id,
        }])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["dental-records", v.patient_id, v.record_type] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteDentalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; patient_id: string; record_type: string }) => {
      const { error } = await db.from("dental_clinical_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["dental-records", v.patient_id, v.record_type] }),
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Consents ────────────────────────────────────────────────────────────────
export function useDentalConsents(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-consents", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("dental_consents")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!patientId && !!profile?.organization_id,
  });
}

export function useSaveDentalConsent() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      patient_id: string;
      consent_type: string;
      title: string;
      body?: string;
      tooth_numbers?: string | null;
      signed_by_name?: string | null;
      signed_at?: string | null;
    }) => {
      if (v.id) {
        const { id, patient_id, ...rest } = v;
        const { data, error } = await db.from("dental_consents").update(rest).eq("id", id).select();
        if (error) throw error;
        return data?.[0];
      }
      const { data, error } = await db
        .from("dental_consents")
        .insert([{
          ...v,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id || null,
          created_by: profile!.id,
        }])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["dental-consents", v.patient_id] });
      toast.success("Consent saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dental lab orders ───────────────────────────────────────────────────────
export function useDentalLabOrders(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-lab-orders", patientId, profile?.organization_id],
    queryFn: async () => {
      let q = db
        .from("dental_lab_orders")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });
      if (patientId) q = q.eq("patient_id", patientId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useSaveDentalLabOrder() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      patient_id: string;
      lab_name?: string;
      work_type: string;
      tooth_numbers?: string | null;
      shade?: string | null;
      instructions?: string | null;
      sent_date?: string | null;
      due_date?: string | null;
      received_date?: string | null;
      fitted_date?: string | null;
      cost?: number;
      status?: string;
    }) => {
      const clean = (o: any) => {
        const out: any = { ...o };
        ["sent_date", "due_date", "received_date", "fitted_date"].forEach((k) => {
          if (out[k] === "") out[k] = null;
        });
        return out;
      };
      if (v.id) {
        const { id, patient_id, ...rest } = v;
        const { data, error } = await db.from("dental_lab_orders").update(clean(rest)).eq("id", id).select();
        if (error) throw error;
        return data?.[0];
      }
      const { data, error } = await db
        .from("dental_lab_orders")
        .insert([clean({
          ...v,
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id || null,
          created_by: profile!.id,
        })])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["dental-lab-orders", v.patient_id] });
      toast.success("Lab order saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

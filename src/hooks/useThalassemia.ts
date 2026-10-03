import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const db = supabase as any;
type Table = "thalassemia_profiles" | "thalassemia_visits" | "chelation_records" | "thalassemia_monitoring" | "patient_sponsorships";

export interface PatientLite { id: string; first_name: string; last_name: string | null; patient_number: string | null }

async function attachPatients<T extends { patient_id: string }>(rows: T[]) {
  const ids = [...new Set(rows.map((r) => r.patient_id))];
  if (!ids.length) return rows.map((r) => ({ ...r, patient: null as PatientLite | null }));
  const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number").in("id", ids);
  const map = new Map((data || []).map((p: any) => [p.id, p]));
  return rows.map((r) => ({ ...r, patient: (map.get(r.patient_id) as PatientLite) || null }));
}

export function useThalList(table: Table, patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["thal", table, profile?.organization_id, patientId],
    enabled: !!profile?.organization_id,
    queryFn: async () => {
      let q = db.from(table).select("*").eq("organization_id", profile!.organization_id);
      if (patientId) q = q.eq("patient_id", patientId);
      const orderCol = { thalassemia_profiles: "next_due_date", thalassemia_visits: "visit_date", chelation_records: "record_date", thalassemia_monitoring: "reading_date", patient_sponsorships: "start_date" }[table];
      const { data, error } = await q.order(orderCol, { ascending: table === "thalassemia_profiles" }).limit(1000);
      if (error) throw error;
      return attachPatients(data || []);
    },
  });
}

export function useThalSave(table: Table) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (row: Record<string, any>) => {
      const payload: Record<string, any> = { ...row, organization_id: profile?.organization_id };
      Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });
      const { id, ...rest } = payload;
      const res = id
        ? await db.from(table).update(rest).eq("id", id).select()
        : await db.from(table).insert(rest).select();
      if (res.error) throw res.error;
      return res.data?.[0];
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["thal"] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
}

/** After a completed visit, push the profile's next due date forward by the interval. */
export async function bumpNextDue(profileRow: any, visitDate: string) {
  if (!profileRow) return;
  const d = new Date(visitDate);
  d.setDate(d.getDate() + (profileRow.transfusion_interval_days || 21));
  await db.from("thalassemia_profiles").update({ next_due_date: d.toISOString().slice(0, 10) }).eq("id", profileRow.id).select();
}

export function usePatientSearch(term: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["thal-patient-search", term, profile?.organization_id],
    enabled: !!profile?.organization_id && term.length >= 2,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number")
        .eq("organization_id", profile!.organization_id)
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,patient_number.ilike.%${term}%`).limit(10);
      return (data || []) as PatientLite[];
    },
  });
}

export const patientName = (p?: PatientLite | null) => (p ? `${p.first_name} ${p.last_name || ""}`.trim() : "—");
export const today = () => new Date().toISOString().slice(0, 10);

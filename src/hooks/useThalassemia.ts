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

/* ---------- Lab-sourced ferritin / Hb ---------- */
const FERRITIN_RE = /ferritin/i;
const HB_RE = /^(hb|hgb|h(a)?emoglobin)\b/i;

function toNum(v: any): number | null {
  if (v == null) return null;
  if (typeof v === "object") v = v.value ?? v.result ?? null;
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Ferritin & Hb readings parsed from this patient's lab results (published or completed). */
export function useLabThalReadings(patientId?: string) {
  return useQuery({
    queryKey: ["thal-lab-readings", patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data: orders } = await db.from("lab_orders")
        .select("id, created_at, published_at, status, is_published").eq("patient_id", patientId).limit(500);
      const ok = (orders || []).filter((o: any) => o.is_published || o.status === "completed");
      if (!ok.length) return [];
      const omap = new Map(ok.map((o: any) => [o.id, o]));
      const { data: items } = await db.from("lab_order_items")
        .select("id, lab_order_id, test_name, result, result_values, result_date").in("lab_order_id", [...omap.keys()]);
      const byDate = new Map<string, { id: string; reading_date: string; ferritin: number | null; hb: number | null; source: "lab" }>();
      (items || []).forEach((it: any) => {
        const o: any = omap.get(it.lab_order_id);
        const date = String(it.result_date || o?.published_at || o?.created_at || "").slice(0, 10);
        if (!date) return;
        let ferritin: number | null = null, hb: number | null = null;
        const vals = (it.result_values || {}) as Record<string, any>;
        Object.entries(vals).forEach(([k, v]) => {
          if (FERRITIN_RE.test(k)) ferritin ??= toNum(v);
          else if (HB_RE.test(k.trim())) hb ??= toNum(v);
        });
        if (FERRITIN_RE.test(it.test_name)) ferritin ??= toNum(it.result) ?? (Object.values(vals).length === 1 ? toNum(Object.values(vals)[0]) : null);
        if (HB_RE.test(String(it.test_name).trim())) hb ??= toNum(it.result);
        if (ferritin == null && hb == null) return;
        const r = byDate.get(date) || { id: `lab-${date}`, reading_date: date, ferritin: null, hb: null, source: "lab" as const };
        r.ferritin ??= ferritin; r.hb ??= hb;
        byDate.set(date, r);
      });
      return [...byDate.values()];
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const db = supabase as any;

// ── Per-surface conditions ──────────────────────────────────────────────────
export function useToothSurfaces(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-tooth-surfaces", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("dental_tooth_surfaces")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("organization_id", profile!.organization_id!);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!patientId && !!profile?.organization_id,
  });
}

export function useUpsertToothSurface() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: {
      patient_id: string;
      tooth_number: number;
      surface: string;
      condition: string;
      previous_condition?: string;
      notes?: string;
    }) => {
      const { previous_condition, ...values } = v;
      const { data, error } = await db
        .from("dental_tooth_surfaces")
        .upsert(
          {
            ...values,
            organization_id: profile!.organization_id!,
            updated_by: profile!.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "organization_id,patient_id,tooth_number,surface" }
        )
        .select();
      if (error) throw error;

      await db.from("dental_chart_history").insert([
        {
          organization_id: profile!.organization_id!,
          patient_id: v.patient_id,
          tooth_number: v.tooth_number,
          surface: v.surface,
          previous_condition: previous_condition || null,
          new_condition: v.condition,
          changed_by: profile!.id,
        },
      ]);
      return data?.[0];
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["dental-tooth-surfaces", v.patient_id] });
      qc.invalidateQueries({ queryKey: ["dental-chart-history", v.patient_id] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Chart history ───────────────────────────────────────────────────────────
export function useChartHistory(patientId?: string, toothNumber?: number | null) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-chart-history", patientId, toothNumber, profile?.organization_id],
    queryFn: async () => {
      let q = db
        .from("dental_chart_history")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("organization_id", profile!.organization_id!)
        .order("changed_at", { ascending: false })
        .limit(200);
      if (toothNumber) q = q.eq("tooth_number", toothNumber);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!patientId && !!profile?.organization_id,
  });
}

export function useLogToothHistory() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: {
      patient_id: string;
      tooth_number: number;
      previous_condition?: string | null;
      new_condition: string;
      notes?: string;
    }) => {
      const { error } = await db.from("dental_chart_history").insert([
        {
          ...v,
          organization_id: profile!.organization_id!,
          changed_by: profile!.id,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["dental-chart-history", v.patient_id] }),
  });
}

// ── Periodontal chart ───────────────────────────────────────────────────────
export function usePerioChart(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-perio", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await db
        .from("dental_perio_charts")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("organization_id", profile!.organization_id!);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!patientId && !!profile?.organization_id,
  });
}

export function useUpsertPerioSite() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: {
      patient_id: string;
      tooth_number: number;
      site: string;
      pocket_depth?: number | null;
      recession?: number | null;
      bleeding?: boolean;
      suppuration?: boolean;
      plaque?: boolean;
    }) => {
      const { data, error } = await db
        .from("dental_perio_charts")
        .upsert(
          {
            ...v,
            organization_id: profile!.organization_id!,
            measured_by: profile!.id,
            measured_at: new Date().toISOString(),
          },
          { onConflict: "organization_id,patient_id,tooth_number,site" }
        )
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["dental-perio", v.patient_id] }),
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Treatment plans ─────────────────────────────────────────────────────────
export function useDentalPlans(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-plans", patientId, profile?.organization_id],
    queryFn: async () => {
      let q = db
        .from("dental_treatment_plans")
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

export function useDentalPlanItems(planId?: string) {
  return useQuery({
    queryKey: ["dental-plan-items", planId],
    queryFn: async () => {
      const { data, error } = await db
        .from("dental_treatment_plan_items")
        .select("*")
        .eq("plan_id", planId!)
        .order("phase")
        .order("created_at");
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!planId,
  });
}

export function useCreateDentalPlan() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: { patient_id: string; title: string; doctor_id?: string | null; notes?: string }) => {
      const { data, error } = await db
        .from("dental_treatment_plans")
        .insert([
          {
            ...v,
            doctor_id: v.doctor_id || null,
            organization_id: profile!.organization_id!,
            branch_id: profile!.branch_id || null,
            created_by: profile!.id,
          },
        ])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dental-plans"] }); toast.success("Treatment plan created"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useAddPlanItem() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (v: {
      plan_id: string;
      procedure_name: string;
      procedure_id?: string | null;
      tooth_number?: number | null;
      surfaces?: string | null;
      phase?: number;
      cost?: number;
      notes?: string;
    }) => {
      const { data, error } = await db
        .from("dental_treatment_plan_items")
        .insert([{ ...v, procedure_id: v.procedure_id || null, organization_id: profile!.organization_id! }])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["dental-plan-items", v.plan_id] });
      qc.invalidateQueries({ queryKey: ["dental-plans"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdatePlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, plan_id, ...values }: { id: string; plan_id: string; status?: string; cost?: number; phase?: number; treatment_id?: string }) => {
      const { data, error } = await db.from("dental_treatment_plan_items").update(values).eq("id", id).select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["dental-plan-items", v.plan_id] }),
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeletePlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; plan_id: string }) => {
      const { error } = await db.from("dental_treatment_plan_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["dental-plan-items", v.plan_id] }),
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateDentalPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; status?: string; total_cost?: number; accepted_at?: string | null; title?: string; notes?: string }) => {
      const { data, error } = await db.from("dental_treatment_plans").update(values).eq("id", id).select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dental-plans"] }); toast.success("Plan updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

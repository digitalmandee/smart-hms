import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Dental Procedures Catalog ──
export function useDentalProcedures() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-procedures", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dental_procedures")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("category, name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateDentalProcedure() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { code: string; name: string; category?: string; description?: string; default_cost?: number; duration_minutes?: number }) => {
      const { data, error } = await supabase
        .from("dental_procedures")
        .insert([{ ...values, organization_id: profile!.organization_id! }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dental-procedures"] }); toast.success("Procedure added"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dental Charts (tooth map) ──
export function useDentalChart(patientId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-chart", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dental_charts")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("organization_id", profile!.organization_id!)
        .order("tooth_number");
      if (error) throw error;
      return data;
    },
    enabled: !!patientId && !!profile?.organization_id,
  });
}

export function useUpsertDentalChart() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { patient_id: string; tooth_number: number; condition: string; surfaces?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("dental_charts")
        .upsert({
          ...values,
          organization_id: profile!.organization_id!,
          updated_by: profile!.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: "patient_id,organization_id,tooth_number" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["dental-chart", vars.patient_id] }); toast.success("Tooth chart updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dental Treatments ──
export function useDentalTreatments(patientId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-treatments", profile?.organization_id, patientId],
    queryFn: async () => {
      let query = supabase
        .from("dental_treatments")
        .select("*, dental_procedures(name, code, category), patients(first_name, last_name, mrn_number), doctors(profiles(full_name))")
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

export function useCreateDentalTreatment() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { patient_id: string; doctor_id?: string; tooth_number?: number; surface?: string; procedure_id?: string; procedure_name?: string; diagnosis?: string; cost?: number; status?: string; planned_date?: string }) => {
      const { data, error } = await supabase
        .from("dental_treatments")
        .insert([{ ...values, organization_id: profile!.organization_id!, branch_id: profile!.branch_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dental-treatments"] }); toast.success("Treatment added"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateDentalTreatment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; status?: string; completed_date?: string; treatment_notes?: string; cost?: number }) => {
      const { data, error } = await supabase
        .from("dental_treatments")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dental-treatments"] }); toast.success("Treatment updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dental Images ──
export function useDentalImages(patientId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dental-images", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dental_images")
        .select("*")
        .eq("patient_id", patientId!)
        .eq("organization_id", profile!.organization_id!)
        .order("taken_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!patientId && !!profile?.organization_id,
  });
}

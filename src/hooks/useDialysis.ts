import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Dialysis Patients ──
export function useDialysisPatients() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dialysis-patients", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_patients")
        .select("*, patients(id, first_name, last_name, patient_number, phone, date_of_birth, gender)")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateDialysisPatient() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { patient_id: string; dry_weight_kg?: number; vascular_access_type?: string; hepatitis_b_status?: string; hepatitis_c_status?: string; schedule_pattern?: string; shift_preference?: string }) => {
      const { data, error } = await supabase
        .from("dialysis_patients")
        .insert([{ ...values, organization_id: profile!.organization_id! }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dialysis-patients"] }); toast.success("Dialysis patient enrolled"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dialysis Machines ──
export function useDialysisMachines() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dialysis-machines", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_machines")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("machine_number");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateDialysisMachine() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { machine_number: string; serial_number?: string; model?: string; manufacturer?: string; chair_number?: string }) => {
      const { data, error } = await supabase
        .from("dialysis_machines")
        .insert([{ ...values, organization_id: profile!.organization_id!, branch_id: profile!.branch_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dialysis-machines"] }); toast.success("Machine added"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateDialysisMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; status?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("dialysis_machines")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dialysis-machines"] }); toast.success("Machine updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dialysis Sessions ──
export function useDialysisSessions(dateFilter?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dialysis-sessions", profile?.organization_id, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("dialysis_sessions")
        .select("*, dialysis_patients(*, patients(first_name, last_name, patient_number)), dialysis_machines(machine_number, chair_number)")
        .eq("organization_id", profile!.organization_id!)
        .order("session_date", { ascending: false });
      if (dateFilter) query = query.eq("session_date", dateFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateDialysisSession() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { dialysis_patient_id: string; machine_id?: string; session_date: string; shift?: string; chair_number?: string; target_uf_ml?: number; duration_minutes?: number; dialyzer_type?: string; blood_flow_rate?: number; dialysate_flow_rate?: number; heparin_dose?: string }) => {
      const { data, error } = await supabase
        .from("dialysis_sessions")
        .insert([{ ...values, organization_id: profile!.organization_id!, branch_id: profile!.branch_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dialysis-sessions"] }); toast.success("Session created"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateDialysisSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: {
      id: string; status?: string;
      pre_weight_kg?: number; post_weight_kg?: number; actual_uf_ml?: number;
      pre_bp_systolic?: number; pre_bp_diastolic?: number; pre_pulse?: number; pre_temperature?: number;
      post_bp_systolic?: number; post_bp_diastolic?: number; post_pulse?: number;
      actual_start_time?: string; actual_end_time?: string;
      complications?: string; nursing_notes?: string; doctor_notes?: string;
      attended_by?: string; nurse_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("dialysis_sessions")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialysis-sessions"] });
      qc.invalidateQueries({ queryKey: ["dialysis-session"] });
      toast.success("Session updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Single Dialysis Session ──
export function useDialysisSession(sessionId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dialysis-session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_sessions")
        .select("*, dialysis_patients(*, patients(first_name, last_name, patient_number)), dialysis_machines(machine_number, chair_number)")
        .eq("id", sessionId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId && !!profile?.organization_id,
  });
}

// ── Dialysis Vitals ──
export function useDialysisVitals(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["dialysis-vitals", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_vitals")
        .select("*")
        .eq("session_id", sessionId!)
        .order("minute_mark");
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

export function useAddDialysisVitals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { session_id: string; minute_mark: number; bp_systolic?: number; bp_diastolic?: number; pulse?: number; blood_flow_rate?: number; uf_rate?: number; notes?: string }) => {
      const { data, error } = await supabase
        .from("dialysis_vitals")
        .insert([values])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["dialysis-vitals", vars.session_id] }); toast.success("Vitals recorded"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dialysis Schedules ──
export function useDialysisSchedules() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dialysis-schedules", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_schedules")
        .select("*, dialysis_patients(*, patients(first_name, last_name, patient_number)), dialysis_machines(machine_number, chair_number)")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("shift");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateDialysisSchedule() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { dialysis_patient_id: string; pattern: string; shift: string; start_date: string; machine_id?: string; chair_number?: string }) => {
      const { data, error } = await supabase
        .from("dialysis_schedules")
        .insert([{ ...values, organization_id: profile!.organization_id!, branch_id: profile!.branch_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dialysis-schedules"] }); toast.success("Schedule created"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Dialysis Schedule Availability ──
export function useDialysisScheduleAvailability(pattern: string, shift: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dialysis-schedule-availability", profile?.organization_id, pattern, shift],
    queryFn: async () => {
      // Get existing schedules for this pattern+shift
      const { data: schedules, error: schErr } = await supabase
        .from("dialysis_schedules")
        .select("*, dialysis_patients(*, patients(first_name, last_name, patient_number)), dialysis_machines(machine_number, chair_number)")
        .eq("organization_id", profile!.organization_id!)
        .eq("pattern", pattern)
        .eq("shift", shift)
        .eq("is_active", true);
      if (schErr) throw schErr;

      // Get all available machines
      const { data: machines, error: mErr } = await supabase
        .from("dialysis_machines")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true);
      if (mErr) throw mErr;

      const occupiedMachineIds = new Set((schedules || []).map((s: any) => s.machine_id).filter(Boolean));
      const occupiedChairs = new Set((schedules || []).map((s: any) => s.chair_number).filter(Boolean));
      const availableMachines = (machines || []).filter((m: any) => !occupiedMachineIds.has(m.id) && m.status === "available");

      return {
        occupied: schedules || [],
        availableMachines,
        allMachines: machines || [],
        occupiedChairs: Array.from(occupiedChairs),
        totalCapacity: machines?.length || 0,
        usedCount: schedules?.length || 0,
      };
    },
    enabled: !!profile?.organization_id && !!pattern && !!shift,
  });
}

// ── Check if patient is enrolled in dialysis ──
export function useDialysisPatientByPatientId(patientId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dialysis-patient-by-patient-id", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_patients")
        .select("*, patients(first_name, last_name, patient_number)")
        .eq("organization_id", profile!.organization_id!)
        .eq("patient_id", patientId!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id && !!patientId,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface IPDVitals {
  temperature?: number;
  pulse?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  blood_sugar?: number;
  pain_score?: number;
  intake_ml?: number;
  output_ml?: number;
  notes?: string;
}

export const CONDITION_STATUSES = [
  "Stable",
  "Improving",
  "Unchanged",
  "Deteriorating",
  "Critical",
  "Guarded",
] as const;

// Daily Rounds
export const useDailyRounds = (admissionId?: string, date?: string) => {
  return useQuery({
    queryKey: ["daily-rounds", admissionId, date],
    queryFn: async () => {
      if (!admissionId) return [];

      let query = supabase
        .from("daily_rounds")
        .select(`
          *,
          doctor:doctors(
            id,
            profile:profiles(full_name),
            specialization
          )
        `)
        .eq("admission_id", admissionId)
        .order("round_date", { ascending: false })
        .order("round_time", { ascending: false });

      if (date) {
        query = query.eq("round_date", date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

export const useCreateDailyRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roundData: {
      admission_id: string;
      doctor_id: string;
      round_date: string;
      round_time: string;
      vitals?: IPDVitals;
      condition_status?: string;
      findings?: string;
      diagnosis_update?: string;
      notes?: string;
      instructions?: string;
      diet_orders?: string;
      activity_orders?: string;
      medications_changed?: boolean;
      critical_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("daily_rounds")
        .insert({
          ...roundData,
          vitals: roundData.vitals as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-rounds"] });
      toast({ title: "Round notes saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save round notes", description: error.message, variant: "destructive" });
    },
  });
};

// IPD Vitals (separate from round vitals for nurse entries)
export const useIPDVitals = (admissionId?: string) => {
  return useQuery({
    queryKey: ["ipd-vitals", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("ipd_vitals")
        .select(`
          *,
          recorded_by:profiles(id, full_name)
        `)
        .eq("admission_id", admissionId)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

export const useCreateIPDVitals = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (vitalsData: {
      admission_id: string;
      temperature?: number;
      pulse?: number;
      blood_pressure_systolic?: number;
      blood_pressure_diastolic?: number;
      respiratory_rate?: number;
      oxygen_saturation?: number;
      weight?: number;
      height?: number;
      blood_sugar?: number;
      pain_score?: number;
      intake_ml?: number;
      output_ml?: number;
      notes?: string;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      const { data, error } = await supabase
        .from("ipd_vitals")
        .insert({
          ...vitalsData,
          recorded_by: profile.id,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-vitals"] });
      toast({ title: "Vitals recorded" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to record vitals", description: error.message, variant: "destructive" });
    },
  });
};

// Pending Rounds (admissions that need rounds today)
export const usePendingRounds = () => {
  const { profile } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["pending-rounds", profile?.organization_id, today],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // Get all active admissions
      const { data: admissions, error: admError } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_number,
          patient:patients(id, first_name, last_name, patient_number),
          ward:wards(id, name),
          bed:beds(id, bed_number),
          attending_doctor:doctors!admissions_attending_doctor_id_fkey(
            id,
            profile:profiles(full_name)
          )
        `)
        .eq("organization_id", profile.organization_id)
        .eq("status", "admitted");

      if (admError) throw admError;

      // Get today's rounds
      const { data: todayRounds, error: roundsError } = await supabase
        .from("daily_rounds")
        .select("admission_id")
        .eq("round_date", today);

      if (roundsError) throw roundsError;

      const roundedAdmissionIds = new Set(todayRounds?.map((r) => r.admission_id) || []);

      // Filter to admissions without rounds today
      return (admissions || []).filter((adm) => !roundedAdmissionIds.has(adm.id));
    },
    enabled: !!profile?.organization_id,
  });
};

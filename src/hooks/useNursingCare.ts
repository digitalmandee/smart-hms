import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export const NURSING_NOTE_TYPES = [
  "Assessment",
  "Intervention",
  "Response",
  "Progress",
  "Handover",
  "Incident",
  "Pain Assessment",
  "Fall Risk",
  "Pressure Injury",
  "Other",
] as const;

export const CARE_PLAN_STATUSES = [
  "Active",
  "On Hold",
  "Completed",
  "Discontinued",
] as const;

export const MEDICATION_ADMIN_STATUSES = [
  "given",
  "refused",
  "held",
  "missed",
  "pending",
  "discontinued",
] as const;

// Nursing Notes
export const useNursingNotes = (admissionId?: string) => {
  return useQuery({
    queryKey: ["nursing-notes", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("nursing_notes")
        .select(`
          *,
          nurse:profiles(id, full_name)
        `)
        .eq("admission_id", admissionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

export const useCreateNursingNote = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (noteData: {
      admission_id: string;
      note_type: string;
      content: string;
      is_critical?: boolean;
      attachments?: string[];
    }) => {
      if (!profile?.id) throw new Error("No profile");

      const { data, error } = await supabase
        .from("nursing_notes")
        .insert({
          admission_id: noteData.admission_id,
          note_type: noteData.note_type as "assessment" | "progress" | "medication" | "procedure" | "handover" | "admission" | "discharge",
          notes: noteData.content,
          recorded_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nursing-notes"] });
      toast({ title: "Note saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save note", description: error.message, variant: "destructive" });
    },
  });
};

// Nursing Care Plans
export const useCarePlans = (admissionId?: string) => {
  return useQuery({
    queryKey: ["care-plans", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("nursing_care_plans")
        .select(`
          *,
          created_by_profile:profiles!nursing_care_plans_created_by_fkey(id, full_name)
        `)
        .eq("admission_id", admissionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

export const useCreateCarePlan = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (planData: {
      admission_id: string;
      problem: string;
      goals: string;
      interventions: string;
      evaluation_criteria?: string;
      target_date?: string;
      priority?: number;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      const { data, error } = await supabase
        .from("nursing_care_plans")
        .insert({
          admission_id: planData.admission_id,
          problem: planData.problem,
          goal: planData.goals,
          interventions: planData.interventions,
          target_date: planData.target_date,
          priority: planData.priority?.toString(),
          nurse_id: profile.id,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans"] });
      toast({ title: "Care plan created" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create care plan", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateCarePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...planData }: { id: string } & Partial<{
      problem: string;
      goals: string;
      interventions: string;
      evaluation_criteria: string;
      target_date: string;
      priority: number;
      status: string;
      outcome_notes: string;
    }>) => {
      const updateData: Record<string, unknown> = {};
      if (planData.problem) updateData.problem = planData.problem;
      if (planData.goals) updateData.goal = planData.goals;
      if (planData.interventions) updateData.interventions = planData.interventions;
      if (planData.target_date) updateData.target_date = planData.target_date;
      if (planData.priority) updateData.priority = planData.priority.toString();
      if (planData.status) updateData.status = planData.status;
      if (planData.evaluation_criteria) updateData.evaluation = planData.evaluation_criteria;

      const { data, error } = await supabase
        .from("nursing_care_plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-plans"] });
      toast({ title: "Care plan updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update care plan", description: error.message, variant: "destructive" });
    },
  });
};

// IPD Medications
export const useIPDMedications = (admissionId?: string) => {
  return useQuery({
    queryKey: ["ipd-medications", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("ipd_medications")
        .select(`
          *,
          medicine:medicines(id, name, generic_name, dosage_form),
          prescribed_by_profile:profiles!ipd_medications_prescribed_by_fkey(id, full_name)
        `)
        .eq("admission_id", admissionId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

// Medication Administration
export const useMedicationAdministration = (admissionId?: string, date?: string) => {
  return useQuery({
    queryKey: ["medication-administration", admissionId, date],
    queryFn: async () => {
      if (!admissionId) return [];

      let query = supabase
        .from("medication_administration")
        .select(`
          *,
          ipd_medication:ipd_medications(
            id,
            medicine:medicines(id, name, dosage_form),
            dosage,
            frequency,
            route
          ),
          administered_by:profiles(id, full_name),
          witnessed_by:profiles(id, full_name)
        `)
        .eq("ipd_medication.admission_id", admissionId)
        .order("scheduled_time", { ascending: true });

      if (date) {
        query = query.gte("scheduled_time", `${date}T00:00:00`)
          .lt("scheduled_time", `${date}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

export const useAdministerMedication = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      administrationId,
      status,
      notes,
    }: {
      administrationId: string;
      status: "given" | "refused" | "held" | "missed" | "pending" | "discontinued";
      notes?: string;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      const { data, error } = await supabase
        .from("medication_administration")
        .update({
          status,
          administered_by: profile.id,
          administered_at: new Date().toISOString(),
          notes,
        })
        .eq("id", administrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medication-administration"] });
      toast({ title: "Medication status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update medication", description: error.message, variant: "destructive" });
    },
  });
};

// Shift Handover Summary
export const useShiftSummary = (wardId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["shift-summary", wardId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !wardId) return null;

      // Get active admissions in the ward
      const { data: admissions, error } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_number,
          patient:patients(id, first_name, last_name),
          bed:beds(id, bed_number),
          clinical_notes
        `)
        .eq("organization_id", profile.organization_id)
        .eq("ward_id", wardId)
        .eq("status", "admitted");

      if (error) throw error;

      // Get critical notes from today
      const today = new Date().toISOString().split("T")[0];
      const { data: criticalNotes } = await supabase
        .from("nursing_notes")
        .select(`
          id,
          content,
          admission_id,
          created_at
        `)
        .in("admission_id", (admissions || []).map((a) => a.id))
        .eq("is_critical", true)
        .gte("created_at", `${today}T00:00:00`);

      return {
        admissions: admissions || [],
        criticalNotes: criticalNotes || [],
        patientCount: admissions?.length || 0,
      };
    },
    enabled: !!profile?.organization_id && !!wardId,
  });
};

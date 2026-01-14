import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AdmissionStatus = Database["public"]["Enums"]["admission_status"];
type AdmissionType = Database["public"]["Enums"]["admission_type"];

export const ADMISSION_TYPES: AdmissionType[] = [
  "emergency",
  "elective",
  "transfer",
  "referral",
];

export const ADMISSION_STATUSES: AdmissionStatus[] = [
  "admitted",
  "discharged",
  "transferred",
  "expired",
  "absconded",
  "lama",
];

export const useAdmissions = (status?: AdmissionStatus) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["admissions", profile?.organization_id, status],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from("admissions")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender, phone),
          ward:wards(id, name, code),
          bed:beds(id, bed_number),
          admitting_doctor:doctors!admissions_admitting_doctor_id_fkey(
            id,
            profile:profiles(full_name)
          ),
          attending_doctor:doctors!admissions_attending_doctor_id_fkey(
            id,
            profile:profiles(full_name)
          ),
          branch:branches(id, name)
        `)
        .eq("organization_id", profile.organization_id)
        .order("admission_date", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useAdmission = (admissionId: string | undefined) => {
  return useQuery({
    queryKey: ["admission", admissionId],
    queryFn: async () => {
      if (!admissionId) return null;

      const { data, error } = await supabase
        .from("admissions")
        .select(`
          *,
          patient:patients(*),
          ward:wards(id, name, code, ward_type),
          bed:beds(id, bed_number, bed_type),
          admitting_doctor:doctors!admissions_admitting_doctor_id_fkey(
            id,
            profile:profiles(full_name),
            specialization
          ),
          attending_doctor:doctors!admissions_attending_doctor_id_fkey(
            id,
            profile:profiles(full_name),
            specialization
          ),
          referring_doctor:doctors!admissions_referring_doctor_id_fkey(
            id,
            profile:profiles(full_name)
          ),
          branch:branches(id, name),
          consultation:consultations(id, diagnosis, symptoms)
        `)
        .eq("id", admissionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!admissionId,
  });
};

export const useCreateAdmission = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (admissionData: {
      patient_id: string;
      branch_id: string;
      ward_id?: string;
      bed_id?: string;
      admission_date: string;
      admission_time: string;
      admission_type?: AdmissionType;
      admitting_doctor_id?: string;
      attending_doctor_id?: string;
      referring_doctor_id?: string;
      chief_complaint?: string;
      diagnosis_on_admission?: string;
      history_of_present_illness?: string;
      clinical_notes?: string;
      expected_discharge_date?: string;
      deposit_amount?: number;
      estimated_cost?: number;
      consultation_id?: string;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Generate admission number
      const { data: lastAdmission } = await supabase
        .from("admissions")
        .select("admission_number")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastAdmission?.admission_number
        ? parseInt(lastAdmission.admission_number.replace(/\D/g, ""))
        : 0;
      const admission_number = `ADM${String(lastNumber + 1).padStart(6, "0")}`;

      const { data, error } = await supabase
        .from("admissions")
        .insert({
          ...admissionData,
          organization_id: profile.organization_id,
          admission_number,
          status: "admitted",
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update bed status to occupied if bed is assigned
      if (admissionData.bed_id) {
        await supabase
          .from("beds")
          .update({ status: "occupied", current_admission_id: data.id })
          .eq("id", admissionData.bed_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Patient admitted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to admit patient", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateAdmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...admissionData }: { id: string } & Partial<{
      ward_id: string;
      bed_id: string;
      attending_doctor_id: string;
      clinical_notes: string;
      expected_discharge_date: string;
      status: AdmissionStatus;
    }>) => {
      const { data, error } = await supabase
        .from("admissions")
        .update(admissionData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admission"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      toast({ title: "Admission updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update admission", description: error.message, variant: "destructive" });
    },
  });
};

export const useDischargePatient = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      admissionId,
      dischargeData,
    }: {
      admissionId: string;
      dischargeData: {
        discharge_type: Database["public"]["Enums"]["discharge_type"];
        discharge_diagnosis?: string;
        discharge_summary?: string;
        discharge_instructions?: string;
        follow_up_date?: string;
        follow_up_instructions?: string;
        condition_at_discharge?: string;
      };
    }) => {
      if (!profile?.id) throw new Error("No profile");

      // Get the admission to find the bed
      const { data: admission, error: fetchError } = await supabase
        .from("admissions")
        .select("bed_id")
        .eq("id", admissionId)
        .single();

      if (fetchError) throw fetchError;

      const now = new Date();
      const { data, error } = await supabase
        .from("admissions")
        .update({
          ...dischargeData,
          status: "discharged",
          actual_discharge_date: now.toISOString().split("T")[0],
          discharge_time: now.toTimeString().split(" ")[0],
          discharged_by: profile.id,
        })
        .eq("id", admissionId)
        .select()
        .single();

      if (error) throw error;

      // Free up the bed
      if (admission?.bed_id) {
        await supabase
          .from("beds")
          .update({ status: "available", current_admission_id: null })
          .eq("id", admission.bed_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admission"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Patient discharged successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to discharge patient", description: error.message, variant: "destructive" });
    },
  });
};

export const useBedTransfer = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      admissionId,
      fromBedId,
      fromWardId,
      toBedId,
      toWardId,
      reason,
      notes,
    }: {
      admissionId: string;
      fromBedId?: string;
      fromWardId?: string;
      toBedId: string;
      toWardId: string;
      reason?: string;
      notes?: string;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      // Create transfer record
      const { error: transferError } = await supabase
        .from("bed_transfers")
        .insert({
          admission_id: admissionId,
          from_bed_id: fromBedId,
          from_ward_id: fromWardId,
          to_bed_id: toBedId,
          to_ward_id: toWardId,
          transfer_reason: reason,
          notes,
          ordered_by: profile.id,
          transferred_by: profile.id,
          transferred_at: new Date().toISOString(),
        });

      if (transferError) throw transferError;

      // Free old bed
      if (fromBedId) {
        await supabase
          .from("beds")
          .update({ status: "available", current_admission_id: null })
          .eq("id", fromBedId);
      }

      // Assign new bed
      await supabase
        .from("beds")
        .update({ status: "occupied", current_admission_id: admissionId })
        .eq("id", toBedId);

      // Update admission
      const { data, error } = await supabase
        .from("admissions")
        .update({ ward_id: toWardId, bed_id: toBedId })
        .eq("id", admissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admission"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      toast({ title: "Bed transfer completed" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to transfer bed", description: error.message, variant: "destructive" });
    },
  });
};

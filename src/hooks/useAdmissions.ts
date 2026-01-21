import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { ipdLogger } from "@/lib/logger";

type AdmissionStatus = Database["public"]["Enums"]["admission_status"];
type AdmissionType = Database["public"]["Enums"]["admission_type"];

export const ADMISSION_TYPES: AdmissionType[] = [
  "emergency",
  "elective",
  "transfer",
  "referral",
];

export const ADMISSION_STATUSES: AdmissionStatus[] = [
  "pending",
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
          ward:wards!admissions_ward_id_fkey(id, name, code),
          bed:beds!admissions_bed_id_fkey(id, bed_number),
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
          ward:wards!admissions_ward_id_fkey(id, name, code, ward_type),
          bed:beds!admissions_bed_id_fkey(id, bed_number, bed_type),
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

      ipdLogger.info("Creating admission", { 
        patientId: admissionData.patient_id,
        wardId: admissionData.ward_id,
        bedId: admissionData.bed_id,
        admissionType: admissionData.admission_type
      });

      // If bed is specified, verify it's available first
      if (admissionData.bed_id) {
        const { data: bed, error: bedCheckError } = await supabase
          .from("beds")
          .select("id, status, current_admission_id")
          .eq("id", admissionData.bed_id)
          .single();

        if (bedCheckError) {
          ipdLogger.error("Failed to verify bed availability", bedCheckError);
          throw new Error("Failed to verify bed availability");
        }

        if (bed.status !== "available" && bed.status !== "reserved") {
          ipdLogger.warn("Bed not available", { bedId: admissionData.bed_id, status: bed.status });
          throw new Error(`Bed is not available (current status: ${bed.status})`);
        }
      }

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

      // Create admission with PENDING status (nurse will confirm)
      const { data, error } = await supabase
        .from("admissions")
        .insert({
          ...admissionData,
          organization_id: profile.organization_id,
          admission_number,
          status: "pending", // Changed: starts as pending until nurse confirms
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) {
        ipdLogger.error("Failed to create admission", error, { patientId: admissionData.patient_id });
        throw error;
      }

      // Reserve bed (not occupied yet - will be occupied when nurse confirms)
      if (admissionData.bed_id) {
        ipdLogger.debug("Reserving bed for admission", { bedId: admissionData.bed_id, admissionId: data.id });
        
        const { error: bedError } = await supabase
          .from("beds")
          .update({ 
            status: "reserved", // Changed: reserved until nurse confirms
            // Don't set current_admission_id yet - set when confirmed
          })
          .eq("id", admissionData.bed_id);

        if (bedError) {
          ipdLogger.error("Failed to reserve bed", bedError, { 
            bedId: admissionData.bed_id, 
            admissionId: data.id 
          });
        } else {
          ipdLogger.info("Bed reserved successfully", { 
            bedId: admissionData.bed_id, 
            admissionId: data.id 
          });
        }
      }

      ipdLogger.info("Admission created", { 
        admissionId: data.id,
        admissionNumber: admission_number,
        bedId: admissionData.bed_id
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Admission created - pending nurse confirmation" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create admission", description: error.message, variant: "destructive" });
    },
  });
};

// Hook to fetch pending admissions
export const usePendingAdmissions = (wardId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["admissions", "pending", profile?.organization_id, wardId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from("admissions")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender, phone),
          ward:wards!admissions_ward_id_fkey(id, name, code),
          bed:beds!admissions_bed_id_fkey(id, bed_number),
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
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (wardId) {
        query = query.eq("ward_id", wardId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

// Hook for nurse to confirm admission (patient arrived and settled to bed)
export const useConfirmAdmission = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      admissionId,
      notes,
    }: {
      admissionId: string;
      notes?: string;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      ipdLogger.info("Confirming admission", { admissionId });

      // Get admission details
      const { data: admission, error: fetchError } = await supabase
        .from("admissions")
        .select("id, bed_id, patient_id, admission_number")
        .eq("id", admissionId)
        .single();

      if (fetchError) {
        ipdLogger.error("Failed to fetch admission for confirmation", fetchError);
        throw fetchError;
      }

      // Update admission status to 'admitted'
      const { data, error: updateError } = await supabase
        .from("admissions")
        .update({
          status: "admitted",
          confirmed_at: new Date().toISOString(),
          confirmed_by: profile.id,
        })
        .eq("id", admissionId)
        .select()
        .single();

      if (updateError) {
        ipdLogger.error("Failed to confirm admission", updateError);
        throw updateError;
      }

      // Update bed to occupied and link admission
      if (admission.bed_id) {
        const { error: bedError } = await supabase
          .from("beds")
          .update({
            status: "occupied",
            current_admission_id: admissionId,
          })
          .eq("id", admission.bed_id);

        if (bedError) {
          ipdLogger.error("Failed to update bed status", bedError);
        }
      }

      // Create nursing note for admission confirmation (optional - don't fail if it errors)
      if (notes) {
        try {
          await supabase.from("nursing_notes").insert([{
            admission_id: admissionId,
            note_type: "admission" as const,
            notes: notes,
            nurse_id: profile.id,
            note_date: new Date().toISOString().split("T")[0],
            note_time: new Date().toTimeString().split(" ")[0],
          }]);
        } catch (noteError) {
          ipdLogger.warn("Failed to create admission note", noteError);
        }
      }

      ipdLogger.info("Admission confirmed", {
        admissionId,
        admissionNumber: admission.admission_number,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admission"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["wards"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-stats"] });
      toast({ title: "Patient admitted to bed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to confirm admission", description: error.message, variant: "destructive" });
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

      ipdLogger.info("Discharging patient", { 
        admissionId, 
        dischargeType: dischargeData.discharge_type 
      });

      // Get the admission to find the bed
      const { data: admission, error: fetchError } = await supabase
        .from("admissions")
        .select("bed_id, admission_number")
        .eq("id", admissionId)
        .single();

      if (fetchError) {
        ipdLogger.error("Failed to fetch admission for discharge", fetchError, { admissionId });
        throw fetchError;
      }

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

      if (error) {
        ipdLogger.error("Failed to discharge patient", error, { admissionId });
        throw error;
      }

      // Free up the bed
      if (admission?.bed_id) {
        ipdLogger.debug("Freeing bed after discharge", { bedId: admission.bed_id });
        await supabase
          .from("beds")
          .update({ status: "available", current_admission_id: null })
          .eq("id", admission.bed_id);
      }

      ipdLogger.info("Patient discharged", { 
        admissionId,
        admissionNumber: admission.admission_number,
        dischargeType: dischargeData.discharge_type
      });

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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { emergencyLogger } from "@/lib/logger";

export type ArrivalMode = 'walk_in' | 'ambulance' | 'police' | 'brought_by_family' | 'referred';
export type ERStatus = 'waiting' | 'in_triage' | 'in_treatment' | 'admitted' | 'discharged' | 'transferred' | 'expired' | 'absconded' | 'lama';
export type TriageLevel = '1' | '2' | '3' | '4' | '5';
export type AmbulanceStatus = 'incoming' | 'arrived' | 'cancelled';
export type ERTreatmentType = 'medication' | 'procedure' | 'investigation' | 'intervention' | 'note';

export const TRIAGE_LEVELS = [
  { level: '1' as TriageLevel, name: 'Resuscitation', color: 'red', zone: 'Resuscitation Bay', description: 'Immediate life-threatening conditions' },
  { level: '2' as TriageLevel, name: 'Emergent', color: 'orange', zone: 'Trauma Bay', description: 'Potentially life-threatening, needs urgent care' },
  { level: '3' as TriageLevel, name: 'Urgent', color: 'yellow', zone: 'Yellow Zone', description: 'Serious but stable, can wait briefly' },
  { level: '4' as TriageLevel, name: 'Less Urgent', color: 'green', zone: 'Green Zone', description: 'Non-urgent, standard care needed' },
  { level: '5' as TriageLevel, name: 'Non-Urgent', color: 'blue', zone: 'Green Zone', description: 'Minor issues, can wait' },
];

export const ARRIVAL_MODES: { value: ArrivalMode; label: string }[] = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'police', label: 'Police/MLC' },
  { value: 'brought_by_family', label: 'Brought by Family' },
  { value: 'referred', label: 'Referred' },
];

export const ER_STATUSES: { value: ERStatus; label: string }[] = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'in_triage', label: 'In Triage' },
  { value: 'in_treatment', label: 'In Treatment' },
  { value: 'admitted', label: 'Admitted' },
  { value: 'discharged', label: 'Discharged' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'expired', label: 'Expired' },
  { value: 'absconded', label: 'Absconded' },
  { value: 'lama', label: 'LAMA' },
];

export const ER_ZONES = ['Resuscitation Bay', 'Trauma Bay', 'Yellow Zone', 'Green Zone'];

export interface EmergencyRegistration {
  id: string;
  organization_id: string;
  branch_id: string;
  patient_id: string | null;
  er_number: string;
  arrival_mode: ArrivalMode;
  arrival_time: string;
  triage_level: TriageLevel | null;
  triage_time: string | null;
  triaged_by: string | null;
  chief_complaint: string | null;
  mechanism_of_injury: string | null;
  is_trauma: boolean;
  is_mlc: boolean;
  police_station: string | null;
  fir_number: string | null;
  brought_by_name: string | null;
  brought_by_phone: string | null;
  brought_by_relation: string | null;
  vitals: Record<string, any> | null;
  status: ERStatus;
  assigned_doctor_id: string | null;
  assigned_zone: string | null;
  admission_id: string | null;
  disposition_time: string | null;
  disposition_notes: string | null;
  unknown_patient_details: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  patient?: any;
  assigned_doctor?: any;
}

export interface AmbulanceAlert {
  id: string;
  organization_id: string;
  branch_id: string;
  ambulance_id: string | null;
  eta_minutes: number | null;
  patient_count: number;
  condition_summary: string | null;
  caller_name: string | null;
  caller_phone: string | null;
  priority: number;
  prehospital_care: string | null;
  status: AmbulanceStatus;
  arrival_time: string | null;
  linked_er_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TraumaAssessment {
  id: string;
  er_id: string;
  assessment_time: string;
  assessed_by: string | null;
  mechanism: string | null;
  gcs_eye: number | null;
  gcs_verbal: number | null;
  gcs_motor: number | null;
  gcs_total: number | null;
  injuries: any[] | null;
  rts_score: number | null;
  iss_score: number | null;
  notes: string | null;
  created_at: string;
}

export interface ERTreatment {
  id: string;
  er_id: string;
  treatment_time: string;
  treatment_type: ERTreatmentType;
  description: string;
  performed_by: string | null;
  notes: string | null;
  created_at: string;
  performer?: any;
}

// Fetch emergency registrations
export const useEmergencyRegistrations = (status?: ERStatus, triageLevel?: TriageLevel) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["emergency-registrations", profile?.organization_id, status, triageLevel],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from("emergency_registrations")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender, phone),
          assigned_doctor:doctors(id, profile:profiles(full_name))
        `)
        .eq("organization_id", profile.organization_id)
        .order("arrival_time", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      if (triageLevel) {
        query = query.eq("triage_level", triageLevel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmergencyRegistration[];
    },
    enabled: !!profile?.organization_id,
  });
};

// Fetch single emergency registration
export const useEmergencyRegistration = (id: string | undefined) => {
  return useQuery({
    queryKey: ["emergency-registration", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("emergency_registrations")
        .select(`
          *,
          patient:patients(*),
          assigned_doctor:doctors(id, profile:profiles(full_name), specialization)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as EmergencyRegistration;
    },
    enabled: !!id,
  });
};

// Fetch active ER queue (real-time)
export const useERQueue = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["er-queue", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("emergency_registrations")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, gender, date_of_birth),
          assigned_doctor:doctors(id, profile:profiles(full_name))
        `)
        .eq("organization_id", profile.organization_id)
        .in("status", ["waiting", "in_triage", "in_treatment"])
        .order("triage_level", { ascending: true, nullsFirst: false })
        .order("arrival_time", { ascending: true });

      if (error) throw error;
      return data as EmergencyRegistration[];
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel("er-queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_registrations",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["er-queue"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id, queryClient]);

  return query;
};

// Create emergency registration
export const useCreateEmergencyRegistration = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<EmergencyRegistration>) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("Organization and branch required");
      }

      const { data: result, error } = await supabase
        .from("emergency_registrations")
        .insert({
          ...data,
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          created_by: profile.id,
          er_number: "", // Will be generated by trigger
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["er-queue"] });
      queryClient.invalidateQueries({ queryKey: ["er-stats"] });
      toast.success("Emergency registration created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create registration");
    },
  });
};

// Update emergency registration
export const useUpdateEmergencyRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmergencyRegistration> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("emergency_registrations")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["emergency-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-registration", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["er-queue"] });
      queryClient.invalidateQueries({ queryKey: ["er-stats"] });
      toast.success("Registration updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update registration");
    },
  });
};

// Triage patient
export const useTriagePatient = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      triage_level,
      vitals,
      assigned_zone,
      assigned_doctor_id,
    }: {
      id: string;
      triage_level: TriageLevel;
      vitals?: Record<string, any>;
      assigned_zone?: string;
      assigned_doctor_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("emergency_registrations")
        .update({
          triage_level,
          triage_time: new Date().toISOString(),
          triaged_by: profile?.id,
          vitals,
          assigned_zone: assigned_zone || TRIAGE_LEVELS.find(t => t.level === triage_level)?.zone,
          assigned_doctor_id,
          status: "in_treatment" as ERStatus,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["emergency-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-registration", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["er-queue"] });
      queryClient.invalidateQueries({ queryKey: ["er-stats"] });
      toast.success("Patient triaged successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to triage patient");
    },
  });
};

// Ambulance alerts
export const useAmbulanceAlerts = (status?: AmbulanceStatus) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["ambulance-alerts", profile?.organization_id, status],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let q = supabase
        .from("ambulance_alerts")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (status) {
        q = q.eq("status", status);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as AmbulanceAlert[];
    },
    enabled: !!profile?.organization_id,
  });

  // Real-time subscription for incoming ambulances
  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel("ambulance-alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ambulance_alerts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ambulance-alerts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id, queryClient]);

  return query;
};

// Create ambulance alert
export const useCreateAmbulanceAlert = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<AmbulanceAlert>) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("Organization and branch required");
      }

      const { data: result, error } = await supabase
        .from("ambulance_alerts")
        .insert({
          ...data,
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambulance-alerts"] });
      toast.success("Ambulance alert created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create alert");
    },
  });
};

// Update ambulance alert (mark as arrived)
export const useUpdateAmbulanceAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AmbulanceAlert> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("ambulance_alerts")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambulance-alerts"] });
      toast.success("Alert updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update alert");
    },
  });
};

// Trauma assessments
export const useTraumaAssessments = (erId: string | undefined) => {
  return useQuery({
    queryKey: ["trauma-assessments", erId],
    queryFn: async () => {
      if (!erId) return [];

      const { data, error } = await supabase
        .from("trauma_assessments")
        .select(`
          *,
          assessor:profiles!trauma_assessments_assessed_by_fkey(full_name)
        `)
        .eq("er_id", erId)
        .order("assessment_time", { ascending: false });

      if (error) throw error;
      return data as TraumaAssessment[];
    },
    enabled: !!erId,
  });
};

// Create trauma assessment
export const useCreateTraumaAssessment = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<TraumaAssessment>) => {
      const gcsTotal = (data.gcs_eye || 0) + (data.gcs_verbal || 0) + (data.gcs_motor || 0);

      const { data: result, error } = await supabase
        .from("trauma_assessments")
        .insert({
          er_id: data.er_id!,
          mechanism: data.mechanism,
          gcs_eye: data.gcs_eye,
          gcs_verbal: data.gcs_verbal,
          gcs_motor: data.gcs_motor,
          gcs_total: gcsTotal > 0 ? gcsTotal : null,
          injuries: data.injuries,
          rts_score: data.rts_score,
          iss_score: data.iss_score,
          notes: data.notes,
          assessed_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trauma-assessments", variables.er_id] });
      toast.success("Trauma assessment recorded");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record assessment");
    },
  });
};

// ER Treatments
export const useERTreatments = (erId: string | undefined) => {
  return useQuery({
    queryKey: ["er-treatments", erId],
    queryFn: async () => {
      if (!erId) return [];

      const { data, error } = await supabase
        .from("er_treatments")
        .select(`
          *,
          performer:profiles!er_treatments_performed_by_fkey(full_name)
        `)
        .eq("er_id", erId)
        .order("treatment_time", { ascending: false });

      if (error) throw error;
      return data as ERTreatment[];
    },
    enabled: !!erId,
  });
};

// Add ER treatment
export const useAddERTreatment = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<ERTreatment>) => {
      const { data: result, error } = await supabase
        .from("er_treatments")
        .insert({
          er_id: data.er_id!,
          treatment_type: data.treatment_type!,
          description: data.description!,
          notes: data.notes,
          performed_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["er-treatments", variables.er_id] });
      toast.success("Treatment recorded");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record treatment");
    },
  });
};

// ER Statistics
export const useERStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["er-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("emergency_registrations")
        .select("id, status, triage_level, arrival_time")
        .eq("organization_id", profile.organization_id)
        .gte("arrival_time", today.toISOString());

      if (error) throw error;

      const stats = {
        total: data.length,
        byTriage: {
          '1': data.filter(d => d.triage_level === '1').length,
          '2': data.filter(d => d.triage_level === '2').length,
          '3': data.filter(d => d.triage_level === '3').length,
          '4': data.filter(d => d.triage_level === '4').length,
          '5': data.filter(d => d.triage_level === '5').length,
          unTriaged: data.filter(d => !d.triage_level).length,
        },
        byStatus: {
          waiting: data.filter(d => d.status === 'waiting').length,
          inTriage: data.filter(d => d.status === 'in_triage').length,
          inTreatment: data.filter(d => d.status === 'in_treatment').length,
          admitted: data.filter(d => d.status === 'admitted').length,
          discharged: data.filter(d => d.status === 'discharged').length,
        },
        activePatients: data.filter(d => ['waiting', 'in_triage', 'in_treatment'].includes(d.status)).length,
      };

      return stats;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000,
  });
};

// Quick admission from ER to IPD
export const useQuickAdmission = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      erRegistrationId,
      wardId,
      bedId,
      attendingDoctorId,
      chiefComplaint,
      clinicalNotes,
    }: {
      erRegistrationId: string;
      wardId: string;
      bedId: string;
      attendingDoctorId: string;
      chiefComplaint?: string;
      clinicalNotes?: string;
    }) => {
      // Get ER registration
      const { data: erReg, error: erError } = await supabase
        .from("emergency_registrations")
        .select("*")
        .eq("id", erRegistrationId)
        .single();

      if (erError) throw erError;
      if (!erReg.patient_id) throw new Error("Patient must be identified before admission");

      // Create admission
      const { data: admission, error: admError } = await supabase
        .from("admissions")
        .insert({
          organization_id: erReg.organization_id,
          branch_id: erReg.branch_id,
          patient_id: erReg.patient_id,
          admission_number: "", // Generated by trigger
          admission_date: new Date().toISOString().split("T")[0],
          admission_time: new Date().toTimeString().split(" ")[0],
          admission_type: "emergency",
          ward_id: wardId,
          bed_id: bedId,
          attending_doctor_id: attendingDoctorId,
          chief_complaint: chiefComplaint || erReg.chief_complaint,
          clinical_notes: clinicalNotes,
          created_by: profile?.id,
          status: "admitted",
        })
        .select()
        .single();

      if (admError) throw admError;

      // Update bed status
      await supabase
        .from("beds")
        .update({ status: "occupied", current_admission_id: admission.id })
        .eq("id", bedId);

      // Update ER registration
      await supabase
        .from("emergency_registrations")
        .update({
          status: "admitted" as ERStatus,
          admission_id: admission.id,
          disposition_time: new Date().toISOString(),
        })
        .eq("id", erRegistrationId);

      return admission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["er-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      toast.success("Patient admitted to IPD");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to admit patient");
    },
  });
};

// Link patient to ER registration
export const useLinkPatientToER = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      erRegistrationId,
      patientId,
    }: {
      erRegistrationId: string;
      patientId: string;
    }) => {
      const { data, error } = await supabase
        .from("emergency_registrations")
        .update({
          patient_id: patientId,
          unknown_patient_details: null, // Clear unknown details
        })
        .eq("id", erRegistrationId)
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["emergency-registration", variables.erRegistrationId] });
      queryClient.invalidateQueries({ queryKey: ["emergency-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["er-queue"] });
      toast.success("Patient linked successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to link patient");
    },
  });
};

// Get ER registration by admission ID (for IPD view)
export const useERByAdmissionId = (admissionId: string | undefined) => {
  return useQuery({
    queryKey: ["er-by-admission", admissionId],
    queryFn: async () => {
      if (!admissionId) return null;

      const { data, error } = await supabase
        .from("emergency_registrations")
        .select("id, er_number, triage_level, arrival_time, chief_complaint, is_trauma, is_mlc")
        .eq("admission_id", admissionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!admissionId,
  });
};

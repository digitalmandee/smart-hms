import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RiskCategory = 'low' | 'moderate' | 'high';
export type VisitType = 'booking' | 'routine' | 'emergency' | 'referred';
export type Presentation = 'cephalic' | 'breech' | 'transverse' | 'unstable' | 'not_applicable';
export type Edema = 'none' | 'mild' | 'moderate' | 'severe';

export interface ANCRecord {
  id: string;
  organization_id: string;
  branch_id: string | null;
  patient_id: string;
  pregnancy_id: string | null;
  lmp_date: string | null;
  edd_date: string | null;
  gravida: number | null;
  para: number | null;
  abortion: number | null;
  living: number | null;
  risk_category: RiskCategory | null;
  risk_factors: string[];
  visit_number: number | null;
  visit_date: string;
  visit_type: VisitType | null;
  gestational_age_weeks: number | null;
  gestational_age_days: number | null;
  weight_kg: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  fundal_height_cm: number | null;
  fetal_heart_rate: number | null;
  fetal_movements: string | null;
  presentation: Presentation | null;
  lie: string | null;
  engagement: string | null;
  edema: Edema | null;
  edema_location: string | null;
  hemoglobin: number | null;
  blood_group: string | null;
  rh_factor: string | null;
  urine_protein: string | null;
  urine_sugar: string | null;
  urine_albumin: string | null;
  hiv_status: string | null;
  vdrl_status: string | null;
  hbsag_status: string | null;
  blood_sugar_fasting: number | null;
  blood_sugar_random: number | null;
  ultrasound_done: boolean;
  ultrasound_findings: string | null;
  ultrasound_edd: string | null;
  iron_folic_given: boolean;
  calcium_given: boolean;
  tt1_given: boolean;
  tt1_date: string | null;
  tt2_given: boolean;
  tt2_date: string | null;
  advice: string | null;
  danger_signs_explained: boolean;
  birth_plan_discussed: boolean;
  next_visit_date: string | null;
  referred_to: string | null;
  referral_reason: string | null;
  notes: string | null;
  attended_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  patient?: any;
  doctor?: any;
}

export interface CreateANCRecordInput {
  branch_id?: string;
  patient_id: string;
  pregnancy_id?: string;
  lmp_date?: string;
  edd_date?: string;
  gravida?: number;
  para?: number;
  abortion?: number;
  living?: number;
  risk_category?: RiskCategory;
  risk_factors?: string[];
  visit_number?: number;
  visit_date: string;
  visit_type?: VisitType;
  gestational_age_weeks?: number;
  gestational_age_days?: number;
  weight_kg?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  fundal_height_cm?: number;
  fetal_heart_rate?: number;
  fetal_movements?: string;
  presentation?: Presentation;
  lie?: string;
  engagement?: string;
  edema?: Edema;
  edema_location?: string;
  hemoglobin?: number;
  blood_group?: string;
  rh_factor?: string;
  urine_protein?: string;
  urine_sugar?: string;
  urine_albumin?: string;
  hiv_status?: string;
  vdrl_status?: string;
  hbsag_status?: string;
  blood_sugar_fasting?: number;
  blood_sugar_random?: number;
  ultrasound_done?: boolean;
  ultrasound_findings?: string;
  ultrasound_edd?: string;
  iron_folic_given?: boolean;
  calcium_given?: boolean;
  tt1_given?: boolean;
  tt1_date?: string;
  tt2_given?: boolean;
  tt2_date?: string;
  advice?: string;
  danger_signs_explained?: boolean;
  birth_plan_discussed?: boolean;
  next_visit_date?: string;
  referred_to?: string;
  referral_reason?: string;
  notes?: string;
  attended_by?: string;
}

export function useANCRecords(patientId?: string, pregnancyId?: string) {
  return useQuery({
    queryKey: ["anc-records", patientId, pregnancyId],
    queryFn: async () => {
      let query = supabase
        .from("anc_records")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number, date_of_birth),
          doctor:attended_by(id, profiles(full_name))
        `)
        .order("visit_date", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      if (pregnancyId) {
        query = query.eq("pregnancy_id", pregnancyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ANCRecord[];
    },
  });
}

export function useANCRecord(id: string) {
  return useQuery({
    queryKey: ["anc-record", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anc_records")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number, date_of_birth, phone, address),
          doctor:attended_by(id, profiles(full_name), specialization)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ANCRecord;
    },
    enabled: !!id,
  });
}

export function usePatientPregnancies(patientId: string) {
  return useQuery({
    queryKey: ["patient-pregnancies", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anc_records")
        .select("pregnancy_id, lmp_date, edd_date, created_at")
        .eq("patient_id", patientId)
        .not("pregnancy_id", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by pregnancy_id and get the first visit for each
      const pregnancies = data.reduce((acc: any[], record) => {
        if (!acc.find(p => p.pregnancy_id === record.pregnancy_id)) {
          acc.push(record);
        }
        return acc;
      }, []);

      return pregnancies;
    },
    enabled: !!patientId,
  });
}

export function useCreateANCRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateANCRecordInput) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, branch_id")
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organization not found");
      }

      // Calculate EDD if LMP provided and EDD not set
      let eddDate = input.edd_date;
      if (input.lmp_date && !eddDate) {
        const lmp = new Date(input.lmp_date);
        lmp.setDate(lmp.getDate() + 280); // Add 280 days (40 weeks)
        eddDate = lmp.toISOString().split('T')[0];
      }

      // Calculate gestational age if LMP provided
      let gestationalWeeks = input.gestational_age_weeks;
      let gestationalDays = input.gestational_age_days;
      if (input.lmp_date && !gestationalWeeks) {
        const lmp = new Date(input.lmp_date);
        const today = new Date(input.visit_date);
        const diffDays = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
        gestationalWeeks = Math.floor(diffDays / 7);
        gestationalDays = diffDays % 7;
      }

      // Generate pregnancy_id if this is a booking visit or first visit
      let pregnancyId = input.pregnancy_id;
      if (!pregnancyId && (input.visit_type === 'booking' || input.visit_number === 1)) {
        pregnancyId = crypto.randomUUID();
      }

      const { data, error } = await supabase
        .from("anc_records")
        .insert({
          ...input,
          edd_date: eddDate,
          gestational_age_weeks: gestationalWeeks,
          gestational_age_days: gestationalDays,
          pregnancy_id: pregnancyId,
          organization_id: profile.organization_id,
          branch_id: input.branch_id || profile.branch_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anc-records"] });
      queryClient.invalidateQueries({ queryKey: ["patient-pregnancies"] });
      toast.success("ANC record created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create ANC record: ${error.message}`);
    },
  });
}

export function useUpdateANCRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateANCRecordInput & { id: string }) => {
      const { data, error } = await supabase
        .from("anc_records")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["anc-records"] });
      queryClient.invalidateQueries({ queryKey: ["anc-record", variables.id] });
      toast.success("ANC record updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ANC record: ${error.message}`);
    },
  });
}

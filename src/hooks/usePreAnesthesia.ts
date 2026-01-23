import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface PreAnesthesiaAssessment {
  id: string;
  surgery_id: string;
  patient_id: string;
  assessed_by: string;
  assessment_date: string;
  // Airway Assessment
  mallampati_score: number | null;
  mouth_opening_cm: number | null;
  thyromental_distance_cm: number | null;
  neck_mobility: string | null;
  dentition: string | null;
  dental_notes: string | null;
  anticipated_difficult_airway: boolean;
  airway_notes: string | null;
  // NPO Status
  last_solid_food: string | null;
  last_clear_liquid: string | null;
  npo_verified: boolean;
  npo_hours: number | null;
  // Previous Anesthesia
  previous_anesthesia: boolean | null;
  previous_anesthesia_problems: string | null;
  family_anesthesia_problems: string | null;
  malignant_hyperthermia_risk: boolean;
  // Medications
  current_medications: Json;
  anticoagulants: boolean;
  anticoagulant_details: string | null;
  last_anticoagulant_dose: string | null;
  // Allergies
  allergies_verified: boolean;
  allergy_notes: string | null;
  // Physical Exam
  heart_sounds: string | null;
  lung_sounds: string | null;
  iv_access_assessment: string | null;
  // Lab Review
  labs_reviewed: boolean;
  lab_abnormalities: string | null;
  ecg_reviewed: boolean;
  ecg_findings: string | null;
  chest_xray_reviewed: boolean;
  chest_xray_findings: string | null;
  // Risk Assessment
  asa_score: number | null;
  asa_emergency: boolean;
  cardiac_risk_score: string | null;
  pulmonary_risk_score: string | null;
  // Anesthesia Plan
  planned_anesthesia_type: string | null;
  planned_airway_management: string | null;
  planned_monitoring: string[] | null;
  special_considerations: string | null;
  // Blood Products
  blood_products_anticipated: boolean;
  blood_type_and_screen: boolean;
  units_crossmatched: number | null;
  // Consent
  risks_explained: boolean;
  questions_answered: boolean;
  patient_consents: boolean;
  cleared_for_anesthesia: boolean;
  clearance_notes: string | null;
  // Meta
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Joined
  assessed_by_profile?: { full_name: string } | null;
}

export interface CreatePreAnesthesiaData {
  surgery_id: string;
  patient_id: string;
  mallampati_score?: number;
  mouth_opening_cm?: number;
  thyromental_distance_cm?: number;
  neck_mobility?: string;
  dentition?: string;
  dental_notes?: string;
  anticipated_difficult_airway?: boolean;
  airway_notes?: string;
  last_solid_food?: string;
  last_clear_liquid?: string;
  npo_verified?: boolean;
  npo_hours?: number;
  previous_anesthesia?: boolean;
  previous_anesthesia_problems?: string;
  family_anesthesia_problems?: string;
  malignant_hyperthermia_risk?: boolean;
  current_medications?: Array<{ name: string; dose: string; frequency: string }>;
  anticoagulants?: boolean;
  anticoagulant_details?: string;
  last_anticoagulant_dose?: string;
  allergies_verified?: boolean;
  allergy_notes?: string;
  heart_sounds?: string;
  lung_sounds?: string;
  iv_access_assessment?: string;
  labs_reviewed?: boolean;
  lab_abnormalities?: string;
  ecg_reviewed?: boolean;
  ecg_findings?: string;
  chest_xray_reviewed?: boolean;
  chest_xray_findings?: string;
  asa_score?: number;
  asa_emergency?: boolean;
  cardiac_risk_score?: string;
  pulmonary_risk_score?: string;
  planned_anesthesia_type?: string;
  planned_airway_management?: string;
  planned_monitoring?: string[];
  special_considerations?: string;
  blood_products_anticipated?: boolean;
  blood_type_and_screen?: boolean;
  units_crossmatched?: number;
  risks_explained?: boolean;
  questions_answered?: boolean;
  patient_consents?: boolean;
  cleared_for_anesthesia?: boolean;
  clearance_notes?: string;
}

// Mallampati score options
export const MALLAMPATI_OPTIONS = [
  { value: 1, label: 'Class I - Full visibility of tonsils, uvula and soft palate' },
  { value: 2, label: 'Class II - Visibility of hard and soft palate, upper uvula and tonsils' },
  { value: 3, label: 'Class III - Soft and hard palate and base of uvula visible' },
  { value: 4, label: 'Class IV - Only hard palate visible' },
];

// ASA Physical Status
export const ASA_OPTIONS = [
  { value: 1, label: 'ASA I - Healthy patient' },
  { value: 2, label: 'ASA II - Mild systemic disease' },
  { value: 3, label: 'ASA III - Severe systemic disease' },
  { value: 4, label: 'ASA IV - Severe systemic disease that is a constant threat to life' },
  { value: 5, label: 'ASA V - Moribund patient not expected to survive without surgery' },
  { value: 6, label: 'ASA VI - Brain-dead patient for organ donation' },
];

// Anesthesia types
export const ANESTHESIA_TYPE_OPTIONS = [
  { value: 'general', label: 'General Anesthesia' },
  { value: 'spinal', label: 'Spinal Anesthesia' },
  { value: 'epidural', label: 'Epidural Anesthesia' },
  { value: 'combined_spinal_epidural', label: 'Combined Spinal-Epidural' },
  { value: 'regional', label: 'Regional/Nerve Block' },
  { value: 'local_with_sedation', label: 'Local with Sedation (MAC)' },
  { value: 'local', label: 'Local Anesthesia Only' },
];

// Airway management
export const AIRWAY_OPTIONS = [
  { value: 'mask', label: 'Face Mask' },
  { value: 'lma', label: 'Laryngeal Mask Airway (LMA)' },
  { value: 'ett', label: 'Endotracheal Tube (ETT)' },
  { value: 'fiber_optic', label: 'Fiber-optic Intubation' },
  { value: 'video_laryngoscopy', label: 'Video Laryngoscopy' },
  { value: 'awake_intubation', label: 'Awake Intubation' },
];

// Monitoring options
export const MONITORING_OPTIONS = [
  { value: 'standard', label: 'Standard (ECG, NIBP, SpO2, EtCO2)' },
  { value: 'arterial_line', label: 'Arterial Line' },
  { value: 'cvp', label: 'Central Venous Pressure' },
  { value: 'pa_catheter', label: 'PA Catheter' },
  { value: 'tee', label: 'TEE' },
  { value: 'bis', label: 'BIS Monitor' },
  { value: 'nerve_stimulator', label: 'Nerve Stimulator' },
  { value: 'temp', label: 'Temperature' },
  { value: 'urine_output', label: 'Urine Output' },
];

export function usePreAnesthesiaAssessment(surgeryId?: string) {
  return useQuery({
    queryKey: ['pre-anesthesia', surgeryId],
    queryFn: async () => {
      if (!surgeryId) return null;

      const { data, error } = await supabase
        .from('pre_anesthesia_assessments')
        .select(`
          *,
          assessed_by_profile:profiles!pre_anesthesia_assessments_assessed_by_fkey(full_name)
        `)
        .eq('surgery_id', surgeryId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PreAnesthesiaAssessment | null;
    },
    enabled: !!surgeryId,
  });
}

export function usePendingPACAssessments(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['pending-pac-assessments', profile?.organization_id, branchId],
    queryFn: async () => {
      // Get surgeries scheduled for today and tomorrow that don't have PAC done
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let query = supabase
        .from('surgeries')
        .select(`
          id,
          surgery_number,
          procedure_name,
          scheduled_date,
          scheduled_start_time,
          patient:patients(id, first_name, last_name, patient_number),
          lead_surgeon:doctors(profile:profiles(full_name))
        `)
        .eq('organization_id', profile?.organization_id!)
        .gte('scheduled_date', today.toISOString().split('T')[0])
        .lte('scheduled_date', tomorrow.toISOString().split('T')[0])
        .in('status', ['scheduled'])
        .order('scheduled_date')
        .order('scheduled_start_time');

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data: surgeries, error: surgeryError } = await query;
      if (surgeryError) throw surgeryError;

      // Get existing PAC assessments
      const surgeryIds = surgeries?.map(s => s.id) || [];
      if (surgeryIds.length === 0) return [];

      const { data: pacAssessments } = await supabase
        .from('pre_anesthesia_assessments')
        .select('surgery_id')
        .in('surgery_id', surgeryIds);

      const assessedSurgeryIds = new Set(pacAssessments?.map(p => p.surgery_id) || []);

      // Return surgeries without PAC
      return surgeries?.filter(s => !assessedSurgeryIds.has(s.id)) || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreatePreAnesthesia() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (assessment: CreatePreAnesthesiaData) => {
      const { data, error } = await supabase
        .from('pre_anesthesia_assessments')
        .insert({
          surgery_id: assessment.surgery_id,
          patient_id: assessment.patient_id,
          assessed_by: profile?.id!,
          assessment_date: new Date().toISOString().split('T')[0],
          mallampati_score: assessment.mallampati_score,
          mouth_opening_cm: assessment.mouth_opening_cm,
          thyromental_distance_cm: assessment.thyromental_distance_cm,
          neck_mobility: assessment.neck_mobility,
          dentition: assessment.dentition,
          dental_notes: assessment.dental_notes,
          anticipated_difficult_airway: assessment.anticipated_difficult_airway || false,
          airway_notes: assessment.airway_notes,
          last_solid_food: assessment.last_solid_food,
          last_clear_liquid: assessment.last_clear_liquid,
          npo_verified: assessment.npo_verified || false,
          npo_hours: assessment.npo_hours,
          previous_anesthesia: assessment.previous_anesthesia,
          previous_anesthesia_problems: assessment.previous_anesthesia_problems,
          family_anesthesia_problems: assessment.family_anesthesia_problems,
          malignant_hyperthermia_risk: assessment.malignant_hyperthermia_risk || false,
          current_medications: assessment.current_medications || [],
          anticoagulants: assessment.anticoagulants || false,
          anticoagulant_details: assessment.anticoagulant_details,
          last_anticoagulant_dose: assessment.last_anticoagulant_dose,
          allergies_verified: assessment.allergies_verified || false,
          allergy_notes: assessment.allergy_notes,
          heart_sounds: assessment.heart_sounds,
          lung_sounds: assessment.lung_sounds,
          iv_access_assessment: assessment.iv_access_assessment,
          labs_reviewed: assessment.labs_reviewed || false,
          lab_abnormalities: assessment.lab_abnormalities,
          ecg_reviewed: assessment.ecg_reviewed || false,
          ecg_findings: assessment.ecg_findings,
          chest_xray_reviewed: assessment.chest_xray_reviewed || false,
          chest_xray_findings: assessment.chest_xray_findings,
          asa_score: assessment.asa_score,
          asa_emergency: assessment.asa_emergency || false,
          cardiac_risk_score: assessment.cardiac_risk_score,
          pulmonary_risk_score: assessment.pulmonary_risk_score,
          planned_anesthesia_type: assessment.planned_anesthesia_type,
          planned_airway_management: assessment.planned_airway_management,
          planned_monitoring: assessment.planned_monitoring,
          special_considerations: assessment.special_considerations,
          blood_products_anticipated: assessment.blood_products_anticipated || false,
          blood_type_and_screen: assessment.blood_type_and_screen || false,
          units_crossmatched: assessment.units_crossmatched,
          risks_explained: assessment.risks_explained || false,
          questions_answered: assessment.questions_answered || false,
          patient_consents: assessment.patient_consents || false,
          cleared_for_anesthesia: assessment.cleared_for_anesthesia || false,
          clearance_notes: assessment.clearance_notes,
          organization_id: profile?.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pre-anesthesia', variables.surgery_id] });
      queryClient.invalidateQueries({ queryKey: ['pending-pac-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgery_id] });
      toast.success('Pre-anesthesia assessment saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save assessment');
    },
  });
}

export function useUpdatePreAnesthesia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, surgeryId, ...updates }: Partial<PreAnesthesiaAssessment> & { id: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('pre_anesthesia_assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pre-anesthesia', result.surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['pending-pac-assessments'] });
      toast.success('Pre-anesthesia assessment updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update assessment');
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Interface matching actual database schema
export interface PreAnesthesiaAssessment {
  id: string;
  surgery_id: string;
  organization_id: string;
  assessed_by: string | null;
  assessment_date: string | null;
  // Airway Assessment
  mallampati_score: string | null;
  mouth_opening: string | null;
  thyromental_distance: string | null;
  neck_mobility: string | null;
  dental_status: string | null;
  airway_notes: string | null;
  predicted_difficult_airway: boolean | null;
  // NPO Status
  last_solid_food: string | null;
  last_clear_fluid: string | null;
  npo_verified: boolean | null;
  npo_notes: string | null;
  // Previous Anesthesia
  previous_anesthesia: boolean | null;
  previous_anesthesia_type: string | null;
  previous_complications: boolean | null;
  previous_complications_details: string | null;
  family_anesthesia_complications: boolean | null;
  family_complications_details: string | null;
  // Vitals & Physical
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  blood_pressure: string | null;
  heart_rate: number | null;
  spo2: number | null;
  // Lab Values
  hemoglobin: number | null;
  blood_sugar: number | null;
  creatinine: number | null;
  platelets: number | null;
  inr: number | null;
  // Allergies & Medications
  known_allergies: Json | null;
  latex_allergy: boolean | null;
  current_medications: Json | null;
  anticoagulant_status: string | null;
  last_anticoagulant_dose: string | null;
  // Investigations
  ecg_findings: string | null;
  chest_xray_findings: string | null;
  // Risk Scores
  asa_class_id: string | null;
  cardiac_risk_score: string | null;
  pulmonary_risk_score: string | null;
  overall_risk: string | null;
  // Anesthesia Plan
  planned_anesthesia_type_id: string | null;
  planned_airway_device_id: string | null;
  planned_position_id: string | null;
  special_considerations: string | null;
  // Consent
  consent_obtained: boolean | null;
  consent_obtained_at: string | null;
  consent_notes: string | null;
  // Clearance
  status: string | null;
  clearance_notes: string | null;
  // Meta
  created_at: string | null;
  updated_at: string | null;
  // Joined
  assessed_by_profile?: { full_name: string } | null;
}

export interface CreatePreAnesthesiaData {
  surgery_id: string;
  // Airway Assessment
  mallampati_score?: string;
  mouth_opening?: string;
  thyromental_distance?: string;
  neck_mobility?: string;
  dental_status?: string;
  airway_notes?: string;
  predicted_difficult_airway?: boolean;
  // NPO Status
  last_solid_food?: string;
  last_clear_fluid?: string;
  npo_verified?: boolean;
  npo_notes?: string;
  // Previous Anesthesia
  previous_anesthesia?: boolean;
  previous_anesthesia_type?: string;
  previous_complications?: boolean;
  previous_complications_details?: string;
  family_anesthesia_complications?: boolean;
  family_complications_details?: string;
  // Vitals & Physical
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  blood_pressure?: string;
  heart_rate?: number;
  spo2?: number;
  // Lab Values
  hemoglobin?: number;
  blood_sugar?: number;
  creatinine?: number;
  platelets?: number;
  inr?: number;
  // Allergies & Medications
  known_allergies?: Array<{ allergen: string; reaction: string }>;
  latex_allergy?: boolean;
  current_medications?: Array<{ name: string; dose: string; frequency: string }>;
  anticoagulant_status?: string;
  last_anticoagulant_dose?: string;
  // Investigations
  ecg_findings?: string;
  chest_xray_findings?: string;
  // Risk Scores
  asa_class_id?: string;
  cardiac_risk_score?: string;
  pulmonary_risk_score?: string;
  overall_risk?: string;
  // Anesthesia Plan
  planned_anesthesia_type_id?: string;
  planned_airway_device_id?: string;
  planned_position_id?: string;
  special_considerations?: string;
  // Consent
  consent_obtained?: boolean;
  consent_notes?: string;
  // Clearance
  status?: string;
  clearance_notes?: string;
}

// Mallampati score options
export const MALLAMPATI_OPTIONS = [
  { value: 'I', label: 'Class I - Full visibility of tonsils, uvula and soft palate' },
  { value: 'II', label: 'Class II - Visibility of hard and soft palate, upper uvula and tonsils' },
  { value: 'III', label: 'Class III - Soft and hard palate and base of uvula visible' },
  { value: 'IV', label: 'Class IV - Only hard palate visible' },
];

// ASA Physical Status
export const ASA_OPTIONS = [
  { value: 'I', label: 'ASA I - Healthy patient' },
  { value: 'II', label: 'ASA II - Mild systemic disease' },
  { value: 'III', label: 'ASA III - Severe systemic disease' },
  { value: 'IV', label: 'ASA IV - Severe systemic disease that is a constant threat to life' },
  { value: 'V', label: 'ASA V - Moribund patient not expected to survive without surgery' },
  { value: 'VI', label: 'ASA VI - Brain-dead patient for organ donation' },
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

// Mouth opening options
export const MOUTH_OPENING_OPTIONS = [
  { value: 'normal', label: 'Normal (>3 fingers / >4cm)' },
  { value: 'reduced', label: 'Reduced (2-3 fingers / 2-4cm)' },
  { value: 'limited', label: 'Limited (<2 fingers / <2cm)' },
];

// Neck mobility options
export const NECK_MOBILITY_OPTIONS = [
  { value: 'full', label: 'Full Range' },
  { value: 'limited', label: 'Limited' },
  { value: 'immobile', label: 'Immobile/Fixed' },
];

// Risk score options
export const OVERALL_RISK_OPTIONS = [
  { value: 'low', label: 'Low Risk' },
  { value: 'moderate', label: 'Moderate Risk' },
  { value: 'high', label: 'High Risk' },
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
          assessed_by_doctor:doctors!pre_anesthesia_assessments_assessed_by_fkey(
            profile:profiles(full_name)
          )
        `)
        .eq('surgery_id', surgeryId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Transform the nested structure
      if (data) {
        const transformed = {
          ...data,
          assessed_by_profile: data.assessed_by_doctor?.profile || null,
        };
        delete (transformed as any).assessed_by_doctor;
        return transformed as PreAnesthesiaAssessment;
      }
      return null;
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
          assessed_by: profile?.id!,
          assessment_date: new Date().toISOString(),
          organization_id: profile?.organization_id!,
          // Airway
          mallampati_score: assessment.mallampati_score,
          mouth_opening: assessment.mouth_opening,
          thyromental_distance: assessment.thyromental_distance,
          neck_mobility: assessment.neck_mobility,
          dental_status: assessment.dental_status,
          airway_notes: assessment.airway_notes,
          predicted_difficult_airway: assessment.predicted_difficult_airway || false,
          // NPO
          last_solid_food: assessment.last_solid_food,
          last_clear_fluid: assessment.last_clear_fluid,
          npo_verified: assessment.npo_verified || false,
          npo_notes: assessment.npo_notes,
          // Previous Anesthesia
          previous_anesthesia: assessment.previous_anesthesia,
          previous_anesthesia_type: assessment.previous_anesthesia_type,
          previous_complications: assessment.previous_complications,
          previous_complications_details: assessment.previous_complications_details,
          family_anesthesia_complications: assessment.family_anesthesia_complications,
          family_complications_details: assessment.family_complications_details,
          // Vitals
          height_cm: assessment.height_cm,
          weight_kg: assessment.weight_kg,
          bmi: assessment.bmi,
          blood_pressure: assessment.blood_pressure,
          heart_rate: assessment.heart_rate,
          spo2: assessment.spo2,
          // Labs
          hemoglobin: assessment.hemoglobin,
          blood_sugar: assessment.blood_sugar,
          creatinine: assessment.creatinine,
          platelets: assessment.platelets,
          inr: assessment.inr,
          // Allergies & Medications
          known_allergies: assessment.known_allergies || [],
          latex_allergy: assessment.latex_allergy || false,
          current_medications: assessment.current_medications || [],
          anticoagulant_status: assessment.anticoagulant_status,
          last_anticoagulant_dose: assessment.last_anticoagulant_dose,
          // Investigations
          ecg_findings: assessment.ecg_findings,
          chest_xray_findings: assessment.chest_xray_findings,
          // Risk Scores
          asa_class_id: assessment.asa_class_id,
          cardiac_risk_score: assessment.cardiac_risk_score,
          pulmonary_risk_score: assessment.pulmonary_risk_score,
          overall_risk: assessment.overall_risk,
          // Plan
          planned_anesthesia_type_id: assessment.planned_anesthesia_type_id,
          planned_airway_device_id: assessment.planned_airway_device_id,
          planned_position_id: assessment.planned_position_id,
          special_considerations: assessment.special_considerations,
          // Consent
          consent_obtained: assessment.consent_obtained || false,
          consent_obtained_at: assessment.consent_obtained ? new Date().toISOString() : null,
          consent_notes: assessment.consent_notes,
          // Status
          status: assessment.status || 'pending',
          clearance_notes: assessment.clearance_notes,
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
    mutationFn: async ({ id, surgeryId, ...updates }: Partial<CreatePreAnesthesiaData> & { id: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('pre_anesthesia_assessments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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

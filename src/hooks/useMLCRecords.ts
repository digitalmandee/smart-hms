import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type MLCCaseType = 'assault' | 'road_accident' | 'fall' | 'burns' | 'poisoning' | 'sexual_assault' | 'animal_bite' | 'firearm' | 'stab_wound' | 'industrial' | 'drowning' | 'electrocution' | 'hanging' | 'other';
export type BroughtBy = 'police' | 'self' | 'relative' | 'ambulance' | 'passerby' | 'other';
export type ConsciousLevel = 'conscious' | 'semiconscious' | 'unconscious';
export type GeneralCondition = 'stable' | 'unstable' | 'critical' | 'dead_on_arrival';
export type NatureOfInjuries = 'simple' | 'grievous' | 'dangerous_to_life';
export type MLCDisposition = 'discharged' | 'admitted' | 'referred' | 'lama' | 'absconded' | 'expired';

export interface InjuryDetail {
  location?: string;
  type?: string;
  size?: string;
  color?: string;
  age_of_injury?: string;
  [key: string]: string | undefined;
}

export interface SampleCollected {
  type?: string;
  quantity?: string;
  sealed?: boolean;
  label?: string;
  [key: string]: string | boolean | undefined;
}

export interface MLCRecord {
  id: string;
  organization_id: string;
  branch_id: string | null;
  patient_id: string;
  emergency_registration_id: string | null;
  mlc_number: string;
  incident_date: string | null;
  incident_time: string | null;
  incident_place: string | null;
  incident_description: string | null;
  case_type: MLCCaseType | null;
  brought_by: BroughtBy | null;
  brought_by_name: string | null;
  brought_by_relation: string | null;
  brought_by_cnic: string | null;
  brought_by_phone: string | null;
  police_station: string | null;
  police_officer_name: string | null;
  police_officer_rank: string | null;
  fir_number: string | null;
  fir_date: string | null;
  dd_number: string | null;
  arrival_time: string | null;
  conscious_level: ConsciousLevel | null;
  oriented: boolean | null;
  general_condition: GeneralCondition | null;
  alcohol_intoxication: boolean;
  drug_intoxication: boolean;
  injuries_description: string | null;
  injury_details: any[];
  nature_of_injuries: NatureOfInjuries | null;
  probable_weapon: string | null;
  probable_cause: string | null;
  age_of_injuries: string | null;
  medical_opinion: string | null;
  samples_collected: any[];
  clothing_preserved: boolean;
  clothing_description: string | null;
  photographs_taken: boolean;
  photograph_count: number | null;
  evidence_handed_to: string | null;
  evidence_receiver_name: string | null;
  evidence_receiver_designation: string | null;
  evidence_handed_at: string | null;
  evidence_receipt_number: string | null;
  treatment_given: string | null;
  disposition: MLCDisposition | null;
  referred_to: string | null;
  examined_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  patient?: any;
  doctor?: any;
}

export interface CreateMLCRecordInput {
  branch_id?: string;
  patient_id: string;
  emergency_registration_id?: string;
  incident_date?: string;
  incident_time?: string;
  incident_place?: string;
  incident_description?: string;
  case_type?: MLCCaseType;
  brought_by?: BroughtBy;
  brought_by_name?: string;
  brought_by_relation?: string;
  brought_by_cnic?: string;
  brought_by_phone?: string;
  police_station?: string;
  police_officer_name?: string;
  police_officer_rank?: string;
  fir_number?: string;
  fir_date?: string;
  dd_number?: string;
  arrival_time?: string;
  conscious_level?: ConsciousLevel;
  oriented?: boolean;
  general_condition?: GeneralCondition;
  alcohol_intoxication?: boolean;
  drug_intoxication?: boolean;
  injuries_description?: string;
  injury_details?: InjuryDetail[];
  nature_of_injuries?: NatureOfInjuries;
  probable_weapon?: string;
  probable_cause?: string;
  age_of_injuries?: string;
  medical_opinion?: string;
  samples_collected?: SampleCollected[];
  clothing_preserved?: boolean;
  clothing_description?: string;
  photographs_taken?: boolean;
  photograph_count?: number;
  treatment_given?: string;
  disposition?: MLCDisposition;
  referred_to?: string;
  examined_by?: string;
  notes?: string;
}

export function useMLCRecords(branchId?: string) {
  return useQuery({
    queryKey: ["mlc-records", branchId],
    queryFn: async () => {
      let query = supabase
        .from("mlc_records")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number, date_of_birth, gender),
          doctor:examined_by(id, profiles(full_name))
        `)
        .order("created_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as MLCRecord[];
    },
  });
}

export function useMLCRecord(id: string) {
  return useQuery({
    queryKey: ["mlc-record", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mlc_records")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number, date_of_birth, gender, phone, address, blood_group),
          doctor:examined_by(id, profiles(full_name), specialization),
          emergency:emergency_registration_id(id, er_number)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as MLCRecord;
    },
    enabled: !!id,
  });
}

export function useCreateMLCRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMLCRecordInput) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, branch_id")
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organization not found");
      }

      const insertData = {
        ...input,
        organization_id: profile.organization_id,
        branch_id: input.branch_id || profile.branch_id,
        arrival_time: input.arrival_time || new Date().toISOString(),
        injury_details: input.injury_details || [],
        samples_collected: input.samples_collected || [],
      };

      const { data, error } = await supabase
        .from("mlc_records")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlc-records"] });
      toast.success("MLC record created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create MLC record: ${error.message}`);
    },
  });
}

export function useUpdateMLCRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateMLCRecordInput & { id: string }) => {
      const { data, error } = await supabase
        .from("mlc_records")
        .update(input as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mlc-records"] });
      queryClient.invalidateQueries({ queryKey: ["mlc-record", variables.id] });
      toast.success("MLC record updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update MLC record: ${error.message}`);
    },
  });
}

export function useHandoverEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      evidence_handed_to,
      evidence_receiver_name,
      evidence_receiver_designation,
      evidence_receipt_number,
    }: {
      id: string;
      evidence_handed_to: string;
      evidence_receiver_name: string;
      evidence_receiver_designation: string;
      evidence_receipt_number?: string;
    }) => {
      const { data, error } = await supabase
        .from("mlc_records")
        .update({
          evidence_handed_to,
          evidence_receiver_name,
          evidence_receiver_designation,
          evidence_receipt_number,
          evidence_handed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mlc-records"] });
      queryClient.invalidateQueries({ queryKey: ["mlc-record", variables.id] });
      toast.success("Evidence handover documented successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to document evidence handover: ${error.message}`);
    },
  });
}

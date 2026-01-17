import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BirthRecord {
  id: string;
  organization_id: string;
  branch_id: string | null;
  mother_patient_id: string;
  baby_patient_id: string | null;
  admission_id: string | null;
  birth_date: string;
  birth_time: string;
  delivery_type: 'normal' | 'cesarean' | 'assisted' | 'vacuum' | 'forceps' | null;
  place_of_birth: string | null;
  birth_weight_grams: number | null;
  birth_length_cm: number | null;
  head_circumference_cm: number | null;
  chest_circumference_cm: number | null;
  gender: 'male' | 'female' | 'ambiguous' | null;
  apgar_1min: number | null;
  apgar_5min: number | null;
  apgar_10min: number | null;
  complications: any[];
  resuscitation_required: boolean;
  nicu_admission: boolean;
  condition_at_birth: string | null;
  father_name: string | null;
  father_cnic: string | null;
  father_occupation: string | null;
  father_address: string | null;
  delivered_by: string | null;
  attended_by: any[];
  certificate_number: string | null;
  certificate_issued_at: string | null;
  certificate_issued_by: string | null;
  bcg_given: boolean;
  opv0_given: boolean;
  hep_b_given: boolean;
  vitamin_k_given: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  mother?: any;
  baby?: any;
  doctor?: any;
}

export interface CreateBirthRecordInput {
  branch_id?: string;
  mother_patient_id: string;
  baby_patient_id?: string;
  admission_id?: string;
  birth_date: string;
  birth_time: string;
  delivery_type?: string;
  place_of_birth?: string;
  birth_weight_grams?: number;
  birth_length_cm?: number;
  head_circumference_cm?: number;
  chest_circumference_cm?: number;
  gender?: string;
  apgar_1min?: number;
  apgar_5min?: number;
  apgar_10min?: number;
  complications?: any[];
  resuscitation_required?: boolean;
  nicu_admission?: boolean;
  condition_at_birth?: string;
  father_name?: string;
  father_cnic?: string;
  father_occupation?: string;
  father_address?: string;
  delivered_by?: string;
  attended_by?: any[];
  bcg_given?: boolean;
  opv0_given?: boolean;
  hep_b_given?: boolean;
  vitamin_k_given?: boolean;
  notes?: string;
}

export function useBirthRecords(branchId?: string) {
  return useQuery({
    queryKey: ["birth-records", branchId],
    queryFn: async () => {
      let query = supabase
        .from("birth_records")
        .select(`
          *,
          mother:mother_patient_id(id, first_name, last_name, patient_number),
          baby:baby_patient_id(id, first_name, last_name, patient_number),
          doctor:delivered_by(id, profiles(full_name))
        `)
        .order("birth_date", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BirthRecord[];
    },
  });
}

export function useBirthRecord(id: string) {
  return useQuery({
    queryKey: ["birth-record", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("birth_records")
        .select(`
          *,
          mother:mother_patient_id(id, first_name, last_name, patient_number, date_of_birth, gender, phone, address),
          baby:baby_patient_id(id, first_name, last_name, patient_number),
          doctor:delivered_by(id, profiles(full_name)),
          admission:admission_id(id, admission_number)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BirthRecord;
    },
    enabled: !!id,
  });
}

export function useCreateBirthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBirthRecordInput) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, branch_id")
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organization not found");
      }

      const { data, error } = await supabase
        .from("birth_records")
        .insert({
          ...input,
          organization_id: profile.organization_id,
          branch_id: input.branch_id || profile.branch_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birth-records"] });
      toast.success("Birth record created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create birth record: ${error.message}`);
    },
  });
}

export function useUpdateBirthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateBirthRecordInput & { id: string }) => {
      const { data, error } = await supabase
        .from("birth_records")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["birth-records"] });
      queryClient.invalidateQueries({ queryKey: ["birth-record", variables.id] });
      toast.success("Birth record updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update birth record: ${error.message}`);
    },
  });
}

export function useIssueBirthCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("birth_records")
        .update({
          certificate_issued_at: new Date().toISOString(),
          certificate_issued_by: user.user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["birth-records"] });
      queryClient.invalidateQueries({ queryKey: ["birth-record", id] });
      toast.success("Birth certificate issued successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to issue certificate: ${error.message}`);
    },
  });
}

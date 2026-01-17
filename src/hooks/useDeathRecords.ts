import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeathRecord {
  id: string;
  organization_id: string;
  branch_id: string | null;
  patient_id: string;
  admission_id: string | null;
  death_date: string;
  death_time: string;
  place_of_death: string | null;
  immediate_cause: string | null;
  immediate_cause_interval: string | null;
  antecedent_cause: string | null;
  antecedent_cause_interval: string | null;
  underlying_cause: string | null;
  underlying_cause_interval: string | null;
  contributing_conditions: string | null;
  manner_of_death: 'natural' | 'accident' | 'suicide' | 'homicide' | 'pending' | 'undetermined' | null;
  is_mlc: boolean;
  mlc_number: string | null;
  autopsy_performed: boolean;
  autopsy_findings: string | null;
  certifying_physician_id: string | null;
  certificate_number: string | null;
  certificate_issued_at: string | null;
  body_condition: string | null;
  body_released_to: string | null;
  body_released_relation: string | null;
  body_released_cnic: string | null;
  body_released_at: string | null;
  body_released_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  patient?: any;
  doctor?: any;
}

export interface CreateDeathRecordInput {
  branch_id?: string;
  patient_id: string;
  admission_id?: string;
  death_date: string;
  death_time: string;
  place_of_death?: string;
  immediate_cause?: string;
  immediate_cause_interval?: string;
  antecedent_cause?: string;
  antecedent_cause_interval?: string;
  underlying_cause?: string;
  underlying_cause_interval?: string;
  contributing_conditions?: string;
  manner_of_death?: string;
  is_mlc?: boolean;
  mlc_number?: string;
  autopsy_performed?: boolean;
  autopsy_findings?: string;
  certifying_physician_id?: string;
  body_condition?: string;
  body_released_to?: string;
  body_released_relation?: string;
  body_released_cnic?: string;
  notes?: string;
}

export function useDeathRecords(branchId?: string) {
  return useQuery({
    queryKey: ["death-records", branchId],
    queryFn: async () => {
      let query = supabase
        .from("death_records")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number, date_of_birth, gender),
          doctor:certifying_physician_id(id, profiles(full_name))
        `)
        .order("death_date", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DeathRecord[];
    },
  });
}

export function useDeathRecord(id: string) {
  return useQuery({
    queryKey: ["death-record", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("death_records")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number, date_of_birth, gender, phone, address, blood_group),
          doctor:certifying_physician_id(id, profiles(full_name)),
          admission:admission_id(id, admission_number, admission_date)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as DeathRecord;
    },
    enabled: !!id,
  });
}

export function useCreateDeathRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDeathRecordInput) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, branch_id")
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organization not found");
      }

      const { data, error } = await supabase
        .from("death_records")
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
      queryClient.invalidateQueries({ queryKey: ["death-records"] });
      toast.success("Death record created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create death record: ${error.message}`);
    },
  });
}

export function useUpdateDeathRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateDeathRecordInput & { id: string }) => {
      const { data, error } = await supabase
        .from("death_records")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["death-records"] });
      queryClient.invalidateQueries({ queryKey: ["death-record", variables.id] });
      toast.success("Death record updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update death record: ${error.message}`);
    },
  });
}

export function useReleaseBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      body_released_to, 
      body_released_relation, 
      body_released_cnic 
    }: { 
      id: string; 
      body_released_to: string;
      body_released_relation: string;
      body_released_cnic: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("death_records")
        .update({
          body_released_to,
          body_released_relation,
          body_released_cnic,
          body_released_at: new Date().toISOString(),
          body_released_by: user.user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["death-records"] });
      queryClient.invalidateQueries({ queryKey: ["death-record", variables.id] });
      toast.success("Body release documented successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to document body release: ${error.message}`);
    },
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("death_records")
        .update({
          certificate_issued_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["death-records"] });
      queryClient.invalidateQueries({ queryKey: ["death-record", id] });
      toast.success("Death certificate issued successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to issue certificate: ${error.message}`);
    },
  });
}

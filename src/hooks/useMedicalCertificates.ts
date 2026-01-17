import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CertificateType = 'fitness' | 'sick_leave' | 'disability' | 'vaccination' | 'medical_report' | 'medical_legal' | 'age_verification';
export type FitnessStatus = 'fit' | 'unfit' | 'fit_with_restrictions' | 'temporarily_unfit';

export interface MedicalCertificate {
  id: string;
  organization_id: string;
  branch_id: string | null;
  patient_id: string;
  certificate_type: CertificateType;
  certificate_number: string | null;
  purpose: string | null;
  valid_from: string | null;
  valid_to: string | null;
  findings: string | null;
  recommendations: string | null;
  restrictions: string | null;
  leave_from: string | null;
  leave_to: string | null;
  leave_days: number | null;
  diagnosis: string | null;
  fitness_status: FitnessStatus | null;
  job_type: string | null;
  employer_name: string | null;
  disability_percentage: number | null;
  disability_type: string | null;
  issued_by: string | null;
  issued_at: string | null;
  print_count: number;
  last_printed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: any;
  doctor?: any;
}

export interface CreateCertificateInput {
  branch_id?: string;
  patient_id: string;
  certificate_type: CertificateType;
  purpose?: string;
  valid_from?: string;
  valid_to?: string;
  findings?: string;
  recommendations?: string;
  restrictions?: string;
  leave_from?: string;
  leave_to?: string;
  leave_days?: number;
  diagnosis?: string;
  fitness_status?: FitnessStatus;
  job_type?: string;
  employer_name?: string;
  disability_percentage?: number;
  disability_type?: string;
  issued_by?: string;
  notes?: string;
}

export function useMedicalCertificates(patientId?: string, certificateType?: CertificateType) {
  return useQuery({
    queryKey: ["medical-certificates", patientId, certificateType],
    queryFn: async () => {
      let query = supabase
        .from("medical_certificates")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number),
          doctor:issued_by(id, profiles(full_name))
        `)
        .order("issued_at", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      if (certificateType) {
        query = query.eq("certificate_type", certificateType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MedicalCertificate[];
    },
  });
}

export function useMedicalCertificate(id: string) {
  return useQuery({
    queryKey: ["medical-certificate", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_certificates")
        .select(`
          *,
          patient:patient_id(id, first_name, last_name, patient_number, date_of_birth, gender, phone, address, blood_group),
          doctor:issued_by(id, profiles(full_name), specialization)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as MedicalCertificate;
    },
    enabled: !!id,
  });
}

export function useCreateMedicalCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCertificateInput) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, branch_id")
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organization not found");
      }

      // Calculate leave days if not provided
      let leaveDays = input.leave_days;
      if (input.leave_from && input.leave_to && !leaveDays) {
        const start = new Date(input.leave_from);
        const end = new Date(input.leave_to);
        leaveDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }

      const { data, error } = await supabase
        .from("medical_certificates")
        .insert({
          ...input,
          leave_days: leaveDays,
          organization_id: profile.organization_id,
          branch_id: input.branch_id || profile.branch_id,
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-certificates"] });
      toast.success("Certificate created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create certificate: ${error.message}`);
    },
  });
}

export function useUpdateMedicalCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateCertificateInput & { id: string }) => {
      const { data, error } = await supabase
        .from("medical_certificates")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medical-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["medical-certificate", variables.id] });
      toast.success("Certificate updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update certificate: ${error.message}`);
    },
  });
}

export function useIncrementPrintCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current, error: fetchError } = await supabase
        .from("medical_certificates")
        .select("print_count")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from("medical_certificates")
        .update({
          print_count: (current?.print_count || 0) + 1,
          last_printed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["medical-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["medical-certificate", id] });
    },
  });
}

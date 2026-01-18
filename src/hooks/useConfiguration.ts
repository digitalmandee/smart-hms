import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for configuration tables (not yet in generated types)
interface Specialization {
  id: string;
  organization_id: string | null;
  name: string;
  code: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface Qualification {
  id: string;
  organization_id: string | null;
  name: string;
  abbreviation: string | null;
  is_active: boolean;
  created_at: string;
}

interface DoctorFeeScheduleItem {
  id: string;
  doctor_id: string;
  appointment_type: string;
  fee: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Specializations hook
export function useSpecializations() {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("specializations")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return data as Specialization[];
    },
  });
}

export function useCreateSpecialization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; code?: string; display_order?: number }) => {
      const { data: result, error } = await (supabase as any)
        .from("specializations")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as Specialization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success("Specialization created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create specialization: " + error.message);
    },
  });
}

export function useUpdateSpecialization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; code?: string; is_active?: boolean; display_order?: number }) => {
      const { data: result, error } = await (supabase as any)
        .from("specializations")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result as Specialization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success("Specialization updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update specialization: " + error.message);
    },
  });
}

export function useDeleteSpecialization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("specializations")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success("Specialization removed");
    },
    onError: (error) => {
      toast.error("Failed to remove specialization: " + error.message);
    },
  });
}

// Qualifications hook
export function useQualifications() {
  return useQuery({
    queryKey: ["qualifications"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("qualifications")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as Qualification[];
    },
  });
}

export function useCreateQualification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; abbreviation?: string }) => {
      const { data: result, error } = await (supabase as any)
        .from("qualifications")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as Qualification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualifications"] });
      toast.success("Qualification created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create qualification: " + error.message);
    },
  });
}

export function useUpdateQualification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; abbreviation?: string; is_active?: boolean }) => {
      const { data: result, error } = await (supabase as any)
        .from("qualifications")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result as Qualification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualifications"] });
      toast.success("Qualification updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update qualification: " + error.message);
    },
  });
}

export function useDeleteQualification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("qualifications")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualifications"] });
      toast.success("Qualification removed");
    },
    onError: (error) => {
      toast.error("Failed to remove qualification: " + error.message);
    },
  });
}

// Doctor fee schedule hooks
export function useDoctorFeeSchedule(doctorId?: string) {
  return useQuery({
    queryKey: ["doctor-fee-schedule", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("doctor_fee_schedule")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("appointment_type");
      
      if (error) throw error;
      return data as DoctorFeeScheduleItem[];
    },
    enabled: !!doctorId,
  });
}

export function useUpdateDoctorFees() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      doctorId, 
      fees 
    }: { 
      doctorId: string; 
      fees: { appointment_type: string; fee: number }[] 
    }) => {
      // Get organization_id from the doctor record
      const { data: doctor, error: doctorError } = await supabase
        .from("doctors")
        .select("organization_id")
        .eq("id", doctorId)
        .single();
      
      if (doctorError) throw doctorError;
      
      // Delete existing fees and insert new ones
      await supabase
        .from("doctor_fee_schedule")
        .delete()
        .eq("doctor_id", doctorId);
      
      if (fees.length > 0) {
        const { error } = await supabase
          .from("doctor_fee_schedule")
          .insert(fees.map(f => ({ 
            doctor_id: doctorId, 
            organization_id: doctor.organization_id,
            ...f 
          })));
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-fee-schedule", variables.doctorId] });
      toast.success("Doctor fees updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update fees: " + error.message);
    },
  });
}

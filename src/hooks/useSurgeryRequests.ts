import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SurgeryRequestStatus = 
  | "pending" 
  | "ot_availability_checked" 
  | "admission_required" 
  | "admitted" 
  | "scheduled" 
  | "completed"
  | "cancelled";

export type SurgeryRequestPriority = "elective" | "urgent" | "emergency";

export interface SurgeryRequest {
  id: string;
  organization_id: string;
  branch_id?: string;
  patient_id: string;
  procedure_name: string;
  diagnosis?: string;
  priority: SurgeryRequestPriority;
  recommended_by?: string;
  recommended_date: string;
  clinical_notes?: string;
  preferred_date_from?: string;
  preferred_date_to?: string;
  estimated_duration_minutes?: number;
  request_status: SurgeryRequestStatus;
  consultation_id?: string;
  admission_id?: string;
  surgery_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  // Joined data
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    patient_number: string;
    phone?: string;
  };
  doctor?: {
    id: string;
    profile?: {
      full_name: string;
    };
    specialization?: string;
  };
  admission?: {
    id: string;
    admission_number: string;
    ward?: { name: string };
    bed?: { bed_number: string };
  };
}

export interface CreateSurgeryRequestData {
  patient_id: string;
  procedure_name: string;
  diagnosis?: string;
  priority?: SurgeryRequestPriority;
  recommended_by?: string;
  clinical_notes?: string;
  preferred_date_from?: string;
  preferred_date_to?: string;
  estimated_duration_minutes?: number;
  consultation_id?: string;
  branch_id?: string;
}

export interface UpdateSurgeryRequestData {
  id: string;
  request_status?: SurgeryRequestStatus;
  admission_id?: string;
  surgery_id?: string;
  cancellation_reason?: string;
}

// Fetch pending surgery requests for reception
export function usePendingSurgeryRequests(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["surgery-requests", "pending", profile?.organization_id, branchId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from("surgery_requests")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone),
          doctor:doctors!surgery_requests_recommended_by_fkey(
            id,
            profile:profiles(full_name),
            specialization
          )
        `)
        .eq("organization_id", profile.organization_id)
        .in("request_status", ["pending", "ot_availability_checked", "admission_required"])
        .order("created_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SurgeryRequest[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Fetch surgery requests for a specific patient
export function usePatientSurgeryRequests(patientId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["surgery-requests", "patient", patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from("surgery_requests")
        .select(`
          *,
          doctor:doctors!surgery_requests_recommended_by_fkey(
            id,
            profile:profiles(full_name),
            specialization
          ),
          admission:admissions(
            id,
            admission_number,
            ward:wards(name),
            bed:beds(bed_number)
          )
        `)
        .eq("patient_id", patientId)
        .neq("request_status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SurgeryRequest[];
    },
    enabled: !!patientId,
  });
}

// Fetch single surgery request
export function useSurgeryRequest(requestId?: string) {
  return useQuery({
    queryKey: ["surgery-request", requestId],
    queryFn: async () => {
      if (!requestId) return null;

      const { data, error } = await supabase
        .from("surgery_requests")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone, gender, date_of_birth),
          doctor:doctors!surgery_requests_recommended_by_fkey(
            id,
            profile:profiles(full_name),
            specialization
          ),
          admission:admissions(
            id,
            admission_number,
            ward:wards(name),
            bed:beds(bed_number)
          )
        `)
        .eq("id", requestId)
        .single();

      if (error) throw error;
      return data as SurgeryRequest;
    },
    enabled: !!requestId,
  });
}

// Create surgery request
export function useCreateSurgeryRequest() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateSurgeryRequestData) => {
      console.log("=== Creating Surgery Request ===");
      console.log("Input data:", data);
      console.log("Profile:", profile);

      if (!profile?.organization_id) {
        console.error("Missing organization_id in profile");
        throw new Error("Missing organization - please log in again");
      }

      const insertData = {
        ...data,
        organization_id: profile.organization_id,
        branch_id: data.branch_id || profile.branch_id,
        created_by: profile.id,
        request_status: "pending" as const,
        recommended_date: new Date().toISOString().split('T')[0],
      };

      console.log("Insert payload:", insertData);

      const { data: request, error } = await supabase
        .from("surgery_requests")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Created request:", request);
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgery-requests"] });
      toast.success("Surgery request created successfully");
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error?.message || "Failed to create surgery request");
    },
  });
}

// Update surgery request status
export function useUpdateSurgeryRequest() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateSurgeryRequestData) => {
      const updateData: Record<string, any> = {
        request_status: data.request_status,
        updated_at: new Date().toISOString(),
      };

      if (data.admission_id) updateData.admission_id = data.admission_id;
      if (data.surgery_id) updateData.surgery_id = data.surgery_id;
      
      if (data.request_status === "cancelled") {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancelled_by = profile?.id;
        updateData.cancellation_reason = data.cancellation_reason;
      }

      const { data: request, error } = await supabase
        .from("surgery_requests")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgery-requests"] });
      queryClient.invalidateQueries({ queryKey: ["surgery-request"] });
    },
    onError: (error) => {
      toast.error("Failed to update surgery request");
      console.error(error);
    },
  });
}

// Cancel surgery request
export function useCancelSurgeryRequest() {
  const updateMutation = useUpdateSurgeryRequest();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return updateMutation.mutateAsync({
        id,
        request_status: "cancelled",
        cancellation_reason: reason,
      });
    },
    onSuccess: () => {
      toast.success("Surgery request cancelled");
    },
  });
}

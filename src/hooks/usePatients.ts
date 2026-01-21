import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { patientLogger } from "@/lib/logger";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export function usePatients(searchQuery?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["patients", profile?.organization_id, searchQuery],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from("patients")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (searchQuery && searchQuery.trim()) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,patient_number.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Patient ID is required");

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<PatientInsert, "organization_id" | "patient_number" | "created_by">) => {
      if (!profile?.organization_id) throw new Error("No organization");

      patientLogger.info("Creating patient", { 
        firstName: data.first_name, 
        lastName: data.last_name,
        phone: data.phone 
      });

      // Ensure branch_id is properly set - empty string should fall back to profile branch
      const effectiveBranchId = data.branch_id && data.branch_id.trim() !== '' 
        ? data.branch_id 
        : profile.branch_id;

      const { data: patient, error } = await supabase
        .from("patients")
        .insert({
          ...data,
          organization_id: profile.organization_id,
          branch_id: effectiveBranchId,
          created_by: user?.id,
          patient_number: null as any, // Trigger will generate the number
        })
        .select()
        .single();

      if (error) {
        patientLogger.error("Failed to create patient", error, { firstName: data.first_name });
        throw error;
      }

      patientLogger.info("Patient created successfully", { 
        patientId: patient.id, 
        mrNumber: patient.patient_number,
        name: `${patient.first_name} ${patient.last_name || ''}`.trim()
      });

      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: "Patient registered",
        description: "The patient has been registered successfully.",
      });
    },
    onError: (error: Error) => {
      patientLogger.error("Patient creation failed", error);
      
      let message = error.message;
      if (error.message.includes("duplicate key") || error.message.includes("violates unique")) {
        message = "A patient with this phone number or email already exists.";
      } else if (error.message.includes("permission denied") || error.message.includes("RLS")) {
        message = "You don't have permission to register patients. Please contact your administrator.";
      } else if (error.message.includes("null value in column")) {
        message = "Please fill in all required fields.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        message = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Failed to register patient",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatientUpdate }) => {
      patientLogger.info("Updating patient", { patientId: id, fields: Object.keys(data) });

      const { data: patient, error } = await supabase
        .from("patients")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        patientLogger.error("Failed to update patient", error, { patientId: id });
        throw error;
      }

      patientLogger.info("Patient updated successfully", { 
        patientId: id, 
        mrNumber: patient.patient_number 
      });

      return patient;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients", "detail", variables.id] });
      toast({
        title: "Patient updated",
        description: "The patient has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePatientStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["patient-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const today = new Date().toISOString().split("T")[0];
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthStart = thisMonth.toISOString().split("T")[0];

      const [totalResult, activeResult, todayResult, monthResult] = await Promise.all([
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id)
          .eq("is_active", true),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id)
          .gte("created_at", today),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id)
          .gte("created_at", monthStart),
      ]);

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        today: todayResult.count || 0,
        thisMonth: monthResult.count || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useRecentPatients(limit: number = 5) {
  const { profile } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["recent-patients", today, profile?.organization_id, limit],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, patient_number, phone, created_at")
        .eq("organization_id", profile.organization_id)
        .gte("created_at", today)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

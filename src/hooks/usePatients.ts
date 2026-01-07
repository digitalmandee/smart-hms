import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

      const { data: patient, error } = await supabase
        .from("patients")
        .insert({
          ...data,
          organization_id: profile.organization_id,
          branch_id: data.branch_id || profile.branch_id,
          created_by: user?.id,
          patient_number: "TEMP", // Will be overwritten by trigger
        })
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: "Error",
        description: error.message,
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
      const { data: patient, error } = await supabase
        .from("patients")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
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

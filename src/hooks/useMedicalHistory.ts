import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type MedicalHistory = Database["public"]["Tables"]["patient_medical_history"]["Row"];
type MedicalHistoryInsert = Database["public"]["Tables"]["patient_medical_history"]["Insert"];

export function useMedicalHistory(patientId: string | undefined) {
  return useQuery({
    queryKey: ["medical-history", patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from("patient_medical_history")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MedicalHistory[];
    },
    enabled: !!patientId,
  });
}

export function useCreateMedicalHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<MedicalHistoryInsert, "created_by">) => {
      const { data: history, error } = await supabase
        .from("patient_medical_history")
        .insert({
          ...data,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return history;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medical-history", variables.patient_id] });
      toast({
        title: "Medical history added",
        description: "The medical history entry has been added successfully.",
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

export function useDeleteMedicalHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase
        .from("patient_medical_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return patientId;
    },
    onSuccess: (patientId) => {
      queryClient.invalidateQueries({ queryKey: ["medical-history", patientId] });
      toast({
        title: "Entry deleted",
        description: "The medical history entry has been deleted.",
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

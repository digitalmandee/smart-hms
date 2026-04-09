import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HipaaTrainingRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  training_type: string;
  training_date: string;
  expiry_date: string;
  status: string;
  acknowledged_at: string | null;
  trainer_name: string | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useHipaaTrainingRecords() {
  return useQuery({
    queryKey: ["hipaa-training"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hipaa_training_records" as any)
        .select("*")
        .order("training_date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as HipaaTrainingRecord[];
    },
  });
}

export function useCreateHipaaTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: Partial<HipaaTrainingRecord>) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userId!)
        .single();

      const { error } = await supabase.from("hipaa_training_records" as any).insert({
        ...record,
        organization_id: profile?.organization_id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hipaa-training"] });
      toast.success("Training record created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateHipaaTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HipaaTrainingRecord> & { id: string }) => {
      const { error } = await supabase
        .from("hipaa_training_records" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hipaa-training"] });
      toast.success("Training record updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

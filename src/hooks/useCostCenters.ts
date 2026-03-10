import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCostCenters() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["cost-centers", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cost_centers")
        .select("*, departments(name)")
        .eq("organization_id", profile!.organization_id!)
        .order("code");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateCostCenter() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: { name: string; code: string; department_id?: string }) => {
      const { data, error } = await supabase
        .from("cost_centers")
        .insert({
          organization_id: profile!.organization_id!,
          ...values,
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cost-centers"] });
      toast.success("Cost center created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name?: string; code?: string; department_id?: string; is_active?: boolean }) => {
      const { error } = await supabase.from("cost_centers").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cost-centers"] });
      toast.success("Cost center updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

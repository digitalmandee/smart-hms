import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HipaaBreach {
  id: string;
  organization_id: string;
  branch_id: string | null;
  incident_date: string;
  discovery_date: string;
  notification_deadline: string;
  breach_type: string;
  phi_types_involved: string[];
  individuals_affected_count: number;
  description: string | null;
  root_cause: string | null;
  corrective_actions: string | null;
  risk_assessment: string;
  notification_status: string;
  notified_individuals_date: string | null;
  notified_hhs_date: string | null;
  reported_by: string | null;
  investigated_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useHipaaBreaches() {
  return useQuery({
    queryKey: ["hipaa-breaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hipaa_breach_incidents" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as HipaaBreach[];
    },
  });
}

export function useCreateHipaaBreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (breach: Partial<HipaaBreach>) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userId!)
        .single();

      const { error } = await supabase.from("hipaa_breach_incidents" as any).insert({
        ...breach,
        organization_id: profile?.organization_id,
        reported_by: userId,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hipaa-breaches"] });
      toast.success("Breach incident recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateHipaaBreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HipaaBreach> & { id: string }) => {
      const { error } = await supabase
        .from("hipaa_breach_incidents" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hipaa-breaches"] });
      toast.success("Breach incident updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

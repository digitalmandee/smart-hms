import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CriticalNotification {
  id: string;
  organization_id: string | null;
  branch_id: string | null;
  lab_order_id: string | null;
  lab_order_item_id: string | null;
  patient_id: string | null;
  test_name: string;
  result_value: string | null;
  unit: string | null;
  low_critical: number | null;
  high_critical: number | null;
  severity: string;
  notified_to_name: string | null;
  notified_to_role: string | null;
  notified_to_phone: string | null;
  notification_channel: string | null;
  notes: string | null;
  notified_at: string;
  notified_by: string | null;
  acknowledged_at: string | null;
  acknowledged_by_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tbl = () => (supabase as any).from("lab_critical_value_notifications");

export function useCriticalNotifications(status?: string) {
  return useQuery({
    queryKey: ["lab-critical-notifications", status ?? "all"],
    queryFn: async (): Promise<CriticalNotification[]> => {
      let q = tbl().select("*").order("notified_at", { ascending: false }).limit(200);
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data as CriticalNotification[]) ?? [];
    },
  });
}

export function useLogCriticalNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CriticalNotification>) => {
      const { data, error } = await tbl().insert(payload).select();
      if (error) throw error;
      return data?.[0] as CriticalNotification;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lab-critical-notifications"] });
      toast.success("Critical-value contact logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAcknowledgeCriticalNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; acknowledged_by_name: string }) => {
      const { data, error } = await tbl()
        .update({
          status: "acknowledged",
          acknowledged_at: new Date().toISOString(),
          acknowledged_by_name: input.acknowledged_by_name,
        })
        .eq("id", input.id)
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lab-critical-notifications"] });
      toast.success("Marked as acknowledged");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

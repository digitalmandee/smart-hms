import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export interface PutAwayTask {
  id: string;
  organization_id: string;
  store_id: string;
  grn_id: string | null;
  item_id: string | null;
  medicine_id: string | null;
  stock_id: string | null;
  quantity: number;
  suggested_bin_id: string | null;
  actual_bin_id: string | null;
  status: string;
  assigned_to: string | null;
  priority: number;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  suggested_bin?: { id: string; bin_code: string };
  actual_bin?: { id: string; bin_code: string };
}

export function usePutAwayTasks(storeId?: string, status?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["putaway-tasks", storeId, status],
    queryFn: async () => {
      let query = queryTable("putaway_tasks")
        .select("*, suggested_bin:warehouse_bins!putaway_tasks_suggested_bin_id_fkey(id, bin_code), actual_bin:warehouse_bins!putaway_tasks_actual_bin_id_fkey(id, bin_code)")
        .eq("organization_id", profile!.organization_id)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (storeId && storeId !== "all") query = query.eq("store_id", storeId);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data as PutAwayTask[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePutAwayTask(id?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["putaway-task", id],
    queryFn: async () => {
      const { data, error } = await queryTable("putaway_tasks")
        .select("*, suggested_bin:warehouse_bins!putaway_tasks_suggested_bin_id_fkey(id, bin_code), actual_bin:warehouse_bins!putaway_tasks_actual_bin_id_fkey(id, bin_code)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as PutAwayTask;
    },
    enabled: !!profile?.organization_id && !!id,
  });
}

export function useCompletePutAway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, actual_bin_id, notes }: { id: string; actual_bin_id: string; notes?: string }) => {
      const { data, error } = await queryTable("putaway_tasks")
        .update({ actual_bin_id, status: "completed", completed_at: new Date().toISOString(), notes })
        .eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["putaway-tasks"] }); qc.invalidateQueries({ queryKey: ["putaway-task"] }); toast.success("Put-away completed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

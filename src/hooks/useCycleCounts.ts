import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CycleCount {
  id: string;
  organization_id: string;
  store_id: string;
  zone_id: string | null;
  count_number: string;
  status: string;
  count_type: string;
  assigned_to: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  store?: { name: string };
  zone?: { zone_name: string };
  assigned_profile?: { full_name: string };
  created_by_profile?: { full_name: string };
}

export interface CycleCountItem {
  id: string;
  cycle_count_id: string;
  item_id: string;
  bin_id: string | null;
  expected_quantity: number;
  counted_quantity: number | null;
  variance: number | null;
  batch_number: string | null;
  notes: string | null;
  counted_at: string | null;
  item?: { name: string; item_code: string };
  bin?: { bin_code: string };
}

export function useCycleCounts(storeId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["cycle-counts", storeId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("cycle_counts")
        .select("*, store:stores(name), zone:warehouse_zones(zone_name), assigned_profile:profiles!cycle_counts_assigned_to_fkey(full_name), created_by_profile:profiles!cycle_counts_created_by_fkey(full_name)")
        .eq("organization_id", profile?.organization_id)
        .order("created_at", { ascending: false });
      if (storeId) query = query.eq("store_id", storeId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CycleCount[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCycleCount(id: string) {
  return useQuery({
    queryKey: ["cycle-count", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cycle_counts")
        .select("*, store:stores(name), zone:warehouse_zones(zone_name), assigned_profile:profiles!cycle_counts_assigned_to_fkey(full_name), created_by_profile:profiles!cycle_counts_created_by_fkey(full_name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as CycleCount;
    },
    enabled: !!id,
  });
}

export function useCycleCountItems(cycleCountId: string) {
  return useQuery({
    queryKey: ["cycle-count-items", cycleCountId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cycle_count_items")
        .select("*, item:inventory_items(name, item_code), bin:warehouse_bins(bin_code)")
        .eq("cycle_count_id", cycleCountId);
      if (error) throw error;
      return data as CycleCountItem[];
    },
    enabled: !!cycleCountId,
  });
}

export function useCreateCycleCount() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (data: { store_id: string; zone_id?: string; count_type: string; assigned_to?: string; notes?: string }) => {
      const { data: result, error } = await (supabase as any)
        .from("cycle_counts")
        .insert({ ...data, organization_id: profile?.organization_id, created_by: profile?.id, count_number: "TEMP" })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycle-counts"] });
      toast.success("Cycle count created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateCycleCountItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, counted_quantity, notes }: { id: string; counted_quantity: number; notes?: string }) => {
      const variance = undefined; // will be computed
      const { error } = await (supabase as any)
        .from("cycle_count_items")
        .update({ counted_quantity, notes, counted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycle-count-items"] }),
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCompleteCycleCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("cycle_counts")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycle-counts"] });
      toast.success("Cycle count completed");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

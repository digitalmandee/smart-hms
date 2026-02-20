import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export interface WarehouseBin {
  id: string;
  organization_id: string;
  store_id: string;
  zone_id: string | null;
  rack_id: string | null;
  bin_code: string;
  bin_type: string;
  max_weight: number | null;
  max_volume: number | null;
  current_weight: number | null;
  current_volume: number | null;
  is_occupied: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  zone?: { id: string; zone_code: string; zone_name: string };
  rack?: { id: string; rack_code: string; rack_name: string | null };
}

export interface BinAssignment {
  id: string;
  organization_id: string;
  store_id: string;
  bin_id: string;
  item_id: string | null;
  medicine_id: string | null;
  stock_id: string | null;
  quantity: number;
  assigned_at: string;
  assigned_by: string | null;
  bin?: { id: string; bin_code: string };
}

export function useWarehouseBins(storeId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["warehouse-bins", storeId],
    queryFn: async () => {
      let query = queryTable("warehouse_bins")
        .select("*, zone:warehouse_zones(id, zone_code, zone_name), rack:store_racks(id, rack_code, rack_name)")
        .eq("organization_id", profile!.organization_id)
        .order("bin_code");
      if (storeId && storeId !== "all") query = query.eq("store_id", storeId);
      const { data, error } = await query;
      if (error) throw error;
      return data as WarehouseBin[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateBin() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (data: { store_id: string; zone_id?: string; rack_id?: string; bin_code: string; bin_type: string; max_weight?: number; max_volume?: number }) => {
      const { data: bin, error } = await queryTable("warehouse_bins")
        .insert({ ...data, organization_id: profile!.organization_id })
        .select().single();
      if (error) throw error;
      return bin;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["warehouse-bins"] }); toast.success("Bin created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; bin_code?: string; bin_type?: string; zone_id?: string; rack_id?: string; max_weight?: number; max_volume?: number; is_active?: boolean }) => {
      const { data: bin, error } = await queryTable("warehouse_bins").update(data).eq("id", id).select().single();
      if (error) throw error;
      return bin;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["warehouse-bins"] }); toast.success("Bin updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await queryTable("warehouse_bins").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["warehouse-bins"] }); toast.success("Bin deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBinAssignments(storeId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["bin-assignments", storeId],
    queryFn: async () => {
      let query = queryTable("inventory_bin_assignments")
        .select("*, bin:warehouse_bins(id, bin_code)")
        .eq("organization_id", profile!.organization_id)
        .order("assigned_at", { ascending: false });
      if (storeId && storeId !== "all") query = query.eq("store_id", storeId);
      const { data, error } = await query;
      if (error) throw error;
      return data as BinAssignment[];
    },
    enabled: !!profile?.organization_id,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export interface WarehouseZone {
  id: string;
  organization_id: string;
  store_id: string;
  zone_code: string;
  zone_name: string;
  zone_type: string;
  temperature_range: string | null;
  capacity_info: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useWarehouseZones(storeId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["warehouse-zones", storeId],
    queryFn: async () => {
      let query = queryTable("warehouse_zones")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .order("zone_code");
      if (storeId && storeId !== "all") query = query.eq("store_id", storeId);
      const { data, error } = await query;
      if (error) throw error;
      return data as WarehouseZone[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (data: { store_id: string; zone_code: string; zone_name: string; zone_type: string; temperature_range?: string }) => {
      const { data: zone, error } = await queryTable("warehouse_zones")
        .insert({ ...data, organization_id: profile!.organization_id })
        .select().single();
      if (error) throw error;
      return zone;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["warehouse-zones"] }); toast.success("Zone created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; zone_code?: string; zone_name?: string; zone_type?: string; temperature_range?: string; is_active?: boolean }) => {
      const { data: zone, error } = await queryTable("warehouse_zones").update(data).eq("id", id).select().single();
      if (error) throw error;
      return zone;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["warehouse-zones"] }); toast.success("Zone updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await queryTable("warehouse_zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["warehouse-zones"] }); toast.success("Zone deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
};

export interface StoreRack {
  id: string;
  store_id: string;
  organization_id: string;
  rack_code: string;
  rack_name: string | null;
  section: string | null;
  capacity_info: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assignment_count?: number;
}

export interface MedicineRackAssignment {
  id: string;
  medicine_id: string;
  store_id: string;
  rack_id: string;
  organization_id: string;
  shelf_number: string | null;
  position: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  medicine?: { id: string; name: string; generic_name: string | null };
  rack?: { id: string; rack_code: string; rack_name: string | null };
  store?: { id: string; name: string };
}

// List racks for a store
export function useStoreRacks(storeId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["store-racks", storeId],
    queryFn: async () => {
      let query = queryTable("store_racks")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .eq("is_active", true)
        .order("rack_code");

      if (storeId) {
        query = query.eq("store_id", storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StoreRack[];
    },
    enabled: !!profile?.organization_id && !!storeId,
  });
}

// List all racks (including inactive) for management
export function useAllStoreRacks(storeId: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["store-racks-all", storeId],
    queryFn: async () => {
      const { data, error } = await queryTable("store_racks")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .eq("store_id", storeId)
        .order("rack_code");

      if (error) throw error;
      return data as StoreRack[];
    },
    enabled: !!profile?.organization_id && !!storeId,
  });
}

// Create rack
export function useCreateRack() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { store_id: string; rack_code: string; rack_name?: string; section?: string }) => {
      const { data: rack, error } = await queryTable("store_racks")
        .insert({
          store_id: data.store_id,
          organization_id: profile!.organization_id,
          rack_code: data.rack_code,
          rack_name: data.rack_name || null,
          section: data.section || null,
        })
        .select()
        .single();
      if (error) throw error;
      return rack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-racks"] });
      queryClient.invalidateQueries({ queryKey: ["store-racks-all"] });
      toast.success("Rack created successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Update rack
export function useUpdateRack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; rack_code?: string; rack_name?: string; section?: string; is_active?: boolean }) => {
      const { data: rack, error } = await queryTable("store_racks")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return rack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-racks"] });
      queryClient.invalidateQueries({ queryKey: ["store-racks-all"] });
      toast.success("Rack updated successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Delete rack
export function useDeleteRack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await queryTable("store_racks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-racks"] });
      queryClient.invalidateQueries({ queryKey: ["store-racks-all"] });
      toast.success("Rack deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// List rack assignments (optionally filtered by store)
export function useRackAssignments(storeId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["rack-assignments", storeId],
    queryFn: async () => {
      let query = queryTable("medicine_rack_assignments")
        .select(`
          *,
          medicine:medicines(id, name, generic_name),
          rack:store_racks(id, rack_code, rack_name),
          store:stores(id, name)
        `)
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false });

      if (storeId && storeId !== "all") {
        query = query.eq("store_id", storeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MedicineRackAssignment[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Create or update rack assignment (upsert by medicine_id + store_id)
export function useUpsertRackAssignment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      medicine_id: string;
      store_id: string;
      rack_id: string;
      shelf_number?: string;
      position?: string;
      notes?: string;
    }) => {
      const { data: assignment, error } = await queryTable("medicine_rack_assignments")
        .upsert(
          {
            medicine_id: data.medicine_id,
            store_id: data.store_id,
            rack_id: data.rack_id,
            organization_id: profile!.organization_id,
            shelf_number: data.shelf_number || null,
            position: data.position || null,
            notes: data.notes || null,
          },
          { onConflict: "medicine_id,store_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rack-assignments"] });
      toast.success("Rack assignment saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Delete rack assignment
export function useDeleteRackAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await queryTable("medicine_rack_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rack-assignments"] });
      toast.success("Rack assignment removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

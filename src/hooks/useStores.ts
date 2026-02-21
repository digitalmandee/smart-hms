import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Returns the correct store context string based on the org's facility_type
export function useStoreContext(): string {
  const { profile } = useAuth();

  const { data: facilityType } = useQuery({
    queryKey: ["org-facility-type", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("facility_type")
        .eq("id", profile!.organization_id)
        .single();
      return (data as any)?.facility_type as string | null;
    },
    enabled: !!profile?.organization_id,
  });

  if (facilityType === "warehouse") return "warehouse";
  if (facilityType === "pharmacy") return "pharmacy";
  return "hospital";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
};

export interface Store {
  id: string;
  organization_id: string;
  branch_id: string;
  name: string;
  code: string | null;
  store_type: string;
  description: string | null;
  manager_id: string | null;
  is_central: boolean;
  is_active: boolean;
  location_info: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  branch?: { id: string; name: string };
  manager?: { id: string; full_name: string } | null;
}

export interface CreateStoreData {
  name: string;
  code?: string;
  store_type: string;
  description?: string;
  branch_id: string;
  manager_id?: string;
  is_central?: boolean;
  location_info?: Record<string, unknown>;
  context?: string;
}

// List all stores for the organization, optionally filtered by branch and context
export function useStores(branchId?: string, context?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["stores", profile?.organization_id, branchId, context],
    queryFn: async () => {
      let query = queryTable("stores")
        .select(`
          *,
          branch:branches(id, name),
          manager:profiles!stores_manager_id_fkey(id, full_name)
        `)
        .eq("organization_id", profile!.organization_id)
        .eq("is_active", true)
        .order("is_central", { ascending: false })
        .order("name");

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      if (context) {
        query = query.eq("context", context);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Store[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Get all stores (including inactive) for management
export function useAllStores(context?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["stores-all", profile?.organization_id, context],
    queryFn: async () => {
      let query = queryTable("stores")
        .select(`
          *,
          branch:branches(id, name),
          manager:profiles!stores_manager_id_fkey(id, full_name)
        `)
        .eq("organization_id", profile!.organization_id)
        .order("is_central", { ascending: false })
        .order("name");

      if (context) {
        query = query.eq("context", context);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Store[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Get a single store
export function useStore(id: string) {
  return useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      const { data, error } = await queryTable("stores")
        .select(`
          *,
          branch:branches(id, name),
          manager:profiles!stores_manager_id_fkey(id, full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Store;
    },
    enabled: !!id,
  });
}

// Stores assigned to the current user (for store_manager role)
export function useMyStores() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["my-stores", profile?.id],
    queryFn: async () => {
      const { data, error } = await queryTable("stores")
        .select(`
          *,
          branch:branches(id, name)
        `)
        .eq("manager_id", profile!.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Store[];
    },
    enabled: !!profile?.id,
  });
}

// Create a new store
export function useCreateStore() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateStoreData) => {
      if (!profile?.organization_id) throw new Error("No organization context");

      const { data: store, error } = await queryTable("stores")
        .insert({
          organization_id: profile.organization_id,
          branch_id: data.branch_id,
          name: data.name,
          code: data.code || null,
          store_type: data.store_type,
          description: data.description || null,
          manager_id: data.manager_id && data.manager_id !== "none" ? data.manager_id : null,
          is_central: data.is_central || false,
          location_info: data.location_info || {},
          context: data.context || "hospital",
        })
        .select()
        .single();

      if (error) throw error;
      return store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores-all"] });
      toast.success("Warehouse created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update an existing store
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateStoreData> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.code !== undefined) updateData.code = data.code;
      if (data.store_type !== undefined) updateData.store_type = data.store_type;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.branch_id !== undefined) updateData.branch_id = data.branch_id;
      if (data.manager_id !== undefined) updateData.manager_id = data.manager_id || null;
      if (data.location_info !== undefined) updateData.location_info = data.location_info;

      const { data: store, error } = await queryTable("stores")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores-all"] });
      queryClient.invalidateQueries({ queryKey: ["store"] });
      toast.success("Warehouse updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Toggle store active status
export function useToggleStoreActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await queryTable("stores")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores-all"] });
      toast.success("Warehouse status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

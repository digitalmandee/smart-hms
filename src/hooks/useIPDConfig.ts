import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// Types
// =====================================================

export interface BedType {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string | null;
  daily_rate: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BedFeature {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WardType {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: string;
  organization_id: string;
  branch_id: string | null;
  building: string;
  floor_name: string;
  floor_number: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Bed Types Hooks
// =====================================================

export const useBedTypes = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-bed-types", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from("ipd_bed_types")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("sort_order");
      
      if (error) throw error;
      return data as BedType[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateBedType = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<BedType>) => {
      const insertData = {
        name: data.name || "",
        code: data.code || "",
        description: data.description,
        daily_rate: data.daily_rate ?? 0,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
        organization_id: profile?.organization_id!,
      };
      const { data: result, error } = await supabase
        .from("ipd_bed_types")
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-bed-types"] });
      toast.success("Bed type created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bed type: ${error.message}`);
    },
  });
};

export const useUpdateBedType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BedType> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("ipd_bed_types")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-bed-types"] });
      toast.success("Bed type updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bed type: ${error.message}`);
    },
  });
};

export const useDeleteBedType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ipd_bed_types")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-bed-types"] });
      toast.success("Bed type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bed type: ${error.message}`);
    },
  });
};

// =====================================================
// Bed Features Hooks
// =====================================================

export const useBedFeatures = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-bed-features", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from("ipd_bed_features")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("sort_order");
      
      if (error) throw error;
      return data as BedFeature[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateBedFeature = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<BedFeature>) => {
      const insertData = {
        name: data.name || "",
        code: data.code || "",
        description: data.description,
        icon: data.icon,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
        organization_id: profile?.organization_id!,
      };
      const { data: result, error } = await supabase
        .from("ipd_bed_features")
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onError: (error: Error) => {
      toast.error(`Failed to create bed feature: ${error.message}`);
    },
  });
};

export const useUpdateBedFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BedFeature> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("ipd_bed_features")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-bed-features"] });
      toast.success("Bed feature updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bed feature: ${error.message}`);
    },
  });
};

export const useDeleteBedFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ipd_bed_features")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-bed-features"] });
      toast.success("Bed feature deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete bed feature: ${error.message}`);
    },
  });
};

// =====================================================
// Ward Types Hooks
// =====================================================

export const useWardTypes = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-ward-types", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from("ipd_ward_types")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("sort_order");
      
      if (error) throw error;
      return data as WardType[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateWardType = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<WardType>) => {
      const insertData = {
        name: data.name || "",
        code: data.code || "",
        description: data.description,
        color: data.color,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
        organization_id: profile?.organization_id!,
      };
      const { data: result, error } = await supabase
        .from("ipd_ward_types")
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onError: (error: Error) => {
      toast.error(`Failed to create ward type: ${error.message}`);
    },
  });
};

export const useUpdateWardType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WardType> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("ipd_ward_types")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-ward-types"] });
      toast.success("Ward type updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ward type: ${error.message}`);
    },
  });
};

export const useDeleteWardType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ipd_ward_types")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-ward-types"] });
      toast.success("Ward type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete ward type: ${error.message}`);
    },
  });
};

// =====================================================
// Floors Hooks
// =====================================================

export const useFloors = (branchId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-floors", profile?.organization_id, branchId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from("ipd_floors")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("building")
        .order("floor_number");
      
      if (branchId) {
        query = query.eq("branch_id", branchId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Floor[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateFloor = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Floor>) => {
      const insertData = {
        building: data.building || "",
        floor_name: data.floor_name || "",
        floor_number: data.floor_number,
        description: data.description,
        branch_id: data.branch_id,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
        organization_id: profile?.organization_id!,
      };
      const { data: result, error } = await supabase
        .from("ipd_floors")
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onError: (error: Error) => {
      toast.error(`Failed to create floor: ${error.message}`);
    },
  });
};

export const useUpdateFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Floor> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("ipd_floors")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-floors"] });
      toast.success("Floor updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update floor: ${error.message}`);
    },
  });
};

export const useDeleteFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ipd_floors")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-floors"] });
      toast.success("Floor deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete floor: ${error.message}`);
    },
  });
};

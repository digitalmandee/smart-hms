import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ServiceCategory {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useServiceCategories(includeInactive = false) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["service-categories", profile?.organization_id, includeInactive],
    queryFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      let query = supabase
        .from("service_categories")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("sort_order");

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceCategory[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (values: {
      code: string;
      name: string;
      icon?: string;
      color?: string;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Get max sort_order
      const { data: existing } = await supabase
        .from("service_categories")
        .select("sort_order")
        .eq("organization_id", profile.organization_id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.sort_order || 0) + 1;

      const { data, error } = await supabase
        .from("service_categories")
        .insert({
          organization_id: profile.organization_id,
          code: values.code.toLowerCase().replace(/\s+/g, "_"),
          name: values.name,
          icon: values.icon || "circle",
          color: values.color || "gray",
          sort_order: nextOrder,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      toast.success("Category created");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: {
      id: string;
      name?: string;
      icon?: string;
      color?: string;
      sort_order?: number;
      is_active?: boolean;
    }) => {
      const { id, ...updateData } = values;

      const { data, error } = await supabase
        .from("service_categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if category is in use
      const { data: services } = await supabase
        .from("service_types")
        .select("id")
        .eq("category_id", id)
        .limit(1);

      if (services && services.length > 0) {
        throw new Error("Cannot delete category with associated services");
      }

      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

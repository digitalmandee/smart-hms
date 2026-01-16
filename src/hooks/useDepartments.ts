import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Use database schema for departments
export function useDepartmentsConfig() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["departments-config", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllDepartmentsConfig() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["all-departments-config", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useDepartmentConfig(id: string | undefined) {
  return useQuery({
    queryKey: ["department-config", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDepartmentConfig() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; code?: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("departments")
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments-config"] });
      queryClient.invalidateQueries({ queryKey: ["all-departments-config"] });
      toast.success("Department created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create department: " + error.message);
    },
  });
}

export function useUpdateDepartmentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; code?: string; description?: string; is_active?: boolean }) => {
      const { data: result, error } = await supabase
        .from("departments")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments-config"] });
      queryClient.invalidateQueries({ queryKey: ["all-departments-config"] });
      toast.success("Department updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update department: " + error.message);
    },
  });
}

export function useDeleteDepartmentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("departments")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments-config"] });
      queryClient.invalidateQueries({ queryKey: ["all-departments-config"] });
      toast.success("Department deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete department: " + error.message);
    },
  });
}

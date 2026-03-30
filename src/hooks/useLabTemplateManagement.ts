import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

// Types
export interface LabTestCategory {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TemplateField {
  name: string;
  unit: string;
  normal_min: number | null;
  normal_max: number | null;
  critical_min?: number | null;
  critical_max?: number | null;
  type?: "text" | "number";
}

export interface LabTestTemplate {
  id: string;
  organization_id: string | null;
  test_name: string;
  test_category: string;
  fields: TemplateField[];
  is_active: boolean;
  created_at: string;
}

export interface LabTestPanel {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  description: string | null;
  price: number;
  tests: string[];
  is_active: boolean;
  created_at: string;
}

// =====================
// Lab Test Categories
// =====================

export function useLabTestCategories() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["lab-test-categories", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_test_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as LabTestCategory[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllLabTestCategories() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["all-lab-test-categories", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_test_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as LabTestCategory[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateLabTestCategory() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; code?: string; description?: string; sort_order?: number }) => {
      if (!profile?.organization_id) throw new Error("No organization");
      
      const { data: result, error } = await supabase
        .from("lab_test_categories")
        .insert({
          name: data.name,
          code: data.code,
          description: data.description,
          sort_order: data.sort_order || 0,
          organization_id: profile.organization_id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-categories"] });
      queryClient.invalidateQueries({ queryKey: ["all-lab-test-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
}

export function useUpdateLabTestCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; code?: string; description?: string; sort_order?: number; is_active?: boolean }) => {
      const { data: result, error } = await supabase
        .from("lab_test_categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-categories"] });
      queryClient.invalidateQueries({ queryKey: ["all-lab-test-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
}

// =====================
// Lab Test Templates
// =====================

export function useLabTestTemplates() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["lab-test-templates", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_test_templates")
        .select("*")
        .eq("organization_id", profile?.organization_id)
        .eq("is_active", true)
        .order("test_name");

      if (error) throw error;
      
      return (data || []).map((template) => ({
        ...template,
        fields: (template.fields as unknown as TemplateField[]) || [],
      })) as LabTestTemplate[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllLabTestTemplates() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["all-lab-test-templates", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_test_templates")
        .select("*")
        .eq("organization_id", profile?.organization_id)
        .order("test_name");

      if (error) throw error;
      
      return (data || []).map((template) => ({
        ...template,
        fields: (template.fields as unknown as TemplateField[]) || [],
      })) as LabTestTemplate[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useLabTestTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["lab-test-template", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("lab_test_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        fields: (data.fields as unknown as TemplateField[]) || [],
      } as LabTestTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateLabTestTemplate() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { test_name: string; test_category: string; fields: TemplateField[] }) => {
      if (!profile?.organization_id) throw new Error("No organization");
      
      const { data: result, error } = await supabase
        .from("lab_test_templates")
        .insert({
          test_name: data.test_name,
          test_category: data.test_category,
          fields: data.fields as unknown as Json,
          organization_id: profile.organization_id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-templates"] });
      queryClient.invalidateQueries({ queryKey: ["all-lab-test-templates"] });
      toast.success("Test template created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create template: " + error.message);
    },
  });
}

export function useUpdateLabTestTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; test_name?: string; test_category?: string; fields?: TemplateField[]; is_active?: boolean }) => {
      const updateData: Record<string, unknown> = {};
      if (data.test_name !== undefined) updateData.test_name = data.test_name;
      if (data.test_category !== undefined) updateData.test_category = data.test_category;
      if (data.fields !== undefined) updateData.fields = data.fields as unknown as Json;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const { data: result, error } = await supabase
        .from("lab_test_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-templates"] });
      queryClient.invalidateQueries({ queryKey: ["all-lab-test-templates"] });
      toast.success("Test template updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });
}

export function useDeleteLabTestTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lab_test_templates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-templates"] });
      queryClient.invalidateQueries({ queryKey: ["all-lab-test-templates"] });
      toast.success("Test template deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete template: " + error.message);
    },
  });
}

// =====================
// Lab Test Panels
// =====================

export function useLabTestPanels() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["lab-test-panels", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_test_panels")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      return (data || []).map((panel) => ({
        ...panel,
        tests: (panel.tests as unknown as string[]) || [],
      })) as LabTestPanel[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useLabTestPanel(id: string | undefined) {
  return useQuery({
    queryKey: ["lab-test-panel", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("lab_test_panels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        tests: (data.tests as unknown as string[]) || [],
      } as LabTestPanel;
    },
    enabled: !!id,
  });
}

export function useCreateLabTestPanel() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; code?: string; description?: string; price?: number; tests?: string[] }) => {
      if (!profile?.organization_id) throw new Error("No organization");
      
      const { data: result, error } = await supabase
        .from("lab_test_panels")
        .insert({
          name: data.name,
          code: data.code,
          description: data.description,
          price: data.price || 0,
          tests: (data.tests || []) as unknown as Json,
          organization_id: profile.organization_id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-panels"] });
      toast.success("Test panel created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create panel: " + error.message);
    },
  });
}

export function useUpdateLabTestPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; code?: string; description?: string; price?: number; tests?: string[]; is_active?: boolean }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.tests) {
        updateData.tests = data.tests as unknown as Json;
      }
      
      const { data: result, error } = await supabase
        .from("lab_test_panels")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-panels"] });
      toast.success("Test panel updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update panel: " + error.message);
    },
  });
}

export function useDeleteLabTestPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lab_test_panels")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-test-panels"] });
      toast.success("Test panel deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete panel: " + error.message);
    },
  });
}

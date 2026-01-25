import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TemplateField {
  name: string;
  unit: string;
  normal_min: number | null;
  normal_max: number | null;
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
  service_type_id?: string | null;
}

// Fetch all lab test templates
export function useLabTestTemplates() {
  return useQuery({
    queryKey: ["lab-test-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_test_templates")
        .select("*")
        .eq("is_active", true)
        .order("test_name");

      if (error) throw error;
      
      // Parse fields from JSON
      return (data || []).map((template) => ({
        ...template,
        fields: (template.fields as unknown as TemplateField[]) || [],
      })) as LabTestTemplate[];
    },
  });
}

// Fetch template by test name
export function useLabTestTemplate(testName: string | undefined) {
  return useQuery({
    queryKey: ["lab-test-template", testName],
    queryFn: async () => {
      if (!testName) return null;
      
      const { data, error } = await supabase
        .from("lab_test_templates")
        .select("*")
        .eq("is_active", true)
        .ilike("test_name", `%${testName}%`)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        fields: (data.fields as unknown as TemplateField[]) || [],
      } as LabTestTemplate;
    },
    enabled: !!testName,
  });
}

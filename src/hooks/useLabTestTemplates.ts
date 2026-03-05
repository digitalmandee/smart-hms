import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

// Fetch all lab test templates for the user's organization
export function useLabTestTemplates() {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;

  return useQuery({
    queryKey: ["lab-test-templates", organizationId],
    queryFn: async () => {
      let query = supabase
        .from("lab_test_templates")
        .select("*")
        .eq("is_active", true)
        .order("test_name");

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map((template) => ({
        ...template,
        fields: (template.fields as unknown as TemplateField[]) || [],
      })) as LabTestTemplate[];
    },
    enabled: !!organizationId,
  });
}

// Fetch template by test name
export function useLabTestTemplate(testName: string | undefined) {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;

  return useQuery({
    queryKey: ["lab-test-template", testName, organizationId],
    queryFn: async () => {
      if (!testName) return null;
      
      let query = supabase
        .from("lab_test_templates")
        .select("*")
        .eq("is_active", true)
        .ilike("test_name", `%${testName}%`);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        fields: (data.fields as unknown as TemplateField[]) || [],
      } as LabTestTemplate;
    },
    enabled: !!testName && !!organizationId,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
export interface ReportTemplate {
  id: string;
  organization_id: string;
  report_type: string;
  name: string;
  template_content: string | null;
  header_content: string | null;
  footer_content: string | null;
  styles: string | null;
  variables: string[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export const REPORT_TYPES = [
  { value: "lab", label: "Lab Report" },
  { value: "radiology", label: "Radiology Report" },
  { value: "discharge", label: "Discharge Summary" },
  { value: "prescription", label: "Prescription" },
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "admission", label: "Admission Form" },
  { value: "consent", label: "Consent Form" },
];

// =====================
// Report Templates
// =====================

export function useReportTemplates(reportType?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["report-templates", profile?.organization_id, reportType],
    queryFn: async () => {
      let query = supabase
        .from("report_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (reportType) {
        query = query.eq("report_type", reportType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(template => ({
        ...template,
        variables: (template.variables as unknown as string[]) || [],
      })) as ReportTemplate[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAllReportTemplates() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["all-report-templates", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .order("report_type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []).map(template => ({
        ...template,
        variables: (template.variables as unknown as string[]) || [],
      })) as ReportTemplate[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useReportTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["report-template", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        variables: (data.variables as unknown as string[]) || [],
      } as ReportTemplate;
    },
    enabled: !!id,
  });
}

export function useDefaultReportTemplate(reportType: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["default-report-template", profile?.organization_id, reportType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("report_type", reportType)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        variables: (data.variables as unknown as string[]) || [],
      } as ReportTemplate;
    },
    enabled: !!profile?.organization_id && !!reportType,
  });
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ReportTemplate, "id" | "organization_id" | "created_at" | "is_active">) => {
      const { data: result, error } = await supabase
        .from("report_templates")
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          is_active: true,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["all-report-templates"] });
      toast.success("Template created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create template: " + error.message);
    },
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ReportTemplate> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("report_templates")
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
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["all-report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["report-template"] });
      queryClient.invalidateQueries({ queryKey: ["default-report-template"] });
      toast.success("Template updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });
}

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("report_templates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["all-report-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete template: " + error.message);
    },
  });
}

export function useSetDefaultTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reportType }: { id: string; reportType: string }) => {
      // First, unset all defaults for this report type
      await supabase
        .from("report_templates")
        .update({ is_default: false })
        .eq("report_type", reportType);

      // Set the new default
      const { data, error } = await supabase
        .from("report_templates")
        .update({ is_default: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["all-report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["default-report-template"] });
      toast.success("Default template updated");
    },
    onError: (error) => {
      toast.error("Failed to set default: " + error.message);
    },
  });
}

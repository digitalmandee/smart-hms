import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ImagingModality } from './useImaging';

export interface ImagingReportTemplate {
  id: string;
  organization_id: string;
  name: string;
  modality: ImagingModality;
  procedure_id: string | null;
  template_structure: {
    technique?: string;
    findings?: string;
    impression?: string;
    recommendations?: string;
  } | null;
  is_default?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  procedure?: {
    id: string;
    name: string;
  };
}

// Fetch all imaging report templates
export function useImagingReportTemplates(modalityType?: ImagingModality) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['imaging-report-templates', profile?.organization_id, modalityType],
    queryFn: async () => {
      let query = supabase
        .from('imaging_report_templates')
        .select('*, procedure:imaging_procedures(id, name)')
        .eq('is_active', true)
        .order('name');

      if (modalityType) {
        query = query.eq('modality', modalityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ImagingReportTemplate[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Fetch all templates including inactive (for management page)
export function useAllImagingReportTemplates() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['all-imaging-report-templates', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_report_templates')
        .select('*, procedure:imaging_procedures(id, name)')
        .order('modality')
        .order('name');

      if (error) throw error;
      return (data || []) as unknown as ImagingReportTemplate[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Fetch single template by ID
export function useImagingReportTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['imaging-report-template', id],
    queryFn: async () => {
      if (!id) throw new Error('Template ID required');
      
      const { data, error } = await supabase
        .from('imaging_report_templates')
        .select('*, procedure:imaging_procedures(id, name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ImagingReportTemplate;
    },
    enabled: !!id,
  });
}

// Fetch default template for a modality
export function useDefaultImagingTemplate(modalityType: ImagingModality | undefined) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['default-imaging-template', profile?.organization_id, modalityType],
    queryFn: async () => {
      if (!modalityType) return null;
      
      const { data, error } = await supabase
        .from('imaging_report_templates')
        .select('*')
        .eq('modality', modalityType)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as ImagingReportTemplate | null;
    },
    enabled: !!profile?.organization_id && !!modalityType,
  });
}

// Create template
export function useCreateImagingReportTemplate() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (template: {
      name: string;
      modality: ImagingModality;
      procedure_id?: string | null;
      template_structure: Record<string, string>;
      is_active?: boolean;
    }) => {
      const insertData = {
        name: template.name,
        modality: template.modality,
        procedure_id: template.procedure_id || null,
        template_structure: template.template_structure,
        is_active: template.is_active ?? true,
        organization_id: profile?.organization_id,
      };
      
      const { data, error } = await supabase
        .from('imaging_report_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-report-templates'] });
      queryClient.invalidateQueries({ queryKey: ['all-imaging-report-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

// Update template
export function useUpdateImagingReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      modality?: ImagingModality;
      procedure_id?: string | null;
      template_structure?: Record<string, string>;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('imaging_report_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['imaging-report-templates'] });
      queryClient.invalidateQueries({ queryKey: ['all-imaging-report-templates'] });
      queryClient.invalidateQueries({ queryKey: ['imaging-report-template', data.id] });
      toast.success('Template updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

// Delete template (soft delete)
export function useDeleteImagingReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('imaging_report_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-report-templates'] });
      queryClient.invalidateQueries({ queryKey: ['all-imaging-report-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

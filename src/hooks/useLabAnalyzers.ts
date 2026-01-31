import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LabAnalyzer {
  id: string;
  organization_id: string;
  branch_id: string | null;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  analyzer_type: string;
  connection_type: string;
  ip_address: string | null;
  port: number | null;
  location: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  connection_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLabAnalyzerInput {
  name: string;
  analyzer_type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  connection_type?: string;
  ip_address?: string;
  port?: number;
  location?: string;
  is_active?: boolean;
  branch_id?: string;
}

export const ANALYZER_TYPES = [
  { value: 'hematology', label: 'Hematology' },
  { value: 'chemistry', label: 'Clinical Chemistry' },
  { value: 'urinalysis', label: 'Urinalysis' },
  { value: 'coagulation', label: 'Coagulation' },
  { value: 'immunology', label: 'Immunology' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'serology', label: 'Serology' },
  { value: 'hormones', label: 'Hormones' },
  { value: 'blood_gas', label: 'Blood Gas' },
  { value: 'other', label: 'Other' },
] as const;

export const CONNECTION_TYPES = [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'hl7', label: 'HL7' },
  { value: 'astm', label: 'ASTM' },
  { value: 'api', label: 'API' },
] as const;

export function useLabAnalyzers() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['lab-analyzers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID');
      }

      const { data, error } = await supabase
        .from('lab_analyzers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) throw error;
      return data as LabAnalyzer[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useLabAnalyzer(id: string | undefined) {
  return useQuery({
    queryKey: ['lab-analyzer', id],
    queryFn: async () => {
      if (!id) throw new Error('No analyzer ID');

      const { data, error } = await supabase
        .from('lab_analyzers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as LabAnalyzer;
    },
    enabled: !!id,
  });
}

export function useCreateLabAnalyzer() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateLabAnalyzerInput) => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID');
      }

      const { data, error } = await supabase
        .from('lab_analyzers')
        .insert({
          organization_id: profile.organization_id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-analyzers'] });
      toast.success('Lab analyzer added successfully');
    },
    onError: (error) => {
      console.error('Error creating lab analyzer:', error);
      toast.error('Failed to add lab analyzer');
    },
  });
}

export function useUpdateLabAnalyzer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<LabAnalyzer> & { id: string }) => {
      const { data, error } = await supabase
        .from('lab_analyzers')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-analyzers'] });
      queryClient.invalidateQueries({ queryKey: ['lab-analyzer'] });
      toast.success('Lab analyzer updated successfully');
    },
    onError: (error) => {
      console.error('Error updating lab analyzer:', error);
      toast.error('Failed to update lab analyzer');
    },
  });
}

export function useDeleteLabAnalyzer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lab_analyzers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-analyzers'] });
      toast.success('Lab analyzer deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting lab analyzer:', error);
      toast.error('Failed to delete lab analyzer');
    },
  });
}

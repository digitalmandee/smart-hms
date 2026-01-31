import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LabAnalyzerTestMapping {
  id: string;
  analyzer_id: string;
  lab_test_template_id: string;
  analyzer_test_code: string;
  analyzer_test_name: string | null;
  is_active: boolean;
  created_at: string;
  // Joined data
  lab_test_template?: {
    id: string;
    test_name: string;
    test_category: string;
  };
}

export interface CreateTestMappingInput {
  analyzer_id: string;
  lab_test_template_id: string;
  analyzer_test_code: string;
  analyzer_test_name?: string;
  is_active?: boolean;
}

export function useLabAnalyzerMappings(analyzerId: string | undefined) {
  return useQuery({
    queryKey: ['lab-analyzer-mappings', analyzerId],
    queryFn: async () => {
      if (!analyzerId) throw new Error('No analyzer ID');

      const { data, error } = await supabase
        .from('lab_analyzer_test_mappings')
        .select(`
          *,
          lab_test_template:lab_test_templates(id, test_name, test_category)
        `)
        .eq('analyzer_id', analyzerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LabAnalyzerTestMapping[];
    },
    enabled: !!analyzerId,
  });
}

export function useCreateTestMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTestMappingInput) => {
      const { data, error } = await supabase
        .from('lab_analyzer_test_mappings')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lab-analyzer-mappings', variables.analyzer_id] });
      toast.success('Test mapping added successfully');
    },
    onError: (error: any) => {
      console.error('Error creating test mapping:', error);
      if (error.code === '23505') {
        toast.error('This test is already mapped to this analyzer');
      } else {
        toast.error('Failed to add test mapping');
      }
    },
  });
}

export function useUpdateTestMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<LabAnalyzerTestMapping> & { id: string }) => {
      const { data, error } = await supabase
        .from('lab_analyzer_test_mappings')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lab-analyzer-mappings'] });
      toast.success('Test mapping updated successfully');
    },
    onError: (error) => {
      console.error('Error updating test mapping:', error);
      toast.error('Failed to update test mapping');
    },
  });
}

export function useDeleteTestMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, analyzerId }: { id: string; analyzerId: string }) => {
      const { error } = await supabase
        .from('lab_analyzer_test_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return analyzerId;
    },
    onSuccess: (analyzerId) => {
      queryClient.invalidateQueries({ queryKey: ['lab-analyzer-mappings', analyzerId] });
      toast.success('Test mapping removed successfully');
    },
    onError: (error) => {
      console.error('Error deleting test mapping:', error);
      toast.error('Failed to remove test mapping');
    },
  });
}

export function useBulkCreateTestMappings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: CreateTestMappingInput[]) => {
      if (inputs.length === 0) return [];

      const { data, error } = await supabase
        .from('lab_analyzer_test_mappings')
        .insert(inputs)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['lab-analyzer-mappings', variables[0].analyzer_id] });
      }
      toast.success(`${variables.length} test mappings added successfully`);
    },
    onError: (error) => {
      console.error('Error creating test mappings:', error);
      toast.error('Failed to add test mappings');
    },
  });
}

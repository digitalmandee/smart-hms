import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const TRAINING_CATEGORIES = [
  { value: 'clinical', label: 'Clinical Training' },
  { value: 'safety', label: 'Safety & Compliance' },
  { value: 'it', label: 'IT & Systems' },
  { value: 'soft_skills', label: 'Soft Skills' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'infection_control', label: 'Infection Control' },
  { value: 'bls_acls', label: 'BLS/ACLS' },
  { value: 'general', label: 'General' },
];

export function useTrainingPrograms() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['training-programs', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await (supabase as any)
        .from('training_programs')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateTrainingProgram() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (program: { name: string; description?: string; category: string; is_mandatory: boolean; duration_hours?: number; instructor?: string }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('training_programs')
        .insert([{ ...program, organization_id: profile.organization_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      toast.success('Training program created');
    },
    onError: (error: Error) => toast.error('Failed to create program: ' + error.message),
  });
}

export function useTrainingEnrollments(programId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['training-enrollments', profile?.organization_id, programId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      let query = (supabase as any)
        .from('training_enrollments')
        .select(`*, employee:employee_id(id, first_name, last_name, employee_number), program:program_id(id, name, category)`)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (programId) query = query.eq('program_id', programId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useEnrollEmployee() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (enrollment: { program_id: string; employee_id: string }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('training_enrollments')
        .insert([{ ...enrollment, organization_id: profile.organization_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-enrollments'] });
      toast.success('Employee enrolled successfully');
    },
    onError: (error: Error) => toast.error('Failed to enroll: ' + error.message),
  });
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, score }: { id: string; status: string; score?: number }) => {
      const updates: any = { status };
      if (status === 'completed') updates.completed_at = new Date().toISOString();
      if (score !== undefined) updates.score = score;
      const { error } = await (supabase as any)
        .from('training_enrollments')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-enrollments'] });
      toast.success('Enrollment updated');
    },
    onError: (error: Error) => toast.error('Failed to update: ' + error.message),
  });
}

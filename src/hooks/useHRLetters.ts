import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const LETTER_TYPES = [
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'experience_certificate', label: 'Experience Certificate' },
  { value: 'salary_certificate', label: 'Salary Certificate' },
  { value: 'warning_letter', label: 'Warning Letter' },
  { value: 'noc', label: 'No Objection Certificate (NOC)' },
  { value: 'termination', label: 'Termination Letter' },
  { value: 'promotion', label: 'Promotion Letter' },
  { value: 'transfer', label: 'Transfer Letter' },
  { value: 'appreciation', label: 'Appreciation Letter' },
  { value: 'other', label: 'Other' },
];

export function useLetterTemplates() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['hr-letter-templates', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await (supabase as any)
        .from('hr_letter_templates')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateLetterTemplate() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (template: { name: string; letter_type: string; template_body: string; variables?: string[] }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('hr_letter_templates')
        .insert([{ ...template, organization_id: profile.organization_id, created_by: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-letter-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: Error) => toast.error('Failed to create template: ' + error.message),
  });
}

export function useIssuedLetters() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['hr-issued-letters', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await (supabase as any)
        .from('hr_issued_letters')
        .select(`*, employee:employee_id(id, first_name, last_name, employee_number)`)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useIssueLetter() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (letter: { employee_id: string; template_id?: string; letter_type: string; subject: string; body: string }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('hr_issued_letters')
        .insert([{ ...letter, organization_id: profile.organization_id, issued_by: user?.id, status: 'issued' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-issued-letters'] });
      toast.success('Letter issued successfully');
    },
    onError: (error: Error) => toast.error('Failed to issue letter: ' + error.message),
  });
}

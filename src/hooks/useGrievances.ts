import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const GRIEVANCE_CATEGORIES = [
  { value: 'workplace_safety', label: 'Workplace Safety' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'discrimination', label: 'Discrimination' },
  { value: 'compensation', label: 'Compensation' },
  { value: 'management', label: 'Management' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'workload', label: 'Workload' },
  { value: 'other', label: 'Other' },
];

export const GRIEVANCE_STATUSES = [
  { value: 'filed', label: 'Filed', color: 'bg-blue-100 text-blue-800' },
  { value: 'under_review', label: 'Under Review', color: 'bg-amber-100 text-amber-800' },
  { value: 'investigation', label: 'Investigation', color: 'bg-orange-100 text-orange-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

export function useGrievances(status?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['employee-grievances', profile?.organization_id, status],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      let query = (supabase as any)
        .from('employee_grievances')
        .select(`*, employee:employee_id(id, first_name, last_name, employee_number)`)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateGrievance() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  return useMutation({
    mutationFn: async (grievance: {
      employee_id: string; category: string; subject: string;
      description?: string; filed_date?: string;
    }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('employee_grievances')
        .insert([{ ...grievance, organization_id: profile.organization_id, created_by: user?.id }])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-grievances'] });
      toast.success('Grievance filed successfully');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateGrievance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; resolution_notes?: string; resolved_date?: string; assigned_to?: string }) => {
      const { data, error } = await (supabase as any)
        .from('employee_grievances')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-grievances'] });
      toast.success('Grievance updated');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

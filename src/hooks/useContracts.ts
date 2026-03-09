import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const CONTRACT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Fixed Term Contract' },
  { value: 'probation', label: 'Probation' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'visiting', label: 'Visiting' },
];

export function useEmployeeContracts(employeeId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['employee-contracts', profile?.organization_id, employeeId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      let query = (supabase as any)
        .from('employee_contracts')
        .select(`*, employee:employee_id(id, first_name, last_name, employee_number)`)
        .eq('organization_id', profile.organization_id)
        .order('start_date', { ascending: false });
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (contract: {
      employee_id: string; contract_type: string; start_date: string;
      end_date?: string; probation_end_date?: string; salary_amount?: number; notes?: string;
    }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('employee_contracts')
        .insert([{ ...contract, organization_id: profile.organization_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts'] });
      toast.success('Contract created successfully');
    },
    onError: (error: Error) => toast.error('Failed to create contract: ' + error.message),
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, is_probation_completed }: { id: string; status?: string; is_probation_completed?: boolean }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (is_probation_completed !== undefined) updates.is_probation_completed = is_probation_completed;
      updates.updated_at = new Date().toISOString();
      const { error } = await (supabase as any)
        .from('employee_contracts')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts'] });
      toast.success('Contract updated');
    },
    onError: (error: Error) => toast.error('Failed to update: ' + error.message),
  });
}

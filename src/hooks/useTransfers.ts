import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useTransfers(status?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['employee-transfers', profile?.organization_id, status],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      let query = (supabase as any)
        .from('employee_transfers')
        .select(`*, employee:employee_id(id, first_name, last_name, employee_number, department_id),
          from_department:from_department_id(id, name),
          to_department:to_department_id(id, name),
          from_branch:from_branch_id(id, name),
          to_branch:to_branch_id(id, name)`)
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

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  return useMutation({
    mutationFn: async (transfer: {
      employee_id: string; from_department_id?: string; to_department_id?: string;
      from_branch_id?: string; to_branch_id?: string; transfer_date: string;
      effective_date?: string; reason?: string;
    }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('employee_transfers')
        .insert([{ ...transfer, organization_id: profile.organization_id, created_by: user?.id, status: 'requested' }])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-transfers'] });
      toast.success('Transfer request created');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateTransferStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'approved' || status === 'rejected') updates.approved_by = user?.id;
      const { data, error } = await (supabase as any)
        .from('employee_transfers')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-transfers'] });
      toast.success('Transfer status updated');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

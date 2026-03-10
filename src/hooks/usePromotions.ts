import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function usePromotions() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['employee-promotions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await (supabase as any)
        .from('employee_promotions')
        .select(`*, employee:employee_id(id, first_name, last_name, employee_number),
          old_designation:old_designation_id(id, title),
          new_designation:new_designation_id(id, title)`)
        .eq('organization_id', profile.organization_id)
        .order('effective_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  return useMutation({
    mutationFn: async (promotion: {
      employee_id: string; old_designation_id?: string; new_designation_id?: string;
      old_salary?: number; new_salary?: number; effective_date: string; reason?: string;
    }) => {
      if (!profile?.organization_id) throw new Error('No organization');
      const { data, error } = await (supabase as any)
        .from('employee_promotions')
        .insert([{ ...promotion, organization_id: profile.organization_id, created_by: user?.id }])
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-promotions'] });
      toast.success('Promotion recorded');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });
}

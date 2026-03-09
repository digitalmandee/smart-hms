import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface OnboardingStep {
  id: string;
  employee_id: string;
  organization_id: string;
  step_name: string;
  step_category: string;
  sort_order: number;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  created_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
    category: { name: string; color: string } | null;
  };
}

const DEFAULT_ONBOARDING_STEPS = [
  { step_name: 'Document Collection', step_category: 'documents', sort_order: 1 },
  { step_name: 'ID Card Issuance', step_category: 'documents', sort_order: 2 },
  { step_name: 'IT Account Setup', step_category: 'it', sort_order: 3 },
  { step_name: 'System Access & Training', step_category: 'it', sort_order: 4 },
  { step_name: 'Uniform Issuance', step_category: 'logistics', sort_order: 5 },
  { step_name: 'Department Orientation', step_category: 'orientation', sort_order: 6 },
  { step_name: 'Policy Acknowledgement', step_category: 'orientation', sort_order: 7 },
  { step_name: 'Buddy/Mentor Assignment', step_category: 'orientation', sort_order: 8 },
  { step_name: 'Probation Goals Set', step_category: 'probation', sort_order: 9 },
  { step_name: 'First Week Check-in', step_category: 'followup', sort_order: 10 },
];

export function useOnboardingEmployees() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['onboarding-employees', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await (supabase as any)
        .from('employee_onboarding')
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, employee_number, category:category_id(name, color))
        `)
        .eq('organization_id', profile.organization_id)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Group by employee
      const grouped: Record<string, { employee: any; steps: OnboardingStep[]; progress: number }> = {};
      for (const step of (data || [])) {
        const empId = step.employee_id;
        if (!grouped[empId]) {
          grouped[empId] = { employee: step.employee, steps: [], progress: 0 };
        }
        grouped[empId].steps.push(step);
      }

      // Calculate progress
      for (const key of Object.keys(grouped)) {
        const g = grouped[key];
        const completed = g.steps.filter(s => s.is_completed).length;
        g.progress = g.steps.length > 0 ? Math.round((completed / g.steps.length) * 100) : 0;
      }

      return Object.values(grouped);
    },
    enabled: !!profile?.organization_id,
  });
}

export function useInitiateOnboarding() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const steps = DEFAULT_ONBOARDING_STEPS.map(step => ({
        ...step,
        employee_id: employeeId,
        organization_id: profile.organization_id,
      }));

      const { error } = await (supabase as any)
        .from('employee_onboarding')
        .insert(steps);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
      toast.success('Onboarding initiated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to initiate onboarding: ' + error.message);
    },
  });
}

export function useToggleOnboardingStep() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ stepId, isCompleted }: { stepId: string; isCompleted: boolean }) => {
      const { error } = await (supabase as any)
        .from('employee_onboarding')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          completed_by: isCompleted ? user?.id : null,
        })
        .eq('id', stepId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update step: ' + error.message);
    },
  });
}

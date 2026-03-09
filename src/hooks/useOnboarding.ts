import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface OnboardingStep {
  id: string;
  employee_id: string;
  organization_id: string;
  item_name: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  due_date: string | null;
  template_id: string | null;
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
  { item_name: 'Document Collection', description: 'Collect ID, certificates, contracts' },
  { item_name: 'ID Card Issuance', description: 'Issue employee ID badge' },
  { item_name: 'IT Account Setup', description: 'Create email and system accounts' },
  { item_name: 'System Access & Training', description: 'Grant system access and basic training' },
  { item_name: 'Uniform Issuance', description: 'Issue uniforms and PPE' },
  { item_name: 'Department Orientation', description: 'Introduce to team and department' },
  { item_name: 'Policy Acknowledgement', description: 'Review and sign company policies' },
  { item_name: 'Buddy/Mentor Assignment', description: 'Assign onboarding buddy' },
  { item_name: 'Probation Goals Set', description: 'Define probation period objectives' },
  { item_name: 'First Week Check-in', description: 'Manager check-in after first week' },
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
        .order('created_at', { ascending: true });

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

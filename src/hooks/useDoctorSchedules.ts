import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type DoctorSchedule = Database['public']['Tables']['doctor_schedules']['Row'];
type DoctorScheduleInsert = Database['public']['Tables']['doctor_schedules']['Insert'];
type DoctorScheduleUpdate = Database['public']['Tables']['doctor_schedules']['Update'];

export interface DoctorScheduleWithDoctor extends DoctorSchedule {
  doctor?: {
    id: string;
    profile: {
      full_name: string;
    };
    specialization: string | null;
  };
}

export function useDoctorSchedules(doctorId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['doctor-schedules', doctorId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('doctor_schedules')
        .select(`
          *,
          doctor:doctors(
            id,
            specialization,
            profile:profiles(full_name)
          )
        `)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DoctorScheduleWithDoctor[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useDoctorSchedule(id: string) {
  return useQuery({
    queryKey: ['doctor-schedule', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select(`
          *,
          doctor:doctors(
            id,
            specialization,
            profile:profiles(full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as DoctorScheduleWithDoctor;
    },
    enabled: !!id,
  });
}

export function useCreateDoctorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedule: DoctorScheduleInsert) => {
      const { data, error } = await supabase
        .from('doctor_schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
    },
  });
}

export function useUpdateDoctorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DoctorScheduleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('doctor_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule', variables.id] });
    },
  });
}

export function useDeleteDoctorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('doctor_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
    },
  });
}

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

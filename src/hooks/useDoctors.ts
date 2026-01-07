import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Doctor = Database['public']['Tables']['doctors']['Row'];

export interface DoctorWithProfile extends Doctor {
  profile: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export function useDoctors(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['doctors', profile?.organization_id, branchId],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(id, full_name, email, phone, avatar_url),
          branch:branches(id, name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_available', true);

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      return data as DoctorWithProfile[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(id, full_name, email, phone, avatar_url),
          branch:branches(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as DoctorWithProfile;
    },
    enabled: !!id,
  });
}

export function useAvailableSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['available-slots', doctorId, date],
    queryFn: async () => {
      if (!doctorId || !date) return [];

      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = new Date(date).getDay();

      // Get doctor's schedule for this day
      const { data: schedules, error: scheduleError } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (scheduleError) throw scheduleError;
      if (!schedules || schedules.length === 0) return [];

      // Get existing appointments for this doctor on this date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time, status')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');

      if (appointmentsError) throw appointmentsError;

      const bookedTimes = new Set(
        appointments?.map(a => a.appointment_time?.substring(0, 5)) || []
      );

      // Generate time slots
      const slots: { time: string; available: boolean }[] = [];

      for (const schedule of schedules) {
        const startTime = schedule.start_time;
        const endTime = schedule.end_time;
        const duration = schedule.slot_duration_minutes || 15;
        const maxPatients = schedule.max_patients_per_slot || 1;

        let currentTime = parseTime(startTime);
        const endTimeMinutes = parseTime(endTime);

        while (currentTime < endTimeMinutes) {
          const timeStr = formatTime(currentTime);
          const bookedCount = appointments?.filter(
            a => a.appointment_time?.substring(0, 5) === timeStr
          ).length || 0;

          slots.push({
            time: timeStr,
            available: bookedCount < maxPatients,
          });

          currentTime += duration;
        }
      }

      return slots;
    },
    enabled: !!doctorId && !!date,
  });
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

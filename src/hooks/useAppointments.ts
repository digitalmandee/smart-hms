import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];
type AppointmentStatus = Database['public']['Enums']['appointment_status'];
type AppointmentType = Database['public']['Enums']['appointment_type'];

interface AppointmentFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  patientId?: string;
  branchId?: string;
}

export interface AppointmentWithRelations extends Appointment {
  patient?: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_number: string;
    phone: string | null;
  };
  doctor?: {
    id: string;
    profile: {
      full_name: string;
    };
    specialization: string | null;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export function useAppointments(filters: AppointmentFilters = {}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['appointments', filters, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone),
          doctor:doctors(id, specialization, profile:profiles(full_name)),
          branch:branches(id, name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (filters.date) {
        query = query.eq('appointment_date', filters.date);
      }
      if (filters.dateFrom) {
        query = query.gte('appointment_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('appointment_date', filters.dateTo);
      }
      if (filters.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('appointment_type', filters.type);
      }
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AppointmentWithRelations[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone, email, date_of_birth, gender, blood_group),
          doctor:doctors(id, specialization, qualification, profile:profiles(full_name)),
          branch:branches(id, name, address, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AppointmentWithRelations;
    },
    enabled: !!id,
  });
}

export function useTodayQueue(branchId?: string, doctorId?: string) {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['today-queue', branchId, doctorId, today, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone),
          doctor:doctors(id, specialization, profile:profiles(full_name))
        `)
        .eq('organization_id', profile.organization_id)
        .eq('appointment_date', today)
        .in('status', ['scheduled', 'checked_in', 'in_progress'])
        .order('token_number', { ascending: true });

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AppointmentWithRelations[];
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAppointmentStats(dateFrom?: string, dateTo?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['appointment-stats', profile?.organization_id, dateFrom, dateTo],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return { total: 0, scheduled: 0, completed: 0, cancelled: 0, noShow: 0, todayCount: 0 };
      }

      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('appointments')
        .select('id, status, appointment_date')
        .eq('organization_id', profile.organization_id);

      if (dateFrom) query = query.gte('appointment_date', dateFrom);
      if (dateTo) query = query.lte('appointment_date', dateTo);

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        scheduled: data.filter(a => a.status === 'scheduled' || a.status === 'checked_in').length,
        completed: data.filter(a => a.status === 'completed').length,
        cancelled: data.filter(a => a.status === 'cancelled').length,
        noShow: data.filter(a => a.status === 'no_show').length,
        todayCount: data.filter(a => a.appointment_date === today).length,
      };

      return stats;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (appointment: Omit<AppointmentInsert, 'organization_id' | 'created_by'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      // Get next token number for this doctor on this date
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('token_number')
        .eq('doctor_id', appointment.doctor_id!)
        .eq('appointment_date', appointment.appointment_date)
        .order('token_number', { ascending: false })
        .limit(1);

      const nextToken = existingAppointments && existingAppointments.length > 0
        ? (existingAppointments[0].token_number || 0) + 1
        : 1;

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointment,
          organization_id: profile.organization_id,
          created_by: user?.id,
          token_number: nextToken,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['today-queue'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['today-queue'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] });
    },
  });
}

export function useCheckInAppointment() {
  const updateAppointment = useUpdateAppointment();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateAppointment.mutateAsync({ id, status: 'checked_in' });
    },
  });
}

export function useStartConsultation() {
  const updateAppointment = useUpdateAppointment();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateAppointment.mutateAsync({ id, status: 'in_progress' });
    },
  });
}

export function useCompleteAppointment() {
  const updateAppointment = useUpdateAppointment();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateAppointment.mutateAsync({ id, status: 'completed' });
    },
  });
}

export function useCancelAppointment() {
  const updateAppointment = useUpdateAppointment();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateAppointment.mutateAsync({ id, status: 'cancelled' });
    },
  });
}

export function useMarkNoShow() {
  const updateAppointment = useUpdateAppointment();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateAppointment.mutateAsync({ id, status: 'no_show' });
    },
  });
}

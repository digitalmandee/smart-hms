import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface UseAppointmentNotificationsProps {
  doctorId?: string;
  enabled?: boolean;
}

export function useAppointmentNotifications({
  doctorId,
  enabled = true,
}: UseAppointmentNotificationsProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled || !doctorId) return;

    const channel = supabase
      .channel(`doctor-appointments-${doctorId}`)
      // Listen for new appointments
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          const timeStr = payload.new.appointment_time?.substring(0, 5) || 'today';
          toast.success('New Appointment Booked', {
            description: `Patient scheduled for ${timeStr}`,
            duration: 6000,
            action: {
              label: 'View',
              onClick: () => navigate(`/app/appointments/${payload.new.id}`),
            },
          });
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
      )
      // Listen for status updates
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;

          if (oldStatus !== newStatus) {
            if (newStatus === 'checked_in') {
              toast.info('Patient Checked In', {
                description: `Token #${payload.new.token_number} is waiting`,
                duration: 5000,
                action: {
                  label: 'View',
                  onClick: () => navigate(`/app/appointments/${payload.new.id}`),
                },
              });
            } else if (newStatus === 'cancelled') {
              toast.warning('Appointment Cancelled', {
                description: `Token #${payload.new.token_number} was cancelled`,
                duration: 5000,
              });
            }
            // No notifications for in_progress/completed - doctor initiates those
          }
          
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId, enabled, queryClient, navigate]);
}

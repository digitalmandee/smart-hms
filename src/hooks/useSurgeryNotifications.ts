import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface UseSurgeryNotificationsProps {
  doctorId?: string;
  enabled?: boolean;
}

// =============================================================================
// SURGERY NOTIFICATIONS HOOK
// =============================================================================

export function useSurgeryNotifications({ 
  doctorId, 
  enabled = true 
}: UseSurgeryNotificationsProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !doctorId) return;

    // Channel for surgery status changes
    const surgeriesChannel = supabase
      .channel(`doctor-surgeries-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'surgeries',
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          // Check if this surgery involves this doctor
          if (newData.lead_surgeon_id !== doctorId) return;

          // Status changed
          if (oldData.status !== newData.status) {
            const statusMessages: Record<string, string> = {
              confirmed: 'Surgery has been fully confirmed by all team members',
              rescheduled: 'Surgery has been rescheduled - please re-confirm',
              cancelled: 'Surgery has been cancelled',
              in_progress: 'Surgery has started',
              completed: 'Surgery completed successfully',
            };

            const message = statusMessages[newData.status];
            if (message) {
              toast.info(`Surgery Update: ${message}`, {
                description: newData.procedure_name,
                duration: 5000,
              });
            }
          }

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['surgeries'] });
          queryClient.invalidateQueries({ queryKey: ['surgery', newData.id] });
        }
      )
      .subscribe();

    // Channel for team member confirmation changes
    const confirmationsChannel = supabase
      .channel(`surgery-confirmations-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'surgery_team_members',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          
          toast.info('New Surgery Assignment', {
            description: 'You have been assigned to a new surgery. Please confirm.',
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = `/app/ot/surgeries/${newData.surgery_id}`;
              },
            },
          });

          queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
          queryClient.invalidateQueries({ queryKey: ['surgeries'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'surgery_team_members',
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          // Confirmation status changed
          if (oldData.confirmation_status !== newData.confirmation_status) {
            // Only show if it's another team member confirming
            if (newData.doctor_id !== doctorId) {
              if (newData.confirmation_status === 'accepted') {
                toast.success('Team Member Confirmed', {
                  description: 'A team member has confirmed their assignment',
                  duration: 4000,
                });
              } else if (newData.confirmation_status === 'declined') {
                toast.warning('Team Member Declined', {
                  description: 'A team member has declined their assignment',
                  duration: 5000,
                });
              }
            }

            queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
            queryClient.invalidateQueries({ queryKey: ['surgeries'] });
            queryClient.invalidateQueries({ queryKey: ['surgery-team-confirmations'] });
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(surgeriesChannel);
      supabase.removeChannel(confirmationsChannel);
    };
  }, [doctorId, enabled, queryClient]);
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface BiometricSyncLog {
  id: string;
  organization_id: string;
  device_id: string | null;
  sync_type: 'manual' | 'scheduled' | 'real-time';
  status: 'success' | 'failed' | 'partial' | 'in_progress';
  records_synced: number;
  records_failed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  device?: {
    device_name: string;
    serial_number: string;
  };
}

export function useBiometricSyncLogs(deviceId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["biometric-sync-logs", profile?.organization_id, deviceId],
    queryFn: async () => {
      let query = supabase
        .from("biometric_sync_logs")
        .select(`
          *,
          device:biometric_devices(device_name, device_serial)
        `)
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (deviceId) {
        query = query.eq("device_id", deviceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateSyncLog() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      device_id: string;
      sync_type?: 'manual' | 'scheduled' | 'real-time';
    }) => {
      const { data: syncLog, error } = await supabase
        .from("biometric_sync_logs")
        .insert({
          organization_id: profile!.organization_id,
          device_id: data.device_id,
          sync_type: data.sync_type || 'manual',
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return syncLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-sync-logs"] });
    },
  });
}

export function useCompleteSyncLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      status: 'success' | 'failed' | 'partial';
      records_synced?: number;
      records_failed?: number;
      error_message?: string;
    }) => {
      const { error } = await supabase
        .from("biometric_sync_logs")
        .update({
          status: data.status,
          records_synced: data.records_synced || 0,
          records_failed: data.records_failed || 0,
          error_message: data.error_message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-sync-logs"] });
    },
  });
}

export function useSyncDevice() {
  const createLog = useCreateSyncLog();
  const completeLog = useCompleteSyncLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      // Create sync log entry
      const syncLog = await createLog.mutateAsync({ device_id: deviceId });
      
      // DEMO MODE: This is a simulation
      // In production, this would connect to actual biometric device SDK (e.g., ZKTeco)
      // Real implementation would use device IP/port from biometric_devices table
      // and communicate via manufacturer's SDK/API
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Demo mode always succeeds with a message
      await completeLog.mutateAsync({
        id: syncLog.id,
        status: 'success',
        records_synced: 0,
        records_failed: 0,
        error_message: 'Demo mode - no actual device connection',
      });

      // Update device last_sync_at for demo
      await supabase
        .from("biometric_devices")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", deviceId);

      return { success: true, recordsSynced: 0, isDemo: true };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["biometric-devices"] });
      toast.info("Demo Mode: Biometric device integration requires SDK setup", {
        description: "Contact support to configure real device connectivity",
      });
    },
    onError: () => {
      toast.error("Failed to sync device");
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PACSSettings {
  pacs_server_url: string;
  pacs_username: string;
  pacs_password: string;
  pacs_ae_title: string;
}

const PACS_SETTING_KEYS = [
  'pacs_server_url',
  'pacs_username',
  'pacs_password',
  'pacs_ae_title',
] as const;

export function usePACSSettings() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['pacs-settings', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID');
      }
      
      const { data, error } = await supabase
        .from('organization_settings')
        .select('setting_key, setting_value')
        .eq('organization_id', profile.organization_id)
        .in('setting_key', PACS_SETTING_KEYS);
      
      if (error) throw error;
      
      const settings: PACSSettings = {
        pacs_server_url: '',
        pacs_username: '',
        pacs_password: '',
        pacs_ae_title: 'LOVABLE_HMS',
      };
      
      data?.forEach((row) => {
        const key = row.setting_key as keyof PACSSettings;
        if (key in settings) {
          settings[key] = row.setting_value || '';
        }
      });
      
      return settings;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpdatePACSSettings() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (settings: Partial<PACSSettings>) => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID');
      }
      
      // Use edge function to save settings securely
      const { data, error } = await supabase.functions.invoke('pacs-settings', {
        body: {
          action: 'save',
          organization_id: profile.organization_id,
          settings,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacs-settings'] });
      queryClient.invalidateQueries({ queryKey: ['pacs-health'] });
      toast.success('PACS settings saved successfully');
    },
    onError: (error) => {
      console.error('Error saving PACS settings:', error);
      toast.error('Failed to save PACS settings');
    },
  });
}

export function useTestPACSConnection() {
  return useMutation({
    mutationFn: async (settings: Partial<PACSSettings>) => {
      // Use edge function to test connection without saving
      const { data, error } = await supabase.functions.invoke('pacs-settings', {
        body: {
          action: 'test',
          settings,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error testing PACS connection:', error);
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PACSServer {
  id: string;
  organization_id: string;
  branch_id: string | null;
  name: string;
  server_url: string;
  ae_title: string;
  username: string | null;
  password: string | null;
  modality_types: string[];
  is_default: boolean;
  is_active: boolean;
  last_connection_check: string | null;
  connection_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePACSServerInput {
  name: string;
  server_url: string;
  ae_title?: string;
  username?: string;
  password?: string;
  modality_types?: string[];
  is_default?: boolean;
  is_active?: boolean;
  branch_id?: string;
}

export function usePACSServers() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['pacs-servers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID');
      }

      const { data, error } = await supabase
        .from('pacs_servers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as PACSServer[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePACSServer(id: string | undefined) {
  return useQuery({
    queryKey: ['pacs-server', id],
    queryFn: async () => {
      if (!id) throw new Error('No server ID');

      const { data, error } = await supabase
        .from('pacs_servers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PACSServer;
    },
    enabled: !!id,
  });
}

export function useCreatePACSServer() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePACSServerInput) => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID');
      }

      // If setting as default, unset other defaults first
      if (input.is_default) {
        await supabase
          .from('pacs_servers')
          .update({ is_default: false })
          .eq('organization_id', profile.organization_id);
      }

      const { data, error } = await supabase
        .from('pacs_servers')
        .insert({
          organization_id: profile.organization_id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacs-servers'] });
      toast.success('PACS server added successfully');
    },
    onError: (error) => {
      console.error('Error creating PACS server:', error);
      toast.error('Failed to add PACS server');
    },
  });
}

export function useUpdatePACSServer() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<PACSServer> & { id: string }) => {
      // If setting as default, unset other defaults first
      if (input.is_default && profile?.organization_id) {
        await supabase
          .from('pacs_servers')
          .update({ is_default: false })
          .eq('organization_id', profile.organization_id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('pacs_servers')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacs-servers'] });
      queryClient.invalidateQueries({ queryKey: ['pacs-server'] });
      toast.success('PACS server updated successfully');
    },
    onError: (error) => {
      console.error('Error updating PACS server:', error);
      toast.error('Failed to update PACS server');
    },
  });
}

export function useDeletePACSServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pacs_servers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacs-servers'] });
      toast.success('PACS server deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting PACS server:', error);
      toast.error('Failed to delete PACS server');
    },
  });
}

export function useTestPACSServerConnection() {
  return useMutation({
    mutationFn: async (server: Partial<PACSServer>) => {
      const { data, error } = await supabase.functions.invoke('pacs-settings', {
        body: {
          action: 'test',
          settings: {
            pacs_server_url: server.server_url,
            pacs_username: server.username,
            pacs_password: server.password,
            pacs_ae_title: server.ae_title,
          },
        },
      });

      if (error) throw error;
      return data as { success: boolean; message: string };
    },
  });
}

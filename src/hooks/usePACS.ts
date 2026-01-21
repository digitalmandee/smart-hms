import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Get the Supabase URL from env
const SUPABASE_URL = "https://eelqfwotuqfatxfgvvjg.supabase.co";

export interface PACSStudy {
  studyInstanceUID: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  accessionNumber: string;
  modalities: string[];
  seriesCount: number;
  instanceCount: number;
}

export interface PACSSeries {
  seriesInstanceUID: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  instanceCount: number;
}

export interface PACSInstance {
  sopInstanceUID: string;
  instanceNumber: number;
  sopClassUID: string;
}

export interface PACSHealthStatus {
  status: 'connected' | 'error' | 'not_configured';
  pacsServer?: string;
  aeTitle?: string;
  configured: boolean;
  message?: string;
}

// Check PACS connectivity
export function usePACSHealth() {
  return useQuery({
    queryKey: ['pacs-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<PACSHealthStatus>('pacs-gateway', {
        method: 'GET',
      });
      
      if (error) {
        return {
          status: 'not_configured' as const,
          configured: false,
          message: error.message,
        };
      }
      
      return data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

// Query studies by patient ID
export function usePACSStudies(patientId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['pacs-studies', patientId],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/pacs-gateway/studies?patientId=${patientId || ''}`,
        {
          headers: {
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch PACS studies');
      }
      
      const result = await response.json();
      return result.studies as PACSStudy[];
    },
    enabled: options?.enabled !== false && !!patientId,
  });
}

// Get series for a study
export function usePACSSeries(studyUid?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['pacs-series', studyUid],
    queryFn: async () => {
      if (!studyUid) throw new Error('Study UID is required');
      
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/pacs-gateway/studies/${studyUid}/series`,
        {
          headers: {
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch series');
      }
      
      const result = await response.json();
      return result.series as PACSSeries[];
    },
    enabled: options?.enabled !== false && !!studyUid,
  });
}

// Get instances for a series
export function usePACSInstances(studyUid?: string, seriesUid?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['pacs-instances', studyUid, seriesUid],
    queryFn: async () => {
      if (!studyUid || !seriesUid) throw new Error('Study and Series UIDs are required');
      
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/pacs-gateway/studies/${studyUid}/series/${seriesUid}/instances`,
        {
          headers: {
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch instances');
      }
      
      const result = await response.json();
      return result.instances as PACSInstance[];
    },
    enabled: options?.enabled !== false && !!studyUid && !!seriesUid,
  });
}

// Get rendered image URL
export function getPACSImageUrl(
  studyUid: string,
  seriesUid: string,
  instanceUid: string,
  frame?: number
): string {
  let url = `${SUPABASE_URL}/functions/v1/pacs-gateway/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/rendered`;
  
  if (frame) {
    url += `?frame=${frame}`;
  }
  
  return url;
}

// Get thumbnail URL
export function getPACSThumbnailUrl(studyUid: string, seriesUid: string): string {
  return `${SUPABASE_URL}/functions/v1/pacs-gateway/studies/${studyUid}/series/${seriesUid}/thumbnail`;
}

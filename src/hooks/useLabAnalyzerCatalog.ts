import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LabAnalyzerCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  analyzer_type: string;
  connection_protocol: string;
  default_port: number | null;
  hl7_version: string | null;
  message_format: string | null;
  result_segment: string | null;
  notes: string | null;
  is_active: boolean;
}

export function useLabAnalyzerCatalog() {
  return useQuery({
    queryKey: ['lab-analyzer-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_analyzer_catalog')
        .select('*')
        .eq('is_active', true)
        .order('manufacturer', { ascending: true })
        .order('model', { ascending: true });

      if (error) throw error;
      return data as LabAnalyzerCatalogItem[];
    },
  });
}

// Group catalog by manufacturer for easier display
export function useLabAnalyzerCatalogGrouped() {
  const { data, ...rest } = useLabAnalyzerCatalog();

  const grouped = data?.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = [];
    }
    acc[item.manufacturer].push(item);
    return acc;
  }, {} as Record<string, LabAnalyzerCatalogItem[]>);

  return { data: grouped, items: data, ...rest };
}

// Filter catalog by type
export function useLabAnalyzerCatalogByType(type?: string) {
  const { data, ...rest } = useLabAnalyzerCatalog();

  const filtered = type 
    ? data?.filter(item => item.analyzer_type === type)
    : data;

  return { data: filtered, ...rest };
}

// Get analyzer types from catalog
export function useAnalyzerTypesFromCatalog() {
  const { data, ...rest } = useLabAnalyzerCatalog();

  const types = data 
    ? [...new Set(data.map(item => item.analyzer_type))].sort()
    : [];

  return { data: types, ...rest };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RadiologyDeviceCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  device_type: string;
  modality_code: string | null;
  dicom_ae_title: string | null;
  default_port: number | null;
  supports_dicomweb: boolean;
  supports_worklist: boolean;
  notes: string | null;
  is_active: boolean;
}

export function useRadiologyDeviceCatalog() {
  return useQuery({
    queryKey: ['radiology-device-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radiology_device_catalog')
        .select('*')
        .eq('is_active', true)
        .order('manufacturer', { ascending: true })
        .order('model', { ascending: true });

      if (error) throw error;
      return data as RadiologyDeviceCatalogItem[];
    },
  });
}

// Group catalog by manufacturer
export function useRadiologyDeviceCatalogGrouped() {
  const { data, ...rest } = useRadiologyDeviceCatalog();

  const grouped = data?.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = [];
    }
    acc[item.manufacturer].push(item);
    return acc;
  }, {} as Record<string, RadiologyDeviceCatalogItem[]>);

  return { data: grouped, items: data, ...rest };
}

// Filter catalog by device type
export function useRadiologyDeviceCatalogByType(type?: string) {
  const { data, ...rest } = useRadiologyDeviceCatalog();

  const filtered = type 
    ? data?.filter(item => item.device_type === type)
    : data;

  return { data: filtered, ...rest };
}

// Get device types from catalog
export function useDeviceTypesFromCatalog() {
  const { data, ...rest } = useRadiologyDeviceCatalog();

  const types = data 
    ? [...new Set(data.map(item => item.device_type))].sort()
    : [];

  return { data: types, ...rest };
}

// Get modality codes from catalog
export function useModalityCodesFromCatalog() {
  const { data, ...rest } = useRadiologyDeviceCatalog();

  const modalities = data 
    ? [...new Set(data.filter(item => item.modality_code).map(item => item.modality_code!))].sort()
    : [];

  return { data: modalities, ...rest };
}

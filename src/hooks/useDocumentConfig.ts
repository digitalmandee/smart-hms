import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Default document categories
export const DEFAULT_DOCUMENT_CATEGORIES = [
  { code: 'identity', name: 'Identity Documents' },
  { code: 'education', name: 'Education Certificates' },
  { code: 'employment', name: 'Employment Documents' },
  { code: 'medical', name: 'Medical Certificates' },
  { code: 'other', name: 'Other Documents' },
];

// Default document types
export const DEFAULT_DOCUMENT_TYPES = [
  { code: 'national_id', name: 'National ID / CNIC', category_code: 'identity', requires_expiry: true },
  { code: 'passport', name: 'Passport', category_code: 'identity', requires_expiry: true },
  { code: 'driving_license', name: 'Driving License', category_code: 'identity', requires_expiry: true },
  { code: 'degree', name: 'Degree Certificate', category_code: 'education', requires_expiry: false },
  { code: 'transcript', name: 'Transcript', category_code: 'education', requires_expiry: false },
  { code: 'experience_letter', name: 'Experience Letter', category_code: 'employment', requires_expiry: false },
  { code: 'offer_letter', name: 'Offer Letter', category_code: 'employment', requires_expiry: false },
  { code: 'contract', name: 'Employment Contract', category_code: 'employment', requires_expiry: true },
  { code: 'relieving_letter', name: 'Relieving Letter', category_code: 'employment', requires_expiry: false },
  { code: 'fitness_certificate', name: 'Medical Fitness Certificate', category_code: 'medical', requires_expiry: true },
  { code: 'other', name: 'Other', category_code: 'other', requires_expiry: false },
];

// Default license types
export const DEFAULT_LICENSE_TYPES = [
  { code: 'medical', name: 'Medical License (MBBS/MD)' },
  { code: 'nursing', name: 'Nursing License' },
  { code: 'pharmacy', name: 'Pharmacy License' },
  { code: 'lab_technician', name: 'Lab Technician License' },
  { code: 'radiology', name: 'Radiology Technician License' },
  { code: 'physiotherapy', name: 'Physiotherapy License' },
  { code: 'dental', name: 'Dental License' },
  { code: 'other', name: 'Other Professional License' },
];

export interface DocumentCategoryConfig {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface DocumentTypeConfig {
  id: string;
  code: string;
  name: string;
  category_id?: string;
  category_code?: string;
  requires_expiry: boolean;
  sort_order: number;
  is_active: boolean;
}

export const useDocumentCategoriesConfig = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-document-categories", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return DEFAULT_DOCUMENT_CATEGORIES.map((dc, i) => ({ 
          ...dc, 
          id: `default-${i}`, 
          sort_order: i, 
          is_active: true 
        }));
      }
      
      const { data, error } = await supabase
        .from("config_document_categories")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_DOCUMENT_CATEGORIES.map((dc, i) => ({ 
          ...dc, 
          id: `default-${i}`, 
          sort_order: i, 
          is_active: true 
        }));
      }
      return data as DocumentCategoryConfig[];
    },
    enabled: true,
  });
};

export const useDocumentTypesConfig = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-document-types", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return DEFAULT_DOCUMENT_TYPES.map((dt, i) => ({ 
          ...dt, 
          id: `default-${i}`, 
          sort_order: i, 
          is_active: true,
          requires_expiry: dt.requires_expiry || false,
        }));
      }
      
      const { data, error } = await supabase
        .from("config_document_types")
        .select("*, category:config_document_categories(code, name)")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_DOCUMENT_TYPES.map((dt, i) => ({ 
          ...dt, 
          id: `default-${i}`, 
          sort_order: i, 
          is_active: true,
          requires_expiry: dt.requires_expiry || false,
        }));
      }
      return data as DocumentTypeConfig[];
    },
    enabled: true,
  });
};

// For backward compatibility - returns value/label format
export const useDocumentCategoryOptions = () => {
  const { data: categories, isLoading } = useDocumentCategoriesConfig();
  
  const options = categories?.map(c => ({
    value: c.code,
    label: c.name,
  })) || DEFAULT_DOCUMENT_CATEGORIES.map(c => ({ value: c.code, label: c.name }));
  
  return { options, isLoading };
};

export const useDocumentTypeOptions = (categoryCode?: string) => {
  const { data: types, isLoading } = useDocumentTypesConfig();
  
  let filtered = types || DEFAULT_DOCUMENT_TYPES.map((dt, i) => ({ 
    ...dt, 
    id: `default-${i}`, 
    sort_order: i, 
    is_active: true 
  }));
  
  if (categoryCode) {
    filtered = filtered.filter(t => t.category_code === categoryCode);
  }
  
  const options = filtered.map(t => ({
    value: t.code,
    label: t.name,
    category: t.category_code,
  }));
  
  return { options, isLoading };
};

export const useLicenseTypeOptions = () => {
  // License types could also be database-driven in the future
  return {
    options: DEFAULT_LICENSE_TYPES.map(l => ({ value: l.code, label: l.name })),
    isLoading: false,
  };
};

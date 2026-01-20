import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Default nurse specializations (fallback when database is empty)
export const DEFAULT_NURSE_SPECIALIZATIONS = [
  { code: "general", name: "General Nursing" },
  { code: "icu", name: "ICU/Critical Care" },
  { code: "emergency", name: "Emergency/Trauma" },
  { code: "pediatric", name: "Pediatric" },
  { code: "neonatal", name: "Neonatal/NICU" },
  { code: "surgical", name: "Surgical/OR" },
  { code: "cardiac", name: "Cardiac Care" },
  { code: "oncology", name: "Oncology" },
  { code: "dialysis", name: "Dialysis/Renal" },
  { code: "obstetric", name: "Obstetric/Labor & Delivery" },
  { code: "psychiatric", name: "Psychiatric/Mental Health" },
  { code: "geriatric", name: "Geriatric" },
  { code: "community", name: "Community Health" },
  { code: "infection_control", name: "Infection Control" },
];

export interface NurseSpecializationConfig {
  id: string;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export const useNurseSpecializationsConfig = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-nurse-specializations", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        return DEFAULT_NURSE_SPECIALIZATIONS.map((ns, i) => ({ 
          ...ns, 
          id: `default-${i}`, 
          sort_order: i, 
          is_active: true 
        }));
      }
      
      const { data, error } = await supabase
        .from("config_nurse_specializations")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_NURSE_SPECIALIZATIONS.map((ns, i) => ({ 
          ...ns, 
          id: `default-${i}`, 
          sort_order: i, 
          is_active: true 
        }));
      }
      return data as NurseSpecializationConfig[];
    },
    enabled: true,
  });
};

// For backward compatibility - returns value/label format
export const useNurseSpecializationOptions = () => {
  const { data: specializations, isLoading } = useNurseSpecializationsConfig();
  
  const options = specializations?.map(s => ({
    value: s.code,
    label: s.name,
  })) || DEFAULT_NURSE_SPECIALIZATIONS.map(s => ({ value: s.code, label: s.name }));
  
  return { options, isLoading };
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Default fallback values (used when database is empty)
const DEFAULT_CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"];
const DEFAULT_LANGUAGES = ["Urdu", "English", "Punjabi", "Sindhi", "Pashto", "Balochi", "Saraiki"];
const DEFAULT_OCCUPATIONS = ["Business", "Government Employee", "Private Employee", "Doctor", "Engineer", "Teacher", "Student", "Housewife", "Retired", "Farmer", "Labour", "Other"];
const DEFAULT_RELATIONS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Friend", "Other"];
const DEFAULT_REFERRAL_SOURCES = ["Doctor Referral", "Hospital Referral", "Walk-in", "Online", "Friend/Family", "Advertisement", "Other"];
const DEFAULT_INSURANCE_PROVIDERS = ["State Life", "Jubilee Life", "EFU Life", "Adamjee Insurance", "Allianz EFU", "IGI Insurance", "Other"];

export interface ConfigItem {
  id: string;
  name: string;
  code?: string;
  province?: string;
  contact_number?: string;
  sort_order: number;
  is_active: boolean;
}

export const useConfigCities = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-cities", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return DEFAULT_CITIES.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      
      const { data, error } = await supabase
        .from("config_cities")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_CITIES.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      }
      return data;
    },
    enabled: true,
  });
};

export const useConfigLanguages = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-languages", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return DEFAULT_LANGUAGES.map((name, i) => ({ id: `default-${i}`, name, code: name.toLowerCase(), sort_order: i, is_active: true }));
      
      const { data, error } = await supabase
        .from("config_languages")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_LANGUAGES.map((name, i) => ({ id: `default-${i}`, name, code: name.toLowerCase(), sort_order: i, is_active: true }));
      }
      return data;
    },
    enabled: true,
  });
};

export const useConfigOccupations = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-occupations", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return DEFAULT_OCCUPATIONS.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      
      const { data, error } = await supabase
        .from("config_occupations")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_OCCUPATIONS.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      }
      return data;
    },
    enabled: true,
  });
};

export const useConfigRelations = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-relations", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return DEFAULT_RELATIONS.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      
      const { data, error } = await supabase
        .from("config_relations")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_RELATIONS.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      }
      return data;
    },
    enabled: true,
  });
};

export const useConfigReferralSources = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-referral-sources", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return DEFAULT_REFERRAL_SOURCES.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      
      const { data, error } = await supabase
        .from("config_referral_sources")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_REFERRAL_SOURCES.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      }
      return data;
    },
    enabled: true,
  });
};

export const useConfigInsuranceProviders = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config-insurance-providers", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return DEFAULT_INSURANCE_PROVIDERS.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      
      const { data, error } = await supabase
        .from("config_insurance_providers")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return DEFAULT_INSURANCE_PROVIDERS.map((name, i) => ({ id: `default-${i}`, name, sort_order: i, is_active: true }));
      }
      return data;
    },
    enabled: true,
  });
};

// Combined hook for convenience
export const usePatientConfig = () => {
  const cities = useConfigCities();
  const languages = useConfigLanguages();
  const occupations = useConfigOccupations();
  const relations = useConfigRelations();
  const referralSources = useConfigReferralSources();
  const insuranceProviders = useConfigInsuranceProviders();

  return {
    cities,
    languages,
    occupations,
    relations,
    referralSources,
    insuranceProviders,
    isLoading: cities.isLoading || languages.isLoading || occupations.isLoading || 
               relations.isLoading || referralSources.isLoading || insuranceProviders.isLoading,
  };
};

// Export defaults for backward compatibility
export { DEFAULT_CITIES, DEFAULT_LANGUAGES, DEFAULT_OCCUPATIONS, DEFAULT_RELATIONS, DEFAULT_REFERRAL_SOURCES, DEFAULT_INSURANCE_PROVIDERS };

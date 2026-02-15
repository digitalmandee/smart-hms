import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Country-aware default fallback values
const DEFAULTS_BY_COUNTRY: Record<string, {
  cities: string[]; languages: string[]; occupations: string[]; relations: string[];
  referralSources: string[]; insuranceProviders: string[];
}> = {
  PK: {
    cities: ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"],
    languages: ["Urdu", "English", "Punjabi", "Sindhi", "Pashto", "Balochi", "Saraiki"],
    occupations: ["Business", "Government Employee", "Private Employee", "Doctor", "Engineer", "Teacher", "Student", "Housewife", "Retired", "Farmer", "Labour", "Other"],
    relations: ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Friend", "Other"],
    referralSources: ["Doctor Referral", "Hospital Referral", "Walk-in", "Online", "Friend/Family", "Advertisement", "Other"],
    insuranceProviders: ["State Life", "Jubilee Life", "EFU Life", "Adamjee Insurance", "Allianz EFU", "IGI Insurance", "Other"],
  },
  SA: {
    cities: ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Tabuk", "Abha", "Taif", "Buraidah"],
    languages: ["Arabic", "English", "Urdu", "Hindi", "Bengali", "Filipino", "Indonesian"],
    occupations: ["Business", "Government Employee", "Private Sector", "Military", "Doctor", "Engineer", "Teacher", "Student", "Housewife", "Retired", "Other"],
    relations: ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Friend", "Other"],
    referralSources: ["Doctor Referral", "Hospital Referral", "Walk-in", "Online", "Insurance", "Friend/Family", "Other"],
    insuranceProviders: ["Bupa Arabia", "Tawuniya", "MedGulf", "Al Rajhi Takaful", "Malath Insurance", "Walaa Insurance", "CCHI", "Other"],
  },
  AE: {
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain"],
    languages: ["Arabic", "English", "Hindi", "Urdu", "Malayalam", "Tagalog", "Bengali"],
    occupations: ["Business", "Government Employee", "Private Sector", "Doctor", "Engineer", "Teacher", "Student", "Housewife", "Retired", "Other"],
    relations: ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Friend", "Other"],
    referralSources: ["Doctor Referral", "Hospital Referral", "Walk-in", "Online", "Insurance", "Friend/Family", "Other"],
    insuranceProviders: ["Daman", "Oman Insurance", "AXA Gulf", "Orient Insurance", "National Health Insurance", "MetLife", "Cigna", "Other"],
  },
};

function getDefaults(countryCode?: string) {
  return DEFAULTS_BY_COUNTRY[countryCode || 'PK'] || DEFAULTS_BY_COUNTRY.PK;
}

const DEFAULT_CITIES = DEFAULTS_BY_COUNTRY.PK.cities;
const DEFAULT_LANGUAGES = DEFAULTS_BY_COUNTRY.PK.languages;
const DEFAULT_OCCUPATIONS = DEFAULTS_BY_COUNTRY.PK.occupations;
const DEFAULT_RELATIONS = DEFAULTS_BY_COUNTRY.PK.relations;
const DEFAULT_REFERRAL_SOURCES = DEFAULTS_BY_COUNTRY.PK.referralSources;
const DEFAULT_INSURANCE_PROVIDERS = DEFAULTS_BY_COUNTRY.PK.insuranceProviders;

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

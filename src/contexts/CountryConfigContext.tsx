import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRY_PRESETS, type CountryCode, type CountryPreset } from "@/lib/countryPresets";

export interface CountryConfig extends CountryPreset {
  isLoading: boolean;
}

const defaultConfig: CountryConfig = {
  ...COUNTRY_PRESETS.PK,
  isLoading: true,
};

const CountryConfigContext = createContext<CountryConfig>(defaultConfig);

export function CountryConfigProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  const { data: orgConfig, isLoading } = useQuery({
    queryKey: ["country-config", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select(
          "country_code, currency_code, currency_symbol, currency_locale, tax_label, default_tax_rate, national_id_label, national_id_format, supported_languages, default_language, date_format, fiscal_year_start, e_invoicing_enabled, e_invoicing_provider, tax_registration_label, phone_country_code, working_days"
        )
        .eq("id", profile.organization_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const config = useMemo<CountryConfig>(() => {
    if (!orgConfig) {
      return { ...COUNTRY_PRESETS.PK, isLoading };
    }

    // Cache language for non-hook access (getTranslatedString in hooks/services)
    const lang = (orgConfig as any).default_language || COUNTRY_PRESETS.PK.default_language || "en";
    localStorage.setItem("org_default_language", lang);

    const countryCode = ((orgConfig as any).country_code || 'PK') as CountryCode;
    const preset = COUNTRY_PRESETS[countryCode] || COUNTRY_PRESETS.PK;

    return {
      ...preset,
      // Override with org-specific values where they exist
      currency_code: (orgConfig as any).currency_code || preset.currency_code,
      currency_symbol: (orgConfig as any).currency_symbol || preset.currency_symbol,
      currency_locale: (orgConfig as any).currency_locale || preset.currency_locale,
      tax_label: (orgConfig as any).tax_label || preset.tax_label,
      default_tax_rate: (orgConfig as any).default_tax_rate ?? preset.default_tax_rate,
      national_id_label: (orgConfig as any).national_id_label || preset.national_id_label,
      national_id_format: (orgConfig as any).national_id_format || preset.national_id_format,
      supported_languages: (orgConfig as any).supported_languages || preset.supported_languages,
      default_language: (orgConfig as any).default_language || preset.default_language,
      date_format: (orgConfig as any).date_format || preset.date_format,
      fiscal_year_start: (orgConfig as any).fiscal_year_start || preset.fiscal_year_start,
      e_invoicing_enabled: (orgConfig as any).e_invoicing_enabled ?? preset.e_invoicing_enabled,
      e_invoicing_provider: (orgConfig as any).e_invoicing_provider ?? preset.e_invoicing_provider,
      tax_registration_label: (orgConfig as any).tax_registration_label || preset.tax_registration_label,
      phone_country_code: (orgConfig as any).phone_country_code || preset.phone_country_code,
      working_days: (orgConfig as any).working_days || preset.working_days,
      country_code: countryCode,
      isLoading: false,
    };
  }, [orgConfig, isLoading]);

  return (
    <CountryConfigContext.Provider value={config}>
      {children}
    </CountryConfigContext.Provider>
  );
}

export function useCountryConfig() {
  return useContext(CountryConfigContext);
}

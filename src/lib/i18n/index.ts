import { useCallback, useMemo } from "react";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { en, type TranslationKey } from "./translations/en";
import { ar } from "./translations/ar";

const translations: Record<string, Record<string, string>> = {
  en,
  ar,
  // Urdu falls back to English for now
};

/**
 * Lightweight translation hook.
 * Returns a `t()` function that resolves translation keys
 * based on the organization's default_language.
 */
export function useTranslation() {
  const { default_language } = useCountryConfig();

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const lang = translations[default_language];
      if (lang && lang[key]) return lang[key];
      // Fallback to English
      if (en[key]) return en[key];
      return fallback || key;
    },
    [default_language]
  );

  return { t, language: default_language };
}

/**
 * Returns the text direction for the current language.
 */
export function useDirection(): "ltr" | "rtl" {
  const { default_language } = useCountryConfig();
  return ["ar", "ur"].includes(default_language) ? "rtl" : "ltr";
}

/**
 * Check if current language is RTL
 */
export function useIsRTL(): boolean {
  return useDirection() === "rtl";
}

export type { TranslationKey };

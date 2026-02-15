import { useMemo } from "react";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import {
  formatCurrency as formatCurrencyBase,
  formatCurrencyFull as formatCurrencyFullBase,
  formatCurrencyCompact as formatCurrencyCompactBase,
  type CurrencyConfig,
} from "@/lib/currency";

/**
 * Convenience hook that returns currency formatting functions
 * pre-bound to the current country configuration.
 */
export function useCurrencyFormatter() {
  const config = useCountryConfig();

  return useMemo(() => {
    const currencyConfig: CurrencyConfig = {
      currency_symbol: config.currency_symbol,
      currency_locale: config.currency_locale,
      currency_code: config.currency_code,
    };

    return {
      formatCurrency: (amount: number | null | undefined) =>
        formatCurrencyBase(amount, currencyConfig),
      formatCurrencyFull: (amount: number | null | undefined) =>
        formatCurrencyFullBase(amount, currencyConfig),
      formatCurrencyCompact: (amount: number | null | undefined) =>
        formatCurrencyCompactBase(amount, currencyConfig),
      currencySymbol: config.currency_symbol,
      currencyCode: config.currency_code,
      currencyConfig,
    };
  }, [config.currency_symbol, config.currency_locale, config.currency_code]);
}

/**
 * Centralized currency formatting utilities
 * Now supports dynamic country configuration (PKR, SAR, AED)
 */

export interface CurrencyConfig {
  currency_symbol: string;
  currency_locale: string;
  currency_code: string;
}

// Default fallback config (Pakistan)
const DEFAULT_CONFIG: CurrencyConfig = {
  currency_symbol: 'Rs.',
  currency_locale: 'en-PK',
  currency_code: 'PKR',
};

/**
 * Format a number as currency using the provided config
 */
export const formatCurrency = (
  amount: number | null | undefined,
  config?: CurrencyConfig
): string => {
  const c = config || DEFAULT_CONFIG;
  if (amount == null) return `${c.currency_symbol} 0`;
  return `${c.currency_symbol} ${Number(amount).toLocaleString(c.currency_locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a number as currency with full decimal places
 */
export const formatCurrencyFull = (
  amount: number | null | undefined,
  config?: CurrencyConfig
): string => {
  const c = config || DEFAULT_CONFIG;
  if (amount == null) return `${c.currency_symbol} 0.00`;
  return `${c.currency_symbol} ${Number(amount).toLocaleString(c.currency_locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a number as compact currency (e.g., Rs. 1.5K, SAR 2.3M)
 */
export const formatCurrencyCompact = (
  amount: number | null | undefined,
  config?: CurrencyConfig
): string => {
  const c = config || DEFAULT_CONFIG;
  if (amount == null) return `${c.currency_symbol} 0`;

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // Use Lakh/Crore for PKR, standard K/M/B for others
  if (c.currency_code === 'PKR') {
    if (absAmount >= 10000000) {
      return `${sign}${c.currency_symbol} ${(absAmount / 10000000).toFixed(1)}Cr`;
    } else if (absAmount >= 100000) {
      return `${sign}${c.currency_symbol} ${(absAmount / 100000).toFixed(1)}L`;
    } else if (absAmount >= 1000) {
      return `${sign}${c.currency_symbol} ${(absAmount / 1000).toFixed(1)}K`;
    }
  } else {
    if (absAmount >= 1000000000) {
      return `${sign}${c.currency_symbol} ${(absAmount / 1000000000).toFixed(1)}B`;
    } else if (absAmount >= 1000000) {
      return `${sign}${c.currency_symbol} ${(absAmount / 1000000).toFixed(1)}M`;
    } else if (absAmount >= 1000) {
      return `${sign}${c.currency_symbol} ${(absAmount / 1000).toFixed(1)}K`;
    }
  }

  return formatCurrency(amount, c);
};

/**
 * Parse a currency string back to number
 */
export const parseCurrency = (value: string): number => {
  // Remove all known currency symbols and formatting
  const cleaned = value.replace(/[Rs.,\s]|SAR|AED|PKR/gi, '').trim();
  return parseFloat(cleaned) || 0;
};

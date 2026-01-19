/**
 * Centralized currency formatting utilities for Pakistani Rupee (PKR)
 */

/**
 * Format a number as Pakistani Rupee currency
 * @param amount - The amount to format
 * @returns Formatted string like "Rs. 1,500"
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-PK', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format a number as Pakistani Rupee with full decimal places
 * @param amount - The amount to format
 * @returns Formatted string like "Rs. 1,500.00"
 */
export const formatCurrencyFull = (amount: number | null | undefined): string => {
  if (amount == null) return 'Rs. 0.00';
  return `Rs. ${Number(amount).toLocaleString('en-PK', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format a number as compact currency (e.g., Rs. 1.5K, Rs. 2.3M)
 * @param amount - The amount to format
 * @returns Compact formatted string
 */
export const formatCurrencyCompact = (amount: number | null | undefined): string => {
  if (amount == null) return 'Rs. 0';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 10000000) {
    return `${sign}Rs. ${(absAmount / 10000000).toFixed(1)}Cr`;
  } else if (absAmount >= 100000) {
    return `${sign}Rs. ${(absAmount / 100000).toFixed(1)}L`;
  } else if (absAmount >= 1000) {
    return `${sign}Rs. ${(absAmount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount);
};

/**
 * Parse a currency string back to number
 * @param value - The currency string to parse
 * @returns The numeric value
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[Rs.,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

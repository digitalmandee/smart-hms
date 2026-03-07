/**
 * Saudi National ID / Iqama validation utilities
 * 
 * Saudi National ID: 10 digits, starts with 1
 * Iqama (Resident ID): 10 digits, starts with 2
 * 
 * NPHIES Identifier System URI: http://nphies.sa/identifier/nationalid
 */

export const NPHIES_NATIONAL_ID_SYSTEM = 'http://nphies.sa/identifier/nationalid';

/**
 * Validates a Saudi National ID or Iqama number
 * - Must be exactly 10 digits
 * - Must start with 1 (Saudi) or 2 (Iqama/Resident)
 */
export function isValidSaudiId(value: string): boolean {
  if (!value) return true; // Optional field
  const cleaned = value.replace(/\s/g, '');
  return /^[12]\d{9}$/.test(cleaned);
}

/**
 * Returns the type of Saudi ID
 */
export function getSaudiIdType(value: string): 'saudi' | 'iqama' | 'unknown' {
  const cleaned = value.replace(/\s/g, '');
  if (cleaned.startsWith('1') && cleaned.length === 10) return 'saudi';
  if (cleaned.startsWith('2') && cleaned.length === 10) return 'iqama';
  return 'unknown';
}

/**
 * Zod refinement for Saudi ID validation based on country code
 */
export function createSaudiIdValidation(countryCode: string) {
  if (countryCode === 'SA') {
    return (value: string | undefined) => {
      if (!value || value.trim() === '') return true;
      return isValidSaudiId(value);
    };
  }
  return () => true;
}

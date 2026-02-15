/**
 * Country configuration presets for Pakistan, KSA, and UAE
 */

export type CountryCode = 'PK' | 'SA' | 'AE';

export interface CountryPreset {
  country_code: CountryCode;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
  currency_locale: string;
  tax_label: string;
  default_tax_rate: number;
  national_id_label: string;
  national_id_format: string;
  supported_languages: string[];
  default_language: string;
  date_format: string;
  fiscal_year_start: string;
  e_invoicing_enabled: boolean;
  e_invoicing_provider: string | null;
  tax_registration_label: string;
  phone_country_code: string;
  working_days: string[];
  timezone: string;
  cash_denominations: number[];
}

export const COUNTRY_PRESETS: Record<CountryCode, CountryPreset> = {
  PK: {
    country_code: 'PK',
    country_name: 'Pakistan',
    currency_code: 'PKR',
    currency_symbol: 'Rs.',
    currency_locale: 'en-PK',
    tax_label: 'GST',
    default_tax_rate: 17,
    national_id_label: 'CNIC',
    national_id_format: 'XXXXX-XXXXXXX-X',
    supported_languages: ['en', 'ur'],
    default_language: 'en',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: '07',
    e_invoicing_enabled: false,
    e_invoicing_provider: null,
    tax_registration_label: 'NTN',
    phone_country_code: '+92',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    timezone: 'Asia/Karachi',
    cash_denominations: [5000, 1000, 500, 100, 50, 20, 10],
  },
  SA: {
    country_code: 'SA',
    country_name: 'Saudi Arabia',
    currency_code: 'SAR',
    currency_symbol: 'SAR',
    currency_locale: 'ar-SA',
    tax_label: 'VAT',
    default_tax_rate: 15,
    national_id_label: 'Iqama / National ID',
    national_id_format: 'XXXXXXXXXX',
    supported_languages: ['en', 'ar'],
    default_language: 'en',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: '01',
    e_invoicing_enabled: true,
    e_invoicing_provider: 'zatca',
    tax_registration_label: 'VAT TIN',
    phone_country_code: '+966',
    working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    timezone: 'Asia/Riyadh',
    cash_denominations: [500, 200, 100, 50, 20, 10, 5, 1],
  },
  AE: {
    country_code: 'AE',
    country_name: 'United Arab Emirates',
    currency_code: 'AED',
    currency_symbol: 'AED',
    currency_locale: 'ar-AE',
    tax_label: 'VAT',
    default_tax_rate: 5,
    national_id_label: 'Emirates ID',
    national_id_format: '784-XXXX-XXXXXXX-X',
    supported_languages: ['en', 'ar'],
    default_language: 'en',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: '01',
    e_invoicing_enabled: false,
    e_invoicing_provider: null,
    tax_registration_label: 'TRN',
    phone_country_code: '+971',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timezone: 'Asia/Dubai',
    cash_denominations: [1000, 500, 200, 100, 50, 20, 10, 5],
  },
};

export const COUNTRY_OPTIONS = [
  { value: 'PK' as CountryCode, label: 'Pakistan', flag: '🇵🇰' },
  { value: 'SA' as CountryCode, label: 'Saudi Arabia', flag: '🇸🇦' },
  { value: 'AE' as CountryCode, label: 'United Arab Emirates', flag: '🇦🇪' },
];


-- Add country configuration columns to organizations table
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'PK',
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'PKR',
  ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT 'Rs.',
  ADD COLUMN IF NOT EXISTS currency_locale TEXT DEFAULT 'en-PK',
  ADD COLUMN IF NOT EXISTS tax_label TEXT DEFAULT 'GST',
  ADD COLUMN IF NOT EXISTS national_id_label TEXT DEFAULT 'CNIC',
  ADD COLUMN IF NOT EXISTS national_id_format TEXT DEFAULT 'XXXXX-XXXXXXX-X',
  ADD COLUMN IF NOT EXISTS supported_languages TEXT[] DEFAULT ARRAY['en', 'ur'],
  ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
  ADD COLUMN IF NOT EXISTS fiscal_year_start TEXT DEFAULT '07',
  ADD COLUMN IF NOT EXISTS e_invoicing_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS e_invoicing_provider TEXT,
  ADD COLUMN IF NOT EXISTS tax_registration_label TEXT DEFAULT 'NTN',
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+92';

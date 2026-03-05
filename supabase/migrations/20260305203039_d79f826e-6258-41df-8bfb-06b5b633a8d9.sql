
ALTER TABLE public.insurance_companies
ADD COLUMN IF NOT EXISTS cchi_payer_code TEXT,
ADD COLUMN IF NOT EXISTS nphies_payer_id TEXT;

COMMENT ON COLUMN public.insurance_companies.cchi_payer_code IS 'CCHI payer code for this insurance company (Saudi NPHIES integration)';
COMMENT ON COLUMN public.insurance_companies.nphies_payer_id IS 'NPHIES payer identifier for electronic claims';

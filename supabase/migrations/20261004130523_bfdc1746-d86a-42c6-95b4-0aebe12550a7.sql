ALTER TABLE public.patients
 ADD COLUMN IF NOT EXISTS needs_welfare boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS monthly_income numeric,
 ADD COLUMN IF NOT EXISTS family_members integer,
 ADD COLUMN IF NOT EXISTS earning_members integer,
 ADD COLUMN IF NOT EXISTS housing_status text,
 ADD COLUMN IF NOT EXISTS head_occupation text,
 ADD COLUMN IF NOT EXISTS zakat_eligible boolean,
 ADD COLUMN IF NOT EXISTS preferred_fund text,
 ADD COLUMN IF NOT EXISTS suggested_coverage_pct numeric CHECK (suggested_coverage_pct IS NULL OR (suggested_coverage_pct >= 0 AND suggested_coverage_pct <= 100)),
 ADD COLUMN IF NOT EXISTS welfare_referral text,
 ADD COLUMN IF NOT EXISTS welfare_notes text;
-- Add payment mode and insurance fields to admissions
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS payment_mode TEXT CHECK (payment_mode IN ('cash', 'insurance', 'corporate', 'government'));
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS insurance_provider_id UUID;
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS corporate_id UUID;
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS authorization_number TEXT;
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(10,2);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS bed_charges_start_at TIMESTAMPTZ;

-- Set default bed type rates (currently all Rs. 0)
UPDATE ipd_bed_types SET daily_rate = 1500 WHERE LOWER(code) = 'standard' OR LOWER(name) LIKE '%standard%';
UPDATE ipd_bed_types SET daily_rate = 2000 WHERE LOWER(code) = 'semi_fowler' OR LOWER(name) LIKE '%semi%fowler%';
UPDATE ipd_bed_types SET daily_rate = 2500 WHERE LOWER(code) = 'fowler' OR (LOWER(name) LIKE '%fowler%' AND LOWER(name) NOT LIKE '%semi%');
UPDATE ipd_bed_types SET daily_rate = 3000 WHERE LOWER(code) = 'electric' OR LOWER(name) LIKE '%electric%';
UPDATE ipd_bed_types SET daily_rate = 5000 WHERE LOWER(code) = 'icu' OR LOWER(name) LIKE '%icu%';
UPDATE ipd_bed_types SET daily_rate = 4000 WHERE LOWER(code) = 'bariatric' OR LOWER(name) LIKE '%bariatric%';
UPDATE ipd_bed_types SET daily_rate = 1800 WHERE LOWER(code) = 'pediatric' OR LOWER(name) LIKE '%pediatric%';
UPDATE ipd_bed_types SET daily_rate = 1200 WHERE LOWER(code) = 'crib' OR LOWER(name) LIKE '%crib%';

-- Set a default rate for any remaining bed types with 0 rate
UPDATE ipd_bed_types SET daily_rate = 1500 WHERE daily_rate = 0 OR daily_rate IS NULL;
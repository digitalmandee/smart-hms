-- Remove duplicate foreign keys we added (keep the original Supabase-generated ones)
ALTER TABLE wards DROP CONSTRAINT IF EXISTS fk_wards_branch;
ALTER TABLE wards DROP CONSTRAINT IF EXISTS fk_wards_organization;
ALTER TABLE wards DROP CONSTRAINT IF EXISTS fk_wards_nurse_in_charge;

-- Add missing foreign key constraints to enable PostgREST joins

-- Wards table foreign keys
ALTER TABLE wards
  ADD CONSTRAINT fk_wards_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_wards_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_wards_nurse_in_charge FOREIGN KEY (nurse_in_charge_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Beds table foreign keys (ward_id already has FK, but adding current_admission_id if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'beds_current_admission_id_fkey' 
    AND table_name = 'beds'
  ) THEN
    ALTER TABLE beds ADD CONSTRAINT beds_current_admission_id_fkey 
      FOREIGN KEY (current_admission_id) REFERENCES admissions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Verify the foreign keys are in place
COMMENT ON TABLE wards IS 'Hospital wards with proper foreign key relationships for PostgREST joins';

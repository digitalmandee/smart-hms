-- Add confirmation tracking columns to surgeries table
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS surgeon_confirmed_at TIMESTAMPTZ;
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS anesthesia_confirmed_at TIMESTAMPTZ;
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS ready_at TIMESTAMPTZ;
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS ready_by UUID REFERENCES profiles(id);
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS pre_op_medications_ordered BOOLEAN DEFAULT false;
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS pre_op_supplies_ready BOOLEAN DEFAULT false;

-- Add fitness decision columns to pre_anesthesia_assessments
ALTER TABLE pre_anesthesia_assessments ADD COLUMN IF NOT EXISTS fitness_decision TEXT 
  CHECK (fitness_decision IN ('fit', 'not_fit', 'conditional'));
ALTER TABLE pre_anesthesia_assessments ADD COLUMN IF NOT EXISTS not_fit_reason TEXT;
ALTER TABLE pre_anesthesia_assessments ADD COLUMN IF NOT EXISTS not_fit_reason_category TEXT;
ALTER TABLE pre_anesthesia_assessments ADD COLUMN IF NOT EXISTS requires_reschedule BOOLEAN DEFAULT false;
ALTER TABLE pre_anesthesia_assessments ADD COLUMN IF NOT EXISTS recommended_postpone_days INTEGER;

-- Create trigger function to update surgery confirmation timestamps when team members accept
CREATE OR REPLACE FUNCTION public.update_surgery_confirmation_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_status = 'accepted' AND (OLD.confirmation_status IS NULL OR OLD.confirmation_status != 'accepted') THEN
    IF NEW.role = 'lead_surgeon' THEN
      UPDATE surgeries SET surgeon_confirmed_at = NOW() WHERE id = NEW.surgery_id;
    ELSIF NEW.role = 'anesthetist' THEN
      UPDATE surgeries SET anesthesia_confirmed_at = NOW() WHERE id = NEW.surgery_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on surgery_team_members
DROP TRIGGER IF EXISTS trg_update_surgery_confirmation_timestamps ON surgery_team_members;
CREATE TRIGGER trg_update_surgery_confirmation_timestamps
AFTER UPDATE OF confirmation_status ON surgery_team_members
FOR EACH ROW EXECUTE FUNCTION update_surgery_confirmation_timestamps();
-- Add missing columns to surgery_team_members for confirmation workflow
ALTER TABLE surgery_team_members 
ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'pending';

ALTER TABLE surgery_team_members 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES profiles(id);

ALTER TABLE surgery_team_members 
ADD COLUMN IF NOT EXISTS declined_reason TEXT;

ALTER TABLE surgery_team_members 
ADD COLUMN IF NOT EXISTS proposed_reschedule_time TIMESTAMPTZ;

ALTER TABLE surgery_team_members 
ADD COLUMN IF NOT EXISTS reschedule_notes TEXT;

ALTER TABLE surgery_team_members 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Add invoice_id to surgeries for outpatient billing
ALTER TABLE surgeries 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);

-- Create trigger function to auto-confirm surgery when all team members accept
CREATE OR REPLACE FUNCTION public.check_surgery_team_confirmation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  all_confirmed BOOLEAN;
  team_count INTEGER;
BEGIN
  -- Count team members and check if all are confirmed
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE confirmation_status = 'accepted') = COUNT(*)
  INTO team_count, all_confirmed
  FROM surgery_team_members 
  WHERE surgery_id = NEW.surgery_id;
  
  -- If all team members confirmed and there's at least one, update surgery status
  IF all_confirmed AND team_count > 0 THEN
    UPDATE surgeries 
    SET status = 'confirmed' 
    WHERE id = NEW.surgery_id 
      AND status IN ('booked', 'scheduled');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_check_surgery_team_confirmation ON surgery_team_members;
CREATE TRIGGER trg_check_surgery_team_confirmation
AFTER UPDATE OF confirmation_status ON surgery_team_members
FOR EACH ROW
WHEN (NEW.confirmation_status = 'accepted')
EXECUTE FUNCTION public.check_surgery_team_confirmation();
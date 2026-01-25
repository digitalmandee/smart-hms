-- Backfill surgery_team_members for existing surgeries with lead_surgeon_id
INSERT INTO surgery_team_members (surgery_id, doctor_id, role, confirmation_status, is_confirmed)
SELECT 
  s.id,
  s.lead_surgeon_id,
  'lead_surgeon',
  'pending',
  false
FROM surgeries s
WHERE s.lead_surgeon_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM surgery_team_members stm 
    WHERE stm.surgery_id = s.id AND stm.role = 'lead_surgeon'
  );

-- Backfill anesthetist team members
INSERT INTO surgery_team_members (surgery_id, doctor_id, role, confirmation_status, is_confirmed)
SELECT 
  s.id,
  s.anesthetist_id,
  'anesthetist',
  'pending',
  false
FROM surgeries s
WHERE s.anesthetist_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM surgery_team_members stm 
    WHERE stm.surgery_id = s.id AND stm.role = 'anesthetist'
  );

-- Update existing surgeries status to 'booked' if they have team members and are still 'scheduled'
UPDATE surgeries 
SET status = 'booked'
WHERE id IN (SELECT DISTINCT surgery_id FROM surgery_team_members)
  AND status = 'scheduled';
-- Link employees to profiles by matching email addresses
UPDATE employees e
SET profile_id = p.id
FROM profiles p
WHERE e.profile_id IS NULL
  AND p.email IS NOT NULL
  AND (
    LOWER(TRIM(e.work_email)) = LOWER(TRIM(p.email))
    OR LOWER(TRIM(e.personal_email)) = LOWER(TRIM(p.email))
  );
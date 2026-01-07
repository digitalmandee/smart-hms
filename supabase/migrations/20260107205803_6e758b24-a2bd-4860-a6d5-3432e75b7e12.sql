-- Fix NULL values in auth.users that cause GoTrue scanning errors
-- The Go auth service cannot convert NULL to string for certain columns

UPDATE auth.users
SET 
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, '')
WHERE email LIKE '%@smarthms.demo';
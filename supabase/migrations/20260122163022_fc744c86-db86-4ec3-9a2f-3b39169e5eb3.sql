-- Update surgeon demo user's role from 'doctor' to 'surgeon'
UPDATE user_roles 
SET role = 'surgeon' 
WHERE user_id = '00000000-0000-0000-0000-000000000030'
AND role = 'doctor';

-- Update anesthetist demo user's role from 'doctor' to 'anesthetist'
UPDATE user_roles 
SET role = 'anesthetist' 
WHERE user_id = '00000000-0000-0000-0000-000000000031'
AND role = 'doctor';
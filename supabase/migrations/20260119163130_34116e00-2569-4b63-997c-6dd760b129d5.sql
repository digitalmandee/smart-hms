-- Fix NULL organization_id for Al-Noor clinic doctors (existing users only)
UPDATE profiles 
SET 
  organization_id = 'b2222222-2222-2222-2222-222222222222',
  branch_id = 'c2222222-2222-2222-2222-222222222222'
WHERE email IN ('dr.kamran@alnoorclinic.internal', 'dr.sadia@alnoorclinic.internal')
  AND organization_id IS NULL;
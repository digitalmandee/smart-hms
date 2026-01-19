-- Fix Super Admin demo account: Remove organization assignment
-- Super Admin should NOT be tied to any organization (platform-level access)
UPDATE profiles
SET organization_id = NULL, branch_id = NULL
WHERE email = 'superadmin@healthos.demo';
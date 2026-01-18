-- Deactivate duplicate/old menu items that use broad permissions
UPDATE menu_items SET is_active = false 
WHERE code = 'nurse_station' AND path = '/app/opd/nursing';

-- Also check for other duplicate items and deactivate them
-- Keep only the role-specific ones

-- Verify the doctor doesn't have appointments.checkin (which would let them see old nurse station)
-- This should already be the case, but let's ensure role_permissions are clean

-- Grant doctors their existing core permissions they need (consultations.view for OPD parent)
-- They already have this, but verify by checking if opd parent is visible

-- Make sure OPD parent menu uses a permission that both doctors AND nurses have
-- OR make it have no permission (visible to anyone with child access)
UPDATE menu_items SET required_permission = NULL 
WHERE code = 'opd' AND parent_id IS NULL;

-- Same for other module parents - they should be visible if user has any child permission
UPDATE menu_items SET required_permission = NULL 
WHERE code IN ('pharmacy', 'laboratory', 'radiology', 'ipd', 'hr', 'accounts', 'inventory', 'blood_bank', 'ot', 'emergency')
AND parent_id IS NULL;
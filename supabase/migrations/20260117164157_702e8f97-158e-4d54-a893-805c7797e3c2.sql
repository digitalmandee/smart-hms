-- PHASE 1: Fix RLS policies for lab technicians
-- Drop existing restrictive policies that require consultations.update
DROP POLICY IF EXISTS "Users with consultation permission can update lab orders" ON lab_orders;
DROP POLICY IF EXISTS "Users with consultation permission can update lab order items" ON lab_order_items;

-- Create new policies allowing both consultations.update AND laboratory.orders permissions
CREATE POLICY "Users with lab or consultation permission can update lab orders"
ON lab_orders FOR UPDATE TO authenticated
USING (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_permission('consultations.update') OR has_permission('laboratory.orders'))
)
WITH CHECK (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_permission('consultations.update') OR has_permission('laboratory.orders'))
);

CREATE POLICY "Users with lab or consultation permission can update lab order items"
ON lab_order_items FOR UPDATE TO authenticated
USING (
  lab_order_id IN (
    SELECT id FROM lab_orders 
    WHERE branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  )
  AND (has_permission('consultations.update') OR has_permission('laboratory.orders'))
);

-- PHASE 2: Add sample_number column to lab_orders
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS sample_number TEXT;

-- PHASE 3: Update menu permissions to hide Patients from lab users
-- Lab users should only see patients in lab order context, not full patient list
UPDATE menu_items 
SET required_permission = 'patients.create' 
WHERE code = 'patients' AND required_permission = 'patients.view';

-- Also add RLS policy for public patient phone verification (for MR search)
CREATE POLICY "Public can verify patient for published reports"
ON patients FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM lab_orders lo 
    WHERE lo.patient_id = patients.id 
    AND lo.is_published = true
  )
);
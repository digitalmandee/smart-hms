-- Fix lab_order_items INSERT policy to allow OT nurses to create lab order items

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users with consultation permission can create lab order items" ON lab_order_items;

-- Create a new INSERT policy that allows:
-- 1. Users with consultations.create (doctors, existing flow)
-- 2. Users with ot:view (OT staff ordering pre-op labs)
-- 3. Users with laboratory.orders (lab staff creating direct orders)
CREATE POLICY "Users with appropriate permissions can create lab order items"
  ON lab_order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    lab_order_id IN (
      SELECT id FROM lab_orders lo
      WHERE lo.branch_id IN (
        SELECT b.id FROM branches b
        WHERE b.organization_id = get_user_organization_id()
      )
    )
    AND (
      has_permission('consultations.create') OR
      has_permission('ot:view') OR
      has_permission('laboratory.orders')
    )
  );
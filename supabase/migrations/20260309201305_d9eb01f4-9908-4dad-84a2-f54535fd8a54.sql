-- Fix lab_orders UPDATE policy
DROP POLICY IF EXISTS "Users with lab or consultation permission can update lab orders" ON lab_orders;
CREATE POLICY "Users with lab or consultation permission can update lab orders"
ON lab_orders FOR UPDATE TO authenticated
USING (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_permission('consultations.edit') OR has_permission('laboratory.orders') OR has_permission('laboratory.results'))
)
WITH CHECK (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_permission('consultations.edit') OR has_permission('laboratory.orders') OR has_permission('laboratory.results'))
);

-- Fix lab_order_items UPDATE policy
DROP POLICY IF EXISTS "Users with lab or consultation permission can update lab order " ON lab_order_items;
CREATE POLICY "Users with lab or consultation permission can update lab order items"
ON lab_order_items FOR UPDATE TO authenticated
USING (
  lab_order_id IN (SELECT id FROM lab_orders WHERE branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id()))
  AND (has_permission('consultations.edit') OR has_permission('laboratory.orders') OR has_permission('laboratory.results'))
);

-- Grant lab permissions to doctor role
INSERT INTO role_permissions (role, permission_id, is_granted)
SELECT 'doctor', id, true FROM permissions WHERE code IN ('laboratory.view', 'laboratory.orders', 'laboratory.results')
ON CONFLICT DO NOTHING;
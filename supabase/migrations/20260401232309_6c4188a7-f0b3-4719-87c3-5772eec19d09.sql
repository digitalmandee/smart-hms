
-- Fix: Add WITH CHECK to the existing ALL policies so INSERT works
-- Drop and recreate the pharmacist policy with proper WITH CHECK
DROP POLICY IF EXISTS "Pharmacists can manage inventory" ON public.medicine_inventory;
CREATE POLICY "Pharmacists can manage inventory"
ON public.medicine_inventory
FOR ALL
TO authenticated
USING (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'org_admin'::app_role))
)
WITH CHECK (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
  AND (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'org_admin'::app_role))
);

-- Also fix super admin policy
DROP POLICY IF EXISTS "Super admins can manage all inventory" ON public.medicine_inventory;
CREATE POLICY "Super admins can manage all inventory"
ON public.medicine_inventory
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Add policy for store/inventory managers who process GRNs
DROP POLICY IF EXISTS "Store managers can insert inventory via GRN" ON public.medicine_inventory;
CREATE POLICY "Store managers can insert inventory via GRN"
ON public.medicine_inventory
FOR INSERT
TO authenticated
WITH CHECK (
  branch_id IN (SELECT id FROM branches WHERE organization_id = get_user_organization_id())
);

-- 1. Drop existing UPDATE policy and recreate with billing permissions added
DROP POLICY IF EXISTS "Users with lab or consultation permission can update lab orders" ON public.lab_orders;

CREATE POLICY "Users with lab or consultation or billing permission can update lab orders"
ON public.lab_orders
FOR UPDATE
TO authenticated
USING (
  branch_id IN (
    SELECT b.id FROM branches b WHERE b.organization_id = get_user_organization_id()
  )
  AND (
    has_permission('consultations.edit'::text)
    OR has_permission('laboratory.orders'::text)
    OR has_permission('laboratory.results'::text)
    OR has_permission('billing.invoices'::text)
    OR has_permission('billing.create'::text)
  )
)
WITH CHECK (
  branch_id IN (
    SELECT b.id FROM branches b WHERE b.organization_id = get_user_organization_id()
  )
  AND (
    has_permission('consultations.edit'::text)
    OR has_permission('laboratory.orders'::text)
    OR has_permission('laboratory.results'::text)
    OR has_permission('billing.invoices'::text)
    OR has_permission('billing.create'::text)
  )
);

-- 2. Enable realtime for lab_orders and invoices
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
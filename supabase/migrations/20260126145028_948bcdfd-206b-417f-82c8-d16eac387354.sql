-- Fix Lab Orders INSERT policy to allow billing staff to trigger lab order creation
DROP POLICY IF EXISTS "OT and Lab staff can create lab orders" ON public.lab_orders;

CREATE POLICY "Clinical and billing users can create lab orders" 
ON public.lab_orders FOR INSERT 
WITH CHECK (
  has_permission('ot:view'::text) OR 
  has_permission('laboratory.orders'::text) OR 
  has_permission('consultations.create'::text) OR
  has_permission('billing.invoices'::text) OR
  has_permission('billing.create'::text) OR
  has_permission('patients.create'::text)
);

-- Update lab_order_items to allow creation via trigger with proper org scope
DROP POLICY IF EXISTS "Users with appropriate permissions can create lab order items" ON public.lab_order_items;

CREATE POLICY "Users can create lab order items for org lab orders"
ON public.lab_order_items FOR INSERT
WITH CHECK (
  (lab_order_id IN (
    SELECT lo.id FROM public.lab_orders lo
    JOIN public.branches b ON b.id = lo.branch_id
    WHERE b.organization_id = get_user_organization_id()
  )) AND (
    has_permission('consultations.create'::text) OR 
    has_permission('ot:view'::text) OR 
    has_permission('laboratory.orders'::text) OR
    has_permission('billing.invoices'::text) OR
    has_permission('billing.create'::text)
  )
);
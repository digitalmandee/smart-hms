-- Add policy to allow OT staff and lab staff to create lab orders
CREATE POLICY "OT and Lab staff can create lab orders"
ON public.lab_orders
FOR INSERT
WITH CHECK (
  has_permission('ot:view') OR 
  has_permission('laboratory.orders') OR 
  has_permission('consultations.create')
);

-- Drop the old restrictive insert policy
DROP POLICY IF EXISTS "Users with consultation permission can create lab orders" ON public.lab_orders;
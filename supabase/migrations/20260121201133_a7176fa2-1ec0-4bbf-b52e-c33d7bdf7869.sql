-- Make consultation_id and doctor_id nullable for billing-originated lab orders
-- These fields may not be available when lab orders are created directly from invoices

ALTER TABLE public.lab_orders 
  ALTER COLUMN consultation_id DROP NOT NULL,
  ALTER COLUMN doctor_id DROP NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN public.lab_orders.consultation_id IS 'Optional - may be null for billing-originated lab orders';
COMMENT ON COLUMN public.lab_orders.doctor_id IS 'Optional - may be null for billing-originated lab orders';
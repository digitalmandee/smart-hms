-- Fix stale invoice balance_amount data
-- This is a one-time data correction wrapped in a migration
UPDATE public.invoices 
SET balance_amount = GREATEST(0, total_amount - COALESCE(paid_amount, 0))
WHERE balance_amount != GREATEST(0, total_amount - COALESCE(paid_amount, 0))
   OR (balance_amount IS NULL AND paid_amount > 0);
-- Fix patient "new"'s appointment that was incorrectly marked as paid by lab invoice trigger
UPDATE public.appointments 
SET payment_status = 'pending', invoice_id = NULL 
WHERE id = '13d34200-9e51-4777-8d1a-2022cd32188f' 
  AND invoice_id = '6ed811b1-df83-4eea-8210-707c6d0eca80';
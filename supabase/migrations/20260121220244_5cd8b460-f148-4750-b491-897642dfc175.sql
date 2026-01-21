-- Add billing columns to imaging_orders table
ALTER TABLE public.imaging_orders 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add check constraint for payment_status
ALTER TABLE public.imaging_orders 
DROP CONSTRAINT IF EXISTS imaging_orders_payment_status_check;

ALTER TABLE public.imaging_orders 
ADD CONSTRAINT imaging_orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'partial', 'waived'));

-- Create index for invoice lookups
CREATE INDEX IF NOT EXISTS idx_imaging_orders_invoice_id ON public.imaging_orders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_imaging_orders_payment_status ON public.imaging_orders(payment_status);

-- Add Arabic name to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS name_ar TEXT;

-- Add ZATCA e-invoicing columns to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zatca_invoice_type TEXT DEFAULT 'simplified';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zatca_uuid UUID;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zatca_icv INTEGER;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zatca_pih TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zatca_qr_code TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zatca_status TEXT DEFAULT 'pending';

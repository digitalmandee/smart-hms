ALTER TABLE public.dental_lab_orders
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_billed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_dental_lab_orders_invoice ON public.dental_lab_orders(invoice_id);
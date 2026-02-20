
-- Add barcode and sku columns to inventory_items
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS barcode text;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS sku text;

-- Add index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON public.inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON public.inventory_items(sku) WHERE sku IS NOT NULL;

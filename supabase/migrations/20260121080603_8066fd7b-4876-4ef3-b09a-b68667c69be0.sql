-- Add columns to invoice_items for lab order and bed booking linkage
ALTER TABLE invoice_items 
  ADD COLUMN IF NOT EXISTS lab_order_id UUID REFERENCES lab_orders(id),
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES beds(id),
  ADD COLUMN IF NOT EXISTS booking_start_date DATE,
  ADD COLUMN IF NOT EXISTS booking_end_date DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_lab_order ON invoice_items(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_bed ON invoice_items(bed_id);

-- Add comment for documentation
COMMENT ON COLUMN invoice_items.lab_order_id IS 'Links to lab_order created from this invoice item';
COMMENT ON COLUMN invoice_items.bed_id IS 'Links to bed reserved for room booking';
COMMENT ON COLUMN invoice_items.booking_start_date IS 'Start date for room/bed booking';
COMMENT ON COLUMN invoice_items.booking_end_date IS 'End date for room/bed booking';
-- Add surgery_id to lab_orders for Pre-Op lab integration
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS surgery_id UUID REFERENCES surgeries(id) ON DELETE SET NULL;

-- Create index for surgery-based lab order lookups
CREATE INDEX IF NOT EXISTS idx_lab_orders_surgery_id ON lab_orders(surgery_id);

-- Add comment for clarity
COMMENT ON COLUMN lab_orders.surgery_id IS 'Links lab order to a surgery for pre-operative investigations';
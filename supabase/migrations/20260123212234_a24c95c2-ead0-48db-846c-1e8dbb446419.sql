-- Add pharmacy integration columns to surgery_medications table
ALTER TABLE surgery_medications ADD COLUMN IF NOT EXISTS 
  inventory_item_id UUID REFERENCES medicine_inventory(id);

ALTER TABLE surgery_medications ADD COLUMN IF NOT EXISTS 
  batch_number TEXT;

ALTER TABLE surgery_medications ADD COLUMN IF NOT EXISTS 
  unit_price DECIMAL(10,2);

ALTER TABLE surgery_medications ADD COLUMN IF NOT EXISTS 
  is_billed BOOLEAN DEFAULT false;

ALTER TABLE surgery_medications ADD COLUMN IF NOT EXISTS 
  pharmacy_status TEXT DEFAULT 'not_required' CHECK (pharmacy_status IN ('not_required', 'requested', 'dispensed', 'cancelled'));

ALTER TABLE surgery_medications ADD COLUMN IF NOT EXISTS 
  dispensed_by UUID REFERENCES profiles(id);

ALTER TABLE surgery_medications ADD COLUMN IF NOT EXISTS 
  dispensed_at TIMESTAMPTZ;

-- Add index for pharmacy queue queries
CREATE INDEX IF NOT EXISTS idx_surgery_medications_pharmacy_status 
  ON surgery_medications(pharmacy_status) 
  WHERE pharmacy_status = 'requested';

-- Add comment for documentation
COMMENT ON COLUMN surgery_medications.pharmacy_status IS 'not_required = from OT cart, requested = pending pharmacy dispense, dispensed = ready for administration, cancelled = request cancelled';
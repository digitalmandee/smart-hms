-- Add medicine_id column to requisition_items for pharmacy requisitions
ALTER TABLE requisition_items
  ALTER COLUMN item_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS medicine_id UUID REFERENCES medicines(id);

-- Add index for medicine_id lookups
CREATE INDEX IF NOT EXISTS idx_requisition_items_medicine_id ON requisition_items(medicine_id) WHERE medicine_id IS NOT NULL;
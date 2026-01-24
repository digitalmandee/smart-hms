-- Extend purchase_order_items to support both inventory items and medicines
ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'inventory' CHECK (item_type IN ('inventory', 'medicine'));

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS medicine_id UUID REFERENCES medicines(id);

-- Add comment for clarity
COMMENT ON COLUMN purchase_order_items.item_type IS 'Type of item: inventory for general items, medicine for pharmacy items';
COMMENT ON COLUMN purchase_order_items.item_id IS 'Reference to inventory_items for general inventory items';
COMMENT ON COLUMN purchase_order_items.medicine_id IS 'Reference to medicines for pharmacy items';

-- Extend grn_items to support both inventory items and medicines
ALTER TABLE grn_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'inventory' CHECK (item_type IN ('inventory', 'medicine'));

ALTER TABLE grn_items 
ADD COLUMN IF NOT EXISTS medicine_id UUID REFERENCES medicines(id);

ALTER TABLE grn_items 
ADD COLUMN IF NOT EXISTS selling_price NUMERIC(15,2);

-- Add comments for clarity
COMMENT ON COLUMN grn_items.item_type IS 'Type of item: inventory for general items, medicine for pharmacy items';
COMMENT ON COLUMN grn_items.item_id IS 'Reference to inventory_items for general inventory items';
COMMENT ON COLUMN grn_items.medicine_id IS 'Reference to medicines for pharmacy items';
COMMENT ON COLUMN grn_items.selling_price IS 'Selling price for medicine items (used for pharmacy markup)';
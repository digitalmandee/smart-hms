-- Add medicine_name column to pharmacy_pos_items
ALTER TABLE pharmacy_pos_items
ADD COLUMN IF NOT EXISTS medicine_name TEXT;
-- Add missing columns to pharmacy_pos_items table
ALTER TABLE pharmacy_pos_items
ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) DEFAULT 0;
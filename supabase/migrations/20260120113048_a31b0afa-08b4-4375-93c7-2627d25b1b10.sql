-- Add remaining missing columns to pharmacy_pos_items table
ALTER TABLE pharmacy_pos_items
ADD COLUMN IF NOT EXISTS line_total NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(15,2) DEFAULT 0;
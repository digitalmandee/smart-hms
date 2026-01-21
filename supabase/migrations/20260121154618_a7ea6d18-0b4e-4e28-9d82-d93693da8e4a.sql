-- Add balance_amount column to invoices table if it doesn't exist
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_amount NUMERIC(12,2) DEFAULT 0;

-- Update existing invoices to calculate balance
UPDATE invoices SET balance_amount = total_amount - COALESCE(paid_amount, 0) WHERE balance_amount = 0 OR balance_amount IS NULL;
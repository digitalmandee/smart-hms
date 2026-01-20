-- Add invoice reference and payment tracking to lab_orders
ALTER TABLE lab_orders 
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'paid', 'partial', 'waived')),
  ADD COLUMN IF NOT EXISTS ordered_by UUID REFERENCES profiles(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lab_orders_payment_status ON lab_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_invoice_id ON lab_orders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_by ON lab_orders(ordered_by);

-- Add comment for clarity
COMMENT ON COLUMN lab_orders.payment_status IS 'Payment status for lab order: pending, paid, partial, waived';
COMMENT ON COLUMN lab_orders.invoice_id IS 'Reference to the invoice generated for this lab order';
COMMENT ON COLUMN lab_orders.ordered_by IS 'Profile ID of the user who created this lab order';
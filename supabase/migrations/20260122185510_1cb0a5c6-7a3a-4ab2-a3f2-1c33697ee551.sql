-- Add payment tracking to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'paid', 'partial', 'waived'));

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);

-- Add index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);

COMMENT ON COLUMN appointments.payment_status IS 'Payment status: pending, paid, partial, waived';
COMMENT ON COLUMN appointments.invoice_id IS 'Link to invoice for consultation fee';
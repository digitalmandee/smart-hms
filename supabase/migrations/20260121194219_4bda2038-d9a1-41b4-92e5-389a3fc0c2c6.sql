-- Add 'credit' to status check constraint for pharmacy_pos_transactions
ALTER TABLE pharmacy_pos_transactions 
DROP CONSTRAINT IF EXISTS pharmacy_pos_transactions_status_check;

ALTER TABLE pharmacy_pos_transactions 
ADD CONSTRAINT pharmacy_pos_transactions_status_check 
CHECK (status IN ('completed', 'voided', 'refunded', 'credit'));

-- Add patient_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pharmacy_pos_transactions' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE pharmacy_pos_transactions ADD COLUMN patient_id UUID REFERENCES patients(id);
  END IF;
END $$;

-- Add due_date column for credit transactions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pharmacy_pos_transactions' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE pharmacy_pos_transactions ADD COLUMN due_date DATE;
  END IF;
END $$;

-- Create pharmacy_patient_credits table for tracking outstanding balances
CREATE TABLE IF NOT EXISTS pharmacy_patient_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  transaction_id UUID REFERENCES pharmacy_pos_transactions(id),
  amount NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  balance NUMERIC(10,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE pharmacy_patient_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for pharmacy_patient_credits
CREATE POLICY "Users can view pharmacy credits in their organization"
ON pharmacy_patient_credits FOR SELECT
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create pharmacy credits in their organization"
ON pharmacy_patient_credits FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update pharmacy credits in their organization"
ON pharmacy_patient_credits FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pharmacy_patient_credits_patient ON pharmacy_patient_credits(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_patient_credits_status ON pharmacy_patient_credits(status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_pos_transactions_patient ON pharmacy_pos_transactions(patient_id);
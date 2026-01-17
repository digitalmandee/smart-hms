-- Add ledger_account_id to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ledger_account_id UUID REFERENCES accounts(id);

-- Create pharmacy_settings table
CREATE TABLE IF NOT EXISTS pharmacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) UNIQUE NOT NULL,
  branch_id UUID REFERENCES branches(id),
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  receipt_header TEXT,
  receipt_footer TEXT DEFAULT 'Thank you for your purchase!',
  low_stock_threshold INTEGER DEFAULT 10,
  expiry_alert_days INTEGER DEFAULT 30,
  require_customer_name BOOLEAN DEFAULT false,
  allow_held_transactions BOOLEAN DEFAULT true,
  auto_print_receipt BOOLEAN DEFAULT true,
  require_prescription_for_controlled BOOLEAN DEFAULT false,
  sales_revenue_account_id UUID REFERENCES accounts(id),
  inventory_account_id UUID REFERENCES accounts(id),
  cogs_account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on pharmacy_settings
ALTER TABLE pharmacy_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for pharmacy_settings
CREATE POLICY "Users can manage their org pharmacy settings"
ON pharmacy_settings FOR ALL USING (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
);

-- Create trigger function for GRN → Accounts Payable journal entry
CREATE OR REPLACE FUNCTION post_grn_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_inventory_account UUID;
  v_ap_account UUID;
  v_vendor_ap_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_total_amount NUMERIC;
  v_grn_number TEXT;
  v_vendor_name TEXT;
BEGIN
  -- Only trigger when status changes to 'verified'
  IF NEW.status != 'verified' OR OLD.status = 'verified' THEN
    RETURN NEW;
  END IF;
  
  -- Calculate total from invoice_amount or sum of items
  v_total_amount := COALESCE(NEW.invoice_amount, (
    SELECT COALESCE(SUM(quantity_accepted * unit_cost), 0)
    FROM grn_items WHERE grn_id = NEW.id
  ));
  
  IF v_total_amount <= 0 THEN
    RETURN NEW;
  END IF;
  
  -- Get GRN number and vendor name
  v_grn_number := NEW.grn_number;
  SELECT name INTO v_vendor_name FROM vendors WHERE id = NEW.vendor_id;
  
  -- Get or create Inventory Asset account
  v_inventory_account := get_or_create_default_account(
    NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset'
  );
  
  -- Get or create default Accounts Payable account
  v_ap_account := get_or_create_default_account(
    NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability'
  );
  
  -- Check if vendor has a specific AP sub-account
  SELECT ledger_account_id INTO v_vendor_ap_account 
  FROM vendors WHERE id = NEW.vendor_id;
  
  -- Use vendor-specific account if available, otherwise use default AP
  IF v_vendor_ap_account IS NULL THEN
    v_vendor_ap_account := v_ap_account;
  END IF;
  
  -- Generate entry number
  v_entry_number := 'JE-GRN-' || to_char(NOW(), 'YYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Create journal entry
  INSERT INTO journal_entries (
    organization_id, branch_id, entry_number, entry_date,
    description, reference_type, reference_id, status, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
    'GRN: ' || v_grn_number || ' - ' || v_vendor_name, 
    'grn', NEW.id, 'posted', true
  ) RETURNING id INTO v_journal_id;
  
  -- Debit: Inventory Asset
  INSERT INTO journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_inventory_account, 
    'Inventory from ' || v_grn_number, v_total_amount, 0
  );
  
  -- Credit: Accounts Payable
  INSERT INTO journal_entry_lines (
    journal_entry_id, account_id, description, debit_amount, credit_amount
  ) VALUES (
    v_journal_id, v_vendor_ap_account, 
    'Payable to ' || v_vendor_name, 0, v_total_amount
  );
  
  -- Update account balances
  UPDATE accounts 
  SET current_balance = current_balance + v_total_amount
  WHERE id = v_inventory_account;
  
  UPDATE accounts 
  SET current_balance = current_balance + v_total_amount
  WHERE id = v_vendor_ap_account;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on goods_received_notes
DROP TRIGGER IF EXISTS auto_post_grn ON goods_received_notes;
CREATE TRIGGER auto_post_grn
AFTER UPDATE ON goods_received_notes
FOR EACH ROW
EXECUTE FUNCTION post_grn_to_journal();
-- ==========================================
-- PHARMACY POS ENHANCEMENTS
-- ==========================================

-- 1. Held Transactions Table (for hold/recall functionality)
CREATE TABLE IF NOT EXISTS public.pharmacy_pos_held_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  held_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  held_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  recalled_at TIMESTAMPTZ,
  recalled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for held transactions
CREATE INDEX IF NOT EXISTS idx_held_tx_branch ON public.pharmacy_pos_held_transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_held_tx_active ON public.pharmacy_pos_held_transactions(is_active) WHERE is_active = true;

-- 2. Stock Movements Table (unified log for all stock in/out)
CREATE TABLE IF NOT EXISTS public.pharmacy_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
  inventory_id UUID REFERENCES public.medicine_inventory(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('grn', 'sale', 'dispense', 'adjustment', 'return', 'transfer_in', 'transfer_out', 'expired', 'damaged', 'opening')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER,
  new_stock INTEGER,
  reference_type TEXT,
  reference_id UUID,
  reference_number TEXT,
  batch_number TEXT,
  unit_cost DECIMAL(12,2),
  total_value DECIMAL(12,2),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for stock movements
CREATE INDEX IF NOT EXISTS idx_stock_mvmt_branch ON public.pharmacy_stock_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_mvmt_medicine ON public.pharmacy_stock_movements(medicine_id);
CREATE INDEX IF NOT EXISTS idx_stock_mvmt_type ON public.pharmacy_stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_mvmt_date ON public.pharmacy_stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_mvmt_ref ON public.pharmacy_stock_movements(reference_type, reference_id);

-- 3. Add patient_id to POS transactions for linking sales to patients
ALTER TABLE public.pharmacy_pos_transactions 
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL;

ALTER TABLE public.pharmacy_pos_transactions 
ADD COLUMN IF NOT EXISTS prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL;

-- 4. Enable RLS on new tables
ALTER TABLE public.pharmacy_pos_held_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_stock_movements ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for held transactions
CREATE POLICY "Users can view held transactions in their branch"
  ON public.pharmacy_pos_held_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (p.branch_id = pharmacy_pos_held_transactions.branch_id 
           OR p.organization_id = pharmacy_pos_held_transactions.organization_id)
    )
  );

CREATE POLICY "Users can create held transactions in their branch"
  ON public.pharmacy_pos_held_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.branch_id = pharmacy_pos_held_transactions.branch_id
    )
  );

CREATE POLICY "Users can update held transactions in their branch"
  ON public.pharmacy_pos_held_transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.branch_id = pharmacy_pos_held_transactions.branch_id
    )
  );

-- 6. RLS Policies for stock movements
CREATE POLICY "Users can view stock movements in their branch"
  ON public.pharmacy_stock_movements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (p.branch_id = pharmacy_stock_movements.branch_id 
           OR p.organization_id = pharmacy_stock_movements.organization_id)
    )
  );

CREATE POLICY "Users can create stock movements in their branch"
  ON public.pharmacy_stock_movements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.branch_id = pharmacy_stock_movements.branch_id
    )
  );

-- 7. Function to auto-log stock movements on POS sale
CREATE OR REPLACE FUNCTION public.log_pos_sale_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  v_inventory RECORD;
  v_medicine_name TEXT;
BEGIN
  -- Get inventory and medicine details
  SELECT mi.*, m.name as medicine_name 
  INTO v_inventory
  FROM public.medicine_inventory mi
  LEFT JOIN public.medicines m ON m.id = mi.medicine_id
  WHERE mi.id = NEW.inventory_id;
  
  IF v_inventory IS NOT NULL THEN
    -- Get the transaction for branch/org context
    INSERT INTO public.pharmacy_stock_movements (
      organization_id,
      branch_id,
      medicine_id,
      inventory_id,
      movement_type,
      quantity,
      previous_stock,
      new_stock,
      reference_type,
      reference_id,
      reference_number,
      batch_number,
      unit_cost,
      total_value,
      notes,
      created_by
    )
    SELECT 
      t.organization_id,
      t.branch_id,
      NEW.medicine_id,
      NEW.inventory_id,
      'sale',
      -NEW.quantity,
      v_inventory.quantity + NEW.quantity,
      v_inventory.quantity,
      'pos_transaction',
      NEW.transaction_id,
      t.transaction_number,
      NEW.batch_number,
      NEW.unit_price,
      NEW.line_total,
      'POS Sale',
      t.created_by
    FROM public.pharmacy_pos_transactions t
    WHERE t.id = NEW.transaction_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger to auto-log stock movements on POS sale
DROP TRIGGER IF EXISTS log_pos_sale_movement ON public.pharmacy_pos_items;
CREATE TRIGGER log_pos_sale_movement
AFTER INSERT ON public.pharmacy_pos_items
FOR EACH ROW
EXECUTE FUNCTION public.log_pos_sale_stock_movement();

-- 9. Add menu items for stock movements page
INSERT INTO public.menu_items (code, name, path, icon, parent_id, sort_order, required_permission, is_active)
SELECT 
  'pharmacy-stock-movements',
  'Stock Movements',
  '/app/pharmacy/stock-movements',
  'ArrowLeftRight',
  (SELECT id FROM public.menu_items WHERE code = 'pharmacy' LIMIT 1),
  60,
  'pharmacy.inventory',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.menu_items WHERE code = 'pharmacy-stock-movements'
);
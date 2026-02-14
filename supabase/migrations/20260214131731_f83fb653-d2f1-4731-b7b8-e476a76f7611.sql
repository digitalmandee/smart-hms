
-- Add store_id to pharmacy_stock_movements
ALTER TABLE pharmacy_stock_movements 
  ADD COLUMN store_id UUID REFERENCES stores(id);

-- Add store_id to pharmacy_pos_transactions
ALTER TABLE pharmacy_pos_transactions 
  ADD COLUMN store_id UUID REFERENCES stores(id);

-- Update the trigger function to propagate store_id from inventory
CREATE OR REPLACE FUNCTION public.log_pos_sale_stock_movement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    INSERT INTO public.pharmacy_stock_movements (
      organization_id,
      branch_id,
      store_id,
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
      v_inventory.store_id,
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
$function$;

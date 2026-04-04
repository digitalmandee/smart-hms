-- Create trigger function to auto-post surgery completion to GL
CREATE OR REPLACE FUNCTION public.auto_post_surgery_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_ar_account UUID;
  v_revenue_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_amount NUMERIC;
  v_patient_name TEXT;
  v_consumable RECORD;
  v_inv_account UUID;
  v_cogs_account UUID;
  v_consumable_total NUMERIC := 0;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    v_amount := COALESCE(NEW.estimated_cost, 0);
    
    SELECT COALESCE(SUM(total_price), 0) INTO v_consumable_total
    FROM public.surgery_consumables WHERE surgery_id = NEW.id;
    
    v_amount := v_amount + v_consumable_total;
    IF v_amount <= 0 THEN RETURN NEW; END IF;

    IF EXISTS (SELECT 1 FROM public.journal_entries WHERE reference_id = NEW.id AND reference_type = 'surgery') THEN
      RETURN NEW;
    END IF;

    SELECT COALESCE(first_name || ' ' || last_name, 'Patient') INTO v_patient_name
    FROM public.patients WHERE id = NEW.patient_id;

    v_ar_account := public.get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
    v_revenue_account := public.get_or_create_default_account(NEW.organization_id, 'REV-SURG-001', 'Surgery Revenue', 'revenue');

    v_entry_number := 'JE-SURG-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
      'Surgery: ' || NEW.procedure_name || ' - ' || v_patient_name || ' (' || NEW.surgery_number || ')',
      'surgery', NEW.id, true)
    RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_ar_account, 'Surgery charges - ' || NEW.surgery_number, v_amount, 0);

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_revenue_account, 'Surgery revenue - ' || NEW.surgery_number, 0, v_amount);

    IF v_consumable_total > 0 THEN
      v_inv_account := public.get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');
      v_cogs_account := public.get_or_create_default_account(NEW.organization_id, 'COGS-SURG-001', 'Surgery COGS', 'expense');
      
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (v_journal_id, v_cogs_account, 'Surgery consumables cost', v_consumable_total, 0);
      
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (v_journal_id, v_inv_account, 'Inventory consumed in surgery', 0, v_consumable_total);
    END IF;

    FOR v_consumable IN
      SELECT sc.inventory_item_id, sc.quantity, sc.unit_price
      FROM public.surgery_consumables sc
      WHERE sc.surgery_id = NEW.id AND sc.inventory_item_id IS NOT NULL
    LOOP
      UPDATE public.store_stock
      SET available_quantity = GREATEST(available_quantity - v_consumable.quantity, 0), updated_at = NOW()
      WHERE item_id = v_consumable.inventory_item_id AND organization_id = NEW.organization_id;
      
      INSERT INTO public.stock_adjustments (organization_id, item_id, adjustment_type, quantity, unit_cost, reason, adjusted_by)
      VALUES (NEW.organization_id, v_consumable.inventory_item_id, 'consumed',
        -v_consumable.quantity, COALESCE(v_consumable.unit_price, 0),
        'Surgery consumption: ' || NEW.surgery_number, NEW.created_by);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_post_surgery_to_journal ON public.surgeries;
CREATE TRIGGER trg_auto_post_surgery_to_journal
  AFTER UPDATE ON public.surgeries
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_post_surgery_to_journal();

DO $$
BEGIN
  ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_reference_type_check;
  ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_reference_type_check
    CHECK (reference_type IS NULL OR reference_type IN (
      'invoice', 'payment', 'expense', 'payroll', 'pos_transaction',
      'patient_deposit', 'credit_note', 'grn', 'donation', 'vendor_payment',
      'stock_adjustment', 'shipment', 'manual', 'opening_balance',
      'cpv', 'crv', 'bpv', 'brv', 'surgery'
    ));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
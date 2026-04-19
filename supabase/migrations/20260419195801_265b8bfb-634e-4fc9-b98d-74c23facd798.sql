-- Harden post_grn_to_journal: fire on INSERT or UPDATE for verified/posted, use received_date, deterministic entry number, idempotency guard

CREATE OR REPLACE FUNCTION public.post_grn_to_journal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inventory_account UUID;
  v_ap_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_total NUMERIC;
  v_should_post BOOLEAN := FALSE;
BEGIN
  -- Decide whether to post:
  --  * INSERT with status already verified/posted, OR
  --  * UPDATE that transitions INTO verified/posted from any other status
  IF TG_OP = 'INSERT' THEN
    v_should_post := NEW.status IN ('verified', 'posted');
  ELSIF TG_OP = 'UPDATE' THEN
    v_should_post := NEW.status IN ('verified', 'posted')
      AND (OLD.status IS NULL OR OLD.status NOT IN ('verified', 'posted'));
  END IF;

  IF NOT v_should_post THEN
    RETURN NEW;
  END IF;

  IF NEW.organization_id IS NULL THEN
    RAISE WARNING 'post_grn_to_journal: organization_id is NULL for GRN %, skipping', NEW.id;
    RETURN NEW;
  END IF;

  -- Idempotency guard
  IF EXISTS (
    SELECT 1 FROM public.journal_entries
    WHERE reference_type = 'grn' AND reference_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(COALESCE(quantity_received, 0) * COALESCE(unit_cost, 0)), 0)
  INTO v_total
  FROM public.grn_items
  WHERE grn_id = NEW.id;

  IF v_total <= 0 THEN
    RETURN NEW;
  END IF;

  v_inventory_account := public.get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');
  v_ap_account        := public.get_or_create_default_account(NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability');

  -- Deterministic entry number tied to GRN number
  v_entry_number := 'JE-GRN-' || NEW.grn_number;

  INSERT INTO public.journal_entries (
    organization_id, branch_id, entry_number, entry_date, description,
    reference_type, reference_id, is_posted
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number,
    COALESCE(NEW.received_date, CURRENT_DATE),
    'GRN: ' || NEW.grn_number,
    'grn', NEW.id, true
  ) RETURNING id INTO v_journal_id;

  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_inventory_account, 'Inventory received', v_total, 0);

  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ap_account, 'Payable to vendor', 0, v_total);

  RETURN NEW;
END;
$$;

-- Replace trigger to also fire on INSERT
DROP TRIGGER IF EXISTS auto_post_grn ON public.goods_received_notes;
CREATE TRIGGER auto_post_grn
AFTER INSERT OR UPDATE ON public.goods_received_notes
FOR EACH ROW
EXECUTE FUNCTION public.post_grn_to_journal();

CREATE OR REPLACE FUNCTION public.post_grn_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_inventory_account UUID;
  v_ap_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_total NUMERIC;
  v_org_id UUID;
BEGIN
  -- Only fire when status changes to 'verified'
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN

    -- Idempotency guard: skip if journal already exists for this GRN
    IF EXISTS (
      SELECT 1 FROM public.journal_entries
      WHERE reference_type = 'grn' AND reference_id = NEW.id
    ) THEN
      RETURN NEW;
    END IF;

    v_org_id := NEW.organization_id;
    IF v_org_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Calculate total using unit_cost (correct column name)
    SELECT COALESCE(SUM(quantity_received * unit_cost), 0)
    INTO v_total
    FROM public.grn_items
    WHERE grn_id = NEW.id;

    IF v_total <= 0 THEN RETURN NEW; END IF;

    v_inventory_account := public.get_or_create_default_account(v_org_id, 'INV-001', 'Inventory Asset', 'asset');
    v_ap_account := public.get_or_create_default_account(v_org_id, 'AP-001', 'Accounts Payable', 'liability');

    v_entry_number := 'JE-GRN-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (organization_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
    VALUES (v_org_id, v_entry_number, CURRENT_DATE, 'GRN: ' || NEW.grn_number, 'grn', NEW.id, true)
    RETURNING id INTO v_journal_id;

    -- DR Inventory Asset
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_inventory_account, 'Inventory received: ' || NEW.grn_number, v_total, 0);

    -- CR Accounts Payable
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_ap_account, 'Vendor liability: ' || NEW.grn_number, 0, v_total);
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate trigger
DROP TRIGGER IF EXISTS trg_post_grn_to_journal ON public.goods_received_notes;
CREATE TRIGGER trg_post_grn_to_journal
  AFTER UPDATE ON public.goods_received_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.post_grn_to_journal();

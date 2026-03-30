
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
  v_amount NUMERIC;
  v_vendor_name TEXT;
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    SELECT COALESCE(SUM(quantity_accepted * unit_cost), 0)
    INTO v_amount
    FROM public.grn_items
    WHERE grn_id = NEW.id;

    IF COALESCE(NEW.invoice_amount, 0) > 0 THEN
      v_amount := NEW.invoice_amount;
    END IF;

    IF v_amount <= 0 THEN RETURN NEW; END IF;

    SELECT name INTO v_vendor_name FROM public.vendors WHERE id = NEW.vendor_id;

    v_inventory_account := public.get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');
    v_ap_account := public.get_or_create_default_account(NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability');

    v_entry_number := 'JE-GRN-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.journal_entries (
      organization_id, branch_id, entry_number, entry_date,
      description, reference_type, reference_id, is_posted
    )
    VALUES (
      NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE,
      'GRN: ' || NEW.grn_number || ' from ' || COALESCE(v_vendor_name, 'vendor'),
      'grn', NEW.id, true
    )
    RETURNING id INTO v_journal_id;

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_inventory_account, 'Goods received - ' || NEW.grn_number, v_amount, 0);

    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
    VALUES (v_journal_id, v_ap_account, 'Payable to ' || COALESCE(v_vendor_name, 'vendor'), 0, v_amount);
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_post_grn_to_journal ON public.goods_received_notes;
CREATE TRIGGER trigger_post_grn_to_journal
  AFTER UPDATE ON public.goods_received_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.post_grn_to_journal();

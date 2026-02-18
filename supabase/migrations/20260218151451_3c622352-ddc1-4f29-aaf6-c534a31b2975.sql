-- Fix remaining trigger functions that don't have search_path set
-- These are non-SECURITY DEFINER functions used in triggers

CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_ar_account UUID;
  v_revenue_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
BEGIN
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;
  IF COALESCE(NEW.total_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;
  v_ar_account := public.get_or_create_default_account(NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  v_revenue_account := public.get_or_create_default_account(NEW.organization_id, 'REV-001', 'Service Revenue', 'revenue');
  v_entry_number := 'JE-INV-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'Invoice: ' || NEW.invoice_number, 'invoice', NEW.id, true)
  RETURNING id INTO v_journal_id;
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ar_account, 'Invoice ' || NEW.invoice_number, NEW.total_amount, 0);
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_revenue_account, 'Revenue from ' || NEW.invoice_number, 0, NEW.total_amount);
  UPDATE public.accounts SET current_balance = current_balance + NEW.total_amount, updated_at = NOW() WHERE id = v_ar_account;
  UPDATE public.accounts SET current_balance = current_balance + NEW.total_amount, updated_at = NOW() WHERE id = v_revenue_account;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.post_pos_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_cash_account UUID;
  v_revenue_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
BEGIN
  IF COALESCE(NEW.total_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;
  v_cash_account := public.get_or_create_default_account(NEW.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
  v_revenue_account := public.get_or_create_default_account(NEW.organization_id, 'REV-PHARM-001', 'Pharmacy Revenue', 'revenue');
  v_entry_number := 'JE-POS-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'POS Sale: ' || NEW.transaction_number, 'pos_transaction', NEW.id, true)
  RETURNING id INTO v_journal_id;
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_cash_account, 'POS Cash Sale', NEW.total_amount, 0);
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_revenue_account, 'Pharmacy Sales', 0, NEW.total_amount);
  UPDATE public.accounts SET current_balance = current_balance + NEW.total_amount, updated_at = NOW() WHERE id = v_cash_account;
  UPDATE public.accounts SET current_balance = current_balance + NEW.total_amount, updated_at = NOW() WHERE id = v_revenue_account;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.post_payment_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_target_account UUID;
  v_ar_account UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_invoice RECORD;
  v_payment_method_account UUID;
BEGIN
  IF COALESCE(NEW.amount, 0) <= 0 THEN RETURN NEW; END IF;
  SELECT * INTO v_invoice FROM public.invoices WHERE id = NEW.invoice_id;
  IF v_invoice IS NULL THEN RETURN NEW; END IF;
  IF NEW.payment_method_id IS NOT NULL THEN
    SELECT ledger_account_id INTO v_payment_method_account FROM public.payment_methods WHERE id = NEW.payment_method_id;
  END IF;
  IF v_payment_method_account IS NOT NULL THEN
    v_target_account := v_payment_method_account;
  ELSE
    v_target_account := public.get_or_create_default_account(v_invoice.organization_id, 'CASH-001', 'Cash in Hand', 'asset');
  END IF;
  v_ar_account := public.get_or_create_default_account(v_invoice.organization_id, 'AR-001', 'Accounts Receivable', 'asset');
  v_entry_number := 'JE-PAY-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  INSERT INTO public.journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (v_invoice.organization_id, v_invoice.branch_id, v_entry_number, CURRENT_DATE, 'Payment for ' || v_invoice.invoice_number, 'payment', NEW.id, true)
  RETURNING id INTO v_journal_id;
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_target_account, 'Payment received', NEW.amount, 0);
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_ar_account, 'AR reduction', 0, NEW.amount);
  UPDATE public.accounts SET current_balance = current_balance + NEW.amount, updated_at = NOW() WHERE id = v_target_account;
  UPDATE public.accounts SET current_balance = current_balance - NEW.amount, updated_at = NOW() WHERE id = v_ar_account;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.post_grn_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
  IF NEW.status != 'verified' OR OLD.status = 'verified' THEN RETURN NEW; END IF;
  v_total_amount := COALESCE(NEW.invoice_amount, (SELECT COALESCE(SUM(quantity_accepted * unit_cost), 0) FROM grn_items WHERE grn_id = NEW.id));
  IF v_total_amount <= 0 THEN RETURN NEW; END IF;
  v_grn_number := NEW.grn_number;
  SELECT name INTO v_vendor_name FROM vendors WHERE id = NEW.vendor_id;
  v_inventory_account := get_or_create_default_account(NEW.organization_id, 'INV-001', 'Inventory Asset', 'asset');
  v_ap_account := get_or_create_default_account(NEW.organization_id, 'AP-001', 'Accounts Payable', 'liability');
  SELECT ledger_account_id INTO v_vendor_ap_account FROM vendors WHERE id = NEW.vendor_id;
  IF v_vendor_ap_account IS NULL THEN v_vendor_ap_account := v_ap_account; END IF;
  v_entry_number := 'JE-GRN-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  INSERT INTO journal_entries (organization_id, branch_id, entry_number, entry_date, description, reference_type, reference_id, is_posted)
  VALUES (NEW.organization_id, NEW.branch_id, v_entry_number, CURRENT_DATE, 'GRN: ' || v_grn_number || ' - ' || v_vendor_name, 'grn', NEW.id, true)
  RETURNING id INTO v_journal_id;
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_inventory_account, 'Inventory from ' || v_grn_number, v_total_amount, 0);
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
  VALUES (v_journal_id, v_vendor_ap_account, 'Payable to ' || v_vendor_name, 0, v_total_amount);
  UPDATE accounts SET current_balance = current_balance + v_total_amount WHERE id = v_inventory_account;
  UPDATE accounts SET current_balance = current_balance + v_total_amount WHERE id = v_vendor_ap_account;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_service_type_price()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.category = 'radiology' THEN
    UPDATE imaging_procedures SET base_price = NEW.default_price, is_active = NEW.is_active WHERE service_type_id = NEW.id;
  END IF;
  IF NEW.category = 'room' THEN
    UPDATE ipd_bed_types SET daily_rate = NEW.default_price, is_active = NEW.is_active WHERE service_type_id = NEW.id;
  END IF;
  IF NEW.category = 'lab' THEN
    UPDATE lab_test_templates SET price = NEW.default_price WHERE service_type_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_pos_sale_stock_movement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_inventory RECORD;
  v_medicine_name TEXT;
BEGIN
  SELECT mi.*, m.name as medicine_name INTO v_inventory
  FROM public.medicine_inventory mi
  LEFT JOIN public.medicines m ON m.id = mi.medicine_id
  WHERE mi.id = NEW.inventory_id;
  IF v_inventory IS NOT NULL THEN
    INSERT INTO public.pharmacy_stock_movements (
      organization_id, branch_id, store_id, medicine_id, inventory_id, movement_type,
      quantity, previous_stock, new_stock, reference_type, reference_id, reference_number,
      batch_number, unit_cost, total_value, notes, created_by
    )
    SELECT t.organization_id, t.branch_id, v_inventory.store_id, NEW.medicine_id, NEW.inventory_id, 'sale',
      -NEW.quantity, v_inventory.quantity + NEW.quantity, v_inventory.quantity,
      'pos_transaction', NEW.transaction_id, t.transaction_number, NEW.batch_number,
      NEW.unit_price, NEW.line_total, 'POS Sale', t.created_by
    FROM public.pharmacy_pos_transactions t WHERE t.id = NEW.transaction_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.post_surgery_earnings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_team_member RECORD;
  v_charges JSONB;
  v_plan RECORD;
  v_gross_amount DECIMAL;
  v_share_percent DECIMAL;
  v_share_amount DECIMAL;
  v_doctor_record_id UUID;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    v_charges := COALESCE(NEW.surgery_charges, '{}'::jsonb);
    FOR v_team_member IN 
      SELECT stm.*, stm.role as team_role, p.id as profile_id
      FROM surgery_team_members stm
      JOIN profiles p ON p.id = stm.staff_id
      WHERE stm.surgery_id = NEW.id
        AND stm.role IN ('lead_surgeon', 'anesthetist', 'assistant_surgeon')
        AND stm.confirmation_status = 'accepted'
    LOOP
      SELECT id INTO v_doctor_record_id FROM doctors WHERE profile_id = v_team_member.profile_id LIMIT 1;
      IF v_doctor_record_id IS NULL THEN CONTINUE; END IF;
      SELECT * INTO v_plan FROM doctor_compensation_plans WHERE doctor_id = v_doctor_record_id AND is_active = true LIMIT 1;
      CASE v_team_member.team_role
        WHEN 'lead_surgeon' THEN
          v_gross_amount := COALESCE((v_charges->>'surgeon_fee')::decimal, 0);
          v_share_percent := COALESCE(v_plan.surgery_share_percent, 50);
        WHEN 'anesthetist' THEN
          v_gross_amount := COALESCE((v_charges->>'anesthesia_fee')::decimal, 0);
          v_share_percent := COALESCE(v_plan.anesthesia_share_percent, COALESCE(v_plan.procedure_share_percent, 50));
        WHEN 'assistant_surgeon' THEN
          v_gross_amount := COALESCE((v_charges->>'surgeon_fee')::decimal, 0) * 0.2;
          v_share_percent := COALESCE(v_plan.surgery_share_percent, 50);
        ELSE
          v_gross_amount := 0;
          v_share_percent := 0;
      END CASE;
      IF v_gross_amount > 0 THEN
        v_share_amount := v_gross_amount * (v_share_percent / 100);
        IF NOT EXISTS (SELECT 1 FROM doctor_earnings WHERE source_id = NEW.id AND source_type = 'surgery' AND doctor_id = v_doctor_record_id AND notes LIKE '%' || v_team_member.team_role || '%') THEN
          INSERT INTO doctor_earnings (organization_id, doctor_id, compensation_plan_id, earning_date, source_type, source_id, source_reference, patient_id, gross_amount, doctor_share_percent, doctor_share_amount, hospital_share_amount, notes)
          VALUES (NEW.organization_id, v_doctor_record_id, v_plan.id, CURRENT_DATE, 'surgery', NEW.id, NEW.surgery_number, NEW.patient_id, v_gross_amount, v_share_percent, v_share_amount, v_gross_amount - v_share_amount, 'Role: ' || v_team_member.team_role);
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

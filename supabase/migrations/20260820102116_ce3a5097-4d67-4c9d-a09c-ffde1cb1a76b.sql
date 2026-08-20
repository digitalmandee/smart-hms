CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_journal_id UUID;
  v_entry_number TEXT;
  v_revenue_account_id UUID;
  v_ar_account_id UUID;
  v_tax_account_id UUID;
  v_discount_account_id UUID;
  v_insurance_ar_account_id UUID;
  v_net_revenue NUMERIC;
  v_patient_ar NUMERIC;
  v_insurance_ar NUMERIC;
  v_description TEXT;
  v_department TEXT;
BEGIN
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.total_amount, 0) = 0 THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM journal_entries
    WHERE reference_id = NEW.id AND reference_type = 'invoice'
  ) THEN
    RETURN NEW;
  END IF;

  v_department := CASE
    WHEN NEW.invoice_number LIKE 'IPD-%' THEN 'IPD'
    WHEN NEW.invoice_number LIKE 'LAB-%' THEN 'Laboratory'
    WHEN NEW.invoice_number LIKE 'RAD-%' THEN 'Radiology'
    WHEN NEW.invoice_number LIKE 'PHARM-%' THEN 'Pharmacy'
    WHEN NEW.invoice_number LIKE 'ER-%' THEN 'Emergency'
    ELSE 'OPD'
  END;

  v_revenue_account_id := get_or_create_default_account(
    NEW.organization_id,
    CASE v_department
      WHEN 'IPD' THEN 'IPD-REV-001'
      WHEN 'Laboratory' THEN 'LAB-REV-001'
      WHEN 'Radiology' THEN 'RAD-REV-001'
      WHEN 'Pharmacy' THEN 'PHARM-REV-001'
      WHEN 'Emergency' THEN 'ER-REV-001'
      ELSE 'OPD-REV-001'
    END,
    CASE v_department
      WHEN 'IPD' THEN 'IPD Revenue'
      WHEN 'Laboratory' THEN 'Laboratory Revenue'
      WHEN 'Radiology' THEN 'Radiology Revenue'
      WHEN 'Pharmacy' THEN 'Pharmacy Revenue'
      WHEN 'Emergency' THEN 'Emergency Revenue'
      ELSE 'OPD Revenue'
    END,
    'revenue'
  );

  v_ar_account_id := get_or_create_default_account(
    NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset'
  );

  v_net_revenue := COALESCE(NEW.subtotal, NEW.total_amount) - COALESCE(NEW.discount_amount, 0);
  v_insurance_ar := COALESCE(NEW.insurance_amount, 0);
  v_patient_ar := NEW.total_amount - v_insurance_ar;

  v_entry_number := 'JE-INV-' || SUBSTRING(NEW.id::text, 1, 8);
  v_description := 'Invoice ' || COALESCE(NEW.invoice_number, NEW.id::text) || ' - ' || v_department;

  INSERT INTO journal_entries (
    organization_id, branch_id, entry_number, entry_date, description,
    reference_type, reference_id, is_posted, posted_at, status,
    created_by
  ) VALUES (
    NEW.organization_id, NEW.branch_id, v_entry_number, COALESCE(NEW.invoice_date, CURRENT_DATE),
    v_description, 'invoice', NEW.id, true, now(), 'posted',
    COALESCE(NEW.created_by, auth.uid())
  ) RETURNING id INTO v_journal_id;

  IF v_patient_ar > 0 THEN
    INSERT INTO journal_entry_lines (
      journal_entry_id, account_id, debit_amount, credit_amount, description
    ) VALUES (
      v_journal_id, v_ar_account_id, v_patient_ar, 0,
      'Patient AR - ' || COALESCE(NEW.invoice_number, '')
    );
  END IF;

  IF v_insurance_ar > 0 THEN
    v_insurance_ar_account_id := get_or_create_default_account(
      NEW.organization_id, 'AR-INS-001', 'Insurance Receivables', 'asset'
    );
    INSERT INTO journal_entry_lines (
      journal_entry_id, account_id, debit_amount, credit_amount, description
    ) VALUES (
      v_journal_id, v_insurance_ar_account_id, v_insurance_ar, 0,
      'Insurance AR - ' || COALESCE(NEW.invoice_number, '')
    );
  END IF;

  INSERT INTO journal_entry_lines (
    journal_entry_id, account_id, debit_amount, credit_amount, description
  ) VALUES (
    v_journal_id, v_revenue_account_id, 0, v_net_revenue,
    v_department || ' Revenue - ' || COALESCE(NEW.invoice_number, '')
  );

  IF COALESCE(NEW.tax_amount, 0) > 0 THEN
    v_tax_account_id := get_or_create_default_account(
      NEW.organization_id, 'TAX-PAY-001', 'Tax Payable', 'liability'
    );
    INSERT INTO journal_entry_lines (
      journal_entry_id, account_id, debit_amount, credit_amount, description
    ) VALUES (
      v_journal_id, v_tax_account_id, 0, NEW.tax_amount,
      'Tax - ' || COALESCE(NEW.invoice_number, '')
    );
  END IF;

  IF COALESCE(NEW.discount_amount, 0) > 0 THEN
    v_discount_account_id := get_or_create_default_account(
      NEW.organization_id, 'DISC-001', 'Discounts Allowed', 'expense'
    );
    INSERT INTO journal_entry_lines (
      journal_entry_id, account_id, debit_amount, credit_amount, description
    ) VALUES (
      v_journal_id, v_discount_account_id, NEW.discount_amount, 0,
      'Discount - ' || COALESCE(NEW.invoice_number, '')
    );
  END IF;

  RETURN NEW;
END;
$function$;
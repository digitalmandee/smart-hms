
-- ============================================================
-- 1. FIX: post_invoice_to_journal trigger — change 'issued' to 'pending'
-- ============================================================
CREATE OR REPLACE FUNCTION public.post_invoice_to_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  -- Only post for valid statuses (FIXED: 'pending' instead of 'issued')
  IF NEW.status NOT IN ('pending', 'paid', 'partially_paid') THEN
    RETURN NEW;
  END IF;

  -- Skip zero-amount invoices
  IF COALESCE(NEW.total_amount, 0) = 0 THEN
    RETURN NEW;
  END IF;

  -- Idempotency: skip if journal already exists
  IF EXISTS (
    SELECT 1 FROM journal_entries
    WHERE reference_id = NEW.id AND reference_type = 'invoice'
  ) THEN
    RETURN NEW;
  END IF;

  -- Determine department from invoice number prefix
  v_department := CASE
    WHEN NEW.invoice_number LIKE 'IPD-%' THEN 'IPD'
    WHEN NEW.invoice_number LIKE 'LAB-%' THEN 'Laboratory'
    WHEN NEW.invoice_number LIKE 'RAD-%' THEN 'Radiology'
    WHEN NEW.invoice_number LIKE 'PHARM-%' THEN 'Pharmacy'
    WHEN NEW.invoice_number LIKE 'ER-%' THEN 'Emergency'
    ELSE 'OPD'
  END;

  -- Get revenue account based on department
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

  -- Get AR account
  v_ar_account_id := get_or_create_default_account(
    NEW.organization_id, 'AR-001', 'Accounts Receivable', 'asset'
  );

  -- Calculate net revenue (subtotal minus discount)
  v_net_revenue := COALESCE(NEW.subtotal, NEW.total_amount) - COALESCE(NEW.discount_amount, 0);

  -- Calculate insurance vs patient AR split
  v_insurance_ar := COALESCE(NEW.insurance_amount, 0);
  v_patient_ar := NEW.total_amount - v_insurance_ar;

  -- Generate entry number
  v_entry_number := 'JE-INV-' || SUBSTRING(NEW.id::text, 1, 8);

  -- Build description
  v_description := 'Invoice ' || COALESCE(NEW.invoice_number, NEW.id::text) || ' - ' || v_department;

  -- Create journal entry
  INSERT INTO journal_entries (
    organization_id, entry_number, entry_date, description,
    reference_type, reference_id, is_auto_generated, status,
    created_by
  ) VALUES (
    NEW.organization_id, v_entry_number, COALESCE(NEW.invoice_date, CURRENT_DATE),
    v_description, 'invoice', NEW.id, true, 'posted',
    COALESCE(NEW.created_by, auth.uid())
  ) RETURNING id INTO v_journal_id;

  -- DR: Accounts Receivable (patient portion)
  IF v_patient_ar > 0 THEN
    INSERT INTO journal_entry_lines (
      journal_entry_id, account_id, debit_amount, credit_amount, description
    ) VALUES (
      v_journal_id, v_ar_account_id, v_patient_ar, 0,
      'Patient AR - ' || COALESCE(NEW.invoice_number, '')
    );
  END IF;

  -- DR: Insurance Receivable (if insurance amount exists)
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

  -- CR: Revenue (net of discount)
  INSERT INTO journal_entry_lines (
    journal_entry_id, account_id, debit_amount, credit_amount, description
  ) VALUES (
    v_journal_id, v_revenue_account_id, 0, v_net_revenue,
    v_department || ' Revenue - ' || COALESCE(NEW.invoice_number, '')
  );

  -- CR: Tax Payable (if tax exists)
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

  -- DR: Discount Allowed (if discount exists)
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
$$;

-- ============================================================
-- 2. ADD INSURANCE COLUMNS TO INVOICES (FK to insurance_companies)
-- ============================================================
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS insurance_id UUID REFERENCES public.insurance_companies(id),
  ADD COLUMN IF NOT EXISTS insurance_amount NUMERIC DEFAULT 0;

-- ============================================================
-- 3. BACKFILL: doctor_id from invoice_items
-- ============================================================
UPDATE invoices i
SET doctor_id = sub.first_doctor_id
FROM (
  SELECT invoice_id, (ARRAY_AGG(doctor_id ORDER BY created_at))[1] AS first_doctor_id
  FROM invoice_items
  WHERE doctor_id IS NOT NULL
  GROUP BY invoice_id
) sub
WHERE i.id = sub.invoice_id
  AND i.doctor_id IS NULL;

-- ============================================================
-- 4. BACKFILL: department from invoice prefix
-- ============================================================
UPDATE invoices
SET department = CASE
  WHEN invoice_number LIKE 'IPD-%' THEN 'IPD'
  WHEN invoice_number LIKE 'LAB-%' THEN 'Laboratory'
  WHEN invoice_number LIKE 'RAD-%' THEN 'Radiology'
  WHEN invoice_number LIKE 'PHARM-%' THEN 'Pharmacy'
  WHEN invoice_number LIKE 'ER-%' THEN 'Emergency'
  ELSE 'OPD'
END
WHERE department IS NULL;

-- ============================================================
-- 5. BACKFILL: admission_id from admissions table
-- ============================================================
UPDATE invoices i
SET admission_id = a.id
FROM admissions a
WHERE (a.admission_invoice_id = i.id OR a.discharge_invoice_id = i.id)
  AND i.admission_id IS NULL;

-- ============================================================
-- 6. SEED DEFAULT ACCOUNTS for all organizations
-- ============================================================
INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_active)
SELECT o.id, 'DISC-001', 'Discounts Allowed', at.id, true, 4, true
FROM organizations o
CROSS JOIN LATERAL (
  SELECT id FROM account_types WHERE organization_id = o.id AND category = 'expense' LIMIT 1
) at
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE organization_id = o.id AND account_number = 'DISC-001'
);

INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_active)
SELECT o.id, 'AR-INS-001', 'Insurance Receivables', at.id, true, 4, true
FROM organizations o
CROSS JOIN LATERAL (
  SELECT id FROM account_types WHERE organization_id = o.id AND category = 'asset' LIMIT 1
) at
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE organization_id = o.id AND account_number = 'AR-INS-001'
);

INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_active)
SELECT o.id, 'BAD-DEBT-001', 'Bad Debt Expense', at.id, true, 4, true
FROM organizations o
CROSS JOIN LATERAL (
  SELECT id FROM account_types WHERE organization_id = o.id AND category = 'expense' LIMIT 1
) at
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE organization_id = o.id AND account_number = 'BAD-DEBT-001'
);

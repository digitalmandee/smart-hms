
-- Step 1: Add new columns
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS account_level INTEGER NOT NULL DEFAULT 4;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS is_header BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Validation trigger
CREATE OR REPLACE FUNCTION public.check_posting_account()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT is_header FROM public.accounts WHERE id = NEW.account_id) THEN
    RAISE EXCEPTION 'Cannot post journal entry lines to a header account (is_header = true)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_posting_account ON public.journal_entry_lines;
CREATE TRIGGER trg_check_posting_account
  BEFORE INSERT OR UPDATE ON public.journal_entry_lines
  FOR EACH ROW EXECUTE FUNCTION public.check_posting_account();

-- Step 3: Update get_or_create_default_account
CREATE OR REPLACE FUNCTION public.get_or_create_default_account(
  p_organization_id uuid, p_account_code text, p_account_name text, p_account_type_category text DEFAULT 'asset'
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_account_id UUID; v_account_type_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM public.accounts WHERE organization_id = p_organization_id AND account_number = p_account_code LIMIT 1;
  IF v_account_id IS NOT NULL THEN RETURN v_account_id; END IF;
  SELECT id INTO v_account_type_id FROM public.account_types WHERE organization_id = p_organization_id AND category = p_account_type_category ORDER BY sort_order LIMIT 1;
  IF v_account_type_id IS NULL THEN RAISE EXCEPTION 'No account type found for category % in organization %', p_account_type_category, p_organization_id; END IF;
  INSERT INTO public.accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header)
  VALUES (p_organization_id, p_account_code, p_account_name, v_account_type_id, true, 4, false) RETURNING id INTO v_account_id;
  RETURN v_account_id;
END;
$function$;

-- Step 4: Hierarchy function with NULL-safe type lookups
CREATE OR REPLACE FUNCTION public.create_coa_hierarchy(p_org_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_type_id UUID;
  v_l1 UUID; v_l2 UUID; v_l3 UUID;
  v_cat RECORD;
  
  -- Structure definition arrays
  TYPE_CATS TEXT[] := ARRAY['asset','liability','equity','revenue','expense'];
BEGIN
  -- For each category, create L1 -> L2 -> L3 and re-parent L4
  FOR v_cat IN
    SELECT unnest(ARRAY['asset','liability','equity','revenue','expense']) AS cat,
           unnest(ARRAY['Assets','Liabilities','Equity','Revenue','Expenses']) AS l1_name,
           unnest(ARRAY['L1-ASSETS','L1-LIABILITIES','L1-EQUITY','L1-REVENUE','L1-EXPENSES']) AS l1_code
  LOOP
    SELECT id INTO v_type_id FROM account_types WHERE organization_id = p_org_id AND category = v_cat.cat ORDER BY sort_order LIMIT 1;
    IF v_type_id IS NULL THEN CONTINUE; END IF;

    -- Create Level 1
    INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header)
    VALUES (p_org_id, v_cat.l1_code, v_cat.l1_name, v_type_id, true, 1, true) RETURNING id INTO v_l1;
  END LOOP;

  -- Now do detailed structure per category
  -- We need type IDs
  DECLARE
    v_asset_tid UUID; v_liab_tid UUID; v_eq_tid UUID; v_rev_tid UUID; v_exp_tid UUID;
    v_assets_l1 UUID; v_liab_l1 UUID; v_eq_l1 UUID; v_rev_l1 UUID; v_exp_l1 UUID;
  BEGIN
    SELECT id INTO v_asset_tid FROM account_types WHERE organization_id = p_org_id AND category = 'asset' ORDER BY sort_order LIMIT 1;
    SELECT id INTO v_liab_tid FROM account_types WHERE organization_id = p_org_id AND category = 'liability' ORDER BY sort_order LIMIT 1;
    SELECT id INTO v_eq_tid FROM account_types WHERE organization_id = p_org_id AND category = 'equity' ORDER BY sort_order LIMIT 1;
    SELECT id INTO v_rev_tid FROM account_types WHERE organization_id = p_org_id AND category = 'revenue' ORDER BY sort_order LIMIT 1;
    SELECT id INTO v_exp_tid FROM account_types WHERE organization_id = p_org_id AND category = 'expense' ORDER BY sort_order LIMIT 1;

    -- Get L1 IDs
    SELECT id INTO v_assets_l1 FROM accounts WHERE organization_id = p_org_id AND account_number = 'L1-ASSETS';
    SELECT id INTO v_liab_l1 FROM accounts WHERE organization_id = p_org_id AND account_number = 'L1-LIABILITIES';
    SELECT id INTO v_eq_l1 FROM accounts WHERE organization_id = p_org_id AND account_number = 'L1-EQUITY';
    SELECT id INTO v_rev_l1 FROM accounts WHERE organization_id = p_org_id AND account_number = 'L1-REVENUE';
    SELECT id INTO v_exp_l1 FROM accounts WHERE organization_id = p_org_id AND account_number = 'L1-EXPENSES';

    -- Renumber conflicting accounts first
    UPDATE accounts SET account_number = '2111' WHERE organization_id = p_org_id AND account_number = '2100' AND is_header = false;
    UPDATE accounts SET account_number = '3111' WHERE organization_id = p_org_id AND account_number = '3100' AND is_header = false;
    UPDATE accounts SET account_number = '5111' WHERE organization_id = p_org_id AND account_number = '5100' AND is_header = false;
    UPDATE accounts SET account_number = '5211' WHERE organization_id = p_org_id AND account_number = '5200' AND is_header = false;
    UPDATE accounts SET account_number = '5311' WHERE organization_id = p_org_id AND account_number = '5300' AND is_header = false;

    -- ===== ASSETS =====
    IF v_asset_tid IS NOT NULL AND v_assets_l1 IS NOT NULL THEN
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '1100', 'Current Assets', v_asset_tid, true, 2, true, v_assets_l1) RETURNING id INTO v_l2;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '1110', 'Cash & Bank', v_asset_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number IN ('1000','CASH-001','1010','1020') AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '1120', 'Receivables', v_asset_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = 'AR-001' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '1130', 'Inventory', v_asset_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = 'INV-001' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '1140', 'Prepaid & Advances', v_asset_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '1300' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '1200', 'Fixed Assets', v_asset_tid, true, 2, true, v_assets_l1) RETURNING id INTO v_l2;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '1210', 'Equipment & Machinery', v_asset_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '1400' AND is_header = false;

      -- Catch remaining unparented assets
      UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE organization_id = p_org_id AND account_number = '1110'), account_level = 4
      WHERE organization_id = p_org_id AND parent_account_id IS NULL AND is_header = false AND account_type_id = v_asset_tid;
    END IF;

    -- ===== LIABILITIES =====
    IF v_liab_tid IS NOT NULL AND v_liab_l1 IS NOT NULL THEN
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '2100', 'Current Liabilities', v_liab_tid, true, 2, true, v_liab_l1) RETURNING id INTO v_l2;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '2110', 'Payables', v_liab_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number IN ('AP-001','2300') AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '2120', 'Accruals & Taxes', v_liab_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number IN ('2111','2200') AND is_header = false;

      UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE organization_id = p_org_id AND account_number = '2110'), account_level = 4
      WHERE organization_id = p_org_id AND parent_account_id IS NULL AND is_header = false AND account_type_id = v_liab_tid;
    END IF;

    -- ===== EQUITY =====
    IF v_eq_tid IS NOT NULL AND v_eq_l1 IS NOT NULL THEN
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '3100', 'Owner''s Equity', v_eq_tid, true, 2, true, v_eq_l1) RETURNING id INTO v_l2;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '3110', 'Capital', v_eq_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '3000' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '3120', 'Retained Earnings', v_eq_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '3111' AND is_header = false;

      UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE organization_id = p_org_id AND account_number = '3110'), account_level = 4
      WHERE organization_id = p_org_id AND parent_account_id IS NULL AND is_header = false AND account_type_id = v_eq_tid;
    END IF;

    -- ===== REVENUE =====
    IF v_rev_tid IS NOT NULL AND v_rev_l1 IS NOT NULL THEN
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '4100', 'Service Revenue', v_rev_tid, true, 2, true, v_rev_l1) RETURNING id INTO v_l2;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '4110', 'OPD Revenue', v_rev_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = 'REV-001' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '4120', 'IPD Revenue', v_rev_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '4010' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '4130', 'Emergency Revenue', v_rev_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '4020' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '4140', 'Ancillary Revenue', v_rev_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number IN ('4200','REV-PHARM-001') AND is_header = false;

      UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE organization_id = p_org_id AND account_number = '4140'), account_level = 4
      WHERE organization_id = p_org_id AND parent_account_id IS NULL AND is_header = false AND account_type_id = v_rev_tid;
    END IF;

    -- ===== EXPENSES =====
    IF v_exp_tid IS NOT NULL AND v_exp_l1 IS NOT NULL THEN
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5100', 'Personnel Expenses', v_exp_tid, true, 2, true, v_exp_l1) RETURNING id INTO v_l2;
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5110', 'Salaries & Benefits', v_exp_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number IN ('5000','EXP-SAL-001') AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5200', 'Clinical Expenses', v_exp_tid, true, 2, true, v_exp_l1) RETURNING id INTO v_l2;
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5210', 'Medicines & Drugs', v_exp_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '5111' AND is_header = false;
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5220', 'Medical Supplies', v_exp_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '5400' AND is_header = false;
      
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5300', 'Operating Expenses', v_exp_tid, true, 2, true, v_exp_l1) RETURNING id INTO v_l2;
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5310', 'Utilities', v_exp_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '5211' AND is_header = false;
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5320', 'Rent & Maintenance', v_exp_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '5311' AND is_header = false;
      INSERT INTO accounts (organization_id, account_number, name, account_type_id, is_system, account_level, is_header, parent_account_id)
      VALUES (p_org_id, '5330', 'Administration', v_exp_tid, true, 3, true, v_l2) RETURNING id INTO v_l3;
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4 WHERE organization_id = p_org_id AND account_number = '5500' AND is_header = false;

      -- Catch remaining unparented expense accounts
      UPDATE accounts SET parent_account_id = v_l3, account_level = 4
      WHERE organization_id = p_org_id AND parent_account_id IS NULL AND is_header = false AND account_type_id = v_exp_tid;
    END IF;
  END;
END;
$$;

-- Step 5: Run for all orgs that have accounts but no headers yet
DO $$
DECLARE v_org RECORD;
BEGIN
  FOR v_org IN 
    SELECT DISTINCT organization_id FROM accounts 
    WHERE NOT EXISTS (SELECT 1 FROM accounts a2 WHERE a2.organization_id = accounts.organization_id AND a2.is_header = true)
  LOOP
    PERFORM public.create_coa_hierarchy(v_org.organization_id);
  END LOOP;
END;
$$;

# Canonical Idempotent Posting Trigger

Every module that posts to the GL follows this shape. Copy and adapt.

```sql
CREATE OR REPLACE FUNCTION public.post_<module>_to_gl()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_revenue_account_id uuid;
  v_cash_account_id uuid;
  v_journal_id uuid;
BEGIN
  -- 1. IDEMPOTENCY GUARD — bail if already posted
  IF EXISTS (
    SELECT 1 FROM journal_entries
    WHERE source_type = '<module>'
      AND source_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  -- 2. Only post on terminal status (e.g. 'paid', 'verified', 'completed')
  IF NEW.status IS DISTINCT FROM '<terminal_status>' THEN
    RETURN NEW;
  END IF;

  -- 3. Resolve accounts (prefix routing, payment method → ledger)
  SELECT id INTO v_revenue_account_id
  FROM accounts
  WHERE organization_id = NEW.organization_id
    AND code = resolve_revenue_account(NEW.service_code);  -- prefix lookup

  SELECT id INTO v_cash_account_id
  FROM accounts
  WHERE organization_id = NEW.organization_id
    AND code = resolve_payment_account(NEW.payment_method);

  -- 4. Create header
  INSERT INTO journal_entries (
    organization_id, branch_id, entry_date, entry_number,
    description, source_type, source_id, status
  ) VALUES (
    NEW.organization_id, NEW.branch_id, NEW.created_at::date,
    '',  -- empty string — DB sequence generates the number
    '<module> posting for ' || NEW.reference_number,
    '<module>', NEW.id, 'posted'
  )
  RETURNING id INTO v_journal_id;

  -- 5. Create debit + credit lines (must balance)
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit)
  VALUES
    (v_journal_id, v_cash_account_id,    NEW.total, 0),
    (v_journal_id, v_revenue_account_id, 0, NEW.total);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_<module>_post_gl
AFTER INSERT OR UPDATE ON <module_table>
FOR EACH ROW
EXECUTE FUNCTION public.post_<module>_to_gl();
```

## Mandatory elements

1. **`SECURITY DEFINER`** + explicit `search_path = public` — required so RLS doesn't block the trigger.
2. **Idempotency guard at the top** — uses `(source_type, source_id)` lookup. Without this, status updates re-post and double-count.
3. **Terminal status gate** — only post when the business event is final (paid, verified, discharged…).
4. **Balanced lines** — sum of debits = sum of credits, always. Add a constraint trigger if paranoid.
5. **`entry_number = ''`** — empty string, not NULL, not a value. The DB-side sequence trigger fills it.

## Reversing a bad posting

Never DELETE from `journal_entries`. Instead:

```sql
-- Reverse the original by inserting a mirror with negated amounts
INSERT INTO journal_entries (..., source_type, source_id, description)
VALUES (..., 'reversal', original_journal_id, 'Reverses entry #' || original_number);
```

## Common mistakes

- Forgetting the guard → double posting on every status change.
- Passing `entry_number = NULL` → constraint violation; or passing a value → breaks the sequence.
- Posting to a Level 1/2/3 account → trial balance won't roll up correctly.
- Skipping `.toLowerCase()` on category when resolving accounts in app code.
- Inserting from app code "just this once" → silent inconsistency at month-end.



# Fix: All Invoices Posting to REV-001 Instead of Correct Revenue Accounts

## Root Cause
The `post_invoice_to_journal` database trigger hardcodes `REV-001` (OPD Revenue) for ALL invoices. IPD discharge invoices, Emergency invoices, and Pharmacy invoices all hit `REV-001` instead of their designated accounts:

- `REV-001` — OPD Revenue (has 131 entries — ALL invoices land here)
- `4010` — IPD Revenue (0 entries)
- `4020` — Emergency Revenue (0 entries)
- `REV-PHARM-001` — Pharmacy Revenue (should have pharmacy POS entries)

This is why "Service Revenue" (4100) rollup shows data (because REV-001 is a descendant), but "IPD Revenue" (4120) and others show empty.

## Fix

### Migration: Update `post_invoice_to_journal` trigger

Modify the trigger to check the invoice source and route to the correct revenue account:

```text
Invoice source logic:
  - If invoice has admission_id → IPD → use account '4010'
  - If invoice has emergency_id → Emergency → use account '4020'  
  - If invoice source = 'pharmacy' → Pharmacy → use 'REV-PHARM-001'
  - Otherwise → OPD → use 'REV-001'
```

The trigger will use `get_or_create_default_account` with the appropriate code based on the invoice's linked source.

### Backfill: Re-route existing journal entries

A second SQL block will update existing `journal_entry_lines` for invoices that have an `admission_id` or `emergency_id`, moving them from `REV-001` to the correct revenue account (`4010`, `4020`). This corrects historical data.

### Update account balances

After backfill, recalculate `current_balance` for all affected revenue accounts (REV-001, 4010, 4020, REV-PHARM-001).

## Result
- Selecting "IPD Revenue" in GL will show all IPD discharge invoice entries
- Selecting "Emergency Revenue" will show emergency invoice entries  
- Selecting "Service Revenue" rolls up all sub-categories correctly
- Same fix applies to all other header accounts across Assets, Liabilities, Expenses

## Files Changed
- `supabase/migrations/new.sql` — update trigger + backfill + rebalance


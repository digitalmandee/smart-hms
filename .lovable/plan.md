

# Fix: GRN Trigger Using Wrong Column Name (`unit_price` → `unit_cost`)

## Problem
The `post_grn_to_journal` trigger calculates GRN total using `unit_price`, but the actual column in `grn_items` is `unit_cost`. This causes:
- New GRNs to silently fail (Postgres returns NULL/error for non-existent column)
- GRN-20260401-0002 somehow posted correctly (likely from an earlier version of the trigger), but any new GRN verification will fail

## Current Data Status

| GRN | Status | Actual Total | Journal Entry | Correct? |
|-----|--------|-------------|---------------|----------|
| GRN-20260401-0002 | posted | 1,000 | JE-GRN-260401-7496 (1,000) | ✅ |
| GRN-20260401-0001 | posted | 0 | None | ✅ (zero value) |
| GRN-20260212-0001 | verified | 57,250 | None | ❌ Missing |
| GRN-20260215-0001 | verified | 25,300 | None | ❌ Missing |
| GRN-20260210-0001 | draft | 91,000 | None | ✅ (draft) |

## Fix (Single Migration)

### 1. Fix column name in trigger
Change `SUM(quantity_received * unit_price)` to `SUM(quantity_received * unit_cost)` in `post_grn_to_journal`.

### 2. Backfill missing journal entries for verified/posted GRNs
For GRN-20260212-0001 (Rs. 57,250) and GRN-20260215-0001 (Rs. 25,300) — create journal entries with DR INV-001, CR AP-001. These are in a different organization (`a1111111...`) so will use that org's accounts.

### 3. No balance recalculation needed
The `update_account_balance` trigger handles it automatically on line insert.

## Files Changed
- `supabase/migrations/new.sql` — fix trigger column name + backfill missing entries


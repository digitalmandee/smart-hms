

# Fix: Department P&L Report — Data Not Showing & Filters Not Working

## Root Causes Found

### Issue 1: Pharmacy POS query silently fails (0 data)
The `pharmacy_pos_items` table has **no foreign key constraints**. The Supabase PostgREST join syntax `medicine:medicines(name, cost_price)` and `pos_transaction:pharmacy_pos_transactions!inner(...)` both fail with 400 errors, but the `try/catch` block swallows the error silently. Result: pharmacy medicine profit tab always empty.

**Fix**: Query `pharmacy_pos_items` directly (no joins), then separately fetch `medicines` cost prices by ID, and filter by transaction IDs from `pharmacy_pos_transactions`.

### Issue 2: Expenses query silently fails (0 data)
The `expenses` table also has **no foreign key constraints**. The join `profiles!expenses_created_by_fkey(full_name)` and `payment_method:payment_methods(name)` both fail. Caught silently.

**Fix**: Query `expenses` without joins. Fetch `profiles` and `payment_methods` in separate queries, then map by ID.

### Issue 3: GRN vendor join may fail
The `goods_received_notes` table join `vendor:vendors(name)` depends on an FK. Need to verify — if no FK, same fix needed.

### Issue 4: Default "This Month" shows no data if transactions are older
The default period filter is `this_month`. If the user hasn't had new transactions this month, the report shows zeros. This isn't a bug but is confusing — we should default to `ytd` (Year to Date) instead.

## Plan

### File: `src/hooks/useDepartmentPnL.ts`

**Fix pharmacy POS query (section 6, ~line 268-314)**:
1. First query `pharmacy_pos_transactions` filtered by org, date, branch — get IDs
2. Then query `pharmacy_pos_items` filtered by `transaction_id IN (...)` — no joins
3. Separately query `medicines` by collected `medicine_id` values to get `cost_price`
4. Map everything together in JS

**Fix expenses query (section 7, ~line 317-350)**:
1. Query `expenses` without any joins — just the base columns
2. Separately query `profiles` for `created_by` IDs to get `full_name`
3. Separately query `payment_methods` for `payment_method_id` values to get `name`
4. Map together in JS

**Fix GRN vendor query (section 8, ~line 352-410)**:
1. Check if FK exists — if not, query `vendors` separately by collected vendor IDs

### File: `src/pages/app/accounts/DepartmentPnLPage.tsx`

**Change default period** (line 93):
- Change `useState("this_month")` to `useState("ytd")` so the report starts with Year-to-Date data, showing all available transactions.

## Files to Change
- `src/hooks/useDepartmentPnL.ts` — rewrite pharmacy POS, expenses, and GRN queries to avoid FK-dependent joins
- `src/pages/app/accounts/DepartmentPnLPage.tsx` — change default period to `ytd`


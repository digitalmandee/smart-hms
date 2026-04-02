

# Fix: Department P&L Shows All Zeros

## Root Cause

Three bugs found:

1. **Case mismatch (main issue)**: The `account_types` table stores categories as lowercase (`revenue`, `expense`), but the hook compares against capitalized strings (`Revenue`, `Expense`). Every journal line is filtered out at line 148, resulting in all zeros.

2. **Wrong pharmacy table name**: The hook queries `pharmacy_pos_sales` but the actual table is `pharmacy_pos_transactions`. This causes a 400 error (visible in network logs).

3. Summary cards already exist in the page — they just show Rs 0 because of bug #1.

## Fix

### File: `src/hooks/useDepartmentPnL.ts`

**Fix 1 — Case-insensitive category comparison** (lines 148, 202, 204):
- Change `acct.category !== "Revenue"` to `acct.category.toLowerCase() !== "revenue"`
- Same for `"Expense"` checks
- Also fix `classifyAccountType` function (line 77) to use lowercase comparison

**Fix 2 — Correct pharmacy table name** (line 243):
- Change `pharmacy_pos_sales` to `pharmacy_pos_transactions`
- Update the field references: check if `sale_date` and `organization_id` columns exist on `pharmacy_pos_transactions`

No other files need changes. The summary cards, charts, department table, and transactions tab will all populate correctly once the category filter stops rejecting every line.


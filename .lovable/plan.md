

# Make Department P&L Revenue Figures Clickable with Transaction Drill-Down

## Problem
Department rows in the P&L table are clickable (cursor changes, `expandedDept` state toggles) but nothing actually expands — the state is unused. Clicking "OPD Revenue 3,232,155" should show the underlying journal transactions that make up that figure.

## Solution
When a department row is clicked, render an expanded detail row below it showing all journal transactions for that department, filtered from the existing `data.transactions` array. This lets users verify exactly where each revenue/expense figure comes from.

## Changes

### File: `src/pages/app/accounts/DepartmentPnLPage.tsx`

**After each department `<TableRow>` (around line 428)**, add a conditional expanded row:

When `expandedDept === dept.department`:
- Render a new `<TableRow>` with a single `<TableCell colSpan={7}>`
- Inside, show a sub-table of all transactions from `data.transactions` filtered by `t.department === dept.department`
- Sub-table columns: Date, Journal #, Description, Account, Type (Revenue/COGS/Expense badge), Debit, Credit, Net Amount
- Include a count badge showing number of transactions
- Add subtle background styling (`bg-muted/30`) to distinguish from parent rows
- Group subtotals at the bottom: total revenue, total COGS, total expenses for that department

This uses the **existing** `data.transactions` array — no new queries needed. The transactions are already fetched and tagged with department names.

### Translation files (`en.ts`, `ur.ts`, `ar.ts`)

Add keys:
- `dept_pnl.drill_down_title`: "Transaction Details" / "تفاصیل لین دین" / "تفاصيل المعاملات"
- `dept_pnl.click_to_expand`: "Click row to see transactions" / equivalent

## Technical Detail
- Filter: `data.transactions.filter(t => t.department === dept.department)`
- The `DepartmentTransaction` interface already has: date, journal_number, description, department, account_name, type, debit, credit, net_amount
- No new hooks or queries needed — purely UI rendering of existing data


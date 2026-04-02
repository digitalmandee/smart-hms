

# P&L Report — CFO Answer + Organization Filter Fix

## Where to See Everything (Already Exists)

The system already has the comprehensive P&L report the CFO needs:

**Path**: Accounts → Financial Reports → **Detailed P&L Report**
(`/app/accounts/reports/detailed-pnl`)

This report shows:
- **Revenue**: All invoice-generated revenue (OPD, IPD, Lab, Pharmacy POS, Dialysis, Donations)
- **Cost of Goods Sold**: Pharmacy COGS from POS sales
- **Expenses**: Administrative expenses, salary expenses, shipping, stock write-offs, petty cash, etc.
- **Gross Profit** and **Net Income**
- **Drill-down**: Click any account to see every individual journal entry (date, reference, debit/credit)
- **Charts**: Revenue vs Expenses bar chart + Expense breakdown pie chart
- **Transactions tab**: Every single journal line in one searchable, sortable table
- **Export**: PDF and Excel

There is also a simpler P&L at `/app/accounts/reports/profit-loss` with period-over-period comparison.

## Important Accounting Clarification for CFO

**GRN does NOT hit P&L directly** — this is correct accounting:
- GRN posts: DR Inventory Asset, CR Accounts Payable (both Balance Sheet accounts)
- The P&L impact happens when goods are **sold** (POS sale triggers COGS: DR COGS Expense, CR Inventory) or **written off**
- This is standard accrual accounting — purchasing inventory is not an expense until consumed

## Bug to Fix

The basic `useProfitLoss` hook (used by `/app/accounts/reports/profit-loss`) is **missing the `organization_id` filter** on both its accounts query and journal lines query. The detailed P&L was fixed in the last migration, but the basic P&L was not.

### Changes

**File: `src/hooks/useFinancialReports.ts`**

1. Add `.eq("organization_id", profile!.organization_id!)` to the accounts query at line 254 (before `.eq("is_active", true)`)
2. Add `.eq("journal_entry.organization_id", profile!.organization_id!)` to the journal_entry_lines query at line 276 (after `.eq("journal_entry.is_posted", true)`)

This is a 2-line fix — no new files, no migration needed.


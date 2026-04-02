

# Department P&L — Detailed Master Report with Transaction Drill-Down & PDF/Excel Export

## Problem
Current Department P&L only shows summary aggregates (totals per department). The CFO needs to see **every individual transaction** — each expense, each sale — mapped to its department, with a proper downloadable PDF report.

## Plan

### 1. Enhance `useDepartmentPnL` hook to return individual transactions

Add a new `transactions` array to the return data containing every journal entry line mapped to a department:

```typescript
interface DepartmentTransaction {
  date: string;
  journal_number: string;
  description: string;
  department: string;
  account_name: string;
  account_number: string;
  type: "Revenue" | "COGS" | "Expense";
  debit: number;
  credit: number;
  net_amount: number;
}
```

In the existing query (step 2), also fetch `journal_entry.journal_number, journal_entry.description, journal_entry.entry_date` and the line's `description`. Build the transactions list alongside the aggregation loop (step 4), pushing each qualifying Revenue/Expense line into the array.

**File**: `src/hooks/useDepartmentPnL.ts`

### 2. Add "Transactions" tab to DepartmentPnLPage

Add a 4th tab showing a searchable, sortable table of all individual transactions:
- Columns: Date, Journal #, Description, Department, Account, Type (Revenue/COGS/Expense), Debit, Credit, Net
- Search filter across description/account/department
- Type filter dropdown (All / Revenue / COGS / Expense)
- Color-coded type badges

**File**: `src/pages/app/accounts/DepartmentPnLPage.tsx`

### 3. Replace basic CSV export with `ReportExportButton`

Replace the manual CSV export button with the existing `ReportExportButton` component that provides CSV + PDF + Print. Configure it with:
- Department summary columns for the main export
- PDF options with organization branding, date range, filters
- Summary totals row

Also add a separate export button on the Transactions tab for exporting the full transaction detail.

**File**: `src/pages/app/accounts/DepartmentPnLPage.tsx`

### 4. Translations

Add new keys for: `dept_pnl.transactions`, `dept_pnl.journal_number`, `dept_pnl.description`, `dept_pnl.type`, `dept_pnl.debit`, `dept_pnl.credit`, `dept_pnl.search_transactions`, `dept_pnl.filter_type`

**Files**: `src/lib/i18n/translations/en.ts`, `ur.ts`, `ar.ts`

## Files to Change
- `src/hooks/useDepartmentPnL.ts` — add transactions array to query results
- `src/pages/app/accounts/DepartmentPnLPage.tsx` — add Transactions tab, replace CSV with ReportExportButton
- `src/lib/i18n/translations/en.ts`, `ur.ts`, `ar.ts` — new labels


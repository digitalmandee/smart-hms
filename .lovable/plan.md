

# Complete Hospital P&L Report — With Procurement & Vendor Payables

## What Changes

Transform the Department P&L page from a revenue/expense-only view into a **complete hospital financial report** with 3 new sections:

1. **Expenses Section** — all recorded expenses (petty cash, refunds, staff advances, misc) from the `expenses` table
2. **Procurement/GRN Section** — all GRNs showing vendor, amount, payment status (paid/credited)
3. **Vendor Credit Payable Section** — outstanding AP balance per vendor (GRN value minus payments made)

## Architecture

### Hook: `src/hooks/useDepartmentPnL.ts`

Add 3 new queries and return types:

**New interfaces:**
- `ExpenseRecord` — id, date, expense_number, category, description, amount, paid_to, payment_method, created_by
- `GRNRecord` — id, grn_number, vendor_name, invoice_amount, received_date, status, total_paid, balance_due
- `VendorPayable` — vendor_name, vendor_code, total_grn_value, total_paid, outstanding_balance, last_payment_date

**New queries inside the existing queryFn:**

1. **Expenses**: Query `expenses` table filtered by org, date range, branch — select amount, category, description, paid_to, expense_number, payment method name, created_by profile name

2. **GRNs**: Query `goods_received_notes` filtered by org, date range, branch — with status = 'verified' — select grn_number, invoice_amount, received_date, vendor name. Then query `vendor_payments` for the same GRNs to calculate paid vs outstanding per GRN.

3. **Vendor Payables**: Aggregate from the GRN + vendor_payments data above — group by vendor, sum GRN invoice amounts, subtract payments, show outstanding balance. Only show vendors with non-zero outstanding.

Return all three arrays alongside existing `departments`, `totals`, `pharmacyMedicines`, `transactions`.

Also update `totals` to include `totalExpensesRecorded` (from expenses table) and `totalProcurement` (from GRNs) and `totalVendorPayable` (outstanding AP).

### Page: `src/pages/app/accounts/DepartmentPnLPage.tsx`

**Summary Cards** — Add 2 more cards:
- Total Procurement (GRN value)  
- Vendor Payable (outstanding AP)

Making it a 6-card grid (2 rows of 3).

**New Tabs** (add to existing tab bar):
- **Expenses** tab — table showing all expenses with columns: Date, Expense #, Category, Description, Paid To, Amount, Payment Method, Created By
- **Procurement (GRN)** tab — table showing all GRNs with: Date, GRN #, Vendor, Invoice Amount, Paid, Outstanding, Status badge (Paid/Credit Payable)
- **Vendor Payables** tab — table showing per-vendor: Vendor Name, Code, Total GRN Value, Total Paid, Outstanding Balance, Last Payment Date

Each tab gets its own export button with appropriate columns.

### Translations: `en.ts`, `ur.ts`, `ar.ts`

Add labels for:
- `dept_pnl.expenses_tab`, `dept_pnl.procurement`, `dept_pnl.vendor_payables`
- `dept_pnl.total_procurement`, `dept_pnl.vendor_payable`
- `dept_pnl.grn_number`, `dept_pnl.vendor_name`, `dept_pnl.invoice_amount`, `dept_pnl.paid_amount`, `dept_pnl.outstanding`, `dept_pnl.payment_status`
- `dept_pnl.expense_number`, `dept_pnl.category`, `dept_pnl.paid_to`, `dept_pnl.payment_method`
- `dept_pnl.vendor_code`, `dept_pnl.total_grn_value`, `dept_pnl.total_paid`, `dept_pnl.last_payment`

## GRN Payment Status Logic

```text
For each GRN:
  total_paid = SUM(vendor_payments.amount WHERE grn_id = grn.id AND status IN ('approved','paid'))
  balance_due = invoice_amount - total_paid
  
  If balance_due <= 0 → "Paid" (green badge)
  If balance_due > 0 AND total_paid > 0 → "Partial" (orange badge)  
  If total_paid = 0 → "Credit Payable" (red badge)
```

## Files to Change
- `src/hooks/useDepartmentPnL.ts` — add expenses, GRN, vendor payable queries + interfaces
- `src/pages/app/accounts/DepartmentPnLPage.tsx` — add 3 new tabs, 2 summary cards
- `src/lib/i18n/translations/en.ts` — English labels
- `src/lib/i18n/translations/ur.ts` — Urdu labels
- `src/lib/i18n/translations/ar.ts` — Arabic labels


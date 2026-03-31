

# Add Export/Download Report Button to POS Transactions Page

## What
Add the existing `ReportExportButton` component to the POS Transactions page so pharmacists can download a PDF/CSV daily sales report based on the currently applied filters (date, status, search) with proper sales summary.

## Implementation

### File: `src/pages/app/pharmacy/POSTransactionsPage.tsx`

1. Import `ReportExportButton` from `@/components/reports/ReportExportButton`
2. Define export columns mapping (Transaction #, Date/Time, Customer, Total, Status, Cashier)
3. Add `ReportExportButton` next to the "Go to POS" button in the header actions, passing:
   - `data`: `filteredTransactions` (respects all active filters)
   - `filename`: `pharmacy-transactions-{date}`
   - `columns`: the export column configs with currency formatting for total
   - `pdfOptions`: title "Pharmacy Daily Sales Report", subtitle with active date/status filters, and a summary row showing total transactions count and total revenue
   - `summaryRow`: with totals (transaction count, total sales amount)

### Column config for export:
- `transaction_number` → "Transaction #"
- `created_at` → "Date/Time" (formatted)
- `customer_name` → "Customer" (default "Walk-in")
- `total_amount` → "Total" (currency formatted)
- `status` → "Status"
- `creator.full_name` → "Cashier"

### Summary row:
- Shows "Total: X transactions" and total revenue from completed sales

No new files needed. Single file change using existing reusable component.

## Files Changed
- `src/pages/app/pharmacy/POSTransactionsPage.tsx` — add ReportExportButton with filter-aware PDF/CSV export




# Pharmacy Reports Hub Redesign -- Card Layout, No Limits, Pagination, and More Reports

## Problem

The current Pharmacy Reports page has three issues:
1. **Flat sidebar list** -- reports are listed as text buttons in a left panel, not as visual cards like the main Reports Hub
2. **Hard data caps** -- Stock Valuation shows only first 50 rows, Profit Margin only first 30 rows; the rest are silently hidden
3. **No pagination** -- large tables just render everything (or are capped), with no way to navigate pages
4. **Only 17 reports** -- user wants 10-15 more to fully represent an independent pharmacy POS

---

## Solution

### 1. Card-Based Hub Layout (like ReportsHubPage)

Replace the current sidebar-list layout with a proper **card grid hub**. Each report category gets a section with report cards showing:
- Icon + color badge
- Report title and short description
- "View Report" button

Clicking a card opens that specific report in a **detail view** (same page, toggled state) with a "Back to Hub" button, date filters, chart, full table with pagination, and export buttons.

### 2. Remove All Data Caps

| Location | Current | Fix |
|---|---|---|
| Stock Valuation table (line 357) | `.slice(0, 50)` | Remove slice, use pagination |
| Profit Margin table (line 477) | `.slice(0, 30)` | Remove slice, use pagination |
| Top Products hook | `limit` parameter caps at 15 | Remove limit for report view |
| Export buttons | Already pass full `data` array | No change needed (already unlimited) |

### 3. Add Client-Side Pagination Component

Create a reusable `PaginatedTable` wrapper that:
- Accepts data array + columns
- Shows 25 rows per page with page controls (Previous / Next / page numbers)
- Shows "Showing X-Y of Z records" label
- All data still available for CSV/PDF export (no server-side pagination needed since datasets are org-scoped and manageable)

### 4. Add 12 New Reports (total: 29 reports)

**Sales Reports (add 4)**
- **Customer Sales Report** -- Top customers by purchase frequency and total spend
- **Receipt-wise Transaction Log** -- Full transaction log with receipt number, items, payment method
- **Refund Rate Analysis** -- Refund percentage over time, reasons breakdown
- **Average Basket Size** -- Trend of average items per transaction and average transaction value

**Inventory Reports (add 4)**
- **Batch-wise Stock Report** -- All batches per medicine with quantities and expiry
- **Category Stock Distribution** -- Stock value breakdown by medicine category (pie + table)
- **Stock Aging Report** -- How long stock has been sitting (by GRN date vs current date)
- **Inventory Turnover Report** -- Turnover ratio per medicine (sales qty / avg stock)

**Financial Reports (add 2)**
- **Daily Cash Summary** -- Opening balance + cash in - cash out = closing, per day
- **Tax Collection Report** -- Tax collected per transaction, daily/monthly aggregation

**Operational Reports (add 2)**
- **Cashier Performance** -- Sales per cashier/user, transaction count, average sale value
- **Peak Hours Report** -- Heatmap grid (day of week x hour) showing transaction density

---

## Technical Details

### Files Changed

| File | Change |
|---|---|
| `src/pages/app/pharmacy/PharmacyReportsPage.tsx` | Complete redesign: card-grid hub with drill-down detail view; remove all `.slice()` caps; add pagination to every table |
| `src/hooks/usePharmacyReports.ts` | Add 12 new hooks: `useCustomerSalesReport`, `useTransactionLog`, `useRefundRateAnalysis`, `useBasketSizeAnalysis`, `useBatchStockReport`, `useCategoryStockDistribution`, `useStockAgingReport`, `useInventoryTurnover`, `useDailyCashSummary`, `useTaxCollectionReport`, `useCashierPerformance`, `usePeakHoursReport` |
| `src/components/reports/PaginatedTable.tsx` | New reusable component: paginated table with configurable page size, page controls, and record count display |

### Report Categories (Final: 29 reports)

**Sales Reports (11)**
1. Daily Sales Summary
2. Hourly Sales Analysis
3. Sales by Category
4. Payment Methods
5. Discount Analysis
6. Monthly Comparison
7. Top Selling Products
8. Customer Sales Report (new)
9. Transaction Log (new)
10. Refund Rate Analysis (new)
11. Average Basket Size (new)

**Inventory Reports (9)**
12. Stock Valuation
13. Expiry Report
14. Low Stock / Reorder
15. Dead Stock
16. Stock Movements
17. Batch-wise Stock (new)
18. Category Stock Distribution (new)
19. Stock Aging (new)
20. Inventory Turnover (new)

**Financial Reports (5)**
21. Profit Margin
22. Returns and Refunds
23. Credit Sales
24. Daily Cash Summary (new)
25. Tax Collection (new)

**Procurement Reports (2)**
26. Supplier Purchases
27. PO Status Pipeline

**Operational Reports (2)**
28. Cashier Performance (new)
29. Peak Hours Heatmap (new)

### Hub Layout Structure

The page will have two states:

**Hub View** (default):
- Page header with summary stat cards (Total Sales, Avg Transaction, Discounts, Reports count)
- Date range filter at top
- Category sections, each with a grid of report cards (3 columns on desktop, 2 on tablet, 1 on mobile)
- Each card shows: colored icon, title, 1-line description, "View Report" arrow

**Detail View** (after clicking a card):
- "Back to Reports Hub" breadcrumb/button at top
- Report title + date range filter
- Chart visualization (existing charts preserved)
- Full paginated table (25 rows/page, no caps)
- Export button (CSV/PDF) -- exports ALL data regardless of current page

### Pagination Component API

```text
PaginatedTable
  props:
    data: T[]
    columns: { key, header, render?, align? }[]
    pageSize?: number (default 25)
    showCount?: boolean (default true)
```

Renders a standard Table with:
- Page navigation (Previous / 1 2 3 ... N / Next)
- "Showing 1-25 of 142 records" footer
- No data caps -- all rows accessible via pagination

### Query Hooks (no Supabase row limit issues)

All pharmacy data is organization-scoped via RLS. Even a busy pharmacy would have at most a few thousand transactions per month, well within Supabase's default 1000-row limit per query. For hooks that might exceed this (like Transaction Log over a long date range), the query will use `.range()` or fetch in batches to ensure completeness.


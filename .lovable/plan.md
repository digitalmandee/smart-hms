

# Enhanced Warehouse Reports Dashboard with Executive Overview

## Overview

Transform the current basic reports listing page into a rich, data-driven reports hub with:
1. An **Executive/Warehouse Dashboard** report (similar to hospital's Executive Dashboard)
2. Enhanced stats cards with real KPIs below the header
3. Date filters, pagination, and export capabilities across all reports
4. Additional warehouse-specific reports (Vendor Performance, Dead Stock, Fast Moving Items)

---

## Changes

### 1. New File: `src/pages/app/inventory/reports/WarehouseExecutiveDashboard.tsx`

A comprehensive executive-style dashboard for warehouse organizations, mirroring the hospital's `ExecutiveDashboardReport.tsx` pattern:

- **Period selector** (This Month / Last Month / Last 3 Months)
- **Top KPI row** (6 cards):
  - Total Stock Value (clickable -> valuation report)
  - Total Purchase Orders / Spend
  - GRN Count (goods received this period)
  - Pending Requisitions
  - Low Stock Alerts (highlighted if > 0)
  - Active Vendors
- **Procurement vs Consumption chart** (bar chart, monthly trend)
- **Top Vendors by Spend** (horizontal bar chart)
- **Category-wise Stock Distribution** (pie chart)
- **Department Performance grid** (clickable cards for Stock, Procurement, Transfers, Vendors, Shipments)
- **Alerts section** (low stock, expiring items, overdue POs)
- **Export button** using `ReportExportButton` for CSV/PDF

Data sourced from existing tables: `inventory_stock`, `purchase_orders`, `goods_received_notes`, `stock_requisitions`, `vendors`, `inventory_items`, `pick_lists`, `shipments`.

### 2. New File: `src/hooks/useWarehouseExecutiveSummary.ts`

Custom hook that aggregates all the executive dashboard data in parallel queries:
- Stock value from `inventory_stock` joined with `inventory_items`
- PO stats from `purchase_orders` filtered by date range
- GRN stats from `goods_received_notes` filtered by date range
- Requisition stats from `stock_requisitions`
- Vendor count from `vendors`
- Low stock count from `inventory_items` with stock comparison
- Expiring items from `inventory_stock` where `expiry_date` is within 90 days
- Category distribution from `inventory_items` grouped by category

### 3. New File: `src/pages/app/inventory/reports/VendorPerformanceReport.tsx`

- Stats: Total vendors, avg lead time, on-time delivery %, total spend
- Table: Vendor name, POs count, total spend, avg delivery days, quality rating
- Filters: date range, vendor search
- Export CSV
- Data from `purchase_orders` + `goods_received_notes` joined with `vendors`

### 4. New File: `src/pages/app/inventory/reports/DeadStockReport.tsx`

- Items with zero movement in last 90 days (configurable)
- Stats: Dead stock count, dead stock value, % of total inventory
- Table with item code, name, last movement date, quantity, value
- Export CSV
- Data: `inventory_stock` items not appearing in recent `grn_items` or `stock_requisition_items`

### 5. New File: `src/pages/app/inventory/reports/FastMovingReport.tsx`

- Top items by consumption/movement frequency
- Stats: fastest movers count, total movement value
- Table: item, total issued, total received, turnover rate
- Bar chart of top 10 items by movement
- Export CSV

### 6. Update: `src/pages/app/inventory/InventoryReportsPage.tsx`

Major enhancements:
- **Add Executive Dashboard card** at the top (highlighted, facility-type aware: "Warehouse Executive Dashboard" or "Inventory Executive Dashboard")
- **Enhanced stats section**: Add more KPIs (Pending POs value, GRN count this month, Active vendors, Transfer count)
- **Add 3 new report cards**: Vendor Performance, Dead Stock, Fast Moving Items
- **Search/filter** for report cards (text filter to find reports quickly)
- The page title becomes facility-aware ("Warehouse Reports" vs "Inventory Reports")

### 7. Update: Individual Report Pages (enhance existing)

Add to each existing report (`StockValuationReport`, `ExpiryReport`, `ConsumptionReport`, `ProcurementReport`, `StockMovementReport`, `ABCAnalysisReport`):
- **Pagination** using the existing `ReportTable` component pattern (already has built-in pagination)
- **ReportExportButton** for CSV + PDF export where missing
- **Search/filter input** where missing

### 8. Route Registration

Add routes for new pages:
- `/app/inventory/reports/executive` -> `WarehouseExecutiveDashboard`
- `/app/inventory/reports/vendor-performance` -> `VendorPerformanceReport`
- `/app/inventory/reports/dead-stock` -> `DeadStockReport`
- `/app/inventory/reports/fast-moving` -> `FastMovingReport`

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useWarehouseExecutiveSummary.ts` | Aggregated data hook for executive dashboard |
| `src/pages/app/inventory/reports/WarehouseExecutiveDashboard.tsx` | Executive overview page |
| `src/pages/app/inventory/reports/VendorPerformanceReport.tsx` | Vendor performance analytics |
| `src/pages/app/inventory/reports/DeadStockReport.tsx` | Dead/slow stock identification |
| `src/pages/app/inventory/reports/FastMovingReport.tsx` | Fast-moving items analysis |

### Files to Update
| File | Changes |
|------|---------|
| `src/pages/app/inventory/InventoryReportsPage.tsx` | Add executive dashboard card, new report cards, enhanced stats, search filter, facility-aware title |
| `src/pages/app/inventory/reports/StockValuationReport.tsx` | Add pagination, search filter |
| `src/pages/app/inventory/reports/ProcurementReport.tsx` | Add ReportExportButton, pagination |
| `src/pages/app/inventory/reports/ConsumptionReport.tsx` | Add ReportExportButton, pagination |
| `src/pages/app/inventory/reports/StockMovementReport.tsx` | Add ReportExportButton |
| Route config file | Add 4 new routes |

### Data Sources (all existing tables)
- `inventory_stock` - current stock levels
- `inventory_items` - item catalog with org scoping
- `purchase_orders` + `purchase_order_items` - procurement data
- `goods_received_notes` + `grn_items` - receiving data
- `stock_requisitions` + `stock_requisition_items` - consumption data
- `vendors` - vendor information
- `stores` - warehouse/store data
- `pick_lists`, `shipments` - outbound data
- `inventory_categories` - category groupings

### Trilingual Support
All new pages will use the existing `useTranslation` hook where translation keys exist, and static English labels for new warehouse-specific terms (consistent with current report pages).


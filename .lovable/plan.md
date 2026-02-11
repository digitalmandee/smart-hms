

# Independent Pharmacy Enhancement -- Full Flow Testing, Sidebar Cleanup, and 15+ New Reports

## Overview

The independent pharmacy (MediCare Pharmacy) needs to operate as a standalone retail POS -- no OT modules, no HMIS-linked prescriptions, and a significantly richer reporting suite. This plan covers three main areas:

1. **Sidebar cleanup** -- Remove HMIS-specific menu items for independent pharmacies
2. **Add Purchase Orders and GRN links** to the pharmacist sidebar so procurement is accessible
3. **Expand Pharmacy Reports** from 3 tabs to 15+ report types with real DB-backed data
4. **Seed sample data** for MediCare Pharmacy so reports render with meaningful content

---

## Part 1: Sidebar Cleanup for Independent Pharmacy

The pharmacist sidebar currently includes HMIS-specific items that don't apply to standalone pharmacies:

| Remove/Hide | Reason |
|---|---|
| Prescriptions (queue) | Linked to doctor appointments -- not relevant for walk-in POS |
| OT Requests (ot-queue) | Operating Theater module -- hospital only |

**Approach**: Check `organization.facility_type` or module availability. If the org does NOT have `appointments` or `ot_management` modules enabled, hide these items. Use the existing `useOrganizationModules` hook that is already available in the codebase.

**Add to sidebar**:
- Purchase Orders (`/app/inventory/purchase-orders`)
- GRN (`/app/inventory/grn`)
- Returns (`/app/pharmacy/returns`)
- Sessions (`/app/pharmacy/pos/sessions`)

---

## Part 2: Expanded Pharmacy Reports (15+ Reports)

Currently the reports page only has **3 tabs**: Sales Trend (7-day bar chart), Payment Methods (pie chart), Top Products (table). This is insufficient for a real pharmacy.

### New Report Tabs/Sections to Add:

**Sales Reports (5)**
1. **Daily Sales Summary** -- Day-by-day breakdown with totals, discounts, net revenue
2. **Hourly Sales Analysis** -- Peak hours heatmap showing when most sales happen
3. **Sales by Category** -- Revenue breakdown by medicine category (Tablets, Syrups, Injections, etc.)
4. **Discount Analysis** -- Total discounts given, discount percentage trends
5. **Monthly Comparison** -- Month-over-month sales comparison bar chart

**Inventory Reports (5)**
6. **Stock Valuation Report** -- Total inventory value at cost and selling price, profit margin
7. **Expiry Report** -- Items expiring within 30/60/90 days with value at risk
8. **Low Stock / Reorder Report** -- Items below reorder level with suggested reorder quantities
9. **Dead Stock Report** -- Items with zero movement in the last 30/60/90 days
10. **Stock Movement Summary** -- Aggregated ins/outs by movement type for the period

**Financial Reports (3)**
11. **Profit Margin Report** -- Per-item and aggregate margin analysis (selling price vs cost)
12. **Returns & Refunds Summary** -- Return count, refund amounts, top returned items
13. **Credit Sales Report** -- Outstanding patient credits and aging

**Supplier/Procurement Reports (2)**
14. **Supplier Purchase Summary** -- Total purchases by supplier with outstanding payables
15. **Purchase Order Status Report** -- PO pipeline: draft, pending, ordered, received counts

### Technical Approach

- **File**: Expand `PharmacyReportsPage.tsx` from a simple 3-tab layout to a sidebar-based report selector (left panel: report list grouped by category; right panel: selected report content)
- **Hook**: Add new query hooks in `usePharmacyReports.ts` for each report type:
  - `useHourlySalesAnalysis` -- aggregates `pharmacy_pos_transactions.created_at` by hour
  - `useSalesByCategory` -- joins `pharmacy_pos_transaction_items` with `medicines` and `medicine_categories`
  - `useDiscountAnalysis` -- aggregates `discount_amount` from transactions
  - `useMonthlyComparison` -- groups sales by month
  - `useStockValuation` -- aggregates `medicine_inventory` (quantity * unit_price vs selling_price)
  - `useExpiryReport` -- filters `medicine_inventory` by expiry_date buckets
  - `useLowStockReport` -- filters where `quantity < reorder_level`
  - `useDeadStockReport` -- left joins inventory with stock movements to find zero-movement items
  - `useProfitMarginReport` -- computes per-item margins from transaction items
  - `useReturnsSummary` -- aggregates from voided/refunded transactions
  - `useCreditSalesReport` -- filters transactions with `payment_type = credit`
  - `useSupplierPurchaseSummary` -- aggregates from `purchase_orders` + `vendors`
  - `usePOStatusReport` -- groups POs by status
- **Export**: Every report will include the existing `ReportExportButton` for PDF/CSV export
- All queries are organization-scoped via RLS -- hospital pharmacy data remains completely isolated

---

## Part 3: Seed Sample Data for MediCare Pharmacy

To make reports show meaningful data, insert sample records into the MediCare Pharmacy org (`c0d9b317-110d-4f2d-a13b-e79dbc056787`):

1. **Medicine Categories** (5): Tablets, Syrups, Injections, Topical, Supplements
2. **Medicines** (20-25): Common OTC and prescription drugs
3. **Medicine Inventory** (30+ batches): With varied quantities, expiry dates (some expiring soon), cost and selling prices
4. **POS Transactions** (40-50): Spread across the last 30 days with different payment methods, discounts, and customer names
5. **Transaction Items** (100+): Linked to the transactions above
6. **POS Payments** (40-50): Cash, card, JazzCash mix
7. **Stock Movements** (50+): GRN receipts, sales, adjustments

This data seeding will be done via a database migration with INSERT statements, all scoped to the MediCare Pharmacy organization ID.

---

## Part 4: Files Changed

| File | Change |
|---|---|
| `src/config/role-sidebars.ts` | Add Purchase Orders, GRN, Returns, Sessions to pharmacist sidebar; conditionally hide OT/Prescriptions |
| `src/hooks/usePharmacyReports.ts` | Add 12+ new report query hooks |
| `src/pages/app/pharmacy/PharmacyReportsPage.tsx` | Complete redesign: report category selector + 15 report panels with charts/tables |
| `supabase/migrations/...` | Seed data migration for MediCare Pharmacy |

---

## Isolation Guarantee

- All new report hooks query tables that have RLS policies scoped to `organization_id`
- The seed data migration explicitly sets `organization_id` and `branch_id` to MediCare's IDs
- Hospital pharmacy (Shifa Medical Center) data is completely untouched


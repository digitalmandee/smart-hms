

# Warehouse Module Comprehensive Audit and Fix Plan

## Issues Found

### CRITICAL: Report Pages Querying Non-Existent Table `store_stock`

Three report pages query a table called `store_stock` that does not exist in the database. The correct table is `inventory_stock`.

**Affected Files:**
1. `src/pages/app/inventory/reports/StockValuationReport.tsx` - queries `store_stock` (line 19)
2. `src/pages/app/inventory/reports/ExpiryReport.tsx` - queries `store_stock` (line 24)
3. `src/pages/app/inventory/reports/ABCAnalysisReport.tsx` - queries `store_stock` (line 19)

**Fix:** Replace all `store_stock` references with `inventory_stock`. Also remove `.eq("organization_id", ...)` since `inventory_stock` does not have an `organization_id` column - instead join through `inventory_items` which does have it, or filter by item IDs that belong to the org.

---

### CRITICAL: Stock Valuation Report - Wrong Schema Assumptions

The `StockValuationReport` and `ABCAnalysisReport` reference `total_value` column which does not exist on `inventory_stock`. The correct calculation is `quantity * unit_cost`.

**Fix:** Remove `total_value` references and compute value inline as `quantity * unit_cost`.

---

### CRITICAL: Expiry Report - Wrong Schema

`ExpiryReport` queries `store_stock` with `organization_id` filter and assumes `store` join. The `inventory_stock` table links to stores via `store_id` and has no `organization_id`.

**Fix:** Query `inventory_stock` and filter items belonging to the user's organization via `inventory_items.organization_id`.

---

### CRITICAL: Consumption Report - Wrong Column Name

`ConsumptionReport.tsx` (line 21) selects `department` from `stock_requisitions`, but the actual column is `department_id` (FK to departments table). The report shows "Unassigned" for everything.

**Fix:** Change the query to join `department:departments(name)` via `department_id` and display `r.department?.name` instead of `r.department`.

---

### MODERATE: Stock Valuation Report - No CSV Export Headers Escaped

The CSV export in `StockValuationReport.tsx` uses basic comma-joining without quoting fields. If item names contain commas, the CSV will break.

**Fix:** Use the existing `exportToCSV` utility from `src/lib/exportUtils.ts` which properly escapes values.

---

### MODERATE: Dashboard title says "Inventory & Procurement" 

For warehouse facility types, the dashboard title (line 37 of `InventoryDashboard.tsx`) still says "Inventory & Procurement" instead of "Warehouse Dashboard" or "Warehouse & Procurement".

**Fix:** Make the title facility-type aware.

---

### LOW: Console Error - WarehouseSection forwardRef

The landing page has a console error about `WarehouseSection` receiving refs but not using `forwardRef`. This doesn't affect functionality but is a warning in the console.

**Fix:** Wrap the `AnimatedSection` usage inside `WarehouseSection` with `forwardRef` or remove the ref passing.

---

## Implementation Plan

### Step 1: Fix StockValuationReport.tsx
- Replace `store_stock` with `inventory_stock`
- Remove `organization_id` filter
- Join through `inventory_items` to filter by org: query `inventory_stock` with `item:inventory_items!inner(name, item_code, category_id, organization_id)` and filter `.eq("item.organization_id", orgId)`
- Remove `total_value` references, compute as `quantity * unit_cost`
- Use `exportToCSV` from `@/lib/exportUtils` for proper CSV export

### Step 2: Fix ExpiryReport.tsx
- Replace `store_stock` with `inventory_stock`
- Join `item:inventory_items!inner(name, item_code, organization_id)` and `store:stores(name)` 
- Filter by `item.organization_id` instead of direct `organization_id`

### Step 3: Fix ABCAnalysisReport.tsx
- Replace `store_stock` with `inventory_stock`
- Join through `inventory_items` for org filtering
- Remove `total_value` references, compute inline

### Step 4: Fix ConsumptionReport.tsx
- Change query from `requisition_number, status, department, created_at` to `requisition_number, status, department:departments(name), created_at`
- Update display from `r.department || "Unassigned"` to `r.department?.name || "Unassigned"`

### Step 5: Fix InventoryDashboard.tsx Title
- Import `useOrganization` 
- If `facility_type === 'warehouse'`, show "Warehouse Dashboard" and "Manage stock, vendors, and procurement" instead of "Inventory & Procurement"

### Step 6: Update Test Cases
Update `docs/WAREHOUSE_TEST_CASES.md` TC-13 (Reports) to include verification that:
- Stock Valuation shows actual values from `inventory_stock` with CSV export working
- Expiry Report shows items with near-expiry dates filtered by store
- ABC Analysis shows Pareto classification with cumulative % chart
- Consumption Report shows department names (not IDs)
- All report CSV/export downloads work correctly
- Add a note that Vendor Performance, Dead Stock, and Fast Moving reports are referenced in test cases but don't have dedicated pages yet (they can be added as future enhancements)

---

## Technical Summary

| File | Issue | Fix |
|------|-------|-----|
| `StockValuationReport.tsx` | Queries non-existent `store_stock` table | Use `inventory_stock` with item join for org filter |
| `ExpiryReport.tsx` | Queries non-existent `store_stock` table | Use `inventory_stock` with item join for org filter |
| `ABCAnalysisReport.tsx` | Queries non-existent `store_stock` table, uses non-existent `total_value` column | Use `inventory_stock`, compute value inline |
| `ConsumptionReport.tsx` | Selects `department` (wrong column, should be `department_id` with join) | Join `departments` table, display name |
| `InventoryDashboard.tsx` | Title not facility-aware | Use org facility_type for dynamic title |
| `WAREHOUSE_TEST_CASES.md` | TC-13 references reports that have broken queries | Update to match fixed report behavior |

## What Already Works Correctly

After auditing all hooks and pages, the following are confirmed functional:

- **Purchase Requests:** Full CRUD, approval flow, convert-to-PO with `from_pr` param
- **Purchase Orders:** CRUD, approval, submit, mark-as-ordered, cancel - all connected to DB
- **GRN:** Create from PO, verify (updates `inventory_stock` and `purchase_order_items.received_quantity`), post, item-vendor mapping updates
- **Stock Adjustments:** Form fetches real current stock per item+store, updates `inventory_stock` directly
- **Reorder Alerts:** Queries real data, creates PR with pre-filled items
- **Store Transfers:** Full flow with FIFO deduction on dispatch, stock insertion on receive
- **Vendor Payments:** Connected to accounts, creates journal entries on approval
- **Pick Lists, Packing Slips, Shipments:** All connected to DB with proper hooks
- **All Printable components:** Use `forwardRef` and `usePrint` correctly
- **Dashboard stats:** Query real data from `inventory_stock` and related tables
- **Categories, Items, Stores, Vendors CRUD:** All working with proper org scoping


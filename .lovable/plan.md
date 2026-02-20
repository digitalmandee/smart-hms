

# Warehouse Module Enhancement Plan

## Audit Results -- Current State

### Module-by-Module Status

| # | Module | Current State | Verdict |
|---|--------|--------------|---------|
| 1 | Medical Inventory Management | Items, categories, stock levels, vendors, POs -- all functional with CRUD | COMPLETE |
| 2 | Receiving & Put-Away | GRN create/detail, Put-Away worklist + task completion with bin selection | COMPLETE |
| 3 | Storage & Space Optimization | Zones, bins, bin assignments, storage map -- all functional | COMPLETE |
| 4 | Order Management & Fulfillment | Requisitions, POs, transfers -- all with create/detail/list | COMPLETE |
| 5 | Picking & Packing | BASIC -- read-only lists, no create pick list, no create packing slip, no auto-generation from orders, no barcode scanning, no wave/batch picking | NEEDS MAJOR WORK |
| 6 | Shipping & Dispatch | Shipments CRUD, tracking events, dispatch dashboard -- functional | COMPLETE |
| 7 | Labor & Workforce (HR) | Linked via sidebar -- employees, attendance, leaves, payroll all use org_id isolation | COMPLETE |
| 8 | Reporting & Analytics | Reports page is just a LINK GRID -- the 6 sub-report pages (valuation, movement, procurement, expiry, consumption) have NO actual pages/routes | NEEDS MAJOR WORK |
| 9 | Integration & API | Static placeholder cards only -- "Coming Soon" badges, no real functionality | PLACEHOLDER ONLY |

---

## What Needs Enhancement

### A. Picking & Packing Module (Major Enhancement)

Currently the module only has:
- List pages that display existing records (no way to CREATE them)
- Basic detail pages that can mark items as picked or verify packing slips
- No link between orders/requisitions and pick list generation

**Enhancements planned:**

1. **Create Pick List** -- Form to generate a pick list from a requisition, transfer, or manual entry. Select warehouse, pick strategy (FIFO/FEFO/zone-based), assign to a picker, add items with bin locations and quantities.

2. **Create Packing Slip** -- Form to generate a packing slip from a completed pick list or manually. Assign items to boxes, enter weights, link to pick list.

3. **Auto-Generate Pick List from Requisition** -- A "Generate Pick List" button on requisition detail page that creates a pick list pre-populated with the requisition items and their bin locations.

4. **Enhanced Pick List Detail** -- Show item names (not just IDs), partial pick support (enter actual quantity instead of auto-filling required), scan/confirm workflow, skip item functionality, notes per item.

5. **Enhanced Packing Slip Detail** -- Add/remove items, assign to boxes, print packing slip, add weight per box.

6. **Picking Dashboard Enhancement** -- Add pick rate (items/hour), picker performance table, recent activity timeline.

### B. Reports & Analytics (Major Enhancement)

Currently the reports page just shows link cards to routes that don't exist. Need to create 6 actual report pages plus 2 new warehouse-specific ones:

1. **Stock Valuation Report** -- Table showing item, quantity, unit cost, total value by FIFO. Grouped by category with totals. Export to CSV.

2. **Stock Movement Report** -- Date range filter. Show all stock ins (GRN) and outs (requisitions, transfers, POS) with running balance chart using Recharts.

3. **Procurement Report** -- Vendor-wise and category-wise purchase analysis with bar charts. Top vendors, PO fulfillment rate, lead time analysis.

4. **Expiry Report** -- Items expiring within 30/60/90 days. Color-coded urgency. Grouped by category.

5. **Consumption Report** -- Department-wise usage. Trend charts over time. Top consumed items.

6. **Warehouse Operations Report** (NEW) -- Put-away completion rate, average put-away time, bin utilization percentage, zone capacity heatmap.

7. **Picking & Shipping Report** (NEW) -- Pick list completion rate, average pick time, shipments by carrier, on-time delivery rate.

8. **ABC Analysis Report** (NEW) -- Classify items into A/B/C categories by value contribution (Pareto analysis with chart).

### C. Integration Page (Minor Enhancement)

Make the "CSV Import/Export" and "Webhook" cards actually functional with basic dialogs, and add an "EDI/HL7" placeholder for healthcare supply chain.

---

## Implementation Plan

### Step 1: Create Pick List Form Page
- New file: `src/pages/app/inventory/PickListFormPage.tsx`
- Select warehouse, pick strategy, priority, assignee
- Add items with item selector, quantity, bin location
- Hook: `useCreatePickList` mutation in `usePickingPacking.ts`
- Route: `/app/inventory/picking/new`

### Step 2: Create Packing Slip Form Page
- New file: `src/pages/app/inventory/PackingSlipFormPage.tsx`
- Link to pick list (optional), add items to boxes
- Hook: `useCreatePackingSlip` mutation in `usePickingPacking.ts`
- Route: `/app/inventory/packing/new`

### Step 3: Enhance Pick List Detail Page
- Show item name via joined query
- Partial pick input (editable quantity)
- Skip item button
- Start picking / complete picking workflow buttons

### Step 4: Enhance Packing Slip Detail Page
- Add items to boxes
- Weight per box input
- Print packing slip button

### Step 5: Enhance Picking Dashboard
- Picker performance stats
- Recent activity timeline
- Pick rate metrics

### Step 6: Create Report Sub-Pages (8 pages)
- `src/pages/app/inventory/reports/StockValuationReport.tsx`
- `src/pages/app/inventory/reports/StockMovementReport.tsx`
- `src/pages/app/inventory/reports/ProcurementReport.tsx`
- `src/pages/app/inventory/reports/ExpiryReport.tsx`
- `src/pages/app/inventory/reports/ConsumptionReport.tsx`
- `src/pages/app/inventory/reports/WarehouseOperationsReport.tsx`
- `src/pages/app/inventory/reports/PickingShippingReport.tsx`
- `src/pages/app/inventory/reports/ABCAnalysisReport.tsx`

### Step 7: Register All New Routes in App.tsx

### Step 8: Update Reports Page
- Add warehouse-specific report cards
- Add the 3 new reports to the grid

### Step 9: Update Sidebar
- Add "New Pick List" and "New Packing Slip" quick links

---

## Technical Details

### New Hooks (in usePickingPacking.ts)
```text
useCreatePickList()     -- insert into pick_lists + pick_list_items
useCreatePickListItem() -- insert individual items
useCreatePackingSlip()  -- insert into packing_slips + packing_slip_items
useCreatePackingSlipItem()
```

### Report Data Sources
All reports query existing tables with aggregation:
- **Valuation**: `store_stock` joined with `inventory_items` for unit costs
- **Movement**: `grn_items` (in) + `stock_requisitions` (out) + `store_stock_transfers` (transfers)
- **Procurement**: `purchase_orders` + `vendors` aggregation
- **Expiry**: `store_stock` where `expiry_date` within range
- **Consumption**: `stock_requisitions` grouped by department over time
- **Warehouse Ops**: `putaway_tasks` completion rates, `warehouse_bins` utilization
- **Picking/Shipping**: `pick_lists` + `shipments` aggregation
- **ABC Analysis**: `store_stock` value ranking with Pareto calculation

### Files Changed/Created

| File | Action |
|------|--------|
| `src/pages/app/inventory/PickListFormPage.tsx` | NEW |
| `src/pages/app/inventory/PackingSlipFormPage.tsx` | NEW |
| `src/pages/app/inventory/PickListDetailPage.tsx` | ENHANCED |
| `src/pages/app/inventory/PackingSlipDetailPage.tsx` | ENHANCED |
| `src/pages/app/inventory/PickingDashboardPage.tsx` | ENHANCED |
| `src/pages/app/inventory/PickListsPage.tsx` | Add "New" button |
| `src/pages/app/inventory/PackingSlipsPage.tsx` | Add "New" button |
| `src/pages/app/inventory/reports/StockValuationReport.tsx` | NEW |
| `src/pages/app/inventory/reports/StockMovementReport.tsx` | NEW |
| `src/pages/app/inventory/reports/ProcurementReport.tsx` | NEW |
| `src/pages/app/inventory/reports/ExpiryReport.tsx` | NEW |
| `src/pages/app/inventory/reports/ConsumptionReport.tsx` | NEW |
| `src/pages/app/inventory/reports/WarehouseOperationsReport.tsx` | NEW |
| `src/pages/app/inventory/reports/PickingShippingReport.tsx` | NEW |
| `src/pages/app/inventory/reports/ABCAnalysisReport.tsx` | NEW |
| `src/pages/app/inventory/InventoryReportsPage.tsx` | Add new report cards |
| `src/hooks/usePickingPacking.ts` | Add create mutations |
| `src/App.tsx` | Add ~12 new routes |
| `src/config/role-sidebars.ts` | Add quick-create links |

No database schema changes needed -- all tables already exist with the right columns.


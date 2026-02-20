
# Fix Warehouse Connectivity Gaps and Add Barcode/Label System

## Issues Found After Audit

### Critical Gap 1: Pick List Form -- No Item Selection
The Pick List form (`PickListFormPage.tsx`) has NO item selector. Users can only enter quantity, batch number, and sequence -- but cannot select WHICH inventory item to pick. The `pick_list_items` table has `item_id` and `medicine_id` columns, but the form does not use them.

### Critical Gap 2: Packing Slip Form -- No Item Selection
The Packing Slip form (`PackingSlipFormPage.tsx`) has NO item selector either. Same problem -- users enter box number and quantity but cannot select which item goes in the box. The `packing_slip_items` table has `item_id` and `medicine_id` columns that are never populated.

### Critical Gap 3: Stock Adjustment Form -- No Store/Warehouse Selection
The Stock Adjustment form (`StockAdjustmentFormPage.tsx`) selects branch but NOT the specific warehouse/store. Without store context, the adjustment cannot target the correct stock record in `inventory_stock` (which is store-specific).

### Critical Gap 4: Stock Adjustment -- Does NOT Actually Update Stock
The adjustment form inserts a record into `stock_adjustments` but sets `previous_quantity: 0` and `new_quantity: 0` hardcoded. It never reads or updates the actual `inventory_stock` table. The adjustment is just a log entry with no effect.

### Critical Gap 5: Reorder Alerts -- Cannot Pre-fill PR
The "Create Purchase Request" button on the Reorder Alerts page just navigates to the blank PR form. It does not pass the low-stock items to pre-fill the PR.

### Critical Gap 6: No Barcode Field on Inventory Items
The `inventory_items` table has no `barcode` or `sku` column. The Item Form has no barcode input field. Without this, barcode scanning in warehouse operations is impossible.

### Critical Gap 7: No Barcode Label Printing
There is no barcode/label generation or printing feature anywhere in the warehouse module. No way to print product labels with barcode, item code, name, batch, and expiry.

---

## Implementation Plan

### Step 1: Add Barcode Column to Inventory Items (Schema)

Add `barcode` (text, nullable) and `sku` (text, nullable) columns to `inventory_items` table.

**Files changed:**
- SQL migration -- ALTER TABLE inventory_items ADD COLUMN barcode, sku

### Step 2: Update Item Form with Barcode/SKU Fields

Add barcode and SKU input fields to the item creation/edit form.

**Files changed:**
- `src/pages/app/inventory/ItemFormPage.tsx` -- Add barcode and SKU fields to the form schema and UI

### Step 3: Fix Pick List Form -- Add Item Selector

Add an inventory item dropdown to each pick list row so users can select WHICH item to pick.

**Files changed:**
- `src/pages/app/inventory/PickListFormPage.tsx` -- Add item_id Select field per row, fetch inventory items, pass item_id in submission

### Step 4: Fix Packing Slip Form -- Add Item Selector

Add an inventory item dropdown to each packing slip row.

**Files changed:**
- `src/pages/app/inventory/PackingSlipFormPage.tsx` -- Add item_id Select field per row, fetch inventory items, pass item_id in submission

### Step 5: Fix Stock Adjustment Form -- Add Store Selector and Actual Stock Update

- Add warehouse/store selector to the form
- On submit, fetch current stock from `inventory_stock` for the selected item + store
- Update `previous_quantity` and `new_quantity` with real values
- Actually UPDATE the `inventory_stock` record

**Files changed:**
- `src/pages/app/inventory/StockAdjustmentFormPage.tsx` -- Add StoreSelector, fetch current stock, update inventory_stock on adjustment

### Step 6: Reorder Alerts -- Pre-fill PR with Low-Stock Items

Pass low-stock item IDs via query params or state when navigating to the PR form, then auto-add those items.

**Files changed:**
- `src/pages/app/inventory/ReorderAlertsPage.tsx` -- Pass selected items to PR form via navigation state
- `src/pages/app/inventory/PRFormPage.tsx` -- Read navigation state and auto-populate items

### Step 7: Barcode Label Generator and Printer

Create a new component and page for generating printable barcode labels for inventory items. Labels will include: barcode (Code128), item code, item name, batch number, expiry date, and store location.

**New files:**
- `src/components/inventory/BarcodeLabelPrinter.tsx` -- Printable label component using html-to-image or CSS print styles, with QR/barcode generation
- `src/pages/app/inventory/BarcodeLabelPage.tsx` -- Page to select items, configure label size, and print

**Integration points:**
- Add "Print Label" button on `ItemDetailPage.tsx`
- Add "Print Labels" bulk action on `ItemsListPage.tsx`
- Add route in `App.tsx`
- Add sidebar entry under warehouse tools

### Step 8: Route and Navigation Updates

- Add `/app/inventory/barcode-labels` route
- Add "Barcode Labels" to warehouse sidebar

**Files changed:**
- `src/App.tsx` -- Add barcode label route
- `src/config/role-sidebars.ts` -- Add Barcode Labels menu item

---

## Summary of All Gaps Fixed

| Gap | Form/Page | Issue | Fix |
|-----|-----------|-------|-----|
| 1 | Pick List Form | No item selector | Add item dropdown per row |
| 2 | Packing Slip Form | No item selector | Add item dropdown per row |
| 3 | Stock Adjustment | No store selector | Add StoreSelector |
| 4 | Stock Adjustment | Does not update stock | Fetch and update inventory_stock |
| 5 | Reorder Alerts | PR not pre-filled | Pass items via navigation state |
| 6 | Item Form | No barcode field | Add barcode/SKU to schema and form |
| 7 | Entire WMS | No label printing | New barcode label generator page |

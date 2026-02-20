
# Audit Results and Fix Plan: Warehouse Inventory Connectivity

## Audit Summary

After checking every form and data record, here is the status:

### What is WORKING correctly

| Component | Status | Details |
|-----------|--------|---------|
| Pick List Form | OK | Has item selector dropdown, fetches inventory items, passes item_id |
| Packing Slip Form | OK | Has item selector dropdown, fetches inventory items, passes item_id |
| Purchase Request Form | OK | Has item selector, accepts reorder alert pre-fill via navigation state |
| Purchase Order Form | OK | Has vendor, branch, warehouse selectors plus item builder |
| GRN Form | OK | Loads items from selected PO, has batch/expiry fields |
| Reorder Alerts | OK | Passes selected items to PR form via navigation state |
| Item Form | OK | Has barcode and SKU fields in the schema and UI |
| Barcode Label Page | OK | Route registered, sidebar entry present, item selection and print working |
| Barcode Label Printer | OK | Generates Code128 barcodes using jsbarcode |
| Stock Adjustment Form | Partial | Has store selector and item selector, but has a critical bug (see below) |

### Issues Found

**Bug 1: Stock Adjustment inserts `organization_id` into `inventory_stock` -- column does not exist**

In `StockAdjustmentFormPage.tsx` line 123, when creating a new stock record (increase on an item with no existing stock), the code inserts `organization_id` into `inventory_stock`. However, the `inventory_stock` table does NOT have an `organization_id` column. This will cause an error.

**Fix:** Remove `organization_id` from the insert payload on that table.

**Data Gap 1: All 15 inventory items have NULL barcode and NULL SKU**

The barcode and SKU columns were added to the schema, and the form supports them, but none of the 15 seeded demo items have barcode or SKU values populated. This means the Barcode Label page will only generate labels using item_code as fallback -- not realistic demo data.

**Fix:** Populate barcode (EAN-13 style) and SKU values for all 15 items.

---

## Implementation Steps

### Step 1: Fix Stock Adjustment Bug

Remove the `organization_id` field from the `inventory_stock` insert in `StockAdjustmentFormPage.tsx` (line 123).

**File:** `src/pages/app/inventory/StockAdjustmentFormPage.tsx`

### Step 2: Populate Barcode and SKU Data for All Items

Update all 15 inventory items with realistic barcode numbers and SKU codes:

| Item | Barcode | SKU |
|------|---------|-----|
| Paracetamol 500mg | 8901234500001 | PHAR-PCM-500 |
| Amoxicillin 250mg | 8901234500002 | PHAR-AMX-250 |
| Omeprazole 20mg | 8901234500003 | PHAR-OMP-020 |
| Normal Saline 0.9% | 8901234500004 | CONS-NS-1000 |
| Surgical Gloves | 8901234500005 | SURG-GLV-STR |
| Disposable Syringes | 8901234500006 | CONS-SYR-005 |
| Suture Silk 3-0 | 8901234500007 | SURG-SUT-3-0 |
| Surgical Masks N95 | 8901234500008 | SURG-MSK-N95 |
| Blood Glucose Strips | 8901234500009 | LAB-BGS-050 |
| CBC Reagent Kit | 8901234500010 | LAB-CBC-KIT |
| Digital Thermometer | 8901234500011 | EQUP-THR-DIG |
| Pulse Oximeter | 8901234500012 | EQUP-POX-001 |
| Bandage Roll 4in | 8901234500013 | CONS-BND-4IN |
| IV Cannula 20G | 8901234500014 | SURG-IVC-20G |
| Urine Test Strips | 8901234500015 | LAB-UTS-100 |

**Method:** SQL UPDATE via the data insert tool (not a migration).

### Step 3: Verification

After fixes, all warehouse forms will be properly connected:
- Procurement: PR (with item selector and reorder pre-fill) -> PO (with item builder) -> GRN (auto-loads from PO)
- Storage: Stock Adjustments (with store + item selector, real stock update)
- Outbound: Pick Lists (with item selector) -> Packing Slips (with item selector)
- Labels: Barcode page with real barcode data for all items

---

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `src/pages/app/inventory/StockAdjustmentFormPage.tsx` | Remove `organization_id` from inventory_stock insert (line 123) |

### Data Changes (via insert tool)

```sql
UPDATE inventory_items SET barcode = '8901234500001', sku = 'PHAR-PCM-500' WHERE id = 'e0000001-1111-4000-a000-000000000001';
-- ... (all 15 items)
```

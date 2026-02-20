

# Warehouse Module: Final Connectivity Fixes and Missing Print Documents

## Re-Audit Results (Warehouse Only -- No Discharge Summaries!)

This audit covers ONLY the warehouse/inventory module. Here is the complete status:

### Working Correctly (No Changes Needed)

| Page | Item Linked | Print | Cross-Link |
|------|------------|-------|------------|
| Item Form | N/A | N/A | Has barcode + SKU fields |
| PO Detail | Yes (items table) | Yes (PrintablePO) | Has Receive Goods button |
| GRN Detail | Yes (from PO) | Yes (PrintableGRN) | Links back to PO |
| Stock Adjustment | Yes (item + store selector) | N/A | Updates inventory_stock |
| Barcode Labels | Yes (item selector) | Yes (Code128 labels) | N/A |
| Reorder Alerts | Yes | N/A | Passes items to PR form |
| Pick List Form | Yes (item selector) | N/A | N/A |
| Packing Slip Form | Yes (item selector) | N/A | N/A |

### Bugs Found

**Bug 1: PO "Receive Goods" link is broken**
- `PODetailPage.tsx` line 151 sends `?po_id=...`
- `GRNFormPage.tsx` line 70 reads `searchParams.get("poId")`
- The parameter names don't match, so the GRN form opens blank instead of pre-selecting the PO

**Bug 2: PR "Convert to PO" does nothing**
- `PRDetailPage.tsx` line 95 navigates to `/app/inventory/purchase-orders/new?from_pr=${pr.id}`
- `POFormPage.tsx` only reads `vendor_id` from search params -- it completely ignores `from_pr`
- Converting a PR to PO just opens a blank PO form

### Missing Print/PDF Documents

| Detail Page | Has Print Button | Has Printable Component |
|-------------|-----------------|------------------------|
| PR Detail | No | No |
| Pick List Detail | No | No |
| Packing Slip Detail | Yes (broken -- uses `window.print()`) | No |
| Shipment Detail | No | No |
| Transfer Detail | No | No |
| Requisition Detail | No | No |

---

## Implementation Steps

### Step 1: Fix PO to GRN Link
Change one character in `PODetailPage.tsx` line 151: `?po_id=` to `?poId=` so it matches what `GRNFormPage.tsx` expects.

**File:** `src/pages/app/inventory/PODetailPage.tsx`

### Step 2: Fix PR to PO Pre-fill
Add `from_pr` handling to `POFormPage.tsx`:
- Read `from_pr` param from URL
- Fetch the PR data and its items
- Auto-set vendor from PR
- Pre-populate PO items from PR items

**File:** `src/pages/app/inventory/POFormPage.tsx`

### Step 3: Create 6 Printable Components
Each follows the same pattern as the existing `PrintablePO` and `PrintableGRN` -- a `forwardRef` component with formatted layout for printing.

| New File | Content |
|----------|---------|
| `src/components/inventory/PrintablePR.tsx` | PR number, requester, items table, estimated totals |
| `src/components/inventory/PrintablePickList.tsx` | Pick list number, items with bin locations and quantities |
| `src/components/inventory/PrintablePackingSlip.tsx` | Packing slip number, box details, item quantities |
| `src/components/inventory/PrintableShipment.tsx` | Shipment details, carrier, tracking, event history |
| `src/components/inventory/PrintableTransfer.tsx` | Transfer between stores, items, approval info |
| `src/components/inventory/PrintableRequisition.tsx` | Requisition details, requested items, approval status |

### Step 4: Add Print Buttons to 6 Detail Pages
Update each detail page to import `usePrint`, add a hidden printable component, and add a Print button.

| File | Change |
|------|--------|
| `PRDetailPage.tsx` | Add Printer button + PrintablePR |
| `PickListDetailPage.tsx` | Add Printer button + PrintablePickList |
| `PackingSlipDetailPage.tsx` | Replace `window.print()` with `usePrint` + PrintablePackingSlip |
| `ShipmentDetailPage.tsx` | Add Printer button + PrintableShipment |
| `TransferDetailPage.tsx` | Add Printer button + PrintableTransfer |
| `RequisitionDetailPage.tsx` | Add Printer button + PrintableRequisition |

---

## Summary

| Category | Count | Details |
|----------|-------|---------|
| Bug fixes | 2 | PO-to-GRN param mismatch, PR-to-PO pre-fill |
| New printable components | 6 | PR, Pick List, Packing Slip, Shipment, Transfer, Requisition |
| Detail page updates | 6 | Add print buttons with proper `usePrint` hook |
| Total files changed | 8 | 2 bug fixes + 6 detail page updates |
| Total new files | 6 | Printable components |

After these changes, every warehouse document will be printable, and every cross-module link (Reorder -> PR -> PO -> GRN, Pick -> Pack -> Ship) will work end-to-end.

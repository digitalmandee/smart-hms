

# Fix: PO-to-Inventory Flow, Stock Alerts, and Pharmacy Returns

## Problems Identified

### Problem 1: GRN verify already adds stock to `medicine_inventory`
The `useVerifyGRN` hook (lines 252-295 in `useGRN.ts`) already handles adding stock to `medicine_inventory` for medicine items and `inventory_stock` for general items when a GRN is verified. This flow works: PO → GRN → Verify GRN → Stock added. No code fix needed here — the chain is functional.

### Problem 2: Stock Alerts page shows pharmacy inventory correctly
The `StockAlertsPage` uses `useInventory()` from `usePharmacy.ts`, which queries `medicine_inventory`. This works — it correctly shows low stock, out of stock, expiring, and expired medicines. The `LowStockAlertWidget` (dashboard widget) uses `useLowStockItems()` from `useInventory.ts`, which queries the general `inventory_items`/`inventory_stock` tables — NOT the pharmacy `medicine_inventory` table. The dashboard widget will never show pharmacy low-stock items.

**Fix**: Create a pharmacy-specific low stock widget or update the existing widget to also check `medicine_inventory`.

### Problem 3: Pharmacy Returns — partially functional
The returns system exists (`pharmacy_returns` + `pharmacy_return_items` tables, `usePharmacyReturns.ts` hook, `PharmacyReturnsPage.tsx`). It can:
- Search transactions by receipt number/customer
- Select items to return with quantities
- Choose refund method (cash/credit/deduct)
- Restock inventory on return
- Log stock movements

**What's broken or missing**:
1. **No prescription/OPD/IPD return flow** — Returns only work for POS transactions. If a medicine was dispensed via a prescription (OPD/IPD), there's no way to return it.
2. **Stats use estimates** — `itemsRestocked` is hardcoded as `todayReturns * 2` (line 148), not real data.
3. **No return approval workflow** — `pendingApproval` is always 0 (line 146).
4. **Recent returns only shows voided/refunded transactions** — doesn't query the actual `pharmacy_returns` table.

## Plan

### 1. Fix Recent Returns to use `pharmacy_returns` table
**File: `src/hooks/usePharmacyReturns.ts`**
- Update `useRecentReturns` to query `pharmacy_returns` table with join to `pharmacy_return_items` instead of just looking at voided POS transactions
- Update `useReturnsStats` to compute real stats from `pharmacy_returns` (actual restocked count, not estimates)

### 2. Add prescription return flow
**File: `src/pages/app/pharmacy/PharmacyReturnsPage.tsx`**
- Add a second search mode: "Search by Patient / MRN" to find dispensed prescriptions
- Show dispensed prescription items with quantities that can be returned
- On return, create `pharmacy_return` record, restock `medicine_inventory`, log `pharmacy_stock_movements`

**File: `src/hooks/usePharmacyReturns.ts`**
- Add `useSearchDispensedPrescriptions(query)` hook that searches `prescriptions` with status `dispensed`/`partially_dispensed` and their `prescription_items`
- Add mutation to process prescription returns (similar to POS return but references prescription instead of transaction)

### 3. Fix dashboard Low Stock widget for pharmacy
**File: `src/components/inventory/LowStockAlertWidget.tsx`**
- Check user role; if pharmacist, query `medicine_inventory` for low stock items instead of general `inventory_items`
- Or create a separate `PharmacyLowStockWidget` component

### 4. Add "Create Requisition" button on Stock Alerts page
**File: `src/pages/app/pharmacy/StockAlertsPage.tsx`**
- Add checkbox selection on low stock items
- Add "Create Requisition" button that navigates to requisition form pre-filled with selected low-stock medicines

### 5. i18n updates
**Files: `en.ts`, `ar.ts`, `ur.ts`**
- Keys: "Search by Patient", "Dispensed Prescriptions", "Return to Stock", "Create Requisition from Alerts", "Prescription Return", "POS Return"

## Files Changed
- `src/hooks/usePharmacyReturns.ts` — fix recent returns query, real stats, add prescription return search/mutation
- `src/pages/app/pharmacy/PharmacyReturnsPage.tsx` — add prescription return tab/mode, improve UI
- `src/pages/app/pharmacy/StockAlertsPage.tsx` — add requisition creation from alerts
- `src/components/inventory/LowStockAlertWidget.tsx` — pharmacy-aware low stock detection
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys


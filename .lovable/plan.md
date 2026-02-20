
# Fix: Warehouses Not Showing for Warehouse Organizations

## Root Cause

The `StoresListPage.tsx` (Warehouse Management page) hardcodes `useAllStores("hospital")` as the context filter. However, the "Central Distribution Warehouse" organization has `facility_type: "warehouse"`, and its stores are stored with `context: "warehouse"`. Since the filter looks for `context = "hospital"`, all warehouse-org stores are hidden.

**Your data IS in the database** -- 3 stores (Main Distribution Center, Medical Supplies Store, General Storage Area), 9 zones, 20 stock records with real inventory quantities, all with barcodes and SKUs. It's just being filtered out by the hardcoded "hospital" context.

## What Will Be Fixed

### 1. StoresListPage -- Remove hardcoded "hospital" context
Instead of `useAllStores("hospital")`, derive the correct context from the current organization's `facility_type`:
- If org is `warehouse` -> use context `"warehouse"`
- If org is `pharmacy` -> use context `"pharmacy"` 
- Otherwise -> use context `"hospital"`

This ensures each organization type sees its own stores.

### 2. StoreSelector -- Make context auto-detect from org
Same logic: when no explicit `context` is passed, auto-detect from the organization's facility type. This ensures all warehouse pages (Zones, Bins, Storage Map, Pick Lists, etc.) show the correct stores.

## Technical Changes

| File | Change |
|------|--------|
| `src/pages/app/inventory/StoresListPage.tsx` | Replace `useAllStores("hospital")` with facility-type-aware context using `useOrganization` hook |
| `src/hooks/useStores.ts` | Add a new `useStoreContext()` helper hook that returns the right context string based on the org's `facility_type` |
| `src/components/inventory/StoreSelector.tsx` | Use `useStoreContext()` as default when no explicit `context` prop is provided |

## After Fix

All 3 warehouse stores will appear:
- Main Distribution Center (central)
- Medical Supplies Store (medical)
- General Storage Area (general)

Plus all 15 inventory items with stock, zones, and bins will be accessible through the warehouse UI.

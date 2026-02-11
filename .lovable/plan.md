
# Warehouse & Inventory Flow Audit -- Issues Found

After reviewing all hooks, pages, components, routes, and sidebar config, here are the issues discovered and fixes needed.

---

## Issue 1: StockLevelsPage -- Store Filter Not Wired to Query (Bug)

The `StockLevelsPage` has a `StoreSelector` with `storeFilter` state, but it is **never passed** to `useInventoryItems()`. The store filter dropdown is purely cosmetic -- selecting a warehouse does nothing.

**Root Cause**: `useInventoryItems()` doesn't accept a `storeId` parameter. It aggregates stock across all stores. The `storeFilter` value is never used.

**Fix**: 
- Add an optional `storeId` parameter to `useInventoryItems()` in `useInventory.ts`
- When `storeId` is provided, filter the stock aggregation query by `store_id`
- Pass `storeFilter` from `StockLevelsPage` to `useInventoryItems()`

---

## Issue 2: StoreFormPage -- `branch_id` Validation Allows "none" (Bug)

The Zod schema requires `branch_id: z.string().min(1)`, and the default is `"none"`. Since `"none"` passes `.min(1)` validation, a user could submit the form with `branch_id = "none"`, which would fail at the database level (invalid UUID FK).

**Fix**: Change the Zod schema to use `.refine()` or update the validation:
```
branch_id: z.string().min(1).refine(v => v !== "none", "Select a branch")
```

---

## Issue 3: TransferFormPage -- Item Select Empty String Value (Bug)

When adding a new transfer item, `item_id` defaults to `""` (empty string). This empty string is passed as the Radix Select `value` prop. While it doesn't crash (the placeholder shows), Radix Select technically requires a matching `SelectItem` for any non-empty value. This could cause issues on some Radix versions.

**Fix**: Use `value={item.item_id || undefined}` in the Select, or keep the current behavior since it appears to work with the placeholder.

**Severity**: Low -- cosmetic/defensive only.

---

## Issue 4: GRN Verify -- Medicine Items Missing `store_id` (Bug)

In `useVerifyGRN()`, when verifying a GRN that routes stock to `inventory_stock`, the `store_id` is correctly copied from the GRN (`grn.store_id`). However, for **medicine items** going to `medicine_inventory`, there is no `store_id` field being set. Medicine stock will not be associated with any warehouse.

**Fix**: Add `store_id: grn.store_id || null` to the `medicine_inventory` insert in `useVerifyGRN()`.

---

## Issue 5: Transfer Dispatch/Receive -- No Actual Stock Movement (Major Gap)

The `useDispatchTransfer()` and `useReceiveTransfer()` hooks only update the transfer status and item quantities. They do **not** actually:
- Deduct stock from the source store's `inventory_stock` on dispatch
- Add stock to the destination store's `inventory_stock` on receive

This means transfers are purely informational -- no physical stock is moved in the database.

**Fix**: 
- In `useDispatchTransfer()`: After updating items, deduct `quantity_sent` from `inventory_stock` records where `store_id = from_store_id` using FIFO
- In `useReceiveTransfer()`: After updating items, insert new `inventory_stock` records with `store_id = to_store_id`

---

## Issue 6: Transfer Status Flow Gap -- No "pending" Step (Minor)

The `TransferDetailPage` shows an "Approve" button when status is `"draft"`, which transitions directly to `"approved"`. But the `transfer_status` enum includes `"pending"` between draft and approved. The "pending" status is never used.

**Fix**: Either:
- Add a "Submit" button on draft that transitions to "pending", then "Approve" on pending transitions to "approved"
- Or remove "pending" from the status filter in TransfersListPage if it's intentionally skipped

**Recommendation**: Add a Submit step (draft -> pending -> approved) for proper workflow.

---

## Issue 7: StoreSelector Crash When No Stores Exist and `showAll=false` (Edge Case)

When `StoreSelector` has `showAll=false` and no stores are loaded yet (or none exist), the `value` prop could be empty string `""`. With `showAll=false`, the component renders `value={value}` which is `""`. Radix Select with an empty string value and no matching SelectItem can behave unexpectedly.

**Fix**: Already partially handled by the "No warehouses found" disabled item. But the `value=""` issue remains. Change to `value={value || undefined}` when `showAll` is false and value is empty.

---

## Summary of Fixes

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | Store filter not wired on Stock Levels page | Medium | `useInventory.ts`, `StockLevelsPage.tsx` |
| 2 | StoreFormPage allows "none" as branch_id | Medium | `StoreFormPage.tsx` |
| 3 | Transfer item Select empty string value | Low | `TransferFormPage.tsx` |
| 4 | Medicine items missing store_id on GRN verify | Medium | `useGRN.ts` |
| 5 | No actual stock movement on transfer dispatch/receive | High | `useStoreTransfers.ts` |
| 6 | Missing "pending" status step in transfer flow | Low | `TransferDetailPage.tsx` |
| 7 | StoreSelector empty value edge case | Low | `StoreSelector.tsx` |

---

## Technical Implementation

### Fix 1: Wire storeId to useInventoryItems

In `useInventory.ts`, update `useInventoryItems` to accept `storeId` in filters. When provided, the stock aggregation query filters by `store_id`.

In `StockLevelsPage.tsx`, pass `storeId: storeFilter === "all" ? undefined : storeFilter` to `useInventoryItems`.

### Fix 2: StoreFormPage branch validation

Add `.refine(v => v !== "none", "Select a branch")` to the `branch_id` field in the Zod schema.

### Fix 4: Medicine store_id in GRN verify

Add `store_id: grn.store_id || null` to the medicine_inventory insert block in `useVerifyGRN()`.

### Fix 5: Stock movement on transfers

**useDispatchTransfer**: After updating transfer items, for each item:
- Query `inventory_stock` WHERE `item_id = item.item_id` AND `store_id = transfer.from_store_id`, ordered by `received_date ASC` (FIFO)
- Deduct `quantity_sent` across matching stock records

**useReceiveTransfer**: After updating transfer items, for each item:
- Fetch the transfer to get `to_store_id` and `from_store_id`
- Fetch the transfer items with their item details
- Insert new `inventory_stock` records with `store_id = to_store_id`, `branch_id` from the destination store

### Fix 6: Add pending step

Update `TransferDetailPage.tsx`:
- When status is `"draft"`: Show "Submit for Approval" button (draft -> pending)
- When status is `"pending"`: Show "Approve" button (pending -> approved)

Add `useSubmitTransfer()` hook that sets status to "pending".

### Fix 7: StoreSelector defensive value

Change line 33 to: `value={showAll ? (value || "all") : (value || undefined)}`

### Files to modify

| File | Changes |
|------|---------|
| `src/hooks/useInventory.ts` | Add `storeId` to `useInventoryItems` stock query filter |
| `src/pages/app/inventory/StockLevelsPage.tsx` | Pass `storeFilter` to `useInventoryItems` |
| `src/pages/app/inventory/StoreFormPage.tsx` | Refine branch_id Zod validation |
| `src/hooks/useGRN.ts` | Add `store_id` to medicine_inventory insert |
| `src/hooks/useStoreTransfers.ts` | Add FIFO stock deduction on dispatch, stock insertion on receive, add `useSubmitTransfer` |
| `src/pages/app/inventory/TransferDetailPage.tsx` | Add Submit button for draft->pending flow |
| `src/components/inventory/StoreSelector.tsx` | Defensive empty value handling |

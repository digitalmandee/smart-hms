

# Fix Two Critical Blockers and Retest

## Issue 1: StoreFormPage Crash -- `manager_id` default

**File**: `src/pages/app/inventory/StoreFormPage.tsx`, line 102

The `manager_id` defaults to `""` (empty string). The Select component renders `value={field.value || "none"}`, so when editing it works, but on initial render the empty string can cause a Radix DOM reconciliation error.

**Fix**: Change line 102 from `manager_id: ""` to `manager_id: "none"`.

---

## Issue 2: Transfer Detail -- Missing Foreign Key on `store_stock_transfer_items`

**File**: Database migration needed

The `store_stock_transfer_items` table has `item_id uuid` with **no REFERENCES** constraint. The `useStoreTransfer` hook joins via `item:inventory_items(id, ...)`, but PostgREST requires a FK relationship to resolve this join, causing a `PGRST200` error.

**Fix**: Add a Foreign Key constraint via SQL migration:

```sql
ALTER TABLE public.store_stock_transfer_items
  ADD CONSTRAINT store_stock_transfer_items_item_id_fkey
  FOREIGN KEY (item_id) REFERENCES public.inventory_items(id);
```

---

## Implementation Order

1. Fix `manager_id` default in `StoreFormPage.tsx` (one line change)
2. Run database migration to add the missing FK constraint
3. Retest the full flow:
   - Create a new warehouse
   - Create a transfer between two warehouses
   - View transfer detail page
   - Walk through submit, approve, dispatch, receive

---

## Technical Details

| Step | File / Target | Change |
|------|---------------|--------|
| 1 | `src/pages/app/inventory/StoreFormPage.tsx` line 102 | `manager_id: ""` to `manager_id: "none"` |
| 2 | Database migration | `ALTER TABLE store_stock_transfer_items ADD CONSTRAINT ... FOREIGN KEY (item_id) REFERENCES inventory_items(id)` |
| 3 | Browser testing | End-to-end walkthrough of warehouse creation and transfer lifecycle |


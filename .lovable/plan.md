
Fix: GRN verify consistency, requisition status sync, and duplicate batch stock

Problem found

1. GRN can add medicine stock but still stay unverified  
In `src/hooks/useGRN.ts`, medicine rows are inserted into `medicine_inventory` first. Later in the same flow, the code writes to `stock_adjustments`, but that table is inventory-item based and requires `item_id`. Medicine rows only have `medicine_id`, so the verify flow can fail after stock is inserted but before GRN status is updated.

2. Requisition status is not moving from “Approved”  
The PO → GRN path drops the requisition link:
- `POFormPage` reads `from_requisition`
- `purchase_orders` does not persist `requisition_id`
- `PODetailPage` opens GRN with only `poId`
- `GRNFormPage` only sets `requisition_id` if `requisitionId` exists in the URL

Result: GRN posts, but the linked requisition is still unknown, so it remains `approved`.

3. Same medicine batch gets duplicated  
`useVerifyGRN()` always inserts a new `medicine_inventory` row. If verify fails late and the user retries, the same medicine/batch gets inserted again. There is no merge or idempotency protection.

Implementation plan

1. Make GRN verification atomic
- Move the full verify workflow into one Supabase SQL function / RPC.
- Inside one transaction:
  - validate GRN is still `draft`
  - process stock updates
  - update PO received quantities and PO status
  - update linked requisition to `issued` if present
  - mark GRN `verified`
- If anything fails, nothing is committed.

2. Split inventory logic by item type
- Inventory items:
  - update `inventory_stock`
  - create `stock_adjustments`
- Medicine items:
  - update/merge `medicine_inventory`
  - create `pharmacy_stock_movements` with movement type `grn`
- Do not insert medicine rows into `stock_adjustments`.

3. Preserve requisition linkage end-to-end
- Add `purchase_orders.requisition_id` as a nullable FK.
- Save it when creating a PO from a requisition.
- Pass it from PO detail to GRN creation.
- In GRN creation, auto-populate `goods_received_notes.requisition_id` from the PO if it is not explicitly passed.

4. Prevent duplicate medicine batch rows
- For medicine receipts, first look for an existing row with the same:
  - `branch_id`
  - `store_id`
  - `medicine_id`
  - `batch_number`
  - `expiry_date`
- If found, increment quantity instead of inserting a new row.
- Add a DB-level unique guard/index (NULL-safe where needed) so repeated clicks or race conditions cannot create duplicates.

5. Repair current bad data
- Backfill `purchase_orders.requisition_id` for POs created from requisitions where recoverable.
- Backfill `goods_received_notes.requisition_id` from the PO link.
- Audit draft GRNs that already inserted medicine stock.
- Clean duplicate batch rows carefully by comparing accepted GRN quantities vs inserted stock, not by blindly summing duplicates.

Technical details

```text
Current failure chain

Verify GRN
  -> insert medicine_inventory
  -> update PO / requisition
  -> insert stock_adjustments
       fails for medicine rows (no item_id)
  -> GRN status update never runs
  -> user retries
  -> same batch inserted again
```

Scope notes
- The recent journal trigger fix (`unit_cost` in `post_grn_to_journal`) is separate and should stay as-is.
- The main issue is in client-side GRN verification flow and missing PO/requisition linkage.

Files to change
- `src/hooks/useGRN.ts`
- `src/hooks/usePurchaseOrders.ts`
- `src/pages/app/inventory/POFormPage.tsx`
- `src/pages/app/inventory/PODetailPage.tsx`
- `src/pages/app/inventory/GRNFormPage.tsx`
- `supabase/migrations/new.sql`

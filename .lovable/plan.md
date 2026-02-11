

# Complete Remaining Warehouse Management Phases (4-8)

## Current Status

Phases 1-3 are done: database tables, enums, RLS, seeds (4 Central Warehouses created), `useStores` hook, `StoreSelector` component, store management pages (list + form), routes, and sidebar entries.

## What Remains

### Phase 4: Update Existing Hooks with `store_id` Support

**`useInventory.ts`**
- `useInventoryStock(itemId?, branchId?)` -- add optional `storeId` parameter, apply `.eq("store_id", storeId)` filter, join `store:stores(id, name)` in select
- `useInventoryDashboardStats()` -- add optional `storeId` parameter, filter stock queries by store when provided
- `useAdjustStock()` -- add optional `store_id` to filter which stock record to adjust

**`usePurchaseOrders.ts`**
- `usePurchaseOrders()` -- join `store:stores(id, name)` in select query
- `useCreatePurchaseOrder()` -- accept optional `store_id` in the data object, pass to insert

**`useGRN.ts`**
- `useGRNs()` -- join `store:stores(id, name)` in select
- `useCreateGRN()` -- accept optional `store_id`, pass to insert
- `useVerifyGRN()` -- when inserting into `inventory_stock` or `medicine_inventory`, copy `store_id` from the GRN record

**`useRequisitions.ts`**
- `useRequisitions()` -- join `from_store:stores!stock_requisitions_from_store_id_fkey(id, name)` in select
- `useCreateRequisition()` -- accept optional `from_store_id` and `to_store_id`, pass to insert
- `useIssueStock()` -- filter FIFO stock deduction by `store_id` when the requisition has a `from_store_id`

---

### Phase 5: Update Existing Inventory & Procurement Pages

**`InventoryDashboard.tsx`**
- Add a `StoreSelector` dropdown (with "All Warehouses" option) in the header next to the action buttons
- Pass selected `storeId` to `useInventoryDashboardStats(storeId)`
- Add a "Warehouses" quick action card linking to `/app/inventory/stores`
- Add a "Transfers" quick action card linking to `/app/inventory/transfers`

**`StockLevelsPage.tsx`**
- Add `StoreSelector` dropdown next to category filter
- Pass selected `storeId` to the stock query for filtering
- (No new table column needed since the filter already scopes the view)

**`POFormPage.tsx`**
- Add `StoreSelector` field (labeled "Destination Warehouse") after the Branch selector
- When branch changes, reset the store selection
- Pass `store_id` to `createPO.mutateAsync()`

**`POListPage.tsx`**
- Add "Warehouse" column in the table between "Vendor" and "Order Date"
- Display `po.store?.name` or "-" if not set

**`GRNFormPage.tsx`**
- Add `StoreSelector` field (labeled "Receiving Warehouse") after the Branch selector
- Pass `store_id` to `createGRN.mutateAsync()`

**`GRNListPage.tsx`**
- Add "Warehouse" column between "Vendor" and "Received Date"
- Display `grn.store?.name` or "-"

**`RequisitionFormPage.tsx`**
- Add "From Warehouse" `StoreSelector` field in the form details section
- Pass `from_store_id` to `createRequisition.mutateAsync()`

**`RequisitionsListPage.tsx`**
- Add "Warehouse" column between "Department" and "Request Date"
- Display `req.from_store?.name` or "-"

---

### Phase 6: Inter-Store Transfers (New Files)

**New Hook: `src/hooks/useStoreTransfers.ts`**
- `useStoreTransfers(filters?)` -- list transfers with store name joins, filter by status
- `useStoreTransfer(id)` -- single transfer with items, item names, store details
- `useCreateTransfer()` -- create draft transfer with items
- `useApproveTransfer()` -- set status to `approved`, record `approved_by`
- `useDispatchTransfer()` -- set status to `in_transit`, record `dispatched_by`, deduct stock from source store
- `useReceiveTransfer()` -- set status to `received`, record `received_by`, add stock to destination store

**New Page: `src/pages/app/inventory/TransfersListPage.tsx`**
- List all transfers with columns: Transfer #, From Store, To Store, Status, Date, Requested By
- Status filter dropdown
- "New Transfer" button

**New Page: `src/pages/app/inventory/TransferFormPage.tsx`**
- Form with: From Warehouse (StoreSelector), To Warehouse (StoreSelector), Notes
- Items builder: select item (inventory or medicine), enter quantity, batch, expiry
- Create as draft

**New Page: `src/pages/app/inventory/TransferDetailPage.tsx`**
- Display transfer header with status badge
- Items table (requested/sent/received quantities)
- Action buttons based on status: Submit (draft->pending), Approve (pending->approved), Dispatch (approved->in_transit), Receive (in_transit->received)

**Routes to add in App.tsx:**
- `/app/inventory/transfers` -- TransfersListPage
- `/app/inventory/transfers/new` -- TransferFormPage
- `/app/inventory/transfers/:id` -- TransferDetailPage

---

### Phase 7: Store Manager Auto-Filter

- In `InventoryDashboard.tsx`, detect if user role is `store_manager`
- If so, use `useMyStores()` to get assigned stores and auto-set the store filter
- Hide the "All Warehouses" option for store managers (they only see their stores)

---

### Phase 8: Sidebar + Seed Data Updates

**Sidebar (`role-sidebars.ts`):**
- Add "Store Transfers" menu item under "Warehouse Management" for both `org_admin` and `store_manager` sidebars (path: `/app/inventory/transfers`)

**Seed additional demo stores** (via SQL INSERT):
- For the main demo organization (org `a0eebc99...`), create sample stores for the first branch:
  - "Medical Store" (type: medical, code: MED-01)
  - "Surgical Store" (type: surgical, code: SURG-01)
  - "Pharmacy Store" (type: pharmacy, code: PHAR-01)
  - "Equipment Store" (type: equipment, code: EQUIP-01)

---

## Files to Create (4 files)

| File | Purpose |
|------|---------|
| `src/hooks/useStoreTransfers.ts` | Transfer CRUD + status transition hooks |
| `src/pages/app/inventory/TransfersListPage.tsx` | Transfer list page |
| `src/pages/app/inventory/TransferFormPage.tsx` | Transfer creation form |
| `src/pages/app/inventory/TransferDetailPage.tsx` | Transfer detail with actions |

## Files to Modify (12 files)

| File | Changes |
|------|---------|
| `src/hooks/useInventory.ts` | Add `storeId` filter to stock/dashboard queries |
| `src/hooks/usePurchaseOrders.ts` | Add `store_id` to create, join store in list |
| `src/hooks/useGRN.ts` | Add `store_id` to create/verify, join store in list |
| `src/hooks/useRequisitions.ts` | Add `from_store_id`/`to_store_id` to create, join store in list |
| `src/pages/app/inventory/InventoryDashboard.tsx` | Store filter + warehouse quick actions |
| `src/pages/app/inventory/StockLevelsPage.tsx` | Store filter dropdown |
| `src/pages/app/inventory/POFormPage.tsx` | Destination warehouse selector |
| `src/pages/app/inventory/POListPage.tsx` | Warehouse column |
| `src/pages/app/inventory/GRNFormPage.tsx` | Receiving warehouse selector |
| `src/pages/app/inventory/GRNListPage.tsx` | Warehouse column |
| `src/pages/app/inventory/RequisitionFormPage.tsx` | From warehouse selector |
| `src/pages/app/inventory/RequisitionsListPage.tsx` | Warehouse column |
| `src/App.tsx` | Add transfer page routes |
| `src/config/role-sidebars.ts` | Add Store Transfers menu item |

## Implementation Order

1. Update hooks (useInventory, usePurchaseOrders, useGRN, useRequisitions) with store_id support
2. Update existing pages with StoreSelector and warehouse columns
3. Create useStoreTransfers hook
4. Create transfer pages (List, Form, Detail)
5. Add transfer routes to App.tsx
6. Update sidebar with transfers menu item
7. Seed sample stores via SQL INSERT
8. Store manager auto-filter logic


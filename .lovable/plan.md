

# Warehouse Management Module -- Integrated with Existing Inventory System

## What You Get

A new **"Warehouse Management"** section in the hospital admin sidebar where you can create and manage warehouses (Medical Store, Surgical Store, Pharmacy Store, Equipment Store, etc.). Each warehouse operates as a self-contained inventory unit -- its own stock levels, its own POs, its own GRNs, its own requisitions. The existing Inventory system works exactly as it does today, but now scoped per warehouse.

---

## How It Works

```text
Hospital Branch
  |
  +-- Central Warehouse (default, auto-created)
  |     +-- Stock Levels (inventory_stock + medicine_inventory)
  |     +-- Purchase Orders
  |     +-- GRN (Goods Received)
  |     +-- Requisitions
  |
  +-- Medical Store
  |     +-- Same sub-pages...
  |
  +-- Surgical Store
  |     +-- Same sub-pages...
  |
  +-- Pharmacy Store
        +-- Same sub-pages...
```

When you open a warehouse, you see the **same inventory dashboard** you already have -- but filtered to that warehouse's stock only. No duplicate code. The existing pages (Items, Stock Levels, PO, GRN, Requisitions, Reports) all get a `store_id` filter behind the scenes.

---

## Database Changes

### 1. New Enums

- `store_type`: central, medical, surgical, dental, equipment, pharmacy, general
- `transfer_status`: draft, pending, approved, in_transit, received, cancelled

### 2. New Table: `stores` (Warehouses)

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid PK | |
| organization_id | uuid FK | RLS scoped |
| branch_id | uuid FK | Which branch this warehouse belongs to |
| name | text | "Medical Store", "Surgical Store", etc. |
| code | text | "MED-01", "SURG-01" |
| store_type | store_type enum | Type of warehouse |
| manager_id | uuid FK (profiles) | Assigned store manager |
| is_central | boolean | One central warehouse per branch |
| is_active | boolean | |
| location_info | jsonb | Bin/rack/shelf metadata |

### 3. Add `store_id` to Existing Tables (nullable -- backward compatible)

- `inventory_stock` -- which warehouse holds this stock
- `medicine_inventory` -- which warehouse holds this medicine
- `purchase_orders` -- PO raised for which warehouse
- `goods_received_notes` -- GRN received into which warehouse
- `stock_requisitions` -- add `from_store_id` and `to_store_id`

### 4. New Tables for Inter-Warehouse Transfers

- `store_stock_transfers` -- transfer header (from warehouse, to warehouse, status, approvals)
- `store_stock_transfer_items` -- line items (item/medicine, quantities requested/sent/received)

### 5. Seed Data

- Auto-create a "Central Warehouse" for each existing branch
- Update all existing stock records to point to the branch's Central Warehouse
- Add permissions: `inventory.stores.manage`, `inventory.transfers.manage`
- Add menu items for Warehouses and Transfers

---

## Frontend Changes

### New Sidebar Section: "Warehouse Management"

Added to `org_admin` and `branch_admin` sidebars:

```text
Warehouse Management
  +-- All Warehouses        (/app/inventory/stores)
  +-- Create Warehouse      (/app/inventory/stores/new)
  +-- Inter-Store Transfers  (/app/inventory/transfers)
```

The existing `store_manager` sidebar also gets these items.

### New Pages (5 pages)

| Page | Route | Purpose |
|------|-------|---------|
| StoresListPage | `/app/inventory/stores` | List all warehouses with type badges, manager, stock summary |
| StoreFormPage | `/app/inventory/stores/new` | Create warehouse: name, code, type, branch, manager |
| StoreFormPage | `/app/inventory/stores/:id/edit` | Edit warehouse |
| TransfersListPage | `/app/inventory/transfers` | List inter-warehouse transfers with status |
| TransferFormPage | `/app/inventory/transfers/new` | Create transfer: select source/destination warehouse, add items |
| TransferDetailPage | `/app/inventory/transfers/:id` | View, approve, dispatch, receive transfer |

### New Reusable Components (2 components)

| Component | Purpose |
|-----------|---------|
| `StoreSelector.tsx` | Dropdown to pick a warehouse (used in PO, GRN, Requisition forms and dashboard filters) |
| `StoreStockSummary.tsx` | Card showing a warehouse's stock count, value, and alerts |

### New Hooks (2 hooks)

| Hook | Purpose |
|------|---------|
| `useStores.ts` | CRUD for warehouses + `useMyStores()` for store_manager role |
| `useStoreTransfers.ts` | Transfer CRUD + status transitions (approve, dispatch, receive) |

### Existing Pages Modified (add warehouse filter/selector)

| Page | What Changes |
|------|-------------|
| InventoryDashboard | Warehouse filter dropdown in header; stats filtered per warehouse |
| StockLevelsPage | Warehouse filter dropdown + "Warehouse" column in table |
| POFormPage | "Destination Warehouse" selector after branch selection |
| POListPage | "Warehouse" column |
| GRNFormPage | "Receiving Warehouse" selector |
| GRNListPage | "Warehouse" column |
| RequisitionFormPage | "From Warehouse" and "To Warehouse" selectors |
| RequisitionsListPage | "Warehouse" column |

### Existing Hooks Modified (add store_id parameter)

| Hook | Change |
|------|--------|
| `useInventoryStock()` | Accept optional `storeId`, filter by `.eq("store_id", storeId)` |
| `useInventoryDashboardStats()` | Accept optional `storeId` |
| `useCreatePurchaseOrder()` | Accept `store_id` in data |
| `usePurchaseOrders()` | Join `store:stores(id, name)` |
| `useCreateGRN()` | Accept `store_id` |
| `useVerifyGRN()` | Set `store_id` on created stock records |
| `useGRNs()` | Join store name |
| `useCreateRequisition()` | Accept `from_store_id`, `to_store_id` |
| `useIssueStock()` | FIFO deduction filtered by store_id |

---

## Store Manager Role Wiring

The `store_manager` role already exists. This plan activates it:

- `stores.manager_id` links to the manager's profile
- When a `store_manager` logs in, the inventory dashboard auto-filters to their assigned warehouse(s)
- `useMyStores()` hook returns only warehouses where `manager_id = current user`

---

## Files Summary

### Create (8 files)

| File | Purpose |
|------|---------|
| `src/hooks/useStores.ts` | Warehouse CRUD hooks |
| `src/hooks/useStoreTransfers.ts` | Transfer lifecycle hooks |
| `src/components/inventory/StoreSelector.tsx` | Reusable warehouse dropdown |
| `src/components/inventory/StoreStockSummary.tsx` | Warehouse stock summary card |
| `src/pages/app/inventory/StoresListPage.tsx` | Warehouse list page |
| `src/pages/app/inventory/StoreFormPage.tsx` | Warehouse create/edit form |
| `src/pages/app/inventory/TransfersListPage.tsx` | Transfer list |
| `src/pages/app/inventory/TransferFormPage.tsx` | Transfer create form |
| `src/pages/app/inventory/TransferDetailPage.tsx` | Transfer detail/actions |

### Modify (12 files)

| File | Changes |
|------|---------|
| `src/hooks/useInventory.ts` | Add `storeId` filter param |
| `src/hooks/usePurchaseOrders.ts` | Add `store_id` to create/join |
| `src/hooks/useGRN.ts` | Add `store_id` to create/verify/join |
| `src/hooks/useRequisitions.ts` | Add `from_store_id`/`to_store_id` |
| `src/pages/app/inventory/InventoryDashboard.tsx` | Warehouse filter + quick action |
| `src/pages/app/inventory/StockLevelsPage.tsx` | Warehouse filter + column |
| `src/pages/app/inventory/POFormPage.tsx` | Destination warehouse selector |
| `src/pages/app/inventory/POListPage.tsx` | Warehouse column |
| `src/pages/app/inventory/GRNFormPage.tsx` | Receiving warehouse selector |
| `src/pages/app/inventory/GRNListPage.tsx` | Warehouse column |
| `src/pages/app/inventory/RequisitionFormPage.tsx` | From/To warehouse selectors |
| `src/pages/app/inventory/RequisitionsListPage.tsx` | Warehouse column |
| `src/App.tsx` | Add routes for warehouse and transfer pages |
| `src/config/role-sidebars.ts` | Add Warehouse Management section to org_admin, store_manager sidebars |

---

## Implementation Order

1. Database migration (enums, stores table, alter existing tables, transfer tables, seeds, RLS, permissions, menu items)
2. `useStores.ts` hook + `StoreSelector.tsx` component
3. Warehouse management pages (StoresListPage + StoreFormPage)
4. Update existing hooks with `store_id` support
5. Update existing inventory/procurement pages with warehouse filter/selector
6. `useStoreTransfers.ts` hook + transfer pages
7. Store manager role auto-filter
8. Sidebar updates for all admin roles


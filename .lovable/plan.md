

# Batch B: Warehouse Management Frontend -- All Missing Features

## Overview

All 10 database tables already exist from Batch A (warehouse_zones, warehouse_bins, inventory_bin_assignments, putaway_tasks, pick_lists, pick_list_items, packing_slips, packing_slip_items, shipments, shipment_tracking_events). This batch builds all frontend hooks, pages, sidebar config, and routes.

## What Gets Built

### 1. Hooks (Data Layer) -- 5 new hook files

| Hook File | Purpose |
|-----------|---------|
| `useWarehouseZones.ts` | CRUD for warehouse_zones table |
| `useWarehouseBins.ts` | CRUD for warehouse_bins + inventory_bin_assignments |
| `usePutAwayTasks.ts` | List/update putaway_tasks (mark complete, assign bin) |
| `usePickingPacking.ts` | CRUD for pick_lists, pick_list_items, packing_slips, packing_slip_items |
| `useShipments.ts` | CRUD for shipments + shipment_tracking_events |

All hooks use the `queryTable()` pattern (same as useStoreRacks.ts) since these tables are not in the generated Supabase types client.

### 2. Pages -- 16 new page files

**Storage & Zones (under `/app/inventory/warehouse/`)**
- `WarehouseZonesPage.tsx` -- CRUD zones per store (receiving, storage, staging, shipping, cold, hazardous)
- `WarehouseBinsPage.tsx` -- CRUD bins within zones, link to racks
- `BinAssignmentsPage.tsx` -- View/search item-to-bin assignments
- `StorageMapPage.tsx` -- Visual zone utilization overview with capacity bars

**Put-Away (under `/app/inventory/`)**
- `PutAwayWorklistPage.tsx` -- Pending put-away tasks from verified GRNs, filterable by store/priority
- `PutAwayTaskPage.tsx` -- Individual task: shows item, suggested bin, select actual bin, mark complete

**Picking & Packing (under `/app/inventory/`)**
- `PickListsPage.tsx` -- All pick lists with status filters (draft/assigned/in_progress/completed)
- `PickListDetailPage.tsx` -- Picking interface with item checklist, bin locations, quantity tracking
- `PackingSlipsPage.tsx` -- All packing slips with status filters
- `PackingSlipDetailPage.tsx` -- Packing interface: box assignment, weight entry, verify button
- `PickingDashboardPage.tsx` -- Stats overview: pending picks, completion rates

**Shipping & Dispatch (under `/app/inventory/shipping/`)**
- `ShipmentsPage.tsx` -- All shipments with status filters (pending/in_transit/delivered)
- `ShipmentFormPage.tsx` -- Create shipment from packing slip or transfer
- `ShipmentDetailPage.tsx` -- Tracking timeline with event log, status updates
- `DispatchDashboardPage.tsx` -- Today's dispatch stats

**Integrations (under `/app/inventory/`)**
- `WarehouseIntegrationsPage.tsx` -- Webhook URL config, CSV import/export, API settings placeholder

### 3. Sidebar Configuration

Add `warehouse_admin` and `warehouse_user` entries to `role-sidebars.ts`:

```text
warehouse_admin:
  Dashboard -> /app/inventory
  Receiving
    GRN -> /app/inventory/grn
    Put-Away Tasks -> /app/inventory/putaway
  Storage
    Zones & Bins -> /app/inventory/warehouse/zones
    Bins -> /app/inventory/warehouse/bins
    Storage Map -> /app/inventory/warehouse/map
    Racks -> /app/inventory/warehouse/racks (existing pharmacy rack page or new)
  Stock
    Items -> /app/inventory/items
    Stock Levels -> /app/inventory/stock
    Categories -> /app/inventory/categories
  Picking & Packing
    Pick Lists -> /app/inventory/picking
    Packing Slips -> /app/inventory/packing
    Picking Dashboard -> /app/inventory/picking/dashboard
  Shipping
    Shipments -> /app/inventory/shipping
    Dispatch Dashboard -> /app/inventory/shipping/dashboard
  Procurement
    Purchase Orders -> /app/inventory/purchase-orders
    Vendors -> /app/inventory/vendors
  Transfers
    Requisitions -> /app/inventory/requisitions
    Store Transfers -> /app/inventory/transfers
  Reports -> /app/inventory/reports
  Integrations -> /app/inventory/integrations
  Warehouse Settings
    Warehouses -> /app/inventory/stores
    Create Warehouse -> /app/inventory/stores/new

warehouse_user (operational subset -- no settings/integrations/reports):
  Dashboard -> /app/inventory
  Receiving: GRN, Put-Away
  Storage: Zones, Bins, Map
  Stock: Items, Stock Levels
  Picking: Pick Lists, Packing Slips
  Shipping: Shipments
  Transfers: Requisitions, Store Transfers
```

Update `getPrimaryRole` priority list to include `warehouse_admin` and `warehouse_user`.

### 4. Routes in App.tsx

Add 16 new routes under the existing inventory section:

```text
inventory/warehouse/zones
inventory/warehouse/bins
inventory/warehouse/assignments
inventory/warehouse/map
inventory/putaway
inventory/putaway/:id
inventory/picking
inventory/picking/dashboard
inventory/picking/:id
inventory/packing
inventory/packing/:id
inventory/shipping
inventory/shipping/dashboard
inventory/shipping/new
inventory/shipping/:id
inventory/integrations
```

### 5. Update store_manager Sidebar

Add the new warehouse modules (Put-Away, Picking, Packing, Shipping, Storage) to the existing `store_manager` sidebar so hospital inventory managers also see them.

## Technical Approach

- Each hook uses `queryTable("table_name")` pattern with `any` cast (same as useStoreRacks.ts) since these tables exist in DB but aren't in the generated client types
- All pages follow existing PageHeader + Card + Table layout pattern
- StoreSelector component reused for warehouse/store filtering
- Toast messages use sonner directly (translation can be added in Batch F)
- Each page is a default export matching existing lazy-loading pattern

## Implementation Order

1. Create all 5 hook files (parallel)
2. Create all 16 page files (parallel batches of 4-5)
3. Update role-sidebars.ts with warehouse_admin and warehouse_user configs
4. Update App.tsx with all new routes + imports
5. Update store_manager sidebar to include new modules

## Estimated File Changes

- 5 new hook files
- 16 new page files
- 1 edited: `src/config/role-sidebars.ts`
- 1 edited: `src/App.tsx`
- Total: 23 files


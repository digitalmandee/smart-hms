
# Independent Warehouse Management System -- Full Build Plan

## Summary

Build an extensive, standalone warehouse management system with 5 missing modules (Put-Away, Picking & Packing, Shipping & Dispatch, Storage Optimization, API/Integration) and a new independent `warehouse_user` role + `warehouse` facility type so organizations can operate purely as warehouses without any hospital linkage.

---

## Phase 1: New Role & Facility Type

### Database Changes

1. **Add `warehouse_user` and `warehouse_admin` to `app_role` enum**
   - `ALTER TYPE app_role ADD VALUE 'warehouse_user';`
   - `ALTER TYPE app_role ADD VALUE 'warehouse_admin';`

2. **Add `warehouse` to facility_type options**
   - Update organization creation forms to include "Warehouse" as a facility type
   - Similar to how `pharmacy` isolates retail-only menus, `warehouse` will hide clinical modules (OPD, IPD, OT, Lab, Radiology, Pharmacy POS, etc.)

3. **New permissions** inserted into `permissions` table:
   - `warehouse.dashboard`, `warehouse.putaway`, `warehouse.picking`, `warehouse.packing`, `warehouse.shipping`, `warehouse.zones`, `warehouse.api_settings`
   - Grant all to `warehouse_admin`, `store_manager`, `org_admin`, `branch_admin`
   - Grant operational subset to `warehouse_user`

### Frontend Changes

- Add `warehouse_admin` and `warehouse_user` to `src/constants/roles.ts` under a new "Warehouse" category
- Add sidebar config in `src/config/role-sidebars.ts` for both roles
- Update `getPrimaryRole` priority list
- Update `ROLE_LABELS` map
- Add `warehouse` to `facility_type` enum in `CreateOrganizationPage.tsx` and `OrganizationDetailPage.tsx`

---

## Phase 2: Storage & Space Optimization (Zones, Bins, Racks for General Inventory)

### Database Tables

```text
warehouse_zones
  id, organization_id, store_id, zone_code, zone_name, zone_type (receiving, storage, staging, shipping, cold, hazardous), 
  temperature_range, capacity_info (jsonb), is_active, created_at, updated_at

warehouse_bins
  id, organization_id, store_id, zone_id (FK warehouse_zones), rack_id (FK store_racks, nullable),
  bin_code, bin_type (shelf, pallet, floor, cold), max_weight, max_volume,
  current_weight, current_volume, is_occupied, is_active, created_at, updated_at

inventory_bin_assignments
  id, organization_id, store_id, bin_id (FK warehouse_bins), item_id (FK inventory_items, nullable),
  medicine_id (FK medicines, nullable), stock_id (FK inventory_stock, nullable),
  quantity, assigned_at, assigned_by
```

Extends existing `store_racks` table (already has rack_code, section, capacity_info).

### Frontend Pages (under `/app/inventory/warehouse/`)

- `WarehouseZonesPage.tsx` -- CRUD for zones per store
- `WarehouseBinsPage.tsx` -- CRUD for bins, visual grid/map
- `BinAssignmentsPage.tsx` -- assign items to bins, search by item to find location
- `StorageMapPage.tsx` -- visual warehouse layout showing zone utilization

---

## Phase 3: Receiving & Put-Away Workflow

### Database Tables

```text
putaway_tasks
  id, organization_id, store_id, grn_id (FK goods_received_notes),
  item_id (nullable), medicine_id (nullable), stock_id,
  quantity, suggested_bin_id (FK warehouse_bins), actual_bin_id (FK warehouse_bins, nullable),
  status (pending, in_progress, completed, skipped),
  assigned_to (FK profiles, nullable), priority (integer),
  started_at, completed_at, notes, created_at, updated_at
```

### Logic

- When a GRN is verified, auto-generate `putaway_tasks` for each accepted line item
- Suggest bin based on: existing item location > zone type match > available capacity
- Worker picks up task, scans/selects actual bin, marks complete
- On completion, create `inventory_bin_assignment` record

### Frontend Pages

- `PutAwayWorklistPage.tsx` -- list of pending put-away tasks, filterable by store/priority
- `PutAwayTaskPage.tsx` -- individual task with suggested bin, actual bin selection, complete button

---

## Phase 4: Picking & Packing Optimization

### Database Tables

```text
pick_lists
  id, organization_id, store_id, pick_list_number (auto),
  source_type (requisition, transfer, order), source_id,
  status (draft, assigned, in_progress, completed, cancelled),
  assigned_to (FK profiles, nullable), priority,
  pick_strategy (fifo, fefo, zone_based),
  started_at, completed_at, notes, created_at, updated_at

pick_list_items
  id, pick_list_id (FK pick_lists), item_id (nullable), medicine_id (nullable),
  quantity_required, quantity_picked, bin_id (FK warehouse_bins, nullable),
  batch_number, expiry_date, pick_sequence (integer for optimized route),
  status (pending, picked, short, skipped), picked_at, notes

packing_slips
  id, organization_id, store_id, packing_slip_number (auto),
  pick_list_id (FK pick_lists), source_type, source_id,
  status (draft, packed, verified, shipped),
  packed_by (FK profiles, nullable), verified_by (FK profiles, nullable),
  total_items, total_weight, box_count,
  packed_at, verified_at, notes, created_at, updated_at

packing_slip_items
  id, packing_slip_id (FK packing_slips), item_id (nullable), medicine_id (nullable),
  quantity, batch_number, box_number, notes
```

### Logic

- When a requisition/transfer is approved, auto-generate a `pick_list`
- Pick sequence optimized by zone/aisle order
- FIFO/FEFO strategy determines which batch to pick from
- After picking complete, create `packing_slip`
- Packing verification step before dispatch

### Frontend Pages

- `PickListsPage.tsx` -- all pick lists with status filters
- `PickListDetailPage.tsx` -- picking interface with item checklist, bin locations, scan support
- `PackingSlipsPage.tsx` -- all packing slips
- `PackingSlipDetailPage.tsx` -- packing interface with box assignment, weight entry
- `PickingDashboardPage.tsx` -- stats: pending picks, avg pick time, accuracy rate

---

## Phase 5: Shipping & Dispatch Management

### Database Tables

```text
shipments
  id, organization_id, store_id, shipment_number (auto),
  packing_slip_id (FK packing_slips, nullable), transfer_id (FK store_stock_transfers, nullable),
  destination_type (branch, store, external, customer),
  destination_id (nullable), destination_address (jsonb),
  carrier_name, tracking_number, shipping_method (standard, express, same_day, pickup),
  status (pending, picked_up, in_transit, delivered, returned, cancelled),
  estimated_delivery, actual_delivery,
  total_weight, total_boxes, shipping_cost,
  dispatched_by (FK profiles), dispatched_at,
  received_by_name, received_at, proof_of_delivery (text, URL),
  notes, created_at, updated_at

shipment_tracking_events
  id, shipment_id (FK shipments), event_type (picked_up, in_transit, out_for_delivery, delivered, exception),
  event_description, location, event_time, created_by (nullable), created_at
```

### Logic

- Create shipment from approved packing slip or transfer
- Track status transitions with event log
- Mark delivered with optional proof-of-delivery upload

### Frontend Pages

- `ShipmentsPage.tsx` -- all shipments with status filters
- `ShipmentFormPage.tsx` -- create shipment from packing slip or transfer
- `ShipmentDetailPage.tsx` -- tracking timeline, status updates
- `DispatchDashboardPage.tsx` -- today's dispatches, pending, delivered stats

---

## Phase 6: Reporting & Analytics Enhancements

New report pages under `/app/inventory/reports/`:

- `WarehouseUtilizationReport.tsx` -- zone/bin utilization percentages, heatmap
- `PutAwayPerformanceReport.tsx` -- avg time, completion rate, worker performance
- `PickingAccuracyReport.tsx` -- pick accuracy, short picks, avg pick time
- `ShipmentReport.tsx` -- shipments by carrier, delivery performance, cost analysis
- `ABCAnalysisReport.tsx` -- classify items by value (A/B/C) for storage optimization

---

## Phase 7: Integration & API Settings Page

### Frontend Page

- `WarehouseIntegrationsPage.tsx` under `/app/inventory/integrations`
  - Show available integration types: Barcode/QR scanning, HL7/FHIR (future), Webhook configuration, CSV import/export
  - Webhook URL configuration (for outbound notifications on GRN verified, shipment dispatched, etc.)
  - API key management placeholder (edge function-backed)
  - CSV bulk import for items, stock, vendors

---

## Phase 8: Sidebar & Navigation Updates

### warehouse_admin Sidebar

```text
Dashboard -> /app/inventory
Receiving
  - GRN -> /app/inventory/grn
  - Put-Away Tasks -> /app/inventory/putaway
Storage
  - Zones & Bins -> /app/inventory/warehouse/zones
  - Storage Map -> /app/inventory/warehouse/map
  - Racks -> /app/inventory/warehouse/racks
Stock
  - Items -> /app/inventory/items
  - Stock Levels -> /app/inventory/stock
  - Categories -> /app/inventory/categories
Picking & Packing
  - Pick Lists -> /app/inventory/picking
  - Packing Slips -> /app/inventory/packing
Shipping
  - Shipments -> /app/inventory/shipping
  - Dispatch Dashboard -> /app/inventory/shipping/dashboard
Procurement
  - Purchase Orders -> /app/inventory/purchase-orders
  - Vendors -> /app/inventory/vendors
Transfers
  - Requisitions -> /app/inventory/requisitions
  - Store Transfers -> /app/inventory/transfers
Reports -> /app/inventory/reports
Integrations -> /app/inventory/integrations
Warehouse Settings
  - Warehouses -> /app/inventory/stores
  - Create Warehouse -> /app/inventory/stores/new
```

### warehouse_user Sidebar

Same as above but without Settings, Integrations, and Reports (operational subset only).

### Facility Type Isolation

When `facility_type = 'warehouse'`, hide all clinical modules: OPD, IPD, OT, Lab, Radiology, Pharmacy POS, Appointments, Emergency, Blood Bank, Certificates. Keep only: Inventory/Warehouse, HR, Finance/Accounting, Settings.

---

## Implementation Order

Due to the massive scope (20+ new pages, 8+ new DB tables, 2 new roles), this should be built in batches:

1. **Batch A**: DB migrations (new roles, new tables for zones/bins/putaway/pick/packing/shipments) + role config
2. **Batch B**: Storage & Space pages (Zones, Bins, Map) + Put-Away pages
3. **Batch C**: Picking & Packing pages
4. **Batch D**: Shipping & Dispatch pages
5. **Batch E**: Reports, Integrations page, facility_type isolation
6. **Batch F**: Translation keys for all new pages (en/ar/ur)

---

## Technical Notes

- All new tables will have RLS policies using existing `has_role()` and `has_permission()` security definer functions
- Auto-number generators follow existing pattern (triggers like `generate_pick_list_number()`)
- All hooks follow existing pattern: `useQuery`/`useMutation` with `@tanstack/react-query`
- New pages follow existing `PageHeader` + `Card` layout conventions
- Store context filtering maintained throughout (existing `StoreSelector` component reused)
- `warehouse_bins` location field enables future barcode/QR scanning integration

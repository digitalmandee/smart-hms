

# Warehouse Module: Complete Isolation + Missing Features

## Core Problem

The HR and Accounts modules are **shared** between hospital and warehouse with **zero facility-type awareness**. When a super admin creates an independent warehouse organization, users of that warehouse see:

- **HR Dashboard**: "Doctors" and "Nurses" quick-access cards (hospital-only)
- **Accounts Receivable**: Queries the `invoices` + `patients` table (irrelevant for warehouse -- warehouses have no patients)
- **Accounts Dashboard**: Shows "Accounts Receivable" linking to patient invoices
- **Attendance Sheet**: Works fine but uses hospital "departments" -- warehouse needs warehouse sections/zones
- No shift handover, safety incidents, or worker performance features

The plan ensures **hospital HR/Finance remains untouched** while warehouse gets its own adapted views.

---

## Strategy: Conditional Rendering, Not Separate Modules

Instead of duplicating entire modules, each shared page will check `facility_type` and conditionally show/hide sections. This means:

- Hospital users see exactly what they see today -- no changes
- Warehouse users see warehouse-adapted versions of the same pages
- Shared features (attendance, payroll, leaves, journal entries, payables) work for both

---

## Phase 1: HR Module Warehouse Adaptation

### 1A. HR Dashboard -- Hide Hospital Quick Access

**File:** `src/pages/app/hr/HRDashboard.tsx`

- Fetch `facility_type` from the organization (same pattern used in `InventoryDashboard.tsx`)
- When `facility_type === "warehouse"`:
  - Replace "Doctors" card with "Warehouse Staff" (links to `/app/hr/employees`)
  - Replace "Nurses" card with "Shift Schedule" (links to `/app/hr/attendance/duty-roster`)
  - Keep "Attendance" and "Payroll" cards as-is (they work for both)

**Hospital impact:** None. Hospital orgs continue seeing Doctors and Nurses cards.

### 1B. Shift Handover Log (New Feature)

Warehouse operations need shift-to-shift documentation of pending tasks, issues, and handover notes.

**New DB table:** `shift_handovers`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK |
| store_id | uuid | FK to stores |
| shift_date | date | |
| shift_type | text | morning, evening, night |
| handed_over_by | uuid | FK to profiles |
| received_by | uuid | FK to profiles |
| pending_receipts | text | |
| pending_dispatches | text | |
| issues_notes | text | |
| status | text | draft, completed |
| created_at | timestamptz | |

**New page:** `src/pages/app/hr/attendance/ShiftHandoverPage.tsx`
- List of handover records with date/shift filters
- Create new handover form with store selector
- Only visible for warehouse facility type (added to sidebar filter)

### 1C. Safety Incident Reporting (New Feature)

**New DB table:** `safety_incidents`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK |
| store_id | uuid | FK to stores |
| incident_date | date | |
| incident_type | text | slip_fall, forklift, hazmat, equipment, other |
| severity | text | minor, moderate, severe, critical |
| description | text | |
| reported_by | uuid | FK to profiles |
| location | text | Zone/Bin location |
| action_taken | text | |
| status | text | reported, investigating, resolved, closed |
| created_at | timestamptz | |

**New page:** `src/pages/app/hr/SafetyIncidentsPage.tsx`
- List with status/severity filters
- Create incident form
- Only visible for warehouse organizations

---

## Phase 2: Accounts Module Warehouse Adaptation

### 2A. Accounts Dashboard -- Conditional Links

**File:** `src/pages/app/accounts/AccountsDashboard.tsx`

- Fetch `facility_type`
- When warehouse:
  - Hide "Accounts Receivable" link (warehouses have no patient invoices)
  - Rename description to "Track warehouse financial operations"
  - Add "Warehouse Expenses" quick action linking to a filtered journal entries view
  - Keep: Chart of Accounts, Journal Entries, General Ledger, Payables (GRN-linked), Bank Accounts, Reports, Budgets

**Hospital impact:** None.

### 2B. Accounts Receivable -- Hide for Warehouse

**File:** `src/pages/app/accounts/ReceivablesPage.tsx`

- Add facility-type check at the top
- When warehouse: show a message "Accounts Receivable is not applicable for warehouse operations. Use Payables to track vendor payments."
- This prevents confusion since the page queries `invoices` + `patients`

**Alternative approach:** Block the route in `facility-type-filter.ts` by adding `/app/accounts/receivables` to warehouse blocked paths. This is cleaner and prevents the page from even appearing in the sidebar.

### 2C. Auto-Post Shipping Costs to Journal

**New DB trigger:** When a shipment status changes to `dispatched` and `shipping_cost > 0`:
- Debit: Shipping Expense account (auto-created via `get_or_create_default_account`)
- Credit: Cash/Bank account

### 2D. Auto-Post Stock Write-offs to Journal

**New DB trigger:** When a stock adjustment with `adjustment_type = 'write_off'` or `damaged` is created:
- Debit: Inventory Loss/Write-off Expense account
- Credit: Inventory Asset account

---

## Phase 3: Warehouse Orders Module (Outbound Trigger)

Currently, pick lists are created manually with no upstream order. This is the biggest workflow gap.

### 3A. New DB Tables

**`warehouse_orders`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK |
| store_id | uuid | FK |
| order_number | text | Auto-generated (WO-YYYYMMDD-XXXX) |
| customer_name | text | |
| customer_address | text | |
| customer_phone | text | |
| order_date | date | |
| required_date | date | |
| status | text | draft, confirmed, picking, packing, shipped, delivered, cancelled |
| notes | text | |
| created_by | uuid | FK to profiles |
| created_at / updated_at | timestamptz | |

**`warehouse_order_items`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| order_id | uuid | FK |
| item_id | uuid | FK to inventory_items |
| quantity | numeric | |
| picked_quantity | numeric | default 0 |
| packed_quantity | numeric | default 0 |
| notes | text | |

### 3B. New Pages

- `WarehouseOrdersListPage.tsx` -- list with status filters, search
- `WarehouseOrderFormPage.tsx` -- create/edit order with item lines
- `WarehouseOrderDetailPage.tsx` -- view order with status workflow, "Generate Pick List" button, fulfillment timeline

### 3C. Link Pick Lists to Orders

- Add `order_id` column to `pick_lists` table (nullable FK to warehouse_orders)
- When generating a pick list from an order, auto-fill items
- Show order reference on pick list detail page

---

## Phase 4: Dock/Gate Management

### 4A. New DB Tables

**`dock_appointments`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK |
| store_id | uuid | FK |
| appointment_type | text | inbound, outbound |
| dock_number | text | |
| vehicle_number | text | |
| driver_name | text | |
| driver_phone | text | |
| scheduled_time | timestamptz | |
| actual_arrival | timestamptz | |
| actual_departure | timestamptz | |
| po_id / shipment_id | uuid | Optional FK links |
| status | text | scheduled, arrived, loading, completed, cancelled |
| notes | text | |

**`gate_logs`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK |
| store_id | uuid | FK |
| vehicle_number | text | |
| driver_name | text | |
| entry_time | timestamptz | |
| exit_time | timestamptz | |
| purpose | text | delivery, pickup, transfer, maintenance |
| dock_appointment_id | uuid | Optional FK |
| logged_by | uuid | FK to profiles |

### 4B. New Pages

- `DockSchedulePage.tsx` -- timeline/list view of dock appointments
- `GateLogPage.tsx` -- entry/exit log with vehicle search

---

## Phase 5: GRN Quality Control Enhancement

### 5A. Add QC Status to GRN Items

- Add `qc_status` column to `grn_items` (values: `pending_qc`, `passed`, `failed`, `quarantine`)
- Default: `passed` (backward compatible -- existing GRNs work as before)

### 5B. Update GRN Detail Page

- Add QC action buttons on each GRN line item: "Pass QC", "Fail QC", "Quarantine"
- Items in `quarantine` or `pending_qc` are excluded from available stock for picking
- "Fail QC" auto-suggests creating an RTV

---

## Phase 6: Warehouse KPI Dashboard

**New page:** `src/pages/app/inventory/WarehouseKPIDashboard.tsx`

Aggregates data from existing tables:
- **Receiving Efficiency**: Average time from PO creation to GRN completion
- **Put-Away Rate**: Put-away tasks completed per day
- **Picking Accuracy**: Completed pick lists vs. total
- **Order Fulfillment Rate**: Orders shipped on time (from warehouse_orders)
- **Inventory Turnover**: Stock movement volume vs. average stock level
- **Space Utilization**: Bins with assignments vs. total bins

---

## Phase 7: Vendor Document Management

### 7A. New DB Table

**`vendor_documents`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK |
| vendor_id | uuid | FK |
| document_type | text | license, certificate, insurance, contract, other |
| document_name | text | |
| file_url | text | Supabase storage |
| expiry_date | date | nullable |
| status | text | active, expired, pending_renewal |
| uploaded_by | uuid | FK to profiles |
| created_at | timestamptz | |

### 7B. UI Changes

- Add "Documents" tab on `VendorDetailPage.tsx`
- Show expiry warning badges on `VendorsListPage.tsx` when documents are expiring within 30 days

---

## Sidebar / Navigation Updates

Add to `facility-type-filter.ts` for warehouse blocked paths:
- `/app/accounts/receivables` (patient invoices -- irrelevant)

Add new menu items (warehouse-only) for:
- Shift Handover (`/app/hr/attendance/shift-handover`)
- Safety Incidents (`/app/hr/safety-incidents`)
- Warehouse Orders (`/app/inventory/warehouse-orders`)
- Dock Schedule (`/app/inventory/dock-schedule`)
- Gate Log (`/app/inventory/gate-log`)
- Warehouse KPIs (`/app/inventory/warehouse-kpis`)

---

## Translation Keys

All new pages and labels will have keys in `en.ts`, `ur.ts`, and `ar.ts`.

---

## Summary of Hospital Impact

| Module | Hospital Change | Warehouse Change |
|--------|----------------|-----------------|
| HR Dashboard | None | Replace Doctors/Nurses with warehouse cards |
| HR Attendance | None | Add Shift Handover page |
| HR Safety | None (page not shown) | New Safety Incidents page |
| Accounts Dashboard | None | Hide Receivables link |
| Accounts Receivable | None | Blocked via facility filter |
| Accounts Payable | None | Works as-is (GRN-linked) |
| Journal Entries | None | New auto-post triggers for shipping + write-offs |
| Inventory | None | New Orders, Dock, Gate, KPI pages |
| Vendors | None | New Documents tab |

## Technical Details: Files Changed/Created

| File | Action |
|------|--------|
| `src/pages/app/hr/HRDashboard.tsx` | Edit -- add facility_type check for quick access cards |
| `src/pages/app/accounts/AccountsDashboard.tsx` | Edit -- conditionally hide Receivables for warehouse |
| `src/lib/facility-type-filter.ts` | Edit -- block `/app/accounts/receivables` for warehouse |
| `src/pages/app/hr/attendance/ShiftHandoverPage.tsx` | New |
| `src/pages/app/hr/SafetyIncidentsPage.tsx` | New |
| `src/pages/app/inventory/WarehouseOrdersListPage.tsx` | New |
| `src/pages/app/inventory/WarehouseOrderFormPage.tsx` | New |
| `src/pages/app/inventory/WarehouseOrderDetailPage.tsx` | New |
| `src/pages/app/inventory/DockSchedulePage.tsx` | New |
| `src/pages/app/inventory/GateLogPage.tsx` | New |
| `src/pages/app/inventory/WarehouseKPIDashboard.tsx` | New |
| `src/pages/app/inventory/GRNDetailPage.tsx` | Edit -- add QC actions |
| `src/pages/app/inventory/VendorDetailPage.tsx` | Edit -- add Documents tab |
| `src/pages/app/inventory/VendorsListPage.tsx` | Edit -- add expiry badges |
| `src/App.tsx` | Edit -- register new routes |
| `src/components/DynamicSidebar.tsx` | Edit -- add icon mappings |
| Migration SQL | New tables + triggers + menu_items inserts |
| `src/lib/i18n/translations/en.ts` | Edit -- new keys |
| `src/lib/i18n/translations/ur.ts` | Edit -- new keys |
| `src/lib/i18n/translations/ar.ts` | Edit -- new keys |

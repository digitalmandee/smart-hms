

# Warehouse Management System -- Full Implementation Plan

## Current State

The system has a basic `stores` table and transfer mechanism, but is severely limited:
- No rack/bin/shelf management for location tracking within warehouses
- No pharmacy-specific warehouse pages (pharmacy uses shared inventory routes)
- No separation between hospital and independent pharmacy warehouse contexts
- `store_id` exists on `medicine_inventory`, `inventory_stock`, `purchase_orders`, and `goods_received_notes` but is nullable and largely unused in the pharmacy module
- No product-to-rack mapping or location visibility

## What Will Be Built

### Phase 1: Database Schema (Rack Management + Store Enhancements)

**New table: `store_racks`**
- `id`, `store_id` (FK to stores), `organization_id`, `rack_code` (e.g., "R-01"), `rack_name` (e.g., "Rack 1 - Cardiovascular"), `section` (optional grouping like "Aisle A"), `capacity_info` (jsonb), `is_active`, timestamps
- RLS: organization-scoped

**New table: `medicine_rack_assignments`**
- `id`, `medicine_id` (FK to medicines), `store_id` (FK to stores), `rack_id` (FK to store_racks), `organization_id`, `shelf_number` (text, e.g., "Shelf 3"), `position` (text, e.g., "Left"), `notes`, timestamps
- Unique constraint on (medicine_id, store_id) -- one medicine has one rack position per store
- RLS: organization-scoped

**Alter `stores` table:**
- Add `context` column (text, default 'hospital') -- values: 'hospital', 'pharmacy'
- This separates hospital warehouses from independent pharmacy warehouses

### Phase 2: Pharmacy Warehouse Pages (New Routes)

Create dedicated pharmacy warehouse pages that are completely separate from the hospital inventory module:

1. **Pharmacy Warehouses List** (`/app/pharmacy/warehouses`)
   - Lists only warehouses where `context = 'pharmacy'` (or `store_type = 'pharmacy'`)
   - Create, edit, activate/deactivate warehouses
   - Shows rack count per warehouse

2. **Pharmacy Warehouse Detail** (`/app/pharmacy/warehouses/:id`)
   - Overview of a single warehouse: stock summary, rack layout, recent movements
   - Quick links to manage racks, view stock by rack

3. **Rack Management** (`/app/pharmacy/warehouses/:id/racks`)
   - CRUD for racks within a warehouse
   - Visual list: rack code, name, section, assigned medicine count
   - Assign medicines to racks from this page

4. **Product-to-Rack Mapping** (`/app/pharmacy/rack-assignments`)
   - Full-page view: which medicine is on which rack in which warehouse
   - Searchable, filterable table
   - Bulk assign/reassign medicines to racks
   - Clear visibility: Medicine Name | Warehouse | Rack | Shelf | Position

### Phase 3: Integrate Warehouse into Pharmacy Inventory Flow

- **Stock Entry Page**: Add rack selector when adding stock -- auto-suggest rack based on medicine's rack assignment
- **Inventory Page**: Show rack/location column in the inventory table
- **POS Terminal**: Show rack location next to medicine name during search (helps staff locate items quickly)
- **Stock Movements**: Filter by warehouse/rack

### Phase 4: Hospital vs Pharmacy Separation

- Hospital inventory module (`/app/inventory/stores`) shows only `context = 'hospital'` warehouses
- Pharmacy module (`/app/pharmacy/warehouses`) shows only `context = 'pharmacy'` warehouses
- Inter-store transfers remain available within the same context (hospital-to-hospital, pharmacy-to-pharmacy)
- Purchase Orders and GRN are already store-aware -- they continue working as-is
- Independent pharmacy users see only pharmacy warehouses in their StoreSelector

### Phase 5: Sidebar & Navigation Updates

Update the pharmacist sidebar to include:
```
Warehouses
  -- My Warehouses      /app/pharmacy/warehouses
  -- Create Warehouse   /app/pharmacy/warehouses/new
  -- Rack Assignments   /app/pharmacy/rack-assignments
  -- Store Transfers    /app/pharmacy/transfers
```

Remove the current links to `/app/inventory/stores` and `/app/inventory/transfers` from the pharmacist sidebar.

---

## Technical Details

### Database Migration SQL

```sql
-- 1. Store racks table
CREATE TABLE public.store_racks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  rack_code text NOT NULL,
  rack_name text,
  section text,
  capacity_info jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, rack_code)
);

ALTER TABLE public.store_racks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage racks in their org"
  ON public.store_racks FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 2. Medicine-to-rack assignments
CREATE TABLE public.medicine_rack_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  rack_id uuid NOT NULL REFERENCES public.store_racks(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  shelf_number text,
  position text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(medicine_id, store_id)
);

ALTER TABLE public.medicine_rack_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rack assignments in their org"
  ON public.medicine_rack_assignments FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 3. Add context column to stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT 'hospital';
```

### New Files to Create

| File | Purpose |
|---|---|
| `src/hooks/useStoreRacks.ts` | CRUD hooks for racks and rack assignments |
| `src/pages/app/pharmacy/WarehousesListPage.tsx` | Pharmacy warehouse list |
| `src/pages/app/pharmacy/WarehouseDetailPage.tsx` | Single warehouse overview |
| `src/pages/app/pharmacy/WarehouseFormPage.tsx` | Create/edit pharmacy warehouse |
| `src/pages/app/pharmacy/RackManagementPage.tsx` | Manage racks within a warehouse |
| `src/pages/app/pharmacy/RackAssignmentsPage.tsx` | Product-to-rack mapping view |
| `src/components/pharmacy/RackSelector.tsx` | Reusable rack dropdown |
| `src/components/pharmacy/RackLocationBadge.tsx` | Shows rack info inline |

### Files to Modify

| File | Change |
|---|---|
| `src/config/role-sidebars.ts` | Update pharmacist sidebar with pharmacy warehouse routes |
| `src/App.tsx` | Add new pharmacy warehouse routes |
| `src/pages/app/pharmacy/StockEntryPage.tsx` | Add rack selector to stock entry form |
| `src/pages/app/pharmacy/InventoryPage.tsx` | Add rack/location column to inventory table |
| `src/components/inventory/StoreSelector.tsx` | Filter by context (hospital vs pharmacy) |
| `src/hooks/useStores.ts` | Add context filter parameter |
| `src/pages/app/inventory/StoresListPage.tsx` | Filter to show only hospital-context stores |

### Scope Note

This is a large feature spanning 8+ new files and 7+ modified files plus database migrations. Given the scope, I recommend implementing it in 2-3 iterations:

**Iteration 1** (this plan): Database schema + Pharmacy warehouse pages + Rack management + Rack assignments + Navigation updates

**Iteration 2** (follow-up): Integration into POS terminal (show rack location), Stock Entry rack auto-suggest, advanced rack analytics


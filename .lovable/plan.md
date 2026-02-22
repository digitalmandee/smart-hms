
# Remaining Work: GRN QC Actions, Vendor Documents, Navigation Integration

## What's Done
- All 8 new pages created and routes registered in App.tsx
- All DB tables created (shift_handovers, safety_incidents, warehouse_orders, dock_appointments, gate_logs, vendor_documents, qc_status on grn_items)
- Translations added for page titles
- Warehouse KPIs menu item inserted

## What's Remaining

### 1. GRN Detail Page -- Add QC Action Buttons

**File:** `src/pages/app/inventory/GRNDetailPage.tsx`

The `qc_status` column exists on `grn_items` but the detail page has no QC UI. Add:

- A new "QC Status" column in the items table showing current qc_status per item
- Three action buttons per item row (only visible when GRN is in "draft" or "pending_verification" status):
  - "Pass QC" -- sets `qc_status = 'passed'`
  - "Fail QC" -- sets `qc_status = 'failed'`
  - "Quarantine" -- sets `qc_status = 'quarantine'`
- A Supabase mutation to update `grn_items.qc_status` by item ID
- Color-coded badges: passed (green), failed (red), quarantine (amber), pending_qc (gray)

### 2. Vendor Detail Page -- Add Documents Tab

**File:** `src/pages/app/inventory/VendorDetailPage.tsx`

The `vendor_documents` table exists but there's no UI. Add:

- A new "Documents" card/section after the Purchase Order History card
- List of documents with columns: Document Name, Type, Expiry Date, Status
- "Upload Document" button opening a dialog with fields: document_name, document_type (license/certificate/insurance/contract/other), expiry_date, file upload
- File upload to Supabase storage bucket `vendor-documents`
- Expiry badge (red if expired, amber if expiring within 30 days)
- A new hook or inline queries for CRUD on `vendor_documents`

### 3. Insert Missing menu_items into Database

Insert menu items for the 5 missing navigation entries:
- Shift Handover (`/app/hr/attendance/shift-handover`) -- under HR > Attendance parent
- Safety Incidents (`/app/hr/safety-incidents`) -- under HR parent
- Warehouse Orders (`/app/inventory/warehouse-orders`) -- under Inventory parent
- Dock Schedule (`/app/inventory/dock-schedule`) -- under Inventory parent
- Gate Log (`/app/inventory/gate-log`) -- under Inventory parent

Each will have `required_module = 'warehouse'` so they only appear for warehouse organizations.

### 4. DynamicSidebar -- Add Missing Icon Mappings

**File:** `src/components/DynamicSidebar.tsx`

Add icon imports and mappings for the new menu items:
- `Anchor` for Dock Schedule
- `DoorOpen` (already imported) for Gate Log
- `ShieldAlert` for Safety Incidents
- `ClipboardCheck` (already imported) for Shift Handover
- `ShoppingCart` (already imported) for Warehouse Orders

Add translation mappings in the `nameToTranslationKey` map:
- "Shift Handover" -> "nav.shiftHandover"
- "Safety Incidents" -> "nav.safetyIncidents"
- "Warehouse Orders" -> "nav.warehouseOrders"
- "Dock Schedule" -> "nav.dockSchedule"
- "Gate Log" -> "nav.gateLog"

### 5. Vendor Documents Storage Bucket

Create a `vendor-documents` storage bucket via migration with RLS policies allowing authenticated users to upload/read documents for their organization.

### 6. Translations for New Sidebar Items

Add missing keys to `en.ts`, `ar.ts`, `ur.ts`:
- `nav.shiftHandover`
- `nav.safetyIncidents`  
- `nav.warehouseOrders`
- `nav.dockSchedule`
- `nav.gateLog`

## Technical Sequencing

1. DB operations first: Insert menu_items + create storage bucket
2. Then in parallel: GRN QC UI, Vendor Documents UI, DynamicSidebar icons, translations



# Fix: Add Prescription Queue to Pharmacy Sidebar

## Problem

The pharmacist sidebar is missing the **Prescription Queue** menu item. This is where OPD/IPD/Surgery prescription orders appear for dispensing. The page exists (`/app/pharmacy/queue`) and works correctly (shows OPD/IPD source badges, dispense buttons), but pharmacists have no way to navigate to it from the sidebar.

## Solution

Add "Prescription Queue" as a top-level menu item in the pharmacist sidebar, positioned right after Dashboard (before Dispensing). This is the primary workflow entry point — pharmacists check the queue for incoming OPD/IPD/Surgery medication orders, then dispense them.

## Technical Details

**File: `src/config/role-sidebars.ts`**
- Add `{ name: "Prescription Queue", path: "/app/pharmacy/queue", icon: "ClipboardList" }` after Dashboard (line 554) in the `pharmacist` section
- Also add it to the `ot_pharmacist` section

**Files: `en.ts`, `ar.ts`, `ur.ts`**
- Ensure `nav.prescriptionQueue` key exists (it likely already does based on DynamicSidebar mappings)

## Files Changed
- `src/config/role-sidebars.ts` — add Prescription Queue to pharmacist and ot_pharmacist sidebars




# Complete Warehouse End-to-End Workflow Enhancement

## Current State vs Required State

After thorough audit, here is what EXISTS and what is MISSING:

### What Already Works

| Module | Status | Details |
|--------|--------|---------|
| Items, Categories, Vendors | DONE | Full CRUD |
| Purchase Orders | DONE | Create from vendor, items builder, status tracking |
| GRN (Goods Receipt) | DONE | Create from PO, batch/expiry, verify, post, journal entry |
| Put-Away | DONE | Auto-generated from GRN, bin selection, task completion |
| Storage (Zones, Bins, Map) | DONE | Full hierarchy |
| Requisitions (Issue Requests) | DONE | Department requests with approval |
| Store Transfers (Move Out/In) | DONE | Create, dispatch, receive |
| Pick Lists | DONE | Create, pick items, partial pick, complete |
| Packing Slips | DONE | Create, verify, link to pick list |
| Shipping & Dispatch | DONE | Shipments, tracking events, dispatch dashboard |
| Stock Adjustments | PARTIAL | Hook exists, but NO dedicated page -- only shown in Item Detail |
| HR & Workforce | DONE | Linked, org-scoped |
| Reports | DONE | 8 report pages created |

### What is MISSING (Gaps in the End-to-End Flow)

| # | Gap | Impact |
|---|-----|--------|
| 1 | **Purchase Request (PR) Module** | No way to raise a purchase request before PO. Currently POs are created directly. Missing: PR form, PR list, PR approval, PR-to-PO conversion |
| 2 | **Stock Adjustments Page** | Adjustments exist as a hook but no standalone list/form page. Users can't do write-offs, expired stock removal, or damage adjustments from the menu |
| 3 | **QC / Quality Check on GRN** | GRN goes Draft -> Verified -> Posted. No explicit QC step with accept/reject per item with reasons |
| 4 | **Approval Workflow UI** | Requisitions and POs have `approved_by` columns but no approval UI (approve/reject buttons with notes) |
| 5 | **Reorder Alerts / Auto PR** | No low-stock alert system that suggests or auto-creates purchase requests |
| 6 | **Invoice Verification Step** | GRN has invoice_number and invoice_amount fields, but no separate invoice verification workflow (price variance check, tax verification) |

---

## Implementation Plan (6 Steps)

### Step 1: Purchase Request Module (NEW)

Create the full PR workflow: the upstream trigger for procurement.

**Database:** Create `purchase_requests` and `purchase_request_items` tables.

```text
purchase_requests:
  id, organization_id, branch_id, store_id,
  pr_number (auto-generated trigger),
  requested_by, department, priority,
  status (draft / pending_approval / approved / rejected / converted),
  approved_by, approved_at, rejection_reason,
  notes, created_at, updated_at

purchase_request_items:
  id, purchase_request_id, item_id, medicine_id,
  quantity_requested, current_stock, reorder_level,
  estimated_unit_cost, notes
```

**New Files:**
- `src/hooks/usePurchaseRequests.ts` -- CRUD hooks
- `src/pages/app/inventory/PRListPage.tsx` -- List with status filters
- `src/pages/app/inventory/PRFormPage.tsx` -- Create PR form with item selection, shows current stock vs reorder level
- `src/pages/app/inventory/PRDetailPage.tsx` -- Detail with Approve/Reject buttons, Convert to PO button

**Flow:** Department user creates PR -> Admin/Manager approves -> "Convert to PO" button pre-fills PO form with PR items and suggested vendor.

### Step 2: Stock Adjustments Page (NEW)

Create a dedicated page for stock adjustments (write-offs, expired, damaged, consumption).

**New Files:**
- `src/pages/app/inventory/StockAdjustmentsPage.tsx` -- List of all adjustments with filters (type, date range)
- `src/pages/app/inventory/StockAdjustmentFormPage.tsx` -- Form to create adjustment: select item, type (expired/damaged/write_off/increase/decrease), quantity, reason, approval

**Adjustment Types:** expired, damaged, write_off, internal_usage, increase, decrease, transfer_in, transfer_out

### Step 3: Approval Workflow on Requisitions and POs

Enhance existing detail pages with approve/reject UI:

**Updated Files:**
- `src/pages/app/inventory/RequisitionDetailPage.tsx` -- Add Approve/Reject buttons for admin, show approval status banner
- `src/pages/app/inventory/PODetailPage.tsx` -- Add Approve button, approved_by tracking
- `src/hooks/useRequisitions.ts` -- Add `useApproveRequisition`, `useRejectRequisition` mutations
- `src/hooks/usePurchaseOrders.ts` -- Add `useApprovePO` mutation

### Step 4: GRN Quality Check Enhancement

Add QC step between GRN creation and verification:

**Database:** Add `qc_status`, `qc_notes`, `qc_checked_by`, `qc_checked_at` columns to `goods_received_notes`. Add `qc_status`, `rejection_reason` to `grn_items`.

**Updated Files:**
- `src/pages/app/inventory/GRNDetailPage.tsx` -- Add QC section: per-item accept/reject with reason, QC notes, QC approval button
- `src/hooks/useGRN.ts` -- Add `useQCApproveGRN` mutation

**Flow:** GRN Created (draft) -> QC Check (per item accept/reject) -> QC Approved -> Verify & Update Stock -> Post

### Step 5: Reorder Alert System

Auto-detect items below reorder level and suggest PRs:

**New Files:**
- `src/pages/app/inventory/ReorderAlertsPage.tsx` -- Dashboard showing all items below reorder level, with "Create PR" button that pre-fills a PR with the deficit quantities
- `src/hooks/useReorderAlerts.ts` -- Query comparing current stock vs reorder_level

### Step 6: Sidebar & Route Registration

**Updated Files:**
- `src/App.tsx` -- Register ~8 new routes (PR list/form/detail, adjustments list/form, reorder alerts)
- `src/config/role-sidebars.ts` -- Add new menu items under warehouse_admin and warehouse_user:
  - Procurement section: add "Purchase Requests" and "Reorder Alerts"
  - Stock section: add "Stock Adjustments"

---

## Updated End-to-End Flow After Implementation

```text
Reorder Alert / Manual Request
       |
  Purchase Request (PR)
       |
  Approval (Admin)
       |
  Convert to Purchase Order (PO)
       |
  Vendor ships goods
       |
  GRN (Goods Receipt)
       |
  Quality Check (Accept/Reject per item)
       |
  Verify & Update Stock
       |
  Post to Accounts (Auto journal entry)
       |
  Put-Away (System suggests bin location)
       |
  Storage (Zones / Racks / Bins)
       |
  Requisition / Issue Request (Department)
       |
  Approval (Admin)
       |
  Pick List Generated (FEFO strategy)
       |
  Picker picks items, confirms batch
       |
  Packing (Assign to boxes, weight)
       |
  Shipment / Dispatch
       |
  Stock Adjustment (Expired / Damaged / Write-off)
       |
  Reports & Analytics
```

## Files Summary

| File | Action |
|------|--------|
| SQL Migration | NEW tables: purchase_requests, purchase_request_items; ALTER goods_received_notes (QC columns), ALTER grn_items (QC columns) |
| `src/hooks/usePurchaseRequests.ts` | NEW |
| `src/hooks/useReorderAlerts.ts` | NEW |
| `src/pages/app/inventory/PRListPage.tsx` | NEW |
| `src/pages/app/inventory/PRFormPage.tsx` | NEW |
| `src/pages/app/inventory/PRDetailPage.tsx` | NEW |
| `src/pages/app/inventory/StockAdjustmentsPage.tsx` | NEW |
| `src/pages/app/inventory/StockAdjustmentFormPage.tsx` | NEW |
| `src/pages/app/inventory/ReorderAlertsPage.tsx` | NEW |
| `src/pages/app/inventory/RequisitionDetailPage.tsx` | ENHANCED (approval UI) |
| `src/pages/app/inventory/PODetailPage.tsx` | ENHANCED (approval UI) |
| `src/pages/app/inventory/GRNDetailPage.tsx` | ENHANCED (QC section) |
| `src/hooks/useRequisitions.ts` | ENHANCED (approve/reject) |
| `src/hooks/usePurchaseOrders.ts` | ENHANCED (approve) |
| `src/hooks/useGRN.ts` | ENHANCED (QC approve) |
| `src/App.tsx` | Add ~8 new routes |
| `src/config/role-sidebars.ts` | Add PR, Adjustments, Reorder Alerts to warehouse sidebar |


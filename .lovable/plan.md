
# Warehouse Demo Seed Data & Test Cases Plan

## Overview

The warehouse organization (`a1111111-1111-1111-1111-111111111111`) currently has 3 stores but **zero** data across all operational tables. This plan seeds comprehensive demo data covering the full end-to-end workflow and creates a detailed test case document.

---

## Seed Data Summary

| Entity | Count | Details |
|--------|-------|---------|
| Inventory Categories | 5 | Pharmaceuticals, Surgical, Consumables, Equipment, Lab Reagents |
| Vendors | 4 | Pakistani pharma/medical suppliers |
| Inventory Items | 15 | Medicines, surgical items, consumables with reorder levels |
| Warehouse Zones | 4 | General, Cold Storage, Controlled, Bulk |
| Warehouse Bins | 12 | 3 bins per zone across stores |
| Purchase Requests | 3 | 1 draft, 1 approved, 1 converted |
| Purchase Request Items | 8 | Multi-item PRs |
| Purchase Orders | 4 | 1 draft, 1 approved, 1 partially received, 1 received |
| Purchase Order Items | 12 | Multi-item POs |
| Goods Received Notes | 3 | 1 draft, 1 verified, 1 posted |
| GRN Items | 9 | With batch numbers and expiry dates |
| Inventory Stock | 15 | Current stock levels from received GRNs |
| Put-Away Tasks | 4 | 2 completed, 1 in-progress, 1 pending |
| Stock Requisitions | 3 | 1 pending, 1 approved, 1 issued |
| Requisition Items | 8 | Multi-item requisitions |
| Store Stock Transfers | 2 | 1 in-transit, 1 received |
| Transfer Items | 5 | Multi-item transfers |
| Pick Lists | 3 | 1 pending, 1 in-progress, 1 completed |
| Pick List Items | 8 | With bin locations and batch numbers |
| Packing Slips | 2 | 1 pending, 1 verified |
| Packing Slip Items | 5 | With box assignments |
| Shipments | 2 | 1 dispatched, 1 delivered |
| Tracking Events | 4 | Pickup, in-transit, delivered events |
| Stock Adjustments | 2 | 1 expired write-off, 1 damage |

---

## Implementation Steps

### Step 1: Insert Categories, Vendors, Items

Insert 5 inventory categories, 4 vendors (with Pakistani names/addresses), and 15 inventory items with proper reorder levels (some items will be below reorder level to trigger alerts).

### Step 2: Insert Zones, Bins

Insert 4 warehouse zones across the Main Distribution Center store, and 12 bins (3 per zone) with varying capacities.

### Step 3: Insert Purchase Requests

Insert 3 PRs in different statuses (draft, approved, converted) with 2-3 items each. The "converted" PR links to a PO.

### Step 4: Insert Purchase Orders

Insert 4 POs in different statuses with items. The "received" PO links to completed GRNs.

### Step 5: Insert GRNs and Inventory Stock

Insert 3 GRNs with items including batch numbers and expiry dates. For verified/posted GRNs, insert corresponding inventory_stock records. Some items will have stock below reorder level for alert testing.

### Step 6: Insert Put-Away Tasks

Insert 4 put-away tasks linked to GRN items and bins in various statuses.

### Step 7: Insert Requisitions, Transfers, Pick Lists, Packing, Shipments

Insert the outbound workflow chain:
- Requisitions with items
- Transfers with items
- Pick lists with items (linked to requisitions)
- Packing slips with items (linked to pick lists)
- Shipments with tracking events (linked to packing slips)

### Step 8: Insert Stock Adjustments

Insert 2 stock adjustments (expired, damaged) for audit trail testing.

### Step 9: Create Test Cases Document

Create `docs/WAREHOUSE_TEST_CASES.md` with detailed manual QA test cases covering:
- Login as warehouse.admin@healthos.demo / Demo@123
- Each module workflow step-by-step
- Expected results for every action

---

## Test Cases Preview

### Test Case Categories

**TC-1: Dashboard & Navigation**
- Login, verify sidebar shows warehouse modules only
- Verify dashboard metrics display

**TC-2: Purchase Request Flow**
- View PR list (3 PRs visible)
- Create new PR, add items, submit for approval
- Approve/Reject PR
- Convert approved PR to PO

**TC-3: Purchase Order Flow**
- View PO list (4 POs visible)
- Create new PO from vendor
- Approve PO
- Track PO status changes

**TC-4: Receiving (GRN) Flow**
- View GRN list (3 GRNs visible)
- Create GRN from PO
- Enter batch numbers, expiry dates
- QC check per item (accept/reject)
- Verify GRN (updates stock)
- Post GRN (creates journal entry)

**TC-5: Put-Away Flow**
- View put-away worklist
- Assign bin location
- Complete put-away task

**TC-6: Storage & Zones**
- View zones and bins
- Check bin utilization
- View storage map

**TC-7: Requisition & Issue Flow**
- View requisitions
- Create requisition from department
- Approve requisition
- Issue stock

**TC-8: Transfer (Move Out/In)**
- View transfers
- Create transfer between stores
- Dispatch transfer
- Receive transfer at destination

**TC-9: Picking & Packing**
- View pick lists
- Create pick list (FEFO strategy)
- Start picking, scan items
- Partial pick, skip item
- Complete pick list
- Create packing slip from pick list
- Assign items to boxes
- Verify packing slip

**TC-10: Shipping & Dispatch**
- Create shipment from packing slip
- Add carrier and tracking info
- Dispatch shipment
- Add tracking events
- Mark delivered

**TC-11: Stock Adjustments**
- View adjustment history
- Create expired stock write-off
- Create damage adjustment
- Verify stock reduced

**TC-12: Reorder Alerts**
- View reorder alerts page
- Verify items below reorder level shown
- Create PR from alert

**TC-13: Reports**
- Stock Valuation Report
- Stock Movement Report
- ABC Analysis
- Expiry Report
- All 8 report pages render with data

---

## Technical Details

### Data Insertion Method

All data will be inserted via the Supabase insert tool (not migrations) since this is data, not schema changes. UUIDs will be pre-generated for cross-referencing between tables.

### Key Relationships

```text
PR (converted) --> PO (received) --> GRN (posted) --> Inventory Stock
                                                   --> Put-Away Tasks --> Bins
Requisition (issued) --> Pick List (completed) --> Packing Slip (verified) --> Shipment (delivered)
Transfer (received) --> Transfer Items
```

### Files Created

| File | Action |
|------|--------|
| `docs/WAREHOUSE_TEST_CASES.md` | NEW -- Complete manual QA test cases |

### No Code Changes Required

All seed data is inserted directly into existing tables. No schema or code modifications needed.

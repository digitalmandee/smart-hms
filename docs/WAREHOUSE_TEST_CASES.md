# Warehouse Module - Manual QA Test Cases

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Warehouse Admin | `warehouse.admin@healthos.demo` | `Demo@123` |
| Warehouse User | `warehouse.user@healthos.demo` | `Demo@123` |

**Gate Password:** `1212`

---

## Seed Data Summary

| Entity | Count | Key Details |
|--------|-------|-------------|
| Inventory Categories | 5 | Pharmaceuticals, Surgical, Consumables, Equipment, Lab Reagents |
| Vendors | 4 | Mediline Pharma, Surgical Plus, LabChem, MedEquip |
| Inventory Items | 15 | Medicines, surgical, consumables, equipment, lab items |
| Warehouse Zones | 4 | General, Cold Storage, Controlled, Bulk |
| Warehouse Bins | 12 | 3 bins per zone |
| Purchase Requests | 3 | 1 draft, 1 approved, 1 converted |
| Purchase Orders | 4 | 1 draft, 1 approved, 1 partially received, 1 received |
| GRNs | 3 | 1 draft, 1 verified, 1 verified |
| Inventory Stock | 15 | Various quantities, some below reorder level |
| Put-Away Tasks | 4 | 2 completed, 1 in-progress, 1 pending |
| Stock Requisitions | 3 | 1 pending, 1 approved, 1 issued |
| Store Transfers | 2 | 1 in-transit, 1 received |
| Pick Lists | 3 | 1 completed, 1 in-progress, 1 pending |
| Packing Slips | 2 | 1 verified, 1 pending |
| Shipments | 2 | 1 dispatched, 1 delivered |
| Stock Adjustments | 2 | 1 expired, 1 damaged |

### Items Below Reorder Level (Should Trigger Alerts)

| Item | Current Stock | Reorder Level | Deficit |
|------|--------------|---------------|---------|
| Amoxicillin 250mg | 15 | 80 | 65 |
| Normal Saline 0.9% | 50 | 200 | 150 |
| Surgical Masks N95 | 50 | 150 | 100 |
| Blood Glucose Strips | 10 | 80 | 70 |
| CBC Reagent Kit | 5 | 25 | 20 |
| Digital Thermometer | 8 | 20 | 12 |
| Pulse Oximeter | 3 | 10 | 7 |
| Urine Test Strips | 8 | 50 | 42 |

---

## TC-1: Dashboard & Navigation

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 1.1 | Login | Go to app → Enter `warehouse.admin@healthos.demo` / `Demo@123` | Login successful, redirected to warehouse dashboard |
| 1.2 | Sidebar modules | Check left sidebar | Shows: Dashboard, Procurement (PRs, POs, Reorder Alerts), Receiving (GRNs, Put-Away), Storage (Zones, Bins, Map), Stock (Items, Adjustments, Requisitions), Outbound (Transfers, Pick Lists, Packing, Shipping), Reports |
| 1.3 | Dashboard metrics | View dashboard | Shows item count, low stock alerts, pending GRNs, pending requisitions |

---

## TC-2: Purchase Request Flow

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 2.1 | View PR List | Navigate to `/app/warehouse/purchase-requests` | See 3 PRs: 1 draft (PR-20260101-0001), 1 approved (PR-20260115-0001), 1 converted (PR-20260201-0001) |
| 2.2 | View PR Detail | Click on draft PR | See 3 items: Paracetamol (200), Amoxicillin (100), Normal Saline (300) with current stock and reorder levels |
| 2.3 | Create New PR | Click "New Purchase Request" → Select store → Add items → Set priority → Save | PR created with auto-generated number, status = draft |
| 2.4 | Submit for Approval | Open draft PR → Click "Submit for Approval" | Status changes to pending_approval |
| 2.5 | Approve PR | Open pending PR → Click "Approve" | Status = approved, approved_by and approved_at set |
| 2.6 | Reject PR | Open pending PR → Click "Reject" → Enter reason | Status = rejected, rejection_reason saved |
| 2.7 | Convert to PO | Open approved PR → Click "Convert to PO" | Redirected to PO form pre-filled with PR items |
| 2.8 | Filter by Status | Use status filter dropdown | Only PRs matching selected status shown |

---

## TC-3: Purchase Order Flow

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 3.1 | View PO List | Navigate to `/app/warehouse/purchase-orders` | See 4 POs in various statuses |
| 3.2 | View PO Detail | Click PO-20260201-0001 (partially received) | See 3 items with quantity_received vs quantity ordered |
| 3.3 | Create PO | Click "New PO" → Select vendor → Add items → Save | PO created with auto-number, status = draft |
| 3.4 | Approve PO | Open draft PO → Click "Approve" | Status = approved, approved_by set |
| 3.5 | Create GRN from PO | Open approved/partially received PO → Click "Create GRN" | GRN form opens pre-filled with PO items |
| 3.6 | Vendor filter | Filter POs by vendor | Only POs for selected vendor shown |
| 3.7 | Status filter | Filter by status | Correct POs displayed per status |

---

## TC-4: Receiving (GRN) Flow

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 4.1 | View GRN List | Navigate to `/app/warehouse/grn` | See 3 GRNs: 1 draft, 2 verified |
| 4.2 | View GRN Detail | Click GRN-20260210-0001 (draft) | See 3 items with batch numbers, quantities, rejection info |
| 4.3 | Create GRN | From PO → Create GRN → Enter received qty, batch, expiry | GRN created with auto-number |
| 4.4 | QC Check | Open draft GRN → QC section → Accept/Reject per item | Items marked accepted/rejected with reasons |
| 4.5 | QC Approve | After per-item QC → Click "Approve QC" | qc_status = approved, qc_checked_by set |
| 4.6 | Verify GRN | Open QC-approved GRN → Click "Verify" | Status = verified, stock updated in inventory_stock |
| 4.7 | Post GRN | Open verified GRN → Click "Post" | Journal entry created, accounts updated |
| 4.8 | Rejected items | Check GI with quantity_rejected > 0 | Rejection reason visible, qty_accepted = qty_received - qty_rejected |

---

## TC-5: Put-Away Flow

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 5.1 | View Put-Away List | Navigate to `/app/warehouse/putaway` | See 4 tasks: 2 completed, 1 in-progress, 1 pending |
| 5.2 | Pending task | Click pending task (Paracetamol) | Shows suggested bin GEN-A1-01, quantity 50, batch PCM-2026-G01 |
| 5.3 | Assign bin | Select a bin from dropdown → Confirm | assigned_bin_id updated |
| 5.4 | Complete task | Click "Complete" on in-progress task | Status = completed, completed_at set |
| 5.5 | Filter by status | Filter pending/in-progress/completed | Correct tasks shown |

---

## TC-6: Storage & Zones

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 6.1 | View Zones | Navigate to `/app/warehouse/zones` | See 4 zones: General, Cold Storage, Controlled, Bulk |
| 6.2 | Zone details | Click a zone | See zone type, temperature range (Cold: 2-8°C), bins in zone |
| 6.3 | View Bins | Navigate to `/app/warehouse/bins` | See 12 bins with capacity and occupancy |
| 6.4 | Bin utilization | Check bin details | current_occupancy/capacity shown as percentage |
| 6.5 | Storage Map | Navigate to `/app/warehouse/storage-map` | Visual map showing zones and bin layout |
| 6.6 | Create Zone | Click "Add Zone" → Fill form → Save | New zone created |
| 6.7 | Create Bin | Click "Add Bin" → Select zone → Fill capacity → Save | New bin created in selected zone |

---

## TC-7: Requisition & Issue Flow

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 7.1 | View Requisitions | Navigate to `/app/warehouse/requisitions` | See 3 requisitions: pending, approved, issued |
| 7.2 | View Detail | Click issued requisition REQ-20260215-0001 | See 3 items with qty_requested, qty_approved, qty_issued |
| 7.3 | Create Requisition | Click "New Requisition" → Select department → Add items → Save | Requisition created with auto-number |
| 7.4 | Approve Requisition | Open pending requisition → Click "Approve" | Status = approved, quantities approved |
| 7.5 | Reject Requisition | Open pending → Click "Reject" → Enter reason | Status = rejected |
| 7.6 | Issue Stock | Open approved requisition → Click "Issue" | Status = issued, stock reduced, pick list generated |
| 7.7 | Partial approval | Approve with reduced quantities | qty_approved < qty_requested |

---

## TC-8: Transfer (Move Out/In)

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 8.1 | View Transfers | Navigate to `/app/warehouse/transfers` | See 2 transfers: 1 in-transit, 1 received |
| 8.2 | View Detail | Click TRF-20260212-0001 (in-transit) | See 3 items being transferred to Medical Supplies Store |
| 8.3 | Create Transfer | Click "New Transfer" → Select source/destination stores → Add items → Save | Transfer created with auto-number |
| 8.4 | Dispatch | Open draft transfer → Click "Dispatch" | Status = in_transit, dispatched_at set |
| 8.5 | Receive Transfer | Open in-transit transfer → Click "Receive" | Status = received, stock added at destination store |
| 8.6 | Verify received | Check TRF-20260215-0001 | received_by and received_at populated |

---

## TC-9: Picking & Packing

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 9.1 | View Pick Lists | Navigate to `/app/warehouse/pick-lists` | See 3 pick lists: completed, in-progress, pending |
| 9.2 | View Pick Detail | Click PL-20260212-0001 (completed) | See 3 items all picked with timestamps |
| 9.3 | Start Picking | Open pending pick list → Click "Start Picking" | Status = in_progress, started_at set |
| 9.4 | Pick Item | Select item → Confirm batch/bin → Enter qty → Pick | Item status = picked, quantity_picked updated |
| 9.5 | Partial Pick | Pick less than required quantity | quantity_picked < quantity_required, status = partial |
| 9.6 | Skip Item | Skip an item during picking | Item status = skipped |
| 9.7 | Complete Pick List | All items picked → Click "Complete" | Status = completed, completed_at set |
| 9.8 | FEFO Validation | Check pick sequence | Items with earliest expiry suggested first |
| 9.9 | Create Packing Slip | From completed pick list → "Create Packing Slip" | Packing slip created linked to pick list |
| 9.10 | Pack Items | Assign items to boxes, enter weight | box_number, total_weight updated |
| 9.11 | Verify Packing | Admin verifies packing slip | Status = verified, verified_by set |

---

## TC-10: Shipping & Dispatch

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 10.1 | View Shipments | Navigate to `/app/warehouse/shipping` | See 2 shipments: 1 dispatched, 1 delivered |
| 10.2 | View Detail | Click SHP-20260215-0001 | See destination (General Ward), carrier, tracking events |
| 10.3 | Create Shipment | From verified packing slip → "Create Shipment" → Enter carrier → Save | Shipment created with auto-number |
| 10.4 | Dispatch | Click "Dispatch" | Status = dispatched, dispatched_at set |
| 10.5 | Add Tracking Event | Click "Add Event" → Select type → Enter description → Save | Event recorded with timestamp |
| 10.6 | Mark Delivered | Click "Mark Delivered" | Status = delivered, delivered_at set |
| 10.7 | Tracking Timeline | View tracking events list | Events shown in chronological order |

---

## TC-11: Stock Adjustments

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 11.1 | View Adjustments | Navigate to `/app/warehouse/stock-adjustments` | See 2 adjustments: 1 expired, 1 damaged |
| 11.2 | View Expired | Click expired adjustment | Shows: Blood Glucose Strips, qty -5, batch BGS-2025-Z01, reason |
| 11.3 | View Damaged | Click damaged adjustment | Shows: Digital Thermometer, qty -2, batch DT-2025-V01, reason |
| 11.4 | Create Write-off | Click "New Adjustment" → Select expired type → Select item → Enter qty → Save | Adjustment created, stock reduced |
| 11.5 | Create Damage | Select damaged type → Enter details → Save | Adjustment created with damage reason |
| 11.6 | Verify stock impact | Check inventory_stock for adjusted items | Quantities reflect adjustments |
| 11.7 | Filter by type | Filter expired/damaged/write_off | Correct adjustments shown |

---

## TC-12: Reorder Alerts

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 12.1 | View Alerts | Navigate to `/app/warehouse/reorder-alerts` | See 8 items below reorder level |
| 12.2 | Highest deficit | Check top item | Normal Saline shows deficit of 150 (stock 50, reorder 200) |
| 12.3 | Sort by deficit | Items sorted by deficit descending | Most critical items first |
| 12.4 | Category shown | Check category column | Each item shows its category (Pharmaceuticals, Lab, etc.) |
| 12.5 | Create PR from Alert | Select items → Click "Create Purchase Request" | PR form opens with selected items pre-filled |
| 12.6 | Verify all alerts | Count items with stock < reorder_level | Should match 8 items listed above |

---

## TC-13: Reports

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 13.1 | Stock Valuation | Navigate to Stock Valuation Report | Shows total value of all stock (qty × unit_cost) from `inventory_stock` table, formatted as currency |
| 13.2 | Stock Valuation CSV | Click "Export CSV" on Stock Valuation | CSV downloads with properly escaped fields (item code, name, batch, qty, unit cost, total value) |
| 13.3 | ABC Analysis | Navigate to ABC Analysis | Items classified A/B/C by value with Pareto chart (bars + cumulative % line) |
| 13.4 | ABC Summary Cards | View ABC summary | 3 cards show count of A (80% value), B (15%), C (5%) items |
| 13.5 | Expiry Report | Navigate to Expiry Report | Shows items with expiry dates within selected window (30/60/90/180 days) |
| 13.6 | Expiry Urgency | Check urgency badges | Expired = red "Expired", ≤30d = red, ≤60d = default, >60d = outline |
| 13.7 | Expiry Filter | Change days filter (30→90) | More items appear as window widens |
| 13.8 | Consumption Report | Navigate to Consumption Report | Shows department names (not IDs) from requisitions with bar chart |
| 13.9 | Consumption Departments | Check department column | Shows actual department names (e.g., "Pharmacy", "Emergency") not "Unassigned" |
| 13.10 | Executive Dashboard | Navigate to Executive Dashboard | KPI cards (Stock Value, PO Spend, GRN Count) and trend charts render with data |
| 13.11 | Vendor Performance | Navigate to Vendor Performance Report | Shows vendor names, total spend, PO count per vendor |
| 13.12 | Dead Stock | Navigate to Dead Stock Report → Change days filter (30/60/90/180) | Items with no movement in selected period listed with value |
| 13.13 | Fast Moving Items | Navigate to Fast Moving Report | Top items ranked by received + issued quantity |
| 13.14 | Report CSV Export | Click "Export > CSV" on any report page | CSV file downloads with correct headers and data |

---

## End-to-End Flow Test

### Full Procurement Cycle

| Step | Action | Expected |
|------|--------|----------|
| 1 | View Reorder Alerts | See items below reorder level |
| 2 | Create PR from alerts | PR created with deficit quantities |
| 3 | Approve PR | Status = approved |
| 4 | Convert PR to PO | PO created with PR items |
| 5 | Approve PO | PO approved |
| 6 | Create GRN from PO | GRN with received quantities |
| 7 | QC Check items | Per-item accept/reject |
| 8 | Verify GRN | Stock updated |
| 9 | Post GRN | Journal entry created |
| 10 | Put-Away | Items assigned to bins |
| 11 | Verify reorder alerts reduced | Restocked items no longer in alerts |

### Full Outbound Cycle

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create Requisition | Request from department |
| 2 | Approve Requisition | Quantities approved |
| 3 | Generate Pick List | FEFO-based pick assignments |
| 4 | Pick Items | Items picked from bins |
| 5 | Create Packing Slip | Items packed in boxes |
| 6 | Verify Packing | Admin verification |
| 7 | Create Shipment | Shipment with carrier info |
| 8 | Dispatch | Status = dispatched |
| 9 | Track | Add tracking events |
| 10 | Deliver | Status = delivered |

---

## Quick Validation Checklist

- [ ] Both warehouse users can login
- [ ] Sidebar shows correct warehouse modules
- [ ] 15 inventory items visible with categories
- [ ] 4 vendors visible
- [ ] 3 Purchase Requests in correct statuses
- [ ] 4 Purchase Orders in correct statuses
- [ ] 3 GRNs with batch/expiry data
- [ ] 15 inventory stock records with locations
- [ ] 4 put-away tasks in various statuses
- [ ] 3 requisitions in correct flow states
- [ ] 2 transfers (1 in-transit, 1 received)
- [ ] 3 pick lists with picked/pending items
- [ ] 2 packing slips (1 verified, 1 pending)
- [ ] 2 shipments with tracking events
- [ ] 2 stock adjustments (expired, damaged)
- [ ] 8 items showing in reorder alerts
- [ ] All report pages render with data
- [ ] Executive Dashboard shows KPI cards and charts
- [ ] Vendor Performance report loads with vendor data
- [ ] Dead Stock report filters by days (30/60/90/180)
- [ ] Fast Moving Items report shows ranked items
- [ ] CSV/PDF export works on all report pages

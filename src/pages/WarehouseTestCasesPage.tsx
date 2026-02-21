import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Download, CheckCircle2, Clock, Users, Package, Truck, ClipboardCheck,
  BarChart3, Warehouse, ArrowRightLeft, AlertTriangle, FileDown, CheckSquare,
  LayoutDashboard, ShoppingCart, PackageCheck, Boxes, FileText, ScanBarcode
} from 'lucide-react';

// ============ LOGIN CREDENTIALS ============
const CREDENTIALS = [
  { role: "Warehouse Admin", email: "warehouse.admin@healthos.demo", password: "Demo@123" },
  { role: "Warehouse User", email: "warehouse.user@healthos.demo", password: "Demo@123" },
];


// ============ SEED DATA ============
const SEED_DATA = [
  { entity: "Inventory Categories", count: 5, details: "Pharmaceuticals, Surgical, Consumables, Equipment, Lab Reagents" },
  { entity: "Vendors", count: 4, details: "Mediline Pharma, Surgical Plus, LabChem, MedEquip" },
  { entity: "Inventory Items", count: 15, details: "Medicines, surgical, consumables, equipment, lab items" },
  { entity: "Warehouse Zones", count: 4, details: "General, Cold Storage, Controlled, Bulk" },
  { entity: "Warehouse Bins", count: 12, details: "3 bins per zone" },
  { entity: "Purchase Requests", count: 3, details: "1 draft, 1 approved, 1 converted" },
  { entity: "Purchase Orders", count: 4, details: "1 draft, 1 approved, 1 partially received, 1 received" },
  { entity: "GRNs", count: 3, details: "1 draft, 1 verified, 1 verified" },
  { entity: "Inventory Stock", count: 15, details: "Various quantities, some below reorder level" },
  { entity: "Put-Away Tasks", count: 4, details: "2 completed, 1 in-progress, 1 pending" },
  { entity: "Stock Requisitions", count: 3, details: "1 pending, 1 approved, 1 issued" },
  { entity: "Store Transfers", count: 2, details: "1 in-transit, 1 received" },
  { entity: "Pick Lists", count: 3, details: "1 completed, 1 in-progress, 1 pending" },
  { entity: "Packing Slips", count: 2, details: "1 verified, 1 pending" },
  { entity: "Shipments", count: 2, details: "1 dispatched, 1 delivered" },
  { entity: "Stock Adjustments", count: 2, details: "1 expired, 1 damaged" },
];

const REORDER_ITEMS = [
  { item: "Amoxicillin 250mg", current: 15, reorder: 80, deficit: 65 },
  { item: "Normal Saline 0.9%", current: 50, reorder: 200, deficit: 150 },
  { item: "Surgical Masks N95", current: 50, reorder: 150, deficit: 100 },
  { item: "Blood Glucose Strips", current: 10, reorder: 80, deficit: 70 },
  { item: "CBC Reagent Kit", current: 5, reorder: 25, deficit: 20 },
  { item: "Digital Thermometer", current: 8, reorder: 20, deficit: 12 },
  { item: "Pulse Oximeter", current: 3, reorder: 10, deficit: 7 },
  { item: "Urine Test Strips", current: 8, reorder: 50, deficit: 42 },
];

// ============ TEST CASE MODULES ============
const TC_MODULES = [
  {
    id: "TC-1", name: "Dashboard and Navigation", icon: LayoutDashboard, tests: [
      { num: "1.1", test: "Login", steps: "Go to app -- Enter warehouse.admin@healthos.demo / Demo@123", expected: "Login successful, redirected to warehouse dashboard" },
      { num: "1.2", test: "Sidebar modules", steps: "Check left sidebar", expected: "Shows: Dashboard, Procurement (PRs, POs, Reorder Alerts), Receiving (GRNs, Put-Away), Storage (Zones, Bins, Map), Stock (Items, Adjustments, Requisitions), Outbound (Transfers, Pick Lists, Packing, Shipping), Reports" },
      { num: "1.3", test: "Dashboard metrics", steps: "View dashboard", expected: "Shows item count, low stock alerts, pending GRNs, pending requisitions" },
    ]
  },
  {
    id: "TC-2", name: "Purchase Request Flow", icon: ShoppingCart, tests: [
      { num: "2.1", test: "View PR List", steps: "Navigate to /app/warehouse/purchase-requests", expected: "See 3 PRs: 1 draft (PR-20260101-0001), 1 approved (PR-20260115-0001), 1 converted (PR-20260201-0001)" },
      { num: "2.2", test: "View PR Detail", steps: "Click on draft PR", expected: "See 3 items: Paracetamol (200), Amoxicillin (100), Normal Saline (300) with current stock and reorder levels" },
      { num: "2.3", test: "Create New PR", steps: 'Click "New Purchase Request" -- Select store -- Add items -- Set priority -- Save', expected: "PR created with auto-generated number, status = draft" },
      { num: "2.4", test: "Submit for Approval", steps: 'Open draft PR -- Click "Submit for Approval"', expected: "Status changes to pending_approval" },
      { num: "2.5", test: "Approve PR", steps: 'Open pending PR -- Click "Approve"', expected: "Status = approved, approved_by and approved_at set" },
      { num: "2.6", test: "Reject PR", steps: 'Open pending PR -- Click "Reject" -- Enter reason', expected: "Status = rejected, rejection_reason saved" },
      { num: "2.7", test: "Convert to PO", steps: 'Open approved PR -- Click "Convert to PO"', expected: "Redirected to PO form pre-filled with PR items" },
      { num: "2.8", test: "Filter by Status", steps: "Use status filter dropdown", expected: "Only PRs matching selected status shown" },
    ]
  },
  {
    id: "TC-3", name: "Purchase Order Flow", icon: FileText, tests: [
      { num: "3.1", test: "View PO List", steps: "Navigate to /app/warehouse/purchase-orders", expected: "See 4 POs in various statuses" },
      { num: "3.2", test: "View PO Detail", steps: "Click PO-20260201-0001 (partially received)", expected: "See 3 items with quantity_received vs quantity ordered" },
      { num: "3.3", test: "Create PO", steps: 'Click "New PO" -- Select vendor -- Add items -- Save', expected: "PO created with auto-number, status = draft" },
      { num: "3.4", test: "Approve PO", steps: 'Open draft PO -- Click "Approve"', expected: "Status = approved, approved_by set" },
      { num: "3.5", test: "Create GRN from PO", steps: 'Open approved/partially received PO -- Click "Create GRN"', expected: "GRN form opens pre-filled with PO items" },
      { num: "3.6", test: "Vendor filter", steps: "Filter POs by vendor", expected: "Only POs for selected vendor shown" },
      { num: "3.7", test: "Status filter", steps: "Filter by status", expected: "Correct POs displayed per status" },
    ]
  },
  {
    id: "TC-4", name: "Receiving / GRN Flow", icon: PackageCheck, tests: [
      { num: "4.1", test: "View GRN List", steps: "Navigate to /app/warehouse/grn", expected: "See 3 GRNs: 1 draft, 2 verified" },
      { num: "4.2", test: "View GRN Detail", steps: "Click GRN-20260210-0001 (draft)", expected: "See 3 items with batch numbers, quantities, rejection info" },
      { num: "4.3", test: "Create GRN", steps: "From PO -- Create GRN -- Enter received qty, batch, expiry", expected: "GRN created with auto-number" },
      { num: "4.4", test: "QC Check", steps: "Open draft GRN -- QC section -- Accept/Reject per item", expected: "Items marked accepted/rejected with reasons" },
      { num: "4.5", test: "QC Approve", steps: 'After per-item QC -- Click "Approve QC"', expected: "qc_status = approved, qc_checked_by set" },
      { num: "4.6", test: "Verify GRN", steps: 'Open QC-approved GRN -- Click "Verify"', expected: "Status = verified, stock updated in inventory_stock" },
      { num: "4.7", test: "Post GRN", steps: 'Open verified GRN -- Click "Post"', expected: "Journal entry created, accounts updated" },
      { num: "4.8", test: "Rejected items", steps: "Check GRN with quantity_rejected > 0", expected: "Rejection reason visible, qty_accepted = qty_received - qty_rejected" },
    ]
  },
  {
    id: "TC-5", name: "Put-Away Flow", icon: Boxes, tests: [
      { num: "5.1", test: "View Put-Away List", steps: "Navigate to /app/warehouse/putaway", expected: "See 4 tasks: 2 completed, 1 in-progress, 1 pending" },
      { num: "5.2", test: "Pending task", steps: "Click pending task (Paracetamol)", expected: "Shows suggested bin GEN-A1-01, quantity 50, batch PCM-2026-G01" },
      { num: "5.3", test: "Assign bin", steps: "Select a bin from dropdown -- Confirm", expected: "assigned_bin_id updated" },
      { num: "5.4", test: "Complete task", steps: 'Click "Complete" on in-progress task', expected: "Status = completed, completed_at set" },
      { num: "5.5", test: "Filter by status", steps: "Filter pending/in-progress/completed", expected: "Correct tasks shown" },
    ]
  },
  {
    id: "TC-6", name: "Storage and Zones", icon: Warehouse, tests: [
      { num: "6.1", test: "View Zones", steps: "Navigate to /app/warehouse/zones", expected: "See 4 zones: General, Cold Storage, Controlled, Bulk" },
      { num: "6.2", test: "Zone details", steps: "Click a zone", expected: "See zone type, temperature range (Cold: 2-8 C), bins in zone" },
      { num: "6.3", test: "View Bins", steps: "Navigate to /app/warehouse/bins", expected: "See 12 bins with capacity and occupancy" },
      { num: "6.4", test: "Bin utilization", steps: "Check bin details", expected: "current_occupancy/capacity shown as percentage" },
      { num: "6.5", test: "Storage Map", steps: "Navigate to /app/warehouse/storage-map", expected: "Visual map showing zones and bin layout" },
      { num: "6.6", test: "Create Zone", steps: 'Click "Add Zone" -- Fill form -- Save', expected: "New zone created" },
      { num: "6.7", test: "Create Bin", steps: 'Click "Add Bin" -- Select zone -- Fill capacity -- Save', expected: "New bin created in selected zone" },
    ]
  },
  {
    id: "TC-7", name: "Requisition and Issue Flow", icon: ClipboardCheck, tests: [
      { num: "7.1", test: "View Requisitions", steps: "Navigate to /app/warehouse/requisitions", expected: "See 3 requisitions: pending, approved, issued" },
      { num: "7.2", test: "View Detail", steps: "Click issued requisition REQ-20260215-0001", expected: "See 3 items with qty_requested, qty_approved, qty_issued" },
      { num: "7.3", test: "Create Requisition", steps: 'Click "New Requisition" -- Select department -- Add items -- Save', expected: "Requisition created with auto-number" },
      { num: "7.4", test: "Approve Requisition", steps: 'Open pending requisition -- Click "Approve"', expected: "Status = approved, quantities approved" },
      { num: "7.5", test: "Reject Requisition", steps: 'Open pending -- Click "Reject" -- Enter reason', expected: "Status = rejected" },
      { num: "7.6", test: "Issue Stock", steps: 'Open approved requisition -- Click "Issue"', expected: "Status = issued, stock reduced, pick list generated" },
      { num: "7.7", test: "Partial approval", steps: "Approve with reduced quantities", expected: "qty_approved < qty_requested" },
    ]
  },
  {
    id: "TC-8", name: "Transfer (Move Out/In)", icon: ArrowRightLeft, tests: [
      { num: "8.1", test: "View Transfers", steps: "Navigate to /app/warehouse/transfers", expected: "See 2 transfers: 1 in-transit, 1 received" },
      { num: "8.2", test: "View Detail", steps: "Click TRF-20260212-0001 (in-transit)", expected: "See 3 items being transferred to Medical Supplies Store" },
      { num: "8.3", test: "Create Transfer", steps: 'Click "New Transfer" -- Select source/destination stores -- Add items -- Save', expected: "Transfer created with auto-number" },
      { num: "8.4", test: "Dispatch", steps: 'Open draft transfer -- Click "Dispatch"', expected: "Status = in_transit, dispatched_at set" },
      { num: "8.5", test: "Receive Transfer", steps: 'Open in-transit transfer -- Click "Receive"', expected: "Status = received, stock added at destination store" },
      { num: "8.6", test: "Verify received", steps: "Check TRF-20260215-0001", expected: "received_by and received_at populated" },
    ]
  },
  {
    id: "TC-9", name: "Picking and Packing", icon: ScanBarcode, tests: [
      { num: "9.1", test: "View Pick Lists", steps: "Navigate to /app/warehouse/pick-lists", expected: "See 3 pick lists: completed, in-progress, pending" },
      { num: "9.2", test: "View Pick Detail", steps: "Click PL-20260212-0001 (completed)", expected: "See 3 items all picked with timestamps" },
      { num: "9.3", test: "Start Picking", steps: 'Open pending pick list -- Click "Start Picking"', expected: "Status = in_progress, started_at set" },
      { num: "9.4", test: "Pick Item", steps: "Select item -- Confirm batch/bin -- Enter qty -- Pick", expected: "Item status = picked, quantity_picked updated" },
      { num: "9.5", test: "Partial Pick", steps: "Pick less than required quantity", expected: "quantity_picked < quantity_required, status = partial" },
      { num: "9.6", test: "Skip Item", steps: "Skip an item during picking", expected: "Item status = skipped" },
      { num: "9.7", test: "Complete Pick List", steps: 'All items picked -- Click "Complete"', expected: "Status = completed, completed_at set" },
      { num: "9.8", test: "FEFO Validation", steps: "Check pick sequence", expected: "Items with earliest expiry suggested first" },
      { num: "9.9", test: "Create Packing Slip", steps: 'From completed pick list -- "Create Packing Slip"', expected: "Packing slip created linked to pick list" },
      { num: "9.10", test: "Pack Items", steps: "Assign items to boxes, enter weight", expected: "box_number, total_weight updated" },
      { num: "9.11", test: "Verify Packing", steps: "Admin verifies packing slip", expected: "Status = verified, verified_by set" },
    ]
  },
  {
    id: "TC-10", name: "Shipping and Dispatch", icon: Truck, tests: [
      { num: "10.1", test: "View Shipments", steps: "Navigate to /app/warehouse/shipping", expected: "See 2 shipments: 1 dispatched, 1 delivered" },
      { num: "10.2", test: "View Detail", steps: "Click SHP-20260215-0001", expected: "See destination (General Ward), carrier, tracking events" },
      { num: "10.3", test: "Create Shipment", steps: 'From verified packing slip -- "Create Shipment" -- Enter carrier -- Save', expected: "Shipment created with auto-number" },
      { num: "10.4", test: "Dispatch", steps: 'Click "Dispatch"', expected: "Status = dispatched, dispatched_at set" },
      { num: "10.5", test: "Add Tracking Event", steps: 'Click "Add Event" -- Select type -- Enter description -- Save', expected: "Event recorded with timestamp" },
      { num: "10.6", test: "Mark Delivered", steps: 'Click "Mark Delivered"', expected: "Status = delivered, delivered_at set" },
      { num: "10.7", test: "Tracking Timeline", steps: "View tracking events list", expected: "Events shown in chronological order" },
    ]
  },
  {
    id: "TC-11", name: "Stock Adjustments", icon: Package, tests: [
      { num: "11.1", test: "View Adjustments", steps: "Navigate to /app/warehouse/stock-adjustments", expected: "See 2 adjustments: 1 expired, 1 damaged" },
      { num: "11.2", test: "View Expired", steps: "Click expired adjustment", expected: "Shows: Blood Glucose Strips, qty -5, batch BGS-2025-Z01, reason" },
      { num: "11.3", test: "View Damaged", steps: "Click damaged adjustment", expected: "Shows: Digital Thermometer, qty -2, batch DT-2025-V01, reason" },
      { num: "11.4", test: "Create Write-off", steps: 'Click "New Adjustment" -- Select expired type -- Select item -- Enter qty -- Save', expected: "Adjustment created, stock reduced" },
      { num: "11.5", test: "Create Damage", steps: "Select damaged type -- Enter details -- Save", expected: "Adjustment created with damage reason" },
      { num: "11.6", test: "Verify stock impact", steps: "Check inventory_stock for adjusted items", expected: "Quantities reflect adjustments" },
      { num: "11.7", test: "Filter by type", steps: "Filter expired/damaged/write_off", expected: "Correct adjustments shown" },
    ]
  },
  {
    id: "TC-12", name: "Reorder Alerts", icon: AlertTriangle, tests: [
      { num: "12.1", test: "View Alerts", steps: "Navigate to /app/warehouse/reorder-alerts", expected: "See 8 items below reorder level" },
      { num: "12.2", test: "Highest deficit", steps: "Check top item", expected: "Normal Saline shows deficit of 150 (stock 50, reorder 200)" },
      { num: "12.3", test: "Sort by deficit", steps: "Items sorted by deficit descending", expected: "Most critical items first" },
      { num: "12.4", test: "Category shown", steps: "Check category column", expected: "Each item shows its category (Pharmaceuticals, Lab, etc.)" },
      { num: "12.5", test: "Create PR from Alert", steps: 'Select items -- Click "Create Purchase Request"', expected: "PR form opens with selected items pre-filled" },
      { num: "12.6", test: "Verify all alerts", steps: "Count items with stock < reorder_level", expected: "Should match 8 items listed above" },
    ]
  },
  {
    id: "TC-13", name: "Reports", icon: BarChart3, tests: [
      { num: "13.1", test: "Stock Valuation", steps: "Navigate to Stock Valuation Report", expected: "Shows total value of all stock (qty x unit_cost), formatted as currency" },
      { num: "13.2", test: "Stock Valuation CSV", steps: 'Click "Export CSV" on Stock Valuation', expected: "CSV downloads with item code, name, batch, qty, unit cost, total value" },
      { num: "13.3", test: "ABC Analysis", steps: "Navigate to ABC Analysis", expected: "Items classified A/B/C by value with Pareto chart (bars + cumulative % line)" },
      { num: "13.4", test: "ABC Summary Cards", steps: "View ABC summary", expected: "3 cards show count of A (80% value), B (15%), C (5%) items" },
      { num: "13.5", test: "Expiry Report", steps: "Navigate to Expiry Report", expected: "Shows items with expiry dates within selected window (30/60/90/180 days)" },
      { num: "13.6", test: "Expiry Urgency", steps: "Check urgency badges", expected: 'Expired = red "Expired", <=30d = red, <=60d = default, >60d = outline' },
      { num: "13.7", test: "Expiry Filter", steps: "Change days filter (30 to 90)", expected: "More items appear as window widens" },
      { num: "13.8", test: "Consumption Report", steps: "Navigate to Consumption Report", expected: 'Shows department names (not IDs) from requisitions with bar chart' },
      { num: "13.9", test: "Consumption Departments", steps: "Check department column", expected: 'Shows actual department names (e.g., "Pharmacy", "Emergency") not "Unassigned"' },
      { num: "13.10", test: "Executive Dashboard", steps: "Navigate to Executive Dashboard", expected: "KPI cards (Stock Value, PO Spend, GRN Count) and trend charts render with data" },
      { num: "13.11", test: "Vendor Performance", steps: "Navigate to Vendor Performance Report", expected: "Shows vendor names, total spend, PO count per vendor" },
      { num: "13.12", test: "Dead Stock", steps: "Navigate to Dead Stock Report -- Change days filter (30/60/90/180)", expected: "Items with no movement in selected period listed with value" },
      { num: "13.13", test: "Fast Moving Items", steps: "Navigate to Fast Moving Report", expected: "Top items ranked by received + issued quantity" },
      { num: "13.14", test: "Report CSV Export", steps: 'Click "Export > CSV" on any report page', expected: "CSV file downloads with correct headers and data" },
    ]
  },
];

const TOTAL_TESTS = TC_MODULES.reduce((acc, m) => acc + m.tests.length, 0);

// ============ E2E JOURNEY FLOWS ============
const E2E_FLOWS = [
  {
    name: "Full Procurement Cycle (Inbound)",
    icon: Package,
    description: "Complete inbound flow from identifying stock shortages through receiving, quality checks, and storage placement.",
    roles: ["Warehouse Admin", "Warehouse User"],
    steps: [
      { step: 1, action: "Detect Reorder Alert", route: "/app/warehouse/reorder-alerts", expected: "8 items below reorder level visible. Normal Saline shows deficit of 150 (stock: 50, reorder: 200). Items sorted by deficit descending.", role: "Warehouse User" },
      { step: 2, action: "Create Purchase Request from Alerts", route: "/app/warehouse/purchase-requests/new", expected: "PR form opens with selected items pre-filled. Quantities match deficit amounts. PR number auto-generated (e.g., PR-20260221-0001). Status = draft.", role: "Warehouse User" },
      { step: 3, action: "Submit and Approve PR", route: "/app/warehouse/purchase-requests", expected: "After submit: status = pending_approval. After admin approval: status = approved, approved_by = warehouse admin, approved_at = current timestamp.", role: "Warehouse Admin" },
      { step: 4, action: "Convert Approved PR to Purchase Order", route: "/app/warehouse/purchase-orders/new?from_pr=<pr_id>", expected: "PO form opens pre-filled with all PR line items. Vendor selection available. Quantities match PR. PO number auto-generated. Status = draft.", role: "Warehouse Admin" },
      { step: 5, action: "Approve Purchase Order", route: "/app/warehouse/purchase-orders", expected: "Status changes from draft to approved. approved_by and approved_at populated. PO ready for GRN creation.", role: "Warehouse Admin" },
      { step: 6, action: "Create GRN from Approved PO", route: "/app/warehouse/grn/new?poId=<po_id>", expected: "GRN form opens with PO items. Enter received quantities, batch numbers (e.g., PCM-2026-G01), and expiry dates. GRN number auto-generated. Status = draft.", role: "Warehouse User" },
      { step: 7, action: "Perform QC Inspection on GRN Items", route: "/app/warehouse/grn/<grn_id>", expected: "QC section shows each item. Accept or reject per item with reasons. After all items checked: click 'Approve QC'. qc_status = approved, qc_checked_by = current user.", role: "Warehouse Admin" },
      { step: 8, action: "Verify GRN (Stock Update)", route: "/app/warehouse/grn/<grn_id>", expected: "Click 'Verify'. Status = verified. inventory_stock table updated: quantities increased for accepted items. qty_accepted = qty_received - qty_rejected.", role: "Warehouse Admin" },
      { step: 9, action: "Post GRN (Accounting Entry)", route: "/app/warehouse/grn/<grn_id>", expected: "Click 'Post'. Journal entry created in accounting module. Inventory account debited, payable account credited. GRN status = posted.", role: "Warehouse Admin" },
      { step: 10, action: "Put-Away Items to Storage Bins", route: "/app/warehouse/putaway", expected: "Put-away tasks auto-generated for verified GRN items. Each task shows suggested bin (e.g., GEN-A1-01). Assign bins and mark completed. Status = completed, completed_at set.", role: "Warehouse User" },
      { step: 11, action: "Verify Reorder Alerts Cleared", route: "/app/warehouse/reorder-alerts", expected: "Previously restocked items no longer appear in alerts. Alert count reduced. Items with stock >= reorder_level removed from list.", role: "Warehouse User" },
    ]
  },
  {
    name: "Full Outbound Cycle (Dispatch)",
    icon: Truck,
    description: "Complete outbound flow from department requisition through FEFO picking, packing verification, and final delivery.",
    roles: ["Warehouse Admin", "Warehouse User"],
    steps: [
      { step: 1, action: "Create Stock Requisition from Department", route: "/app/warehouse/requisitions/new", expected: "Select requesting department (e.g., Emergency, Pharmacy). Add items with required quantities. Requisition number auto-generated (e.g., REQ-20260221-0001). Status = pending.", role: "Warehouse User" },
      { step: 2, action: "Approve Requisition with Quantities", route: "/app/warehouse/requisitions/<req_id>", expected: "Review requested quantities. Approve full or partial amounts. qty_approved set per item. Status = approved. If partial: qty_approved < qty_requested.", role: "Warehouse Admin" },
      { step: 3, action: "Generate FEFO-Based Pick List", route: "/app/warehouse/pick-lists", expected: "Pick list auto-generated from approved requisition. Items ordered by First Expiry First Out (FEFO). Each line shows: item, batch, bin location, quantity to pick. Pick list number auto-generated (e.g., PL-20260221-0001).", role: "Warehouse User" },
      { step: 4, action: "Pick Items from Storage Bins", route: "/app/warehouse/pick-lists/<pl_id>", expected: "Click 'Start Picking'. For each item: confirm batch/bin, enter quantity_picked. Item status = picked. If quantity_picked < quantity_required: status = partial. started_at timestamp set.", role: "Warehouse User" },
      { step: 5, action: "Create Packing Slip from Pick List", route: "/app/warehouse/packing", expected: "From completed pick list, click 'Create Packing Slip'. Packing slip created linked to pick list. Assign items to boxes with box_number. Enter total_weight per box.", role: "Warehouse User" },
      { step: 6, action: "Verify Packing Slip", route: "/app/warehouse/packing/<slip_id>", expected: "Admin reviews packed items against pick list. Click 'Verify'. Status = verified, verified_by = admin user. Packing slip ready for shipment.", role: "Warehouse Admin" },
      { step: 7, action: "Create Shipment with Carrier Details", route: "/app/warehouse/shipping/new", expected: "From verified packing slip, click 'Create Shipment'. Enter carrier name, tracking info. Destination auto-set from requisition department. Shipment number auto-generated (e.g., SHP-20260221-0001).", role: "Warehouse Admin" },
      { step: 8, action: "Dispatch Shipment", route: "/app/warehouse/shipping/<shp_id>", expected: "Click 'Dispatch'. Status = dispatched. dispatched_at = current timestamp. Stock quantities reduced at source store.", role: "Warehouse Admin" },
      { step: 9, action: "Add Tracking Events", route: "/app/warehouse/shipping/<shp_id>", expected: "Click 'Add Event'. Select event type (e.g., picked_up, in_transit, out_for_delivery). Enter description. Event saved with timestamp. Events display in chronological timeline.", role: "Warehouse User" },
      { step: 10, action: "Mark Shipment as Delivered", route: "/app/warehouse/shipping/<shp_id>", expected: "Click 'Mark Delivered'. Status = delivered. delivered_at = current timestamp. Full tracking timeline visible from dispatch to delivery.", role: "Warehouse User" },
    ]
  },
  {
    name: "Stock Adjustment and Reconciliation",
    icon: Package,
    description: "Handle expired and damaged stock through adjustments, verify impact on valuation reports and ABC analysis.",
    roles: ["Warehouse Admin"],
    steps: [
      { step: 1, action: "Identify Expired or Damaged Stock", route: "/app/warehouse/stock-adjustments", expected: "Review current adjustments: 1 expired (Blood Glucose Strips, qty -5, batch BGS-2025-Z01) and 1 damaged (Digital Thermometer, qty -2, batch DT-2025-V01).", role: "Warehouse Admin" },
      { step: 2, action: "Create Expired Stock Adjustment", route: "/app/warehouse/stock-adjustments/new", expected: "Click 'New Adjustment'. Select type = expired. Choose item (e.g., CBC Reagent Kit). Enter quantity to write off and batch number. Add reason: 'Past expiry date'. Adjustment created, stock quantity reduced.", role: "Warehouse Admin" },
      { step: 3, action: "Create Damaged Stock Adjustment", route: "/app/warehouse/stock-adjustments/new", expected: "Select type = damaged. Choose item (e.g., Pulse Oximeter). Enter quantity and batch. Add reason: 'Physical damage during handling'. Adjustment created, stock quantity reduced.", role: "Warehouse Admin" },
      { step: 4, action: "Verify Stock Quantities Reduced", route: "/app/inventory/items", expected: "Check inventory_stock for adjusted items. Quantities reflect deductions from adjustments. Current stock = previous stock - adjustment quantity.", role: "Warehouse Admin" },
      { step: 5, action: "Check Stock Valuation Report", route: "/app/inventory/reports/stock-valuation", expected: "Total inventory value decreased. Adjusted items show reduced quantities and corresponding lower total values (qty x unit_cost). Search for adjusted items to confirm.", role: "Warehouse Admin" },
      { step: 6, action: "Run ABC Analysis for Reclassification", route: "/app/inventory/reports/abc-analysis", expected: "Items with reduced stock value may shift categories (e.g., A to B or B to C). Pareto chart reflects updated cumulative percentages. Summary cards show updated counts per category.", role: "Warehouse Admin" },
      { step: 7, action: "Verify Adjustment History in Reports", route: "/app/warehouse/stock-adjustments", expected: "All adjustments listed with type filter (expired/damaged/write_off). Each shows: item name, batch, quantity, reason, created_at. Total adjustment count increased.", role: "Warehouse Admin" },
    ]
  },
  {
    name: "Inter-Store Transfer",
    icon: ArrowRightLeft,
    description: "Transfer surplus stock between warehouse stores, tracking from dispatch through receipt with stock verification at both ends.",
    roles: ["Warehouse Admin", "Warehouse User"],
    steps: [
      { step: 1, action: "Identify Surplus Stock at Source Store", route: "/app/inventory/items", expected: "Review stock levels at Central Distribution Warehouse. Identify items with surplus quantities (stock well above reorder level). Note batch numbers for transfer.", role: "Warehouse User" },
      { step: 2, action: "Create Transfer Request", route: "/app/warehouse/transfers/new", expected: "Click 'New Transfer'. Select source store: Central Distribution Warehouse. Transfer number auto-generated (e.g., TRF-20260221-0001). Status = draft.", role: "Warehouse User" },
      { step: 3, action: "Select Destination Store", route: "/app/warehouse/transfers/new", expected: "Choose destination from available stores (e.g., Medical Supplies Store, Pharmacy Store). Destination store details displayed with current stock summary.", role: "Warehouse User" },
      { step: 4, action: "Add Items with Batch and Quantity", route: "/app/warehouse/transfers/new", expected: "Add items to transfer: select item, choose batch number, enter quantity. Multiple items can be added. Validate quantity does not exceed available stock at source.", role: "Warehouse User" },
      { step: 5, action: "Dispatch Transfer", route: "/app/warehouse/transfers/<trf_id>", expected: "Click 'Dispatch'. Status changes from draft to in_transit. dispatched_at = current timestamp. Stock reserved/deducted at source store.", role: "Warehouse Admin" },
      { step: 6, action: "Receive Transfer at Destination", route: "/app/warehouse/transfers/<trf_id>", expected: "At destination store, click 'Receive'. Status = received. received_by and received_at populated. Stock added to destination store inventory.", role: "Warehouse User" },
      { step: 7, action: "Verify Source Store Stock Decreased", route: "/app/inventory/items", expected: "Check source store (Central Distribution Warehouse). Transferred items show reduced quantities. Reduction matches transfer quantities exactly.", role: "Warehouse Admin" },
      { step: 8, action: "Verify Destination Store Stock Increased", route: "/app/inventory/items", expected: "Switch to destination store context. Transferred items show increased quantities with correct batch numbers and expiry dates preserved.", role: "Warehouse Admin" },
    ]
  },
];

// ============ VALIDATION CHECKLIST ============
const CHECKLIST = [
  "Both warehouse users can login",
  "Sidebar shows correct warehouse modules",
  "15 inventory items visible with categories",
  "4 vendors visible",
  "3 Purchase Requests in correct statuses",
  "4 Purchase Orders in correct statuses",
  "3 GRNs with batch/expiry data",
  "15 inventory stock records with locations",
  "4 put-away tasks in various statuses",
  "3 requisitions in correct flow states",
  "2 transfers (1 in-transit, 1 received)",
  "3 pick lists with picked/pending items",
  "2 packing slips (1 verified, 1 pending)",
  "2 shipments with tracking events",
  "2 stock adjustments (expired, damaged)",
  "8 items showing in reorder alerts",
  "All report pages render with data",
  "Executive Dashboard shows KPI cards and charts",
  "Vendor Performance report loads with vendor data",
  "Dead Stock report filters by days (30/60/90/180)",
  "Fast Moving Items report shows ranked items",
  "CSV/PDF export works on all report pages",
];

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    "Warehouse Admin": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    "Warehouse User": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  };
  return colors[role] || "bg-muted text-muted-foreground";
};

export default function WarehouseTestCasesPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: 'Warehouse Management System - Test Cases & Validation Guide' });

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Warehouse className="h-6 w-6" />
              Warehouse Management System - Test Cases & Validation Guide
            </h1>
            <p className="text-sm text-muted-foreground">
              {TC_MODULES.length} Sections / {TOTAL_TESTS} Tests / {E2E_FLOWS.length} E2E Journeys / {CHECKLIST.length} Checklist Items
            </p>
          </div>
          <Button onClick={() => handlePrint()}>
            <Download className="h-4 w-4 mr-2" />Download PDF
          </Button>
        </div>
      </div>

      <div ref={printRef} className="container mx-auto px-4 py-8 space-y-8 print:p-4">
        {/* Print header */}
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-bold">Warehouse Management System - Test Cases & Validation Guide</h1>
          <p className="text-sm text-muted-foreground mt-2">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Section 1: Login Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Login Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CREDENTIALS.map((cred, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium">{cred.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background px-2 py-1 rounded">{cred.email}</code>
                    <code className="text-xs bg-background px-2 py-1 rounded">{cred.password}</code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Seed Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Seed Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 font-medium text-sm border-b">
                <div className="col-span-4">Entity</div>
                <div className="col-span-1 text-center">Count</div>
                <div className="col-span-7">Details</div>
              </div>
              {SEED_DATA.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-3 text-sm border-b last:border-b-0">
                  <div className="col-span-4 font-medium">{row.entity}</div>
                  <div className="col-span-1 text-center">
                    <Badge variant="secondary">{row.count}</Badge>
                  </div>
                  <div className="col-span-7 text-muted-foreground">{row.details}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Items Below Reorder Level (Should Trigger Alerts)
              </h4>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 font-medium text-sm border-b">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-2 text-center">Current Stock</div>
                  <div className="col-span-3 text-center">Reorder Level</div>
                  <div className="col-span-3 text-center">Deficit</div>
                </div>
                {REORDER_ITEMS.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 p-3 text-sm border-b last:border-b-0">
                    <div className="col-span-4 font-medium">{row.item}</div>
                    <div className="col-span-2 text-center">{row.current}</div>
                    <div className="col-span-3 text-center">{row.reorder}</div>
                    <div className="col-span-3 text-center">
                      <Badge variant="destructive">{row.deficit}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Sections 3-15: TC Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Test Case Modules
              <Badge className="ml-2">{TOTAL_TESTS} Tests</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {TC_MODULES.map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <module.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">{module.id}: {module.name}</span>
                      <Badge variant="outline">{module.tests.length} tests</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="max-h-[500px]">
                      <div className="space-y-2 mt-2">
                        <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 rounded-lg text-xs font-semibold uppercase tracking-wider">
                          <div className="col-span-1">#</div>
                          <div className="col-span-2">Test Name</div>
                          <div className="col-span-5">Steps</div>
                          <div className="col-span-4">Expected Result</div>
                        </div>
                        {module.tests.map((test) => (
                          <div key={test.num} className="grid grid-cols-12 gap-4 p-3 bg-muted/30 rounded-lg text-sm items-start">
                            <div className="col-span-1">
                              <Badge variant="outline" className="font-mono text-xs">{test.num}</Badge>
                            </div>
                            <div className="col-span-2 font-medium">{test.test}</div>
                            <div className="col-span-5 text-muted-foreground">{test.steps}</div>
                            <div className="col-span-4 flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              <span>{test.expected}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Separator />

        {/* Section 16: E2E Flow Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              End-to-End Flow Tests
              <Badge className="ml-2">{E2E_FLOWS.length} Journeys</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Complete workflow testing across warehouse roles with navigation routes and detailed expected results</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {E2E_FLOWS.map((flow, flowIdx) => (
                <AccordionItem key={flowIdx} value={`e2e-${flowIdx}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <flow.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{flow.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />{flow.steps.length} steps
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{flow.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {flow.roles.map((role) => (
                            <Badge key={role} variant="secondary" className={`text-xs ${getRoleBadgeColor(role)}`}>{role}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-4 space-y-0">
                      {flow.steps.map((step, idx) => (
                        <div key={step.step} className="relative">
                          {idx < flow.steps.length - 1 && (
                            <div className="absolute left-[19px] top-10 w-0.5 h-[calc(100%-20px)] bg-border" />
                          )}
                          <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-sm font-bold text-primary shrink-0 z-10">
                              {step.step}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{step.action}</p>
                                <Badge variant="secondary" className="text-xs">{step.role}</Badge>
                              </div>
                              {step.route && (
                                <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">{step.route}</code>
                              )}
                              <div className="flex items-start gap-2 mt-1.5 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{step.expected}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Separator />

        {/* Section 17: Quick Validation Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Quick Validation Checklist
              <Badge variant="secondary" className="ml-2">{CHECKLIST.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CHECKLIST.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-sm">
                  <div className="h-5 w-5 rounded border-2 border-muted-foreground/30 flex items-center justify-center shrink-0">
                    <span className="text-xs text-muted-foreground">{idx + 1}</span>
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Warehouse Management System - Test Cases & Validation Guide / Smart HMS / {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

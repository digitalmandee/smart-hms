

# Create Dedicated Warehouse Test Cases Page

## Overview

Create a standalone `/warehouse-test-cases` page that presents all warehouse QA test cases from the documentation in a clean, structured format. No emojis. Clear flows with step-by-step progression. Professional layout matching the existing test cases page pattern but focused entirely on warehouse operations.

## New File: `src/pages/WarehouseTestCasesPage.tsx`

A dedicated page with the following sections:

### Header
- Title: "Warehouse Module - Manual QA Test Cases"
- Subtitle showing total test count and section count
- Download PDF button (using `useReactToPrint`)

### Section 1: Login Credentials
- Card with Warehouse Admin and Warehouse User emails and passwords
- Gate password displayed

### Section 2: Seed Data Summary
- Table showing all entity counts (Categories, Vendors, Items, Zones, Bins, PRs, POs, GRNs, Stock, etc.)
- Separate sub-table for "Items Below Reorder Level" with Item, Current Stock, Reorder Level, Deficit columns

### Sections 3-15: Test Case Modules (TC-1 through TC-13)
Each as an accordion section with:
- TC-1: Dashboard and Navigation (3 tests)
- TC-2: Purchase Request Flow (8 tests)
- TC-3: Purchase Order Flow (7 tests)
- TC-4: Receiving / GRN Flow (8 tests)
- TC-5: Put-Away Flow (5 tests)
- TC-6: Storage and Zones (7 tests)
- TC-7: Requisition and Issue Flow (7 tests)
- TC-8: Transfer (Move Out/In) (6 tests)
- TC-9: Picking and Packing (11 tests)
- TC-10: Shipping and Dispatch (7 tests)
- TC-11: Stock Adjustments (7 tests)
- TC-12: Reorder Alerts (6 tests)
- TC-13: Reports (14 tests)

Each test displayed as a row with columns: #, Test Name, Steps, Expected Result — using the grid layout pattern from the existing page.

### Section 16: End-to-End Flow Tests
Two journey flows rendered as step timelines (same visual pattern as the main test cases page):
- **Full Procurement Cycle** (11 steps): Reorder Alerts to Verify alerts reduced
- **Full Outbound Cycle** (10 steps): Create Requisition to Mark Delivered

### Section 17: Quick Validation Checklist
A card with all 21 checklist items displayed as a list with checkbox-style indicators.

### Design Principles
- No emojis anywhere — use Lucide icons (Package, Truck, ClipboardList, BarChart3, etc.)
- Clean table/grid layouts for test rows
- Accordion sections for each TC module
- Timeline/step visualization for end-to-end flows
- Print-friendly layout with `print:` CSS classes
- Consistent with existing TestCasesPage styling

## Route Registration

Add route in `src/App.tsx`:
- `/warehouse-test-cases` pointing to `WarehouseTestCasesPage`

## Technical Details

| File | Action |
|------|--------|
| `src/pages/WarehouseTestCasesPage.tsx` | Create — full page with all TC-1 to TC-13, E2E flows, checklist |
| `src/App.tsx` | Update — add route for `/warehouse-test-cases` |

### Components Used (all existing)
- Card, CardHeader, CardTitle, CardContent
- Accordion, AccordionItem, AccordionTrigger, AccordionContent
- Badge
- ScrollArea
- Separator
- Button
- useReactToPrint for PDF export

### Icons (Lucide, no emojis)
- Package (Procurement), Truck (Outbound), ClipboardCheck (QC), BarChart3 (Reports), Warehouse (Storage), ArrowRightLeft (Transfers), AlertTriangle (Reorder), FileDown (Exports), CheckSquare (Checklist)


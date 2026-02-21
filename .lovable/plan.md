

# Update Warehouse Test Cases Page

## Changes

### 1. Remove Gate Password
- Delete `GATE_PASSWORD` constant (line 20)
- Remove the Gate Password badge from the Login Credentials card header (line 317)

### 2. Rename Page Title
- Change from "Warehouse Module - Manual QA Test Cases" to "Warehouse Management System - Test Cases & Validation Guide"
- Update all references: header, print header, document title, footer

### 3. Expand End-to-End Flows with Complete Detail
Replace the current 2 basic E2E flows with 4 comprehensive journeys, each with detailed sub-steps:

**Flow 1: Full Procurement Cycle (Inbound)** - 11 steps with detailed expected results
- Reorder Alert detection -> PR creation -> PR approval -> Convert to PO -> PO approval -> GRN creation -> QC inspection -> GRN verification (stock updated) -> GRN posting (journal entry) -> Put-away to bins -> Verify alerts cleared

**Flow 2: Full Outbound Cycle (Dispatch)** - 10 steps
- Requisition from department -> Approve with quantities -> Generate FEFO pick list -> Pick items from bins -> Create packing slip -> Verify packing -> Create shipment with carrier -> Dispatch -> Add tracking events -> Mark delivered

**Flow 3: Stock Adjustment & Reconciliation** (NEW) - 7 steps
- Identify expired/damaged stock -> Create adjustment (expired type) -> Create adjustment (damaged type) -> Verify stock quantities reduced -> Check stock valuation report reflects changes -> Run ABC analysis to see reclassification -> Verify adjustment history in reports

**Flow 4: Inter-Store Transfer** (NEW) - 8 steps
- Identify surplus at source store -> Create transfer request -> Select destination store -> Add items with batch/qty -> Dispatch transfer (status = in_transit) -> Receive at destination -> Verify source stock decreased -> Verify destination stock increased

Each step will include:
- Step number
- Action (what to do)
- Route/navigation path where applicable
- Expected result with specific data values
- Role performing the action

### 4. Update Documentation (WAREHOUSE_TEST_CASES.md)
- Remove "Gate Password: 1212" line
- Add the 2 new E2E flows (Stock Adjustment and Inter-Store Transfer)

### Technical Details

| File | Changes |
|------|---------|
| `src/pages/WarehouseTestCasesPage.tsx` | Remove gate password, rename title, expand E2E flows from 2 to 4 with richer detail |
| `docs/WAREHOUSE_TEST_CASES.md` | Remove gate password line, add 2 new E2E flow tables |


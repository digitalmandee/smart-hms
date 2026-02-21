

# Update Warehouse Test Cases (Page + Documentation)

## Problem
1. The `/test-cases` page (TestCasesPage.tsx) has only 4 generic inventory tests (INV-001 to INV-004) and zero warehouse-specific tests
2. The `docs/WAREHOUSE_TEST_CASES.md` still says Vendor Performance, Dead Stock, and Fast Moving reports "don't have dedicated pages yet" even though they were just built
3. The new Executive Dashboard report is not mentioned anywhere in test cases

## Changes

### 1. Update `src/pages/TestCasesPage.tsx`

Replace the minimal "Inventory" module (4 tests) with a comprehensive **"Warehouse & Inventory"** module section containing test cases for:

- **Procurement** (PR create/approve, PO create/approve/receive) - 6 tests
- **Receiving** (GRN create, QC, verify, post) - 4 tests
- **Stock Management** (view items, adjustments, reorder alerts) - 4 tests
- **Outbound** (requisitions, transfers, pick lists, packing, shipping) - 5 tests
- **Reports** (Executive Dashboard, Stock Valuation, ABC, Expiry, Consumption, Vendor Performance, Dead Stock, Fast Moving) - 8 tests
- **Export/Download** (CSV exports from reports) - 2 tests

Add a new **end-to-end warehouse journey** to JOURNEY_TEST_CASES:
- "Full Warehouse Procurement to Dispatch" journey covering PR -> PO -> GRN -> Put-Away -> Requisition -> Pick -> Pack -> Ship
- Roles: Warehouse Admin, Warehouse User
- ~15 steps

Add warehouse demo accounts to the demo accounts list:
- Warehouse Admin: `warehouse.admin@healthos.demo`
- Warehouse User: `warehouse.user@healthos.demo`

### 2. Update `docs/WAREHOUSE_TEST_CASES.md`

- Remove the note saying "Vendor Performance, Dead Stock, and Fast Moving reports are planned enhancements and do not have dedicated pages yet"
- Add test cases for:
  - TC-13.10: Executive Dashboard loads with KPI cards and charts
  - TC-13.11: Vendor Performance report shows vendor spend and PO counts
  - TC-13.12: Dead Stock report shows items with no movement (configurable days)
  - TC-13.13: Fast Moving report shows top items by movement
  - TC-13.14: All report exports (CSV) download correctly
- Update Quick Validation Checklist to include new report pages

### Technical Details

**TestCasesPage.tsx changes:**
- Add 2 warehouse accounts to `demoAccounts` array
- Replace "Inventory" module (lines 816-821) with expanded "Warehouse & Inventory" module (~29 tests)
- Add warehouse journey to `JOURNEY_TEST_CASES` array
- Add "Warehouse Admin" and "Warehouse User" to `getRoleBadgeColor` map
- Update header count text to reflect new totals

**WAREHOUSE_TEST_CASES.md changes:**
- Remove outdated note on line 230
- Add 5 new test rows to TC-13 table
- Add 2 items to Quick Validation Checklist


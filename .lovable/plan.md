

## Add Comprehensive Playwright E2E Tests

### Current State
The project has basic "can open page" smoke tests for each module. The TEST_CASES.md documents much richer flows that aren't covered.

### New Test Files

**1. `tests/e2e/pharmacy-flow.spec.ts`** — Expand from 1 test to 5
- **View Pharmacy Dashboard**: Pharmacist logs in → `/app/pharmacy` → verify dashboard loads with stats cards
- **View Prescription Queue** (existing): verify table visible
- **Search Prescriptions**: navigate to queue → type in search box → verify search input works
- **View Inventory Page**: navigate to `/app/pharmacy/inventory` → verify page loads
- **Open POS Terminal**: navigate to `/app/pharmacy/pos` → verify POS page loads

**2. `tests/e2e/lab-flow.spec.ts`** — Expand from 1 test to 5
- **View Lab Queue** (existing): verify heading and tabs
- **View Lab Dashboard**: Lab Tech → `/app/lab` → verify dashboard loads
- **Check Lab Queue Tabs**: verify "Ordered", "Collected", "Completed" tabs exist
- **Search Lab Orders**: verify search placeholder input is functional
- **View Lab Templates**: navigate to `/app/lab/templates` → verify page loads

**3. `tests/e2e/finance-flow.spec.ts`** — Expand from 2 tests to 5
- **View Accounts Dashboard** (existing)
- **View Billing Invoices** (existing)
- **View Billing Dashboard**: Accountant → `/app/billing` → verify dashboard heading
- **View Payment History**: navigate to `/app/billing/payments` → verify page loads
- **View Daily Closing**: navigate to `/app/billing/daily-closing` → verify page loads

**4. `tests/e2e/emergency-flow.spec.ts`** — New file, 4 tests
- **View ER Dashboard**: Doctor → `/app/emergency` → verify dashboard loads
- **Open ER Registration**: navigate to `/app/emergency/register` → verify registration form
- **View Triage Page**: navigate to `/app/emergency/triage` → verify page loads
- **View ER Queue**: navigate to `/app/emergency/queue` → verify queue page loads

**5. `tests/e2e/opd-flow.spec.ts`** — Expand from 1 test to 4
- **Doctor can open OPD dashboard** (existing)
- **Receptionist views OPD**: Receptionist → `/app/opd` → verify page loads
- **Nurse views nursing queue**: Nurse → `/app/opd/nursing` → verify page loads
- **Doctor views patient search**: Doctor → uses patient search on OPD

### Technical Notes
- All tests use the existing `demoLogin()` utility with role labels matching the login page buttons: "Doctor", "Pharmacist", "Lab Tech", "Accountant", "Receptionist", "Nurse"
- No "Emergency Doctor" button exists — Doctor role navigates to emergency routes
- Tests are smoke-level (page loads, key UI elements visible) since we can't guarantee demo data state
- Each test is independent (separate login per test)


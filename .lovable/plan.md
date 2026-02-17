

# Comprehensive QA Audit & Dashboard Enhancement Plan

## Part 1: Menu Structure Issues Found

### A. IPD Module - Patient Care Children Orphaned (CRITICAL)
- `ipd.care` (id: `507a300b`) is the **active** parent but has **0 direct children**
- `ipd.patient-care` (id: `c239134c`, code prefix used by children like `ipd.care.rounds`) is a **different inactive item** that holds 7 children: Daily Rounds, Vitals, Nursing Notes, Medications, eMAR, Diet, Care Plans
- **Result**: The "Patient Care" submenu appears empty in the sidebar
- **Fix**: Update the 7 children's `parent_id` from `c239134c` to `507a300b`

### B. IPD Records - Empty Group (CRITICAL)
- `ipd.records` (id: `46d4a867`) is active but has **0 children**
- Pages exist: Birth Records (`/app/ipd/birth-records`), Death Records (`/app/ipd/death-records`), IPD Reports (`/app/ipd/reports`)
- **Fix**: Insert 3 child menu items under `ipd.records`

### C. IPD Nursing Station - Missing from Menu
- Route exists: `/app/ipd/nursing` (NursingStationPage)
- No menu item points there
- **Fix**: Add menu item under `ipd.care`

### D. Billing Module - Missing Menu Items
Pages exist but no menu items:
| Page | Route | Status |
|------|-------|--------|
| Insurance Companies | `/app/billing/insurance/companies` | No menu item |
| Insurance Plans | `/app/billing/insurance/plans` | No menu item |
| Claims | `/app/billing/claims` | No menu item |
| Claims Report | `/app/billing/claims-report` | No menu item |
| Daily Closing | `/app/billing/daily-closing` | No menu item |

**Fix**: Add an "Insurance & Claims" submenu and a "Daily Closing" item under Billing

### E. Accounts Module - Missing Menu Items
Only 3 children exist (Dashboard, AR, AP). Missing from menu:
| Page | Route |
|------|-------|
| Chart of Accounts | `/app/accounts/chart-of-accounts` |
| Account Types | `/app/accounts/types` |
| Journal Entries | `/app/accounts/journal-entries` |
| General Ledger | `/app/accounts/ledger` |
| Bank & Cash | `/app/accounts/bank-accounts` |
| Budgets | `/app/accounts/budgets` |
| Financial Reports | `/app/accounts/reports` (parent with sub-routes) |
| Vendor Payments | `/app/accounts/vendor-payments` |

**Fix**: Insert ~8 menu items under Accounts

### F. HR Module - 4 Missing Routes
Menu items exist but no routes in App.tsx:
- `/app/hr/leaves/calendar` - No route
- `/app/hr/leaves/approvals` - No route
- `/app/hr/employees/directory` - No route
- `/app/hr/attendance/corrections` - No route

**Fix**: Add routes + simple redirect/placeholder pages

### G. OPD Module - `required_module` Inconsistency
- OPD parent and several children (Doctor Dashboard, Nurse Station, History) have `required_module: NULL` instead of `'opd'`
- **Fix**: Update to `required_module = 'opd'`

### H. Duplicate Routes in App.tsx
- `opd/nursing` appears twice (lines 644 and 648)
- Several IPD routes are duplicated between lines 691-727 and 893-910
- Radiology routes are defined twice (lines 766-784 and 801-817)
- **Fix**: Remove duplicate route blocks

---

## Part 2: Billing-Accounts-IPD-OPD Linkage Audit

### What Works Well
- Invoices auto-post to journal entries via `post_invoice_to_journal()` trigger
- Payments auto-post via `post_payment_to_journal()` trigger
- Lab orders auto-created from invoices via `create_lab_order_from_invoice()` trigger
- IPD charges tracked in `ipd_charges` table, linked to admissions
- OPD Walk-in creates invoice + appointment + payment in one flow
- IPD Billing Dashboard shows deposit vs charges vs balance per admission
- GRN verification posts to AP via `post_grn_to_journal()` trigger

### Issues Found
1. **No OPD-specific dashboard** exists - OPD only has DoctorDashboard (doctor-centric) and NurseDashboard (nurse-centric). There is no admin/management OPD dashboard showing today's OPD stats, revenue, department-wise breakdown, etc.
2. **IPD Dashboard is basic** - shows stats + recent admissions but lacks financial summary, department-wise occupancy charts, or clinical KPIs

---

## Part 3: New Dashboards Needed

### A. OPD Admin Dashboard (New Page)
A comprehensive OPD management dashboard showing:

- **Stats Row**: Total Patients Today, Completed Consultations, In Queue, Revenue Today
- **Department-wise Breakdown**: Table showing each OPD department with patient count, completed, pending, avg wait time
- **Doctor Performance**: Table with doctor name, patients seen, avg consultation time, revenue generated
- **Hourly Patient Flow**: Bar chart showing patient arrivals per hour
- **Revenue Breakdown**: Today's OPD revenue by payment status (paid, pending, waived)
- **Quick Links**: Walk-in, Reports, Pending Checkouts, History
- **Recent Consultations**: Last 10 completed consultations with status

### B. Enhanced IPD Dashboard (Enhance Existing)
Add to the current IPD Dashboard:

- **Ward-wise Occupancy**: Visual cards per ward showing occupied/total beds, occupancy %
- **Financial Summary Section** (visible to finance roles only): Total deposits, unbilled charges, outstanding balance
- **Clinical KPIs**: Average length of stay, today's procedures, pending lab results
- **Discharge Pipeline**: Visual showing patients by discharge stage (pending summary, pending billing, ready)
- **Recent Activity Feed**: Last 10 actions (admissions, discharges, transfers, rounds)

---

## Implementation Plan

### Step 1: Database Fixes (Menu Items)
- Update 7 IPD care children `parent_id` to correct parent
- Insert ~20 missing menu items (IPD Records, Billing Insurance/Claims/Daily Closing, Accounts sub-items)
- Fix OPD `required_module` values

### Step 2: Code Fixes
- Remove duplicate routes in App.tsx
- Add 4 missing HR routes with redirect pages

### Step 3: Create OPD Admin Dashboard
- New file: `src/pages/app/opd/OPDAdminDashboard.tsx`
- New hook: `src/hooks/useOPDDashboardStats.ts` (queries appointments, invoices, consultations for today)
- Add route: `/app/opd/admin-dashboard`
- Add menu item: `opd.admin_dashboard`

### Step 4: Enhance IPD Dashboard
- Add ward occupancy section to `IPDDashboard.tsx`
- Add financial summary (gated by `canViewFinancials`)
- Add discharge pipeline visualization
- New hook: `src/hooks/useIPDDashboardStats.ts` for ward-level stats

---

## Technical Details

| File | Change |
|------|--------|
| Database `menu_items` | ~20 INSERT + 8 UPDATE statements |
| `src/App.tsx` | Remove duplicate routes, add 5 new routes |
| `src/pages/app/opd/OPDAdminDashboard.tsx` | New file - comprehensive OPD dashboard |
| `src/hooks/useOPDDashboardStats.ts` | New hook - OPD stats queries |
| `src/pages/app/ipd/IPDDashboard.tsx` | Enhance with ward occupancy, financial summary, discharge pipeline |
| `src/hooks/useIPDDashboardStats.ts` | New hook - ward-level stats, clinical KPIs |
| 4 HR placeholder pages | Simple redirect pages for missing routes |


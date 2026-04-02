

# HMIS Aging Report — Complete Audit & Enhancement Plan

## Audit Findings

```text
REQUIREMENT                          CURRENT STATE                               VERDICT
──────────────────────────────────── ─────────────────────────────────────────── ───────
A. Aging calculation basis           Invoice date only, no due_date column       PARTIAL
   Bucket correctness                Current/1-30/31-60/61-90/90+ ✓             PASS
B. Module coverage                   Only "invoices" table queried               FAIL
   OPD/IPD/Lab/Pharmacy/Corporate    No department breakdown, no source filter   FAIL
   Insurance Claims                  Claims have aging in useClaimsReports       PARTIAL
C. Insurance aging basis             Uses created_at, not submission_date        FAIL
   Claim statuses supported          Yes (pending/submitted/approved/rejected)   PASS
   Unpaid/partial claims in aging    Only pending/submitted, not partial         PARTIAL
D. Partial payments                  Uses (total - paid_amount) = outstanding    PASS
E. Credit notes / write-offs         credit_notes table exists but NOT deducted  FAIL
   Discounts                         discount_amount on invoice, not factored    FAIL
F. GL sync / AR = GL balance         AR Reconciliation page exists separately    PASS
G. Department-level filtering        No department/source on receivables page    FAIL
H. Drill-down to invoice/patient     Can click View/Collect per invoice          PARTIAL
   Payment history visible           Not shown inline                            FAIL
I. Real-time updates                 React Query, live on page load              PASS
```

## Key Gaps

1. **No department filter** — invoices lack a `source_type` column; must infer department from `invoice_items` (service_type_id, lab_order_id, medicine_inventory_id, bed_id) or from `notes` field
2. **Insurance receivables hardcoded to 0** — `insuranceReceivable = 0` on line 92
3. **Credit notes not deducted** from outstanding balances
4. **No insurance claim aging tab** — claims aging exists in a separate reports page but not integrated into the AR view
5. **No CFO dashboard view** with high-risk accounts, top defaulters
6. **Payables page** only shows GRNs with status "posted" — misses "verified" GRNs
7. **No configurable credit terms** — aging always calculated from invoice_date with fixed buckets
8. **No write-off tracking** in AR

## Enhancement Plan

### 1. Create unified Aging Report hook: `src/hooks/useAgingReport.ts`

Centralizes all aging logic for both AR and AP:

**AR Query** — fetch invoices with status `pending`/`partially_paid`, join `patient`, `invoice_items` (to detect department via service_type_id/lab_order_id/bed_id/medicine_inventory_id), and `credit_notes` (approved, same invoice_id). Calculate:
- `outstanding = total_amount - paid_amount - SUM(approved credit_notes.total_amount)`
- `days_outstanding` from invoice_date
- `department` inferred from invoice_items: has bed_id → IPD, has lab_order_id → Lab, has medicine_inventory_id → Pharmacy, has service_type_id → check service_type category, fallback → OPD

**Insurance AR Query** — fetch `insurance_claims` with status NOT in `paid`/`rejected`, join `insurance_companies`, `patients`. Calculate:
- `outstanding = total_amount - (paid_amount || 0)`
- `days_outstanding` from `submission_date` (not created_at)
- Bucket into same aging categories

**AP Query** — reuse existing PayablesPage logic (GRNs with outstanding > 0)

**Aging buckets**: Current (0 days), 1-30, 31-60, 61-90, 90+

Returns: `{ arSummary, arInvoices[], insuranceClaims[], apSummary, apGrns[], topDefaulters[], departmentBreakdown[] }`

### 2. Rebuild Receivables Page: `src/pages/app/accounts/ReceivablesPage.tsx`

Complete rewrite with tabbed layout:

**Summary Cards (6):**
- Total AR Outstanding
- Patient Receivables
- Insurance Receivables (from claims)
- Overdue (>30 days)
- Credit Notes Applied
- Top Defaulter Amount

**Tabs:**

**Tab 1: Patient Aging** — existing invoice table + new columns:
- Department badge (OPD/IPD/Lab/Pharmacy)
- Credit note adjustments shown
- Aging bucket badge
- Filter by department, aging bucket, date range
- Drill-down: click row → invoice detail with payment history

**Tab 2: Insurance Aging** — from insurance_claims:
- Claim #, Insurance Company, Patient, Submission Date, Claim Amount, Approved, Paid, Outstanding, Status, Aging
- Aging based on submission_date
- Filter by insurer, status, aging bucket

**Tab 3: Department Summary** — pivot table:
- Rows: OPD, IPD, Lab, Pharmacy, Radiology
- Columns: Current, 1-30, 31-60, 61-90, 90+, Total
- Both count and amount

**Tab 4: Top Defaulters** — grouped by patient/company:
- Patient name, total invoices, total outstanding, oldest invoice, avg days outstanding
- Sorted by outstanding amount desc

**CFO Dashboard section** at top (collapsible):
- Aging bucket bar chart (existing, keep)
- Pie chart: department split
- High-risk indicator: count & amount of 90+ days

**Export**: Excel/CSV per tab with ReportExportButton

### 3. Enhance Payables Page: `src/pages/app/accounts/PayablesPage.tsx`

- Add aging bar chart (same as AR page)
- Fix query: include GRNs with status `verified` OR `posted` (currently only `posted`)
- Add vendor aging summary tab (grouped by vendor with bucket breakdown)

### 4. Add sidebar links

In `role-sidebars.ts`, under Receivables children:
- "Outstanding" (existing)
- "Insurance Aging" → same page, auto-selects insurance tab via query param

### 5. Translations

Add all new labels to `en.ts`, `ur.ts`, `ar.ts`:
- `aging.title`, `aging.patientAging`, `aging.insuranceAging`, `aging.departmentSummary`, `aging.topDefaulters`
- `aging.submissionDate`, `aging.claimNumber`, `aging.insurer`, `aging.creditApplied`, `aging.writeOff`
- `aging.current`, `aging.bucket_1_30`, `aging.bucket_31_60`, `aging.bucket_61_90`, `aging.bucket_90_plus`
- `aging.department`, `aging.highRisk`, `aging.avgDaysOutstanding`, `aging.oldestInvoice`

## Files to Change

- **Create**: `src/hooks/useAgingReport.ts` — unified aging engine with AR, insurance, AP, department breakdown
- **Rewrite**: `src/pages/app/accounts/ReceivablesPage.tsx` — 4-tab CFO-grade aging report
- **Edit**: `src/pages/app/accounts/PayablesPage.tsx` — add aging chart, fix GRN status filter, add vendor summary
- **Edit**: `src/config/role-sidebars.ts` — add Insurance Aging link under Receivables
- **Edit**: `src/lib/i18n/translations/en.ts` — English labels
- **Edit**: `src/lib/i18n/translations/ur.ts` — Urdu labels
- **Edit**: `src/lib/i18n/translations/ar.ts` — Arabic labels

No database migration needed — all required data exists in invoices, invoice_items, insurance_claims, credit_notes, goods_received_notes, vendor_payments tables.


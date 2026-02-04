
# Consolidated Day-End Summary Report with Doctor Compensation

## Overview

This report page provides a **complete financial picture** for end-of-day processing, including all collections, doctor settlements paid out during the day, and the **net amount to submit** to management. This fills a critical gap where doctor payouts were not being accounted for in daily cash submissions.

---

## Problem Statement

Currently, the Daily Closing page tracks:
- Total collections by payment method (Cash, Card, UPI, Other)
- Session reconciliation
- Outstanding receivables

**What's Missing:**
- Doctor settlements/compensation paid during the day
- Vendor payments made
- Expenses/petty cash used
- **Net cash to submit** (Collections - Payouts)

---

## Solution: Day-End Summary Report

A comprehensive report that shows:

```text
+================================================+
|          DAY-END FINANCIAL SUMMARY             |
|          February 4, 2026                      |
+================================================+

COLLECTIONS
+--------------------------------------------+
| Payment Method      | Amount               |
+--------------------------------------------+
| Cash                | Rs. 185,000          |
| Card/Credit         | Rs. 65,000           |
| UPI/Online          | Rs. 28,000           |
| JazzCash/EasyPaisa  | Rs. 12,000           |
+--------------------------------------------+
| TOTAL COLLECTIONS   | Rs. 290,000          |
+--------------------------------------------+

COLLECTIONS BY DEPARTMENT
+--------------------------------------------+
| OPD                 | Rs. 85,000           |
| IPD                 | Rs. 125,000          |
| Pharmacy            | Rs. 45,000           |
| Laboratory          | Rs. 25,000           |
| Radiology           | Rs. 10,000           |
+--------------------------------------------+

PAYOUTS & DEDUCTIONS
+--------------------------------------------+
| Doctor Settlements  | Rs. 42,000           |
|   - Dr. Ahmed (OPD) |   Rs. 15,000         |
|   - Dr. Sara (Surg) |   Rs. 22,000         |
|   - Dr. Ali (IPD)   |   Rs. 5,000          |
+--------------------------------------------+
| Vendor Payments     | Rs. 8,500            |
| Petty Cash/Expense  | Rs. 2,500            |
+--------------------------------------------+
| TOTAL PAYOUTS       | Rs. 53,000           |
+--------------------------------------------+

RECONCILIATION
+--------------------------------------------+
| Total Cash Collected| Rs. 185,000          |
| Less: Doctor Payouts| Rs. 42,000           |
| Less: Other Payouts | Rs. 11,000           |
+--------------------------------------------+
| NET CASH TO SUBMIT  | Rs. 132,000          |
+--------------------------------------------+

| Expected Cash in Hand| Rs. 132,000         |
| Actual Cash Count    | Rs. 131,800         |
| Difference           | -Rs. 200 (Short)    |
+--------------------------------------------+

OUTSTANDING RECEIVABLES
+--------------------------------------------+
| Pending Invoices    | Rs. 28,500 (12)      |
| Credit Given Today  | Rs. 15,000           |
| Credit Recovered    | Rs. 8,000            |
+--------------------------------------------+

        [ Print Report ]  [ Export PDF ]
```

---

## Implementation Plan

### New Hook: `useDayEndSummary.ts`

Creates a comprehensive summary by fetching:

1. **Collections** - From `payments` table filtered by date
2. **Doctor Settlements** - From `doctor_settlements` where `settlement_date = today`
3. **Vendor Payments** - From `vendor_payments` where `payment_date = today`
4. **Expenses** - From `expenses` or petty cash transactions
5. **Outstanding** - Pending invoices from `invoices` table

```typescript
interface DayEndSummary {
  date: string;
  
  // Collections
  collections: {
    byMethod: { method: string; amount: number }[];
    byDepartment: { department: string; amount: number }[];
    totalCash: number;
    totalNonCash: number;
    grandTotal: number;
  };
  
  // Payouts
  payouts: {
    doctorSettlements: {
      total: number;
      items: { doctorName: string; amount: number; settlementNumber: string }[];
    };
    vendorPayments: {
      total: number;
      items: { vendorName: string; amount: number; paymentNumber: string }[];
    };
    expenses: {
      total: number;
      items: { description: string; amount: number }[];
    };
    totalPayouts: number;
  };
  
  // Reconciliation
  reconciliation: {
    totalCashCollected: number;
    cashPayouts: number;
    netCashToSubmit: number;
    actualCashCount?: number;
    difference?: number;
  };
  
  // Outstanding
  outstanding: {
    pendingInvoices: number;
    pendingAmount: number;
    creditGivenToday: number;
    creditRecoveredToday: number;
  };
  
  // Transaction counts
  transactionCount: number;
  invoiceCount: number;
  paymentCount: number;
}
```

### New Page: `DayEndSummaryReport.tsx`

Location: `src/pages/app/reports/DayEndSummaryReport.tsx`

**Features:**
- Date picker to view any day's summary
- Branch filter for multi-branch organizations
- Collapsible sections for each category
- Detailed breakdown tables
- Professional PDF export with organization branding
- Print-optimized layout

**UI Structure:**
```text
┌─────────────────────────────────────────────────┐
│ PageHeader: Day-End Summary Report              │
│ [Date Picker] [Branch Filter] [Export ▼]        │
├─────────────────────────────────────────────────┤
│ Summary Cards (4-grid):                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ │Collections│ │ Payouts  │ │Net Submit│ │Outstanding│
│ │ Rs.290K  │ │ Rs.53K   │ │ Rs.132K  │ │ Rs.28.5K │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘
├─────────────────────────────────────────────────┤
│ Tabs: [Collections] [Payouts] [Reconciliation]  │
├─────────────────────────────────────────────────┤
│ Collections Tab:                                │
│   - By Payment Method (table)                   │
│   - By Department (table)                       │
│   - Individual Payments (expandable)            │
├─────────────────────────────────────────────────┤
│ Payouts Tab:                                    │
│   - Doctor Settlements (table with details)     │
│   - Vendor Payments (table)                     │
│   - Expenses/Petty Cash (table)                 │
├─────────────────────────────────────────────────┤
│ Reconciliation Tab:                             │
│   - Cash flow summary                           │
│   - Net calculation                             │
│   - Discrepancy notes                           │
└─────────────────────────────────────────────────┘
```

### PDF Export Enhancement

Extends existing `pdfExport.ts` with a specialized `generateDayEndSummaryPDF()` function:

- Multi-section layout
- Collections breakdown
- Payouts with doctor details
- Net calculation prominently displayed
- Signature lines for:
  - Prepared By (Cashier)
  - Verified By (Manager)
  - Received By (Accountant)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useDayEndSummary.ts` | Comprehensive data aggregation hook |
| `src/pages/app/reports/DayEndSummaryReport.tsx` | Main report page |
| `src/components/reports/DayEndSummaryPDF.tsx` | PDF generation component |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add route `/app/reports/day-end-summary` |
| `src/pages/app/reports/ReportsHubPage.tsx` | Add card/link to Day-End Summary |
| `src/config/role-sidebars.ts` | Add menu item for finance roles |
| `src/lib/pdfExport.ts` | Add `generateDayEndSummaryPDF()` function |

---

## Technical Details

### Database Queries

**Doctor Settlements for Date:**
```sql
SELECT ds.*, 
  d.employee_id,
  e.first_name, e.last_name
FROM doctor_settlements ds
JOIN doctors d ON ds.doctor_id = d.id
JOIN employees e ON d.employee_id = e.id
WHERE ds.settlement_date = :date
  AND ds.organization_id = :org_id
```

**Vendor Payments for Date:**
```sql
SELECT vp.*, v.name as vendor_name
FROM vendor_payments vp
JOIN vendors v ON vp.vendor_id = v.id
WHERE DATE(vp.payment_date) = :date
  AND vp.organization_id = :org_id
```

**Payments by Method:**
```sql
SELECT pm.name as method, SUM(p.amount) as total
FROM payments p
JOIN payment_methods pm ON p.payment_method_id = pm.id
WHERE DATE(p.created_at) = :date
  AND p.branch_id = :branch_id
GROUP BY pm.name
```

### Integration with Daily Closing

The new report complements the Daily Closing wizard:
- Daily Closing = Operational (close sessions, count cash)
- Day-End Summary = Financial (full picture with payouts)

Users can:
1. Complete Daily Closing wizard
2. View/Print Day-End Summary Report for records
3. Submit net amount based on the report

---

## Security & Permissions

- Viewable by: `accountant`, `billing_manager`, `branch_admin`, `org_admin`, `super_admin`
- PDF export includes audit metadata (generated by, timestamp)
- Read-only report - no mutations

---

## Expected Outcome

After implementation:
1. Complete visibility of all cash inflows and outflows for the day
2. Doctor settlements clearly shown as deductions
3. Net cash to submit calculated automatically
4. Professional PDF for audit trail
5. Integration with existing Daily Closing workflow

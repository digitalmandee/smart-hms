

# Fix Day-End Summary Report - Complete Invoice & Department Tracking

## The Problem

You correctly identified that the current implementation is flawed:

| Issue | Current State | Correct State |
|-------|---------------|---------------|
| Payments source | Fetched directly from `payments` table | Must trace through `invoices` to get context |
| Department breakdown | Hardcoded as "General" | From `invoice_items` → `service_types.category` |
| Invoice tracking | Not tracked at all | All invoices created today |
| Credit logic | Placeholder values (0) | Compare invoice vs payment dates |

### Data Flow in HMS

```text
Payment Collection Flow:
Reception/Billing → Creates Invoice → Records Payment against Invoice

payments.invoice_id → invoices.id → invoice_items → service_types.category
                                                          ↓
                                              (consultation, lab, radiology, etc.)
```

---

## Solution: Correct Data Aggregation

### Step 1: Fetch Invoices Created Today (Not Just Payments)

```typescript
// Invoices created today - the REAL source of billing activity
const invoicesCreatedToday = await supabase
  .from("invoices")
  .select(`
    id, invoice_number, total_amount, paid_amount, status, created_at,
    patient:patients!invoices_patient_id_fkey(first_name, last_name),
    created_by_profile:profiles!invoices_created_by_fkey(full_name)
  `)
  .eq("organization_id", orgId)
  .gte("created_at", startDate)
  .lte("created_at", endDate)
  .neq("status", "cancelled");
```

### Step 2: Get Department Breakdown from Invoice Items

Instead of showing "General", properly categorize by department:

```typescript
// Get invoice items with service categories for department breakdown
const invoiceItemsRes = await supabase
  .from("invoice_items")
  .select(`
    id, total_price, service_type_id,
    invoice:invoices!invoice_items_invoice_id_fkey(
      id, created_at, status, branch_id
    ),
    service_type:service_types(id, category, name)
  `)
  .gte("invoice.created_at", startDate)
  .lte("invoice.created_at", endDate)
  .neq("invoice.status", "cancelled");

// Group by service_types.category
const byDepartment = groupByCategory(invoiceItemsRes.data);
// Result: { consultation: 85000, lab: 45000, radiology: 32000, ... }
```

### Step 3: Payments Linked to Invoice Categories

For collections (actual cash received), trace payment → invoice → invoice_items:

```typescript
// Payments made today with invoice details
const paymentsRes = await supabase
  .from("payments")
  .select(`
    id, amount, payment_method_id, created_at,
    invoice:invoices!payments_invoice_id_fkey(
      id, created_at
    )
  `)
  .eq("organization_id", orgId)
  .gte("created_at", startDate)
  .lte("created_at", endDate);
```

### Step 4: Credit Given vs Recovered

```typescript
// Credit Given Today = Invoices created today that are still unpaid
const creditGivenToday = invoicesCreatedToday
  .filter(inv => inv.status !== 'paid')
  .reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);

// Credit Recovered Today = Payments today for invoices created BEFORE today
const creditRecoveredToday = payments
  .filter(p => new Date(p.invoice.created_at) < startOfDay(date))
  .reduce((sum, p) => sum + p.amount, 0);
```

---

## Updated Interface

```typescript
interface DayEndSummary {
  // ... existing fields ...
  
  // NEW: Invoices section
  invoices: {
    created: InvoiceCreatedToday[];
    totalCount: number;
    totalAmount: number;
    paidCount: number;
    paidAmount: number;
    pendingCount: number;
    pendingAmount: number;
    byDepartment: { department: string; amount: number; count: number }[];
  };
  
  // FIXED: Collections now properly categorized
  collections: {
    byMethod: PaymentByMethod[];      // Cash, Card, UPI, etc.
    byDepartment: PaymentByDepartment[]; // Consultation, Lab, Radiology, etc.
    totalCash: number;
    totalNonCash: number;
    grandTotal: number;
  };
  
  // FIXED: Credit tracking
  outstanding: {
    pendingInvoices: number;
    pendingAmount: number;
    creditGivenToday: number;    // Pay-later invoices created today
    creditRecoveredToday: number; // Payments for old invoices
  };
}
```

---

## UI Updates

### New Invoices Tab

| Invoice # | Patient | Department | Amount | Paid | Status | Created By |
|-----------|---------|------------|--------|------|--------|------------|
| INV-0001 | Ahmed Khan | Consultation | 5,000 | 5,000 | Paid | Reception |
| INV-0002 | Sara Ali | Lab | 8,500 | 0 | Pending | Reception |
| INV-0003 | Bilal | Surgery | 125,000 | 50,000 | Partial | IPD |

### Fixed Collections Tab

**By Department (from service_types.category):**

| Department | Invoice Amount | Collections | Count |
|------------|----------------|-------------|-------|
| Consultation | Rs. 85,000 | Rs. 82,000 | 28 |
| Laboratory | Rs. 48,000 | Rs. 45,000 | 15 |
| Radiology | Rs. 35,000 | Rs. 32,000 | 8 |
| Surgery/OT | Rs. 150,000 | Rs. 125,000 | 3 |
| Room Charges | Rs. 45,000 | Rs. 45,000 | 5 |
| Pharmacy | Rs. 28,000 | Rs. 28,000 | 12 |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useDayEndSummary.ts` | Complete rewrite of data fetching logic |
| `src/pages/app/reports/DayEndSummaryReport.tsx` | Add Invoices tab, fix department display |
| `src/lib/pdfExport.ts` | Include invoice summary in PDF |

---

## Technical Implementation

### Query 1: Invoices Created Today
```sql
SELECT i.*, p.first_name, p.last_name, pr.full_name as created_by_name
FROM invoices i
JOIN patients p ON i.patient_id = p.id
LEFT JOIN profiles pr ON i.created_by = pr.id
WHERE DATE(i.created_at) = :date
  AND i.organization_id = :org_id
  AND i.status != 'cancelled'
```

### Query 2: Invoice Items with Categories
```sql
SELECT 
  COALESCE(st.category, 'other') as department,
  SUM(ii.total_price) as invoiced_amount,
  COUNT(DISTINCT i.id) as invoice_count
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
LEFT JOIN service_types st ON ii.service_type_id = st.id
WHERE DATE(i.created_at) = :date
  AND i.organization_id = :org_id
  AND i.status != 'cancelled'
GROUP BY st.category
```

### Query 3: Payments with Invoice Dates (for credit recovery)
```sql
SELECT 
  pay.amount, pay.payment_method_id,
  DATE(inv.created_at) as invoice_created_date
FROM payments pay
JOIN invoices inv ON pay.invoice_id = inv.id
WHERE DATE(pay.created_at) = :date
  AND pay.organization_id = :org_id
```

---

## Expected Outcome

After implementation:
1. All invoices created by reception/billing staff are tracked
2. Department breakdown uses actual service categories (not hardcoded "General")
3. Credit given today (pay-later) is calculated correctly
4. Credit recovered (old invoice payments) is calculated correctly
5. PDF report includes complete invoice summary
6. Reconciliation shows accurate net cash based on actual transaction data


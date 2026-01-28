

# Comprehensive HMS Enhancement Plan: Executive Dashboard, Reports, Doctor Commissions, E-Prescriptions & Ledger Integration

## Executive Summary

After thorough analysis of the codebase, I've identified several gaps and enhancement opportunities across multiple modules. This plan addresses:

1. **Executive Dashboard** - Missing detailed metrics, clickable drill-downs, and export functionality
2. **Reports System** - Missing pagination, PDF export footers, and advanced filters
3. **Doctor Daily Commission System** - Settlement workflow and daily payout reports
4. **E-Prescription** - Currently saves properly but needs print/view enhancements
5. **Ledger Integration** - Payment method to specific accounts mapping

---

## Current System Analysis

### Executive Dashboard Status

| Metric | Current State | Gap |
|--------|---------------|-----|
| Total Revenue | Shows | OK |
| Lab Orders | Shows count only | Missing revenue, pending details |
| Pharmacy | Month/Today sales | Missing stock alerts, expiry warnings |
| Beds | Occupancy % only | Missing Free/Occupied count |
| Gross vs Net | Not shown | Missing expenses, net calculation |
| Clickable Cards | Not implemented | Cannot drill down to details |
| Export | Button exists but non-functional | PDF/Excel not working |
| Filters | Period only | Missing Branch, Department |

### Doctor Commission System

| Feature | Exists | Status |
|---------|--------|--------|
| `doctor_earnings` table | Yes | Real-time auto-credits via triggers |
| Wallet Balances Page | Yes | `/app/hr/payroll/wallet-balances` |
| Mark as Paid | Yes | Works - updates `is_paid` flag |
| Daily Commissions Report | No | Missing dedicated report |
| Settlement with Receipt | Partial | No settlement receipt/confirmation |
| Payment Tracking | Partial | No detailed payment history log |

### E-Prescription System

| Feature | Exists | Status |
|---------|--------|--------|
| PrescriptionBuilder | Yes | Works during consultation |
| Save to Database | Yes | `prescriptions` + `prescription_items` tables |
| PrintablePrescription | Yes | Professional format with Rx# |
| View Previous | Yes | Shows in patient profile |
| Drug Interaction Warnings | No | Not implemented |

### Ledger/Journal Integration

| Payment Method | Current Mapping | Gap |
|----------------|-----------------|-----|
| Cash | CASH-001 (Cash in Hand) | OK |
| Card | CASH-001 | Should go to BANK-001 |
| Bank Transfer | CASH-001 | Should go to specific bank account |
| JazzCash | CASH-001 | Should go to JazzCash wallet account |
| EasyPaisa | CASH-001 | Should go to EasyPaisa wallet account |

**Issue**: The `post_payment_to_journal()` trigger always uses `CASH-001` regardless of payment method. It should map to the correct ledger account based on `payment_method_id`.

---

## Implementation Plan

### Phase 1: Enhanced Executive Dashboard

**File: `src/hooks/useExecutiveSummary.ts`**
- Add gross revenue vs net profit calculation (revenue - expenses)
- Add beds occupied/free count (not just %)
- Add lab revenue from invoice items
- Add pharmacy low stock count and expiry warnings
- Add radiology pending orders

**File: `src/pages/app/reports/ExecutiveDashboardReport.tsx`**
- Make all KPI cards clickable with navigation to detail pages
- Add Branch filter
- Add proper PDF export using `generatePDFReport()` utility
- Add detailed breakdown tables for each department
- Add revenue vs expenses chart (gross/net)
- Add beds visual (occupied/free/maintenance)

**New Components**:
```
src/components/reports/
  ExecutiveDetailDialog.tsx - Modal for drill-down details
  BedOccupancyChart.tsx - Visual bed status
  RevenueVsExpenseChart.tsx - Gross vs Net visual
```

### Phase 2: Doctor Daily Commission Reports

**New Page: `src/pages/app/hr/payroll/DailyCommissionReport.tsx`**

Features:
- Date picker for specific day
- All doctors' earnings for that day
- Source breakdown (Consultation, Surgery, IPD Visit, etc.)
- Patient name and reference
- Paid/Unpaid status
- Export to CSV/PDF

**Enhanced: `src/pages/app/hr/payroll/DoctorWalletBalancesPage.tsx`**

Add:
- Daily view toggle (Today / This Week / This Month)
- Settlement dialog with amount confirmation
- Print settlement receipt
- Settlement history log

**New Component: `src/components/hr/SettlementReceiptDialog.tsx`**

Features:
- Shows doctor name, amount, breakdown
- Generates settlement receipt number
- Updates `is_paid` and logs settlement
- Print receipt option

### Phase 3: Ledger Integration Fix

**Database Migration**: Add `ledger_account_id` to `payment_methods` table

```sql
ALTER TABLE payment_methods 
ADD COLUMN ledger_account_id UUID REFERENCES accounts(id);
```

**Update Trigger: `post_payment_to_journal()`**

Modify to:
1. Look up payment method from `payments` table
2. Get `ledger_account_id` from `payment_methods`
3. If null, fall back to `CASH-001`
4. Debit the correct account (Cash/Bank/JazzCash/EasyPaisa)

**Seed default accounts**:
- CASH-001: Cash in Hand
- BANK-001: Bank Account (for card/transfer)
- JAZZCASH-001: JazzCash Wallet
- EASYPAISA-001: EasyPaisa Wallet

**Update Payment Methods Settings**: Add ledger account selector in payment method form

### Phase 4: Reports Enhancement

**All Report Pages - Add these features**:

1. **Pagination** using `ReportTable.tsx`
   - Already created, integrate into existing reports
   - Apply to: Billing, HR, Pharmacy, Lab reports

2. **PDF Export Footer**
   - Update `generatePDFReport()` to include:
     - Page numbers
     - Generation timestamp
     - Organization signature line

3. **Enhanced Filters**
   - Department filter on all financial reports
   - Shift filter on collection reports
   - Cashier filter on billing reports

**Files to Update**:
```
src/pages/app/billing/BillingReportsPage.tsx
src/pages/app/hr/HRReportsPage.tsx
src/pages/app/hr/payroll/PayrollReportsPage.tsx
src/pages/app/lab/LabReportsPage.tsx
```

### Phase 5: E-Prescription Enhancements

**Current Flow (Working)**:
1. Doctor adds medicines in `PrescriptionBuilder`
2. On "Complete Consultation", `createPrescription.mutateAsync()` is called
3. Prescription saved with `prescription_number` (RX-YYYYMMDD-XXXX)
4. Can print via `PrintablePrescription`

**Enhancements Needed**:

**File: `src/components/consultation/PrintablePrescription.tsx`**
- Add QR code with prescription ID for pharmacy verification
- Add drug interaction warning section (if implemented)
- Add refill information

**New Feature: View Prescription Page**
- `/app/prescriptions/:id` - Standalone view page
- Shows full prescription details
- Print button
- Status (Active/Dispensed/Expired)

---

## Technical Implementation Details

### 1. Executive Dashboard Enhancement

```typescript
// Enhanced useExecutiveSummary hook additions
interface ExecutiveSummary {
  // ... existing
  beds: {
    total: number;
    occupied: number;
    free: number;
    maintenance: number;
    occupancyRate: number;
  };
  financial: {
    grossRevenue: number;
    totalExpenses: number;
    netProfit: number;
    // ... existing
  };
  lab: {
    ordersProcessed: number;
    pendingOrders: number;
    revenue: number;  // Calculate from invoice_items
    urgentPending: number;
  };
}
```

### 2. Doctor Settlement Flow

```typescript
// New settlement mutation
export function useSettleDoctorEarnings() {
  return useMutation({
    mutationFn: async ({ 
      doctorId, 
      earningIds, 
      settlementMethod, 
      referenceNumber 
    }) => {
      // 1. Update earnings to is_paid = true
      // 2. Create settlement record in new table
      // 3. Return settlement receipt data
    }
  });
}
```

### 3. Ledger Account Mapping

```sql
-- Update payment trigger to use correct account
CREATE OR REPLACE FUNCTION post_payment_to_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_target_account UUID;
  v_payment_method RECORD;
BEGIN
  -- Get payment method details
  SELECT pm.* INTO v_payment_method 
  FROM payment_methods pm 
  WHERE pm.id = NEW.payment_method_id;
  
  -- Use mapped account or default to cash
  v_target_account := COALESCE(
    v_payment_method.ledger_account_id,
    get_or_create_default_account(org_id, 'CASH-001', 'Cash in Hand', 'asset')
  );
  
  -- Debit the correct account
  -- ... rest of journal entry logic
END;
$$ LANGUAGE plpgsql;
```

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/app/hr/payroll/DailyCommissionReport.tsx` | Daily doctor earnings report |
| `src/components/hr/SettlementReceiptDialog.tsx` | Settlement confirmation with receipt |
| `src/components/reports/ExecutiveDetailDialog.tsx` | Drill-down modal for dashboard |
| `src/components/reports/BedOccupancyChart.tsx` | Visual bed status chart |
| `src/pages/app/prescriptions/PrescriptionViewPage.tsx` | Standalone prescription view |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useExecutiveSummary.ts` | Add beds detail, lab revenue, net profit |
| `src/pages/app/reports/ExecutiveDashboardReport.tsx` | Clickable cards, PDF export, drill-downs |
| `src/pages/app/hr/payroll/DoctorWalletBalancesPage.tsx` | Settlement receipt, date filters |
| `src/lib/pdfExport.ts` | Add page numbers, footer improvements |
| `src/components/reports/ReportExportButton.tsx` | Ensure PDF footer included |
| `supabase/migrations/` | Add ledger_account_id to payment_methods |
| `src/pages/app/settings/PaymentMethodFormPage.tsx` | Add ledger account selector |

---

## Database Changes Required

1. **Add ledger_account_id to payment_methods**
```sql
ALTER TABLE payment_methods 
ADD COLUMN ledger_account_id UUID REFERENCES accounts(id);
```

2. **Create doctor_settlements table** (optional - for settlement history)
```sql
CREATE TABLE doctor_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  doctor_id UUID REFERENCES doctors(id),
  settlement_date DATE NOT NULL,
  settlement_number TEXT UNIQUE,
  total_amount DECIMAL(15,2),
  earning_ids UUID[],
  payment_method TEXT,
  reference_number TEXT,
  settled_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. **Update post_payment_to_journal trigger** to use payment method's ledger account

---

## Summary of Deliverables

| Category | Items |
|----------|-------|
| Executive Dashboard | 6 enhanced KPI cards, drill-downs, PDF export, branch filter |
| Doctor Commissions | Daily report page, settlement workflow, receipt generation |
| Reports | Pagination across all reports, PDF footers, enhanced filters |
| E-Prescriptions | Working (confirmed), add view page and QR code |
| Ledger Integration | Payment method to account mapping, trigger update |

This comprehensive enhancement will transform the HMS reporting and financial tracking capabilities to professional-grade standards with proper audit trails and detailed analytics.


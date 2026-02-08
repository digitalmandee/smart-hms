

# Add Expense/Petty Cash Tracking, Fix Vendor Payments Filter, and Session-Based Reconciliation

## Current State Analysis

| Component | Current Status | Issue |
|-----------|---------------|-------|
| **Expenses Table** | Does NOT exist | No way to track petty cash/expenses |
| **Vendor Payments Filter** | Missing date filter | Shows ALL vendor payments instead of today's |
| **Daily Closing** | Fetches raw payments | Should aggregate from closed sessions |
| **Session Linking** | Payments have `billing_session_id` | Not utilized in reconciliation |
| **Day-End Summary** | Expenses section placeholder | Always shows Rs. 0 |

---

## Solution Overview

### Part 1: Create Expenses/Petty Cash System

Create a new `expenses` table to track cash outflows during a billing session.

**Database Schema:**
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  billing_session_id UUID REFERENCES billing_sessions(id),
  expense_number VARCHAR(50) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  category VARCHAR(50), -- 'petty_cash', 'refund', 'staff_advance', 'misc'
  description TEXT NOT NULL,
  paid_to VARCHAR(255),
  payment_method_id UUID REFERENCES payment_methods(id),
  reference_number VARCHAR(100),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**New Hook: `useExpenses.ts`**
- `useSessionExpenses(sessionId)` - Expenses for a specific session
- `useBranchExpenses(branchId, date)` - All expenses for a date
- `useCreateExpense()` - Record a new expense
- `useApproveExpense()` - Manager approval for expenses

### Part 2: Fix Vendor Payments Date Filter

Current code in `useDayEndSummary.ts`:
```typescript
// WRONG - No date filter
const vpRes = await supabase
  .from("vendor_payments")
  .select("*")
  .eq("organization_id", orgId);
```

Fixed code:
```typescript
// CORRECT - Filter by payment_date
const vpRes = await supabase
  .from("vendor_payments")
  .select("*")
  .eq("organization_id", orgId)
  .gte("payment_date", dateStr)
  .lte("payment_date", dateStr);
```

### Part 3: Session-Based Reconciliation

Instead of aggregating from raw `payments` table, use closed `billing_sessions`:

```typescript
// Current (WRONG): Aggregate from payments
const payments = await fetchPaymentsForDate(...);
let cashTotal = 0;
payments.forEach(p => cashTotal += p.amount);

// Fixed (CORRECT): Use session totals
const sessions = await fetchClosedSessionsForDate(...);
const reconciledData = {
  totalExpectedCash: sessions.reduce((sum, s) => sum + s.expected_cash, 0),
  totalActualCash: sessions.reduce((sum, s) => sum + s.actual_cash, 0),
  totalCardCollections: sessions.reduce((sum, s) => sum + s.card_total, 0),
  totalUPICollections: sessions.reduce((sum, s) => sum + s.upi_total, 0),
  totalExpenses: sessionExpenses.reduce((sum, e) => sum + e.amount, 0),
  netCash: totalActualCash - totalExpenses,
};
```

---

## Implementation Plan

### Phase 1: Database & Backend

**1.1 Create `expenses` table (SQL migration)**
```sql
-- Create expenses table for petty cash/expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  billing_session_id UUID REFERENCES billing_sessions(id),
  expense_number VARCHAR(50) NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) DEFAULT 'petty_cash',
  description TEXT NOT NULL,
  paid_to VARCHAR(255),
  payment_method_id UUID REFERENCES payment_methods(id),
  reference_number VARCHAR(100),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_category CHECK (
    category IN ('petty_cash', 'refund', 'staff_advance', 'misc', 'other')
  )
);

-- RLS policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_org_access" ON expenses
  FOR ALL USING (organization_id = auth.organization_id());

-- Generate expense number function
CREATE OR REPLACE FUNCTION generate_expense_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INT;
  v_prefix TEXT := 'EXP';
  v_date TEXT := to_char(CURRENT_DATE, 'YYMMDD');
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM expenses
  WHERE organization_id = p_org_id
    AND created_at::date = CURRENT_DATE;
  
  RETURN v_prefix || '-' || v_date || '-' || LPAD(v_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
```

### Phase 2: Create Expense Hook

**File: `src/hooks/useExpenses.ts`**

```typescript
// Types
export type ExpenseCategory = 'petty_cash' | 'refund' | 'staff_advance' | 'misc' | 'other';

export interface Expense {
  id: string;
  organization_id: string;
  branch_id: string;
  billing_session_id: string | null;
  expense_number: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  paid_to: string | null;
  created_by: string;
  created_at: string;
  // Joined
  created_by_profile?: { full_name: string };
}

// Hooks
export function useSessionExpenses(sessionId?: string);
export function useBranchExpenses(branchId?: string, date?: string);
export function useCreateExpense();
export function useApproveExpense();
```

### Phase 3: Fix useDayEndSummary

**File: `src/hooks/useDayEndSummary.ts`**

Changes:
1. Add date filter to vendor payments query
2. Add expenses query
3. Calculate expense totals in reconciliation

```typescript
// 1. Fix vendor payments query
const vpRes = await supabase
  .from("vendor_payments")
  .select("*")
  .eq("organization_id", orgId)
  .eq("payment_date", dateStr);  // ADD THIS

// 2. Add expenses query
const expensesRes = await supabase
  .from("expenses")
  .select("*, created_by_profile:profiles(full_name)")
  .eq("organization_id", orgId)
  .gte("created_at", startDate)
  .lte("created_at", endDate);

// 3. Update reconciliation to include expenses
const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
reconciliation: {
  totalCashCollected: totalCash,
  cashPayouts: doctorCashTotal + vendorCashTotal + expenseTotal,
  netCashToSubmit: totalCash - (doctorCashTotal + vendorCashTotal + expenseTotal)
}
```

### Phase 4: Update Daily Closing Hook

**File: `src/hooks/useDailyClosing.ts`**

Use session-based aggregation instead of raw payments:

```typescript
// Replace fetchPaymentsForDate with session-based calculation
async function fetchClosedSessionsForDate(branchId: string, date: string) {
  const result = await supabase
    .from('billing_sessions')
    .select('*')
    .eq('branch_id', branchId)
    .eq('status', 'closed')
    .gte('closed_at', `${date}T00:00:00`)
    .lte('closed_at', `${date}T23:59:59`);
  
  return result.data || [];
}

// Update summary calculation
const closedSessions = await fetchClosedSessionsForDate(branchId, date);
const sessionTotals = closedSessions.reduce((acc, s) => ({
  totalCollections: acc.totalCollections + (s.total_collections || 0),
  expectedCash: acc.expectedCash + (s.expected_cash || 0),
  actualCash: acc.actualCash + (s.actual_cash || 0),
  cardTotal: acc.cardTotal + (s.card_total || 0),
  upiTotal: acc.upiTotal + (s.upi_total || 0),
  discrepancy: acc.discrepancy + (s.cash_difference || 0),
}), { totalCollections: 0, expectedCash: 0, actualCash: 0, cardTotal: 0, upiTotal: 0, discrepancy: 0 });
```

### Phase 5: Add Expense UI to Daily Closing

**File: `src/pages/app/billing/DailyClosingPage.tsx`**

Add a step for recording expenses (optional but recommended):

```
Step Flow:
1. Sessions Review (existing)
2. Expenses Entry (NEW - optional)
3. Cash Count (existing)
4. Summary & Submit (existing)
```

**File: `src/components/billing/ExpenseEntryCard.tsx`**

Quick expense entry component for the daily closing flow.

### Phase 6: Update Day-End Summary Report UI

**File: `src/pages/app/reports/DayEndSummaryReport.tsx`**

Update Payouts tab to show expense details:

```tsx
{/* Expenses Section */}
<Collapsible open={expandedSections.expenses}>
  <Card>
    <CollapsibleTrigger asChild>
      <CardHeader className="cursor-pointer">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Expenses/Petty Cash</CardTitle>
          <div className="flex items-center gap-4">
            <span className="font-bold text-red-600">
              {formatCurrency(summary?.payouts.expenses.total || 0)}
            </span>
            <ChevronDown className={expanded ? 'rotate-180' : ''} />
          </div>
        </div>
      </CardHeader>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expense #</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Paid To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary?.payouts.expenses.items.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-mono">{expense.expenseNumber}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                <TableCell>{expense.paidTo || '-'}</TableCell>
                <TableCell className="text-right font-mono text-red-600">
                  {formatCurrency(expense.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </CollapsibleContent>
  </Card>
</Collapsible>
```

### Phase 7: Update PDF Export

**File: `src/lib/pdfExport.ts`**

Add expense details to the Day-End Summary PDF.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useExpenses.ts` | Expense CRUD operations |
| `src/components/billing/ExpenseEntryCard.tsx` | Quick expense entry form |
| `src/components/billing/RecordExpenseDialog.tsx` | Full expense entry dialog |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useDayEndSummary.ts` | Add date filter to vendor payments, add expenses query |
| `src/hooks/useDailyClosing.ts` | Use session-based aggregation |
| `src/pages/app/billing/DailyClosingPage.tsx` | Optional expenses step, session-based totals |
| `src/pages/app/reports/DayEndSummaryReport.tsx` | Expense details in Payouts tab |
| `src/lib/pdfExport.ts` | Include expenses in PDF |
| `src/components/billing/DailyClosingSummary.tsx` | Show expense deductions |

---

## Updated Data Flow

```text
Daily Workflow:

1. Open Session (Reception/Pharmacy/IPD)
   ↓
2. Collect Payments → linked to billing_session_id
   ↓
3. Record Expenses (NEW) → linked to billing_session_id
   ↓
4. Close Session
   - Count cash denominations
   - Actual vs Expected reconciliation
   ↓
5. Daily Closing (Manager)
   - Review all closed sessions (aggregated)
   - Review expenses
   - Vendor payments (filtered by date)
   - Net cash calculation
   ↓
6. Day-End Report
   - Session-based totals
   - Expense breakdown
   - True net cash to deposit
```

---

## Reconciliation Formula (Updated)

```text
Net Cash to Submit = 
    Sum of (Actual Cash from all closed sessions)
  - Sum of (Cash Expenses from sessions)
  - Sum of (Cash Doctor Settlements)
  - Sum of (Cash Vendor Payments for today)
```

---

## Expected Outcome

After implementation:
1. **Expenses tracked per session** - Complete audit trail of cash outflows
2. **Vendor payments filtered correctly** - Only today's payments in day-end summary
3. **Session-based reconciliation** - Totals from closed sessions, not raw payments
4. **Accurate net cash** - Includes all deductions (expenses, settlements, vendor payments)
5. **PDF report complete** - Includes expense breakdown


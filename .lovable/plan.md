

# Enforce Mandatory Billing Sessions for Payment Collection

## Problem Statement

Currently, reception staff can create invoices and collect payments **without opening a billing session**. This breaks the cash reconciliation model:

| Current State | Expected State |
|---------------|----------------|
| Payments recorded without session | Payments MUST be linked to active session |
| No audit trail of who collected what during shift | Complete session-based audit trail |
| Daily closing cannot reconcile unlinked payments | All transactions traceable to session |

---

## Solution Overview

Implement a **Session Guard** system that:
1. Blocks invoice/payment pages if no active session exists
2. Automatically links all payments to the active session
3. Provides clear UX prompting staff to open a session

---

## Implementation Plan

### Phase 1: Create Session Guard Hook & Component

**New Hook: `useRequireSession`**
```typescript
// src/hooks/useRequireSession.ts
export function useRequireSession(counterType?: CounterType) {
  const { data: activeSession, isLoading } = useActiveSession(counterType);
  
  return {
    hasActiveSession: !!activeSession,
    session: activeSession,
    isLoading,
    sessionId: activeSession?.id,
  };
}
```

**New Component: `SessionRequiredGuard`**
```typescript
// src/components/billing/SessionRequiredGuard.tsx
// Wrapper component that blocks content and shows "Open Session" prompt
// if no active session exists
```

---

### Phase 2: Update Payment Recording to Include Session ID

**Modify `useRecordPayment` in `useBilling.ts`:**
```typescript
// Add billingSessionId parameter
mutationFn: async ({
  invoiceId,
  amount,
  paymentMethodId,
  billingSessionId,  // NEW - required
  referenceNumber,
  notes,
}) => {
  // Validate session is still active before recording
  if (!billingSessionId) {
    throw new Error("Active billing session required");
  }
  
  const { data: payment } = await supabase
    .from("payments")
    .insert({
      invoice_id: invoiceId,
      amount,
      payment_method_id: paymentMethodId,
      billing_session_id: billingSessionId, // Link to session
      // ...
    });
}
```

---

### Phase 3: Add Guards to Payment Collection Pages

**Pages to Update:**

| Page | Guard Implementation |
|------|----------------------|
| `PaymentCollectionPage.tsx` | Wrap content with SessionRequiredGuard |
| `InvoiceFormPage.tsx` | Block "Create Invoice" until session open |
| `OPDCheckoutPage.tsx` | Guard payment processing section |
| `OPDWalkInPage.tsx` | Guard payment flow |
| `ClinicTokenPage.tsx` | Guard fee collection |
| `QuickPaymentDialog.tsx` | Require session before allowing payment |

**Example Implementation:**
```tsx
// PaymentCollectionPage.tsx
export default function PaymentCollectionPage() {
  const { hasActiveSession, session } = useRequireSession('reception');
  
  if (!hasActiveSession) {
    return (
      <SessionRequiredGuard
        message="Open a billing session to collect payments"
        counterType="reception"
      />
    );
  }
  
  // ... existing payment form, now with session.id passed to recordPayment
}
```

---

### Phase 4: Invoice Creation Enforcement

**Option A - Soft Enforcement (Recommended for MVP):**
- Show warning banner if no session active
- Allow invoice creation but highlight that payments cannot be collected

**Option B - Hard Enforcement:**
- Block invoice creation entirely without session
- All billing activity requires session

For this implementation, I recommend **Option A** initially - allow invoice creation but block payment collection.

---

### Phase 5: Session Banner on All Billing Pages

Add a persistent banner showing session status:

```text
┌─────────────────────────────────────────────────────────┐
│ 🟢 Session #S-20240206-001 | Reception | Morning Shift  │
│ Opened: 8:30 AM | Cash: Rs. 5,000 | Transactions: 12    │
└─────────────────────────────────────────────────────────┘
```

Or if no session:

```text
┌─────────────────────────────────────────────────────────┐
│ ⚠️ No Active Session | [Open Session] button           │
│ You must open a session to collect payments             │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useRequireSession.ts` | Hook to check/enforce active session |
| `src/components/billing/SessionRequiredGuard.tsx` | Blocking component with Open Session prompt |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useBilling.ts` | Add `billingSessionId` param to `useRecordPayment` |
| `src/hooks/useIPDDeposit.ts` | Add session linking for deposit payments |
| `src/pages/app/billing/PaymentCollectionPage.tsx` | Add session guard |
| `src/pages/app/billing/InvoiceFormPage.tsx` | Add session warning banner |
| `src/pages/app/opd/OPDCheckoutPage.tsx` | Add session guard for payment section |
| `src/pages/app/opd/OPDWalkInPage.tsx` | Add session guard |
| `src/pages/app/clinic/ClinicTokenPage.tsx` | Add session guard |
| `src/components/ipd/QuickPaymentDialog.tsx` | Add session requirement |
| `src/components/lab/LabPaymentDialog.tsx` | Add session requirement |

---

## User Flow After Implementation

```text
Reception Staff Login
        ↓
Navigate to Billing Dashboard
        ↓
    ┌───────────────────────────┐
    │ No Active Session Banner  │
    │ "Open Session to Begin"   │
    │      [Open Session]       │
    └───────────────────────────┘
        ↓ (click)
    ┌───────────────────────────┐
    │ Open Session Dialog       │
    │ Counter: Reception        │
    │ Opening Cash: Rs. 5,000   │
    │      [Start Session]      │
    └───────────────────────────┘
        ↓
Session Now Active - All Pages Accessible
        ↓
Create Invoice → Collect Payment (linked to session)
        ↓
End of Shift → Close Session → Cash Reconciliation
```

---

## Technical Details

### Session Guard Component

```tsx
interface SessionRequiredGuardProps {
  children?: React.ReactNode;
  counterType?: CounterType;
  message?: string;
  allowInvoiceCreation?: boolean; // For soft enforcement
}

export function SessionRequiredGuard({
  children,
  counterType = 'reception',
  message = "You must open a billing session to collect payments",
  allowInvoiceCreation = false,
}: SessionRequiredGuardProps) {
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const { hasActiveSession, isLoading } = useRequireSession(counterType);
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!hasActiveSession) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Required</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => setShowOpenDialog(true)}>
            <Monitor className="mr-2 h-4 w-4" />
            Open Billing Session
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return <>{children}</>;
}
```

### Updated Payment Recording

```typescript
// In PaymentCollectionPage.tsx
const { session } = useRequireSession('reception');

const handleSubmit = async () => {
  await recordPaymentMutation.mutateAsync({
    invoiceId: id,
    amount,
    paymentMethodId,
    billingSessionId: session!.id, // Now required
    referenceNumber,
    notes,
  });
};
```

---

## Expected Outcome

After implementation:
1. Staff cannot collect payments without opening a session
2. All payments are linked to specific session for audit trail
3. Daily closing accurately reconciles session-based transactions
4. Clear UX guides staff to open session before beginning work
5. Complete accountability: who collected what, during which shift

---

## Rollout Considerations

- **Training Required**: Staff need to understand the new session workflow
- **Shift Handover**: Enforce closing session before leaving shift
- **Manager Override**: Consider adding bypass for emergency situations (with audit log)


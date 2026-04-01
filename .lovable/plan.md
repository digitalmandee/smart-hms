

# Fix IPD Discharge Invoice: Deposit Application GL + End-to-End Verification

## Critical Bug Found

When "Generate Final Invoice" is clicked on the discharge page, the deposit application is handled **incorrectly**:

### Current (Broken) Flow
```text
DischargeFormPage → useGenerateIPDInvoice
  Line 254: depositAmount = admission.deposit_amount  ← uses requested amount, not actual deposit balance
  Line 493: paid_amount = min(depositAmount, totalAmount)
  Line 599-612: Creates a PAYMENTS record with payment_method="deposit"
    → This fires the PAYMENT GL trigger: DR Cash, CR AR  ← WRONG!
    → Patient deposit liability (LIA-DEP-001) is NEVER cleared
    → No patient_deposits "applied" record created
    → Deposit balance never decreases
```

### Correct Flow Should Be
```text
1. Invoice created → GL: DR AR-001, CR REV-001 (via invoice trigger)
2. Deposit applied → INSERT patient_deposits (type='applied', invoice_id)
   → DB trigger fires: DR LIA-DEP-001, CR AR-001 (liability cleared, AR cleared)
3. Remaining balance → Patient pays cash → normal payment flow
```

## Changes

### File 1: `src/hooks/useDischarge.ts` — Fix `useGenerateIPDInvoice`

**Remove** the payments table insert for deposit application (lines 599-612). Replace with:

1. Query `patient_deposits` to get **actual** deposit balance (not `admission.deposit_amount`)
2. If deposit balance > 0, insert a `patient_deposits` record with `type: "applied"` and `invoice_id`
3. This triggers the existing DB trigger to post correct GL: DR LIA-DEP-001, CR AR-001
4. Update invoice `paid_amount` and `status` based on applied amount
5. No `payments` record needed — deposit application is an internal transfer, not cash receipt

```typescript
// Get actual deposit balance
const { data: depositRecords } = await supabase
  .from("patient_deposits")
  .select("amount, type")
  .eq("patient_id", patientId)
  .eq("organization_id", profile.organization_id)
  .eq("status", "completed");

const totalDeposits = depositRecords?.filter(d => d.type === "deposit").reduce((s, d) => s + Number(d.amount), 0) || 0;
const totalApplied = depositRecords?.filter(d => d.type === "applied").reduce((s, d) => s + Number(d.amount), 0) || 0;
const totalRefunds = depositRecords?.filter(d => d.type === "refund").reduce((s, d) => s + Number(d.amount), 0) || 0;
const availableBalance = totalDeposits - totalApplied - totalRefunds;

const applyAmount = Math.min(availableBalance, totalAmount);

if (applyAmount > 0) {
  await supabase.from("patient_deposits").insert({
    organization_id: profile.organization_id,
    branch_id: branchId,
    patient_id: patientId,
    amount: applyAmount,
    type: "applied",
    status: "completed",
    invoice_id: invoice.id,
    notes: `Applied to discharge invoice ${invoiceNumber}`,
    created_by: profile.id,
  });

  // Update invoice paid_amount
  await supabase.from("invoices").update({
    paid_amount: applyAmount,
    status: applyAmount >= totalAmount ? "paid" : "partially_paid",
  }).eq("id", invoice.id);
}
```

### File 2: `src/pages/app/ipd/DischargeFormPage.tsx` — Use real deposit balance

**Line 304**: Change from `admission?.deposit_amount || 0` to use `useDepositBalance` hook:

```typescript
import { useDepositBalance } from "@/hooks/usePatientDeposits";
// ...
const { data: depositBalanceData } = useDepositBalance(admission?.patient_id);
const depositAmount = depositBalanceData?.balance || 0;
```

This shows the **actual available deposit** (deposits minus already-applied minus refunds) instead of the original requested amount.

### File 3: Translation keys
Add labels: `billing.depositAppliedToInvoice`, `billing.actualDepositBalance` in en/ar/ur.

## GL Verification After Fix

```text
Step 1 — Deposit Collected (Rs. 50,000):
  DR  Cash in Hand (CASH-001)        50,000
  CR  Patient Deposits (LIA-DEP-001) 50,000   ✓ Already working

Step 2 — Discharge Invoice (Rs. 80,000):
  DR  Accounts Receivable (AR-001)   80,000
  CR  Revenue (REV-001)              80,000   ✓ Invoice trigger

Step 3 — Deposit Applied (Rs. 50,000):
  DR  Patient Deposits (LIA-DEP-001) 50,000   ← Liability cleared
  CR  Accounts Receivable (AR-001)   50,000   ← AR reduced
  (No cash movement — internal transfer)

Step 4 — Patient Pays Balance (Rs. 30,000):
  DR  Cash in Hand (CASH-001)        30,000
  CR  Accounts Receivable (AR-001)   30,000   ✓ Payment trigger

Net Result:
  Cash in Hand: +80,000 (50k deposit + 30k payment)
  Revenue: 80,000
  LIA-DEP-001: 0 (cleared)
  AR-001: 0 (cleared)
  ✓ Balanced
```

## Files Changed
- `src/hooks/useDischarge.ts` — fix deposit application in `useGenerateIPDInvoice`
- `src/pages/app/ipd/DischargeFormPage.tsx` — use real deposit balance from `useDepositBalance`
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new labels


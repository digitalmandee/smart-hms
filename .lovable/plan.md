

# Fix: Deposit Includes Procedure Charges + Split Payment in Invoice Collection

## Issues

1. **Deposit ignores procedure charges** — `BedRateDisplay` calculates suggested deposit as 60% of room cost only. The selected procedure charge is not factored in, so the deposit is under-calculated.

2. **No split payment on invoice payment page** — The `PaymentCollectionPage.tsx` only supports a single payment method. The split payment UI exists in `AdmissionPaymentDialog` but not in the invoice payment flow.

## Plan

### Fix 1: Include procedure charges in deposit calculation

**File: `src/pages/app/ipd/AdmissionFormPage.tsx`**

- When procedure is selected or bed/discharge date changes, calculate total estimated cost = procedure charge + room cost
- Update the `onSuggestedDepositChange` callback from `BedRateDisplay` to add procedure charges on top
- Also show the combined breakdown: "Procedure: Rs X + Room: Rs Y = Total: Rs Z → Suggested Deposit (60%): Rs D"

Approach: After `BedRateDisplay` calls `onSuggestedDepositChange(roomDeposit)`, intercept and add procedure charge. Better approach — pass procedure charge into `BedRateDisplay` so it can calculate the combined deposit.

**File: `src/components/ipd/BedRateDisplay.tsx`**

- Add `procedureCharge?: number` prop
- Include it in `suggestedDeposit` calculation: `suggestedDeposit = (estimatedRoomCost + procedureCharge) * 0.6`
- Show procedure charge in the display breakdown

### Fix 2: Add split payment to invoice PaymentCollectionPage

**File: `src/pages/app/billing/PaymentCollectionPage.tsx`**

- Add the same split payment UI pattern from `AdmissionPaymentDialog`:
  - Toggle switch for "Split Payment"
  - Multiple payment method rows with amount + method + reference
  - Validation that splits sum equals total
- When split is enabled, record multiple payments (one per split) or record the primary and note the rest

Since the `useRecordPayment` hook records a single payment, for split we'll call it multiple times (once per split), each with its own method and amount. This keeps GL entries accurate per payment method.

### Files to change

- **Edit**: `src/components/ipd/BedRateDisplay.tsx` — add `procedureCharge` prop, include in deposit calc and display
- **Edit**: `src/pages/app/ipd/AdmissionFormPage.tsx` — pass procedure charge to BedRateDisplay
- **Edit**: `src/pages/app/billing/PaymentCollectionPage.tsx` — add split payment toggle + UI + multi-payment recording
- **Edit**: `src/lib/i18n/translations/en.ts`, `ur.ts`, `ar.ts` — new labels for split payment


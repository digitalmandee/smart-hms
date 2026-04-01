

# Show Patient Deposit Balance on Invoices & Payment Pages

## Problem
When a patient has a deposit (advance), the system tracks it in `patient_deposits` but:
1. **Invoice Form** — `PatientBalanceCard` only shows outstanding invoices, not deposit/credit balance
2. **Invoice Detail** — No deposit info shown
3. **Payment Collection** — No indication of available deposit that could be applied
4. **After partial payment** — No running credit/deposit balance visible across invoices

## Current State
- `usePatientBalance` in `useBilling.ts` only queries `invoices` table for unpaid amounts
- `usePatientBalance` in `usePatientDeposits.ts` calculates deposit balance (deposits - refunds - applied) but is not used on billing pages
- `PatientBalanceCard` component only shows outstanding invoice balance

## Plan

### 1. Enhance PatientBalanceCard to show both outstanding AND deposit balance
- Import `usePatientBalance` from `usePatientDeposits` (rename to `useDepositBalance` to avoid collision)
- Show two sections: Outstanding Balance (red) and Available Deposit (green)
- If deposit > 0, show "Available credit that can be applied"

### 2. Add deposit balance info to InvoiceDetailPage
- Below invoice summary, show a card with patient's deposit balance
- Add "Apply Deposit" button if deposit > 0 and invoice is unpaid

### 3. Add deposit balance info to PaymentCollectionPage  
- Show available deposit balance above payment form
- Add quick action: "Apply from Deposit" that pre-fills amount from deposit balance
- When applying deposit, create a `patient_deposits` record with `type: 'applied'` and record the payment

### 4. Show cumulative patient account summary on invoice print/detail
- After payment, show: "Deposit Balance Remaining: Rs. X"
- On invoice detail: "Patient Account: Deposit Rs. X | Outstanding Rs. Y"

## Technical Details

### Files Changed
- `src/components/billing/PatientBalanceCard.tsx` — enhance to show deposit balance alongside outstanding
- `src/pages/app/billing/InvoiceDetailPage.tsx` — add deposit balance card with "Apply Deposit" action
- `src/pages/app/billing/PaymentCollectionPage.tsx` — add deposit info and "Apply from Deposit" option
- `src/hooks/usePatientDeposits.ts` — export deposit balance hook with distinct name
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — trilingual labels

### Key Logic
- Deposit application: When user clicks "Apply Deposit", create `patient_deposits` record with `type: 'applied'`, `invoice_id` set, then record the payment against the invoice
- Balance calculation: `deposits - refunds - applied = available credit`
- Show on every invoice creation: "This patient has Rs. X available deposit"


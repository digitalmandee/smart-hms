

# Show Patient Deposits in Billing History

## Problem
After unifying IPD deposits, admission deposits are stored in `patient_deposits` table (not `invoices`). The patient's Billing tab (`PatientBillingHistory`) only queries invoices and payments — deposits are invisible there.

## Solution
Enhance `PatientBillingHistory` to also fetch and display `patient_deposits` records alongside invoices and payments.

### Changes

**1. `PatientBillingHistory.tsx`**
- Import `usePatientDeposits` from `usePatientDeposits.ts`
- Add a new "Deposits" summary card showing total deposit balance (alongside existing Total Invoices, Paid, Outstanding cards)
- Add a "Deposits" section below invoices listing all deposit records with:
  - Amount, date, status (completed/pending), type (deposit/applied/refund)
  - Green badge for deposits, orange for pending, blue for applied
  - Notes showing ward/bed info
- Merge deposits into the timeline view so they appear chronologically with invoices and payments

**2. `useBilling.ts`** (or inline in component)
- No hook changes needed — we reuse existing `usePatientDeposits(patientId)` hook

**3. Translations (`en.ts`, `ar.ts`, `ur.ts`)**
- Add keys: `billing.deposits`, `billing.depositReceived`, `billing.depositApplied`, `billing.depositRefunded`, `billing.depositBalance`

## Summary Card Addition
Add a 6th summary card: "Deposit Balance" showing net available credit (deposits - applied - refunds) using the existing `useDepositBalance` hook.

## Files Changed
- `src/components/patients/PatientBillingHistory.tsx` — add deposits section and summary card
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — trilingual deposit labels


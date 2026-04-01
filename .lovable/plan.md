

# Fix: IPD Deposits Not Showing in IPD Billing & Patient Profile + Verify GL

## Problems Identified

### 1. IPD Billing Dashboard — Deposits from `patient_deposits` not used
`useIPDBillingStats` (line 127) reads `adm.deposit_amount` from the `admissions` table. While this value IS set during admission, it only reflects the *requested* deposit amount, not the *actual collected* amount from `patient_deposits`. The dashboard should cross-reference the `patient_deposits` table to show real collected deposits per patient.

### 2. GL Posting Conditional Bug
In `useIPDDeposit.ts` line 54, GL only posts when `params.paymentMethodId` is truthy:
```ts
if (depositStatus === "completed" && params.paymentMethodId) {
```
If the user doesn't select a payment method (or it's not passed), the deposit record is created but **no journal entry is posted**. This should post GL for all completed deposits regardless.

### 3. IPD Billing Dashboard doesn't invalidate on deposit changes
`useIPDBillingStats` query key isn't invalidated when deposits are created via `useCreateIPDDeposit`.

## Solution

### 1. Update `useIPDBillingStats` to fetch actual deposits from `patient_deposits`
- After fetching active admissions, also query `patient_deposits` for each admitted patient
- Use `patient_deposits` sum (type=deposit, status=completed) minus applied/refunds as the actual deposit per patient
- Fall back to `admissions.deposit_amount` if no `patient_deposits` records exist

### 2. Fix GL posting condition in `useIPDDeposit.ts`
Change line 54 from:
```ts
if (depositStatus === "completed" && params.paymentMethodId) {
```
to:
```ts
if (depositStatus === "completed") {
```
GL should always post for completed deposits — payment method is informational, not a gate.

### 3. Add query invalidation
In `useCreateIPDDeposit.onSuccess`, also invalidate:
```ts
queryClient.invalidateQueries({ queryKey: ["ipd-billing-stats"] });
```

## Files Changed
- `src/hooks/useIPDBilling.ts` — fetch `patient_deposits` for active patients, use real deposit totals
- `src/hooks/useIPDDeposit.ts` — remove `params.paymentMethodId` check from GL posting condition; add `ipd-billing-stats` invalidation


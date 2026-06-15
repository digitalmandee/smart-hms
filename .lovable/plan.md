# Sprint 2 kickoff — BIL-02: Patient Deposit & Refund Ledger

Goal: a single per-patient ledger that shows every deposit, refund, and applied-to-invoice line with a **running balance**, plus a proper refund workflow. This unblocks IPD-01 (live running bill) and BIL-01 (Cashier Workspace), both of which need a trusted "available deposit" number.

## What exists today
- `patient_deposits` table with `type` ∈ {`deposit`, `refund`, `applied`} and `status`.
- `usePatientDeposits` / `useDepositBalance` (computes scalar balance only).
- `RecordDepositDialog`, `DepositDetailDialog`, `PatientFinancialLedger`, `PatientDepositsPage`.
- No refund flow, no running balance column, no GL link for refunds, no "apply to invoice" history view, and the page lists deposits in isolation per patient.

## Problems
1. **No refund mutation.** Refunds today require a manual DB insert. There's no dialog, no validation that refund ≤ available balance, no GL posting.
2. **No running balance.** Each row is shown in isolation; cashiers can't tell at a glance what the balance was at any point.
3. **Applied entries are invisible.** When a deposit is consumed by an invoice (`type='applied'`), the invoice link isn't shown in the ledger.
4. **GL coupling.** Deposits today post DR Cash / CR LIA-DEP-001 via the existing trigger; refunds need the inverse (DR LIA-DEP-001 / CR Cash) — confirm trigger covers `type='refund'`, otherwise extend the trigger (DB-side, per project rule — no manual journals in app code).
5. **No printable receipt** for deposits or refunds.

## Scope (this ticket)

### 1. Hook: `usePatientLedger(patientId)`
New hook in `src/hooks/usePatientDeposits.ts` that returns a chronologically sorted array with running balance:
```ts
[{ id, date, type, amount, signed_amount, running_balance, reference, invoice_id, invoice_number, payment_method, created_by_name, notes, status }]
```
- Deposits add, refunds + applied subtract.
- Pulls `invoices.invoice_number` for `applied` rows via a manual JS join (per project rule — `patient_deposits.invoice_id` is FK-less in some envs).
- Reused everywhere a ledger is shown.

### 2. Refund mutation: `useRefundPatientDeposit`
New mutation that:
- Validates refund amount > 0 and ≤ current `useDepositBalance().balance`.
- Requires `payment_method_id`, `reference_number` (cheque/EFT) for non-cash, and `reason` (free text, mandatory).
- Inserts a `patient_deposits` row with `type='refund'`, `status='completed'`, linked to the originating deposit when provided (`parent_deposit_id` — add column via migration if missing; otherwise carry in `notes`).
- Lets the existing DB trigger post the reversal journal. Add/extend the trigger only if it doesn't already handle `type='refund'`.

### 3. UI: `RefundDepositDialog`
New component `src/components/billing/RefundDepositDialog.tsx`:
- Fields: amount (default = available balance, capped), payment method, reference #, reason, notes.
- Shows current available balance and post-refund balance preview.
- Blocks submit if `amount > balance` or reason empty.

### 4. UI: `PatientDepositLedger` component
New component `src/components/billing/PatientDepositLedger.tsx`:
- Table with columns: Date | Type (badge: Deposit/Refund/Applied) | Reference | Method | Amount (signed, color-coded) | Running Balance | By | Actions.
- Header strip: Total Deposits / Total Refunds / Applied to Invoices / **Available Balance** (matches `useDepositBalance`).
- Actions: "Record Deposit" + "Refund" buttons (Refund disabled when balance ≤ 0).
- Row click → opens `DepositDetailDialog` (for `applied` rows, also links to the invoice).
- Print/export the ledger as a patient deposit statement (reuses existing PDF helper).

### 5. Page integration
- `src/pages/app/accounts/PatientDepositsPage.tsx` → swap the existing list for `PatientDepositLedger` when a patient is selected.
- `src/components/patients/PatientFinancialLedger.tsx` → embed `PatientDepositLedger` under a "Deposits & Refunds" tab.
- Patient profile balance card (`PatientBalanceCard`) already shows Outstanding + Available Deposit per memory rule — confirm it still pulls from `useDepositBalance`.

### 6. Migration (only if needed)
Run the linter / read trigger to confirm:
- `patient_deposits` has `parent_deposit_id uuid null` referencing `patient_deposits(id)`. Add column + index if missing.
- The deposit-posting trigger handles `NEW.type = 'refund'` (DR LIA-DEP-001 / CR Cash-Bank resolved from `payment_method_id`). Extend trigger using the `IF EXISTS` idempotency guard pattern (per `mem://finance/trigger-hardening-and-idempotency`) if missing.
- `GRANT`s already in place for `patient_deposits` (existing table, no changes to roles).

### 7. i18n
Add keys to `en.ts`, `ar.ts`, `ur.ts`:
- `deposits.refund`, `deposits.refundTitle`, `deposits.refundReason`, `deposits.refundReasonRequired`, `deposits.amountExceedsBalance`, `deposits.runningBalance`, `deposits.availableBalance`, `deposits.ledgerTitle`, `deposits.printStatement`, `deposits.appliedToInvoice`.

## Out of scope (Sprint 2 follow-ups)
- **IPD-01** Live running bill panel (next ticket, leans on `usePatientLedger`).
- **BIL-01** Unified Cashier Workspace (after IPD-01).
- **BIL-04** 80mm thermal receipt template (will reuse the print helper added here).

## Files

**New**
- `src/components/billing/PatientDepositLedger.tsx`
- `src/components/billing/RefundDepositDialog.tsx`
- `supabase/migrations/<ts>_patient_deposits_refund.sql` *(only if trigger/column gap confirmed)*

**Edited**
- `src/hooks/usePatientDeposits.ts` (add `usePatientLedger`, `useRefundPatientDeposit`)
- `src/pages/app/accounts/PatientDepositsPage.tsx`
- `src/components/patients/PatientFinancialLedger.tsx`
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`

## Verification
- Record deposit → ledger row appears, running balance increases, GL shows DR Cash / CR LIA-DEP-001.
- Apply deposit to invoice → ledger row (`applied`) with invoice link, running balance decreases.
- Refund: balance = 500, refund 600 → blocked. Refund 200 → ledger row appears, balance drops to 300, GL shows DR LIA-DEP-001 / CR Cash.
- Toggle org language to `ar` and `ur` → all new labels render correctly (RTL on ar).
- Print statement → PDF shows the full ledger with running balance column.

After this lands, IPD-01 can begin immediately.

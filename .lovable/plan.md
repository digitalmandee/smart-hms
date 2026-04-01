

# Audit: GL Posting Verification + Add "Record Deposit" to Invoices Section

## Part 1: GL Posting Verification (Current State)

All invoice types are correctly posting to GL via database triggers:

### Invoice Creation (trigger: `post_invoice_to_journal`)
- **DR** Accounts Receivable (AR-001) — invoice total
- **CR** Revenue (REV-001 or service-specific) — invoice total
- Reference type: `invoice`

### Payment Recording (trigger: `post_payment_to_journal`)
- **DR** Cash/Bank (resolved via `payment_methods.ledger_account_id`) — payment amount
- **CR** Accounts Receivable (AR-001) — payment amount
- Reference type: `payment`

### Patient Deposit Collection (trigger: `post_patient_deposit_journal`)
- **DR** Cash in Hand (CASH-001) — deposit amount
- **CR** Patient Deposits Liability (LIA-DEP-001) — deposit amount
- Reference type: `patient_deposit`

### Deposit Application to Invoice (application in `useGenerateIPDInvoice`)
- **DR** Patient Deposits Liability (LIA-DEP-001) — applied amount
- **CR** Accounts Receivable (AR-001) — applied amount
- Reference type: `deposit_application`

### Credit Note Approval (trigger: `post_credit_note_to_journal`)
- **DR** Revenue (REV-001) — credit amount
- **CR** Accounts Receivable (AR-001) — credit amount
- Reference type: `credit_note`

All five flows are correctly wired. The patient's multiple invoices each generate their own journal entries and are independently trackable in the GL.

---

## Part 2: Add "Record Deposit" Button to Invoices Section

### Problem
Currently, to record a standalone patient deposit (advance payment not tied to any service), users must navigate to **Accounts > Patient Deposits** (`/app/accounts/patient-deposits`). There is no way to do this from the Invoices list page where billing staff normally work.

### Plan

#### File 1: `src/pages/app/billing/InvoicesListPage.tsx`
- Add a **"Record Deposit"** button (with `Wallet` icon) next to the existing "New Invoice" button in the PageHeader actions
- Clicking opens a dialog with:
  - Patient search (using existing `PatientSearch` component)
  - Amount input
  - Payment method selector (using existing `payment_methods` query)
  - Reference number input
  - Notes textarea
- On submit, calls `useCreatePatientDeposit` hook (already exists) with `billing_session_id` from active session
- Dialog resets and closes on success; deposit immediately appears in the merged invoice list

#### File 2: `src/components/mobile/MobileInvoiceList.tsx`
- Add the same "Record Deposit" button to the mobile view header
- Same dialog logic as desktop

#### File 3: Translation keys (`en.ts`, `ar.ts`, `ur.ts`)
- Add keys: `invoices.recordDeposit`, `invoices.recordDepositDesc`, `invoices.depositAmount`, `invoices.depositRecorded`

### Technical Notes
- Reuse `useCreatePatientDeposit` from `src/hooks/usePatientDeposits.ts` — it already handles the insert and invalidates queries
- The deposit will auto-appear in the invoice list because `useDepositRows` already fetches all `type='deposit'` records
- GL posting happens automatically via the existing `post_patient_deposit_journal` database trigger
- Active billing session ID should be fetched and passed so the deposit counts in session collections


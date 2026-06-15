# Sprint 2 / IPD-01 — Live Running Bill panel

Goal: a single, always-fresh "Running Bill" panel inside the IPD admission detail page that shows every chargeable line as it's added, the **real** deposit balance pulled from the deposit ledger (not the static `admissions.deposit_amount` snapshot), and one-click actions to top up the deposit or refund without leaving the page.

## What exists today
- `AdmissionFinancialSummary` (253 lines) — totals card on the **Billing** tab. Reads `admission.deposit_amount` (a static field set at admission time) plus aggregated `ipd_charges`. Refreshes every 30s via polling.
- `useAdmissionFinancials` — returns aggregates only (no line-item list, no realtime).
- `usePatientLedger` + `useDepositBalance` shipped in BIL-02 — already give the canonical patient deposit balance.
- `RecordDepositDialog`, `RefundDepositDialog` shipped — reusable.
- `ipd_charges` is the per-line table (charge_type ∈ room/medication/lab/service/...).

## Problems
1. **Wrong deposit source.** `admission.deposit_amount` is a snapshot of what the patient paid at admission. It ignores top-up deposits, applied amounts, and refunds. Cashiers see a stale balance and accept extra cash they shouldn't, or refuse refunds that are actually available.
2. **No live line items.** Nurses add medication/consumable charges; cashiers can't see them in one place — they have to open the IPD Charges page separately.
3. **No realtime.** 30s polling means the floor and the cashier desk can be 30s out of sync.
4. **No in-context cash actions.** Collecting an additional deposit requires navigating to the Patient Deposits page, finding the patient, etc.

## Scope (this ticket)

### 1. Hook: `useAdmissionRunningBill(admissionId)`
New hook in `src/hooks/useAdmissionFinancials.ts`:
- Pulls the admission, ward, bed-type rate (same as today).
- Pulls **all** `ipd_charges` rows with `id, charge_date, charge_type, description, quantity, unit_price, total_amount, is_billed, added_by`.
- Pulls `pharmacy_patient_credits` open lines and outstanding lab/imaging invoices (same logic as today, but returned as line items).
- Pulls deposit balance via the existing `useDepositBalance` semantics (live `patient_deposits` ledger), **replacing** the `admission.deposit_amount` snapshot for the running balance math.
- Returns:
  ```ts
  {
    admission: { id, number, daysAdmitted, bedType, bedNumber, wardName, dailyRate },
    lines: Array<{ id, date, category, description, quantity, unit_price, amount, source: 'ipd_charge' | 'pharmacy_credit' | 'outstanding_invoice', is_billed, reference }>,
    totals: { room, medication, lab, service, other, pharmacyCredits, outstandingInvoices, totalCharges },
    deposit: { collected, refunded, applied, available }, // from patient_deposits ledger
    balance: number, // totalCharges - available
    hasUnbilledCharges: boolean,
  }
  ```

### 2. Realtime subscription
Inside the panel, subscribe to `postgres_changes` on `ipd_charges` filtered by `admission_id=eq.<id>` and on `patient_deposits` filtered by `patient_id=eq.<patientId>`. On any event invalidate `["admission-running-bill", admissionId]` and `["patient-balance", patientId]`. Wrap in `useEffect` with `supabase.removeChannel` cleanup (per the realtime rule). Drop the 30s polling.

Migration check: confirm `ipd_charges` and `patient_deposits` are in `supabase_realtime` publication. Add them via migration if missing.

### 3. Component: `AdmissionRunningBillPanel`
New `src/components/ipd/AdmissionRunningBillPanel.tsx`:
- Header strip — 4 tiles: **Total Charges**, **Deposit Available**, **Balance Due / Credit**, **Days Admitted** with daily rate.
- Itemized table — columns: Date | Category (badge) | Description | Qty | Unit | Amount | Status (Billed/Unbilled). Grouped/sortable by date desc. Empty state when no charges yet.
- Action bar — buttons: **Collect Deposit** (opens existing `RecordDepositDialog` prefilled with this patient), **Refund** (opens `RefundDepositDialog`, disabled when available ≤ 0), **View Full Ledger** (links to `/app/accounts/patient-deposits` with `?patientId=`), **Generate Discharge Invoice** (existing link).
- A live "updated just now" timestamp that refreshes on realtime tick.

### 4. Page integration
- `src/pages/app/ipd/AdmissionDetailPage.tsx` — on the **Billing** tab, render `AdmissionRunningBillPanel` **above** the existing `AdmissionFinancialSummary`. (Keep the summary card for the breakdown/totals view; the new panel is the working surface.)
- `src/pages/app/ipd/AdmissionsListPage.tsx` — replace the static deposit chip with `deposit.available` from the new hook (call per row only if list size ≤ 25, otherwise leave existing behavior to avoid N+1).

### 5. Existing summary alignment
- `AdmissionFinancialSummary` — switch `depositAmount` source from `admission.deposit_amount` to the live `useDepositBalance(patient_id).balance` so both panels agree. Keep `admission.deposit_amount` as a labelled "Admission deposit (snapshot)" sub-line for audit trail.

### 6. i18n
Add keys to `en.ts`, `ar.ts`, `ur.ts`:
- `ipd.runningBill.title`, `ipd.runningBill.collectDeposit`, `ipd.runningBill.viewLedger`, `ipd.runningBill.balanceDue`, `ipd.runningBill.balanceCredit`, `ipd.runningBill.depositAvailable`, `ipd.runningBill.daysAdmitted`, `ipd.runningBill.noCharges`, `ipd.runningBill.unbilled`, `ipd.runningBill.billed`, `ipd.runningBill.category.room`, `category.medication`, `category.lab`, `category.service`, `category.other`, `category.pharmacyCredit`, `category.outstandingInvoice`, `ipd.runningBill.updatedJustNow`.

## Out of scope (Sprint 2 follow-ups)
- **BIL-01** Unified Cashier Workspace (next; will embed this panel).
- **BIL-04** 80mm thermal receipt for in-admission deposit receipts.
- Editing/voiding posted `ipd_charges` (separate ticket — needs an audit log).

## Files

**New**
- `src/components/ipd/AdmissionRunningBillPanel.tsx`
- `supabase/migrations/<ts>_ipd_realtime.sql` *(only if `ipd_charges`/`patient_deposits` not already in `supabase_realtime`)*

**Edited**
- `src/hooks/useAdmissionFinancials.ts` — add `useAdmissionRunningBill`, switch deposit source.
- `src/components/ipd/AdmissionFinancialSummary.tsx` — align deposit source.
- `src/pages/app/ipd/AdmissionDetailPage.tsx` — mount the new panel on the Billing tab.
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`.

## Verification
- Add an `ipd_charges` row from the IPD Charges page → panel reflects it within ~1s without a refresh.
- Record a deposit from the panel → `patient_deposits` row created, panel's Deposit Available updates live, GL shows DR Cash / CR LIA-DEP-001.
- Refund 200 when available is 500 → Available drops to 300, Balance recalculates.
- Toggle org language to `ar` and `ur` → all labels render correctly (RTL on ar).
- Discharge invoice button still works and sweeps `is_billed=false` lines as today.

After this lands, BIL-01 (Cashier Workspace) becomes a thin shell over this panel.

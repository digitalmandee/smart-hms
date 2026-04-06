

# Accounting Flow Audit — Duplication & Integrity Review

## Complete GL Posting Map

Your system has **15 financial trigger points** that auto-post to the General Ledger. Here is every source and its posting mechanism:

```text
Source                  Trigger Method          GL Entry Pattern
--------------------    --------------------    ---------------------------
OPD/Lab/ER/IPD/IMG      DB: post_invoice        DR AR-001 / CR Revenue
Patient Payment         DB: post_payment        DR Cash|Bank / CR AR-001
Pharmacy POS            DB: post_pos             DR Cash / CR Pharm Revenue + COGS
GRN (Verified)          DB: post_grn             DR INV-001 / CR AP-001
Vendor Payment          CODE: useVendorPayments  DR AP-001 / CR Cash|Bank
Expense                 DB: post_expense         DR Expense / CR Cash|Bank
Payroll (Completed)     DB: post_payroll         DR Salary Expense / CR Payable
Donation (Received)     DB: post_donation        DR Cash / CR Donation Revenue
Patient Deposit         DB: post_deposit         DR Cash / CR Liability
Credit Note (Approved)  DB: post_credit_note     DR Revenue / CR AR-001
Surgery (Completed)     DB: post_surgery         DR AR / CR Surgery Revenue + COGS
Shipment Cost           DB: post_shipping        DR Shipping Exp / CR AP
Stock Write-Off         DB: post_writeoff        DR Write-off Exp / CR Inventory
Manual Voucher          CODE: JournalEntryForm   User-defined DR/CR
POS Session Close       CODE: usePOSSessions     DR Cash / CR Revenue (DEAD CODE)
```

---

## Issues Found

### 1. DUPLICATE TRIGGER on Invoices (Risk: Double-Posting)
The `invoices` table has **two triggers** calling the same function:
- `auto_post_invoice` (from original migration)
- `trg_post_invoice_to_journal` (from later migration)

Both fire `AFTER INSERT` and call `post_invoice_to_journal()`. The **idempotency guard** (`IF EXISTS reference_id`) currently prevents actual double entries, but this is fragile — if the guard is ever removed or the function refactored, every invoice will post twice.

**Fix**: Drop `auto_post_invoice`, keep only `trg_post_invoice_to_journal`.

### 2. Dead Code — POS Session GL Posting
`usePOSSessions.ts` (lines 162-220) creates journal entries with `reference_type: 'pos_session'` on session close. But the DB trigger `auto_post_pos_transaction` already posts per-transaction. Result: **0 pos_session entries in DB** (the code path may not execute, or it fails silently). This is dead code that risks creating duplicate revenue entries if it ever fires alongside the per-transaction trigger.

**Fix**: Remove the journal entry creation code from `usePOSSessions.ts`. Per-transaction posting via trigger is the correct approach.

### 3. Vendor Payment — Code-Level Instead of Trigger
`useVendorPayments.ts` creates journal entries via application code (not a DB trigger), unlike every other source. This means:
- No trigger-level idempotency guard
- If the code crashes after inserting the JE but before completing, partial state
- No consistency with the trigger pattern used everywhere else

**Fix**: Move to a DB trigger `post_vendor_payment_to_journal` (trigger exists but verify it's the active path — the code-level insert may be redundant WITH the trigger).

### 4. Vendor Payment — Potential Double Posting
The trigger `trg_post_vendor_payment_to_journal` fires `AFTER INSERT ON vendor_payments`, AND `useVendorPayments.ts` code manually inserts a journal entry. If both are active, vendor payments could double-post (no idempotency guard in the trigger function to check).

**Fix**: Remove code-level JE creation from `useVendorPayments.ts`, rely solely on DB trigger with idempotency guard.

### 5. IPD Ward Medications — Missing Charge Bridge
Regular ward medications ordered through nursing charts do NOT auto-create `ipd_charges`. Only OT medications are bridged. This means medication costs can be missed at discharge billing.

**Fix**: Add trigger or hook to create `ipd_charges` when `medication_administration` records are created.

### 6. Surgery Has Two Triggers (Correct but Worth Noting)
- `trg_auto_post_surgery_to_journal` — GL posting (financial)
- `trg_post_surgery_earnings` — Doctor compensation splits (operational)

These serve different purposes and are NOT duplicates. No fix needed.

---

## Summary Scorecard

| Check | Status |
|-------|--------|
| Invoice posting | DUPLICATE TRIGGER (fix needed) |
| Payment posting | Clean |
| POS transaction posting | Clean (trigger) |
| POS session posting | DEAD CODE (remove) |
| GRN posting | Clean (single trigger) |
| Vendor payment posting | DUPLICATE PATH (trigger + code) |
| Expense posting | Clean |
| Payroll posting | Clean |
| Donation posting | Clean |
| Patient deposit posting | Clean |
| Credit note posting | Clean |
| Surgery GL posting | Clean |
| Surgery earnings | Clean (separate concern) |
| Shipping cost posting | Clean |
| Stock write-off posting | Clean |
| Manual vouchers | Clean (code-level, intentional) |
| IPD ward medications | GAP (no charge bridge) |
| All reference_ids unique | VERIFIED (no duplicates in data) |
| Account balance updates | Clean (single trigger pattern) |

---

## Implementation Plan

### Step 1 — Remove Duplicate Invoice Trigger
Drop `auto_post_invoice` from `invoices` table, keeping only `trg_post_invoice_to_journal`.

### Step 2 — Remove Dead POS Session GL Code
Remove journal entry creation logic from `usePOSSessions.ts` (lines 140-230). Session close should only handle session status, not GL posting.

### Step 3 — Fix Vendor Payment Double-Path
Add idempotency guard to `post_vendor_payment_to_journal` trigger function. Remove manual JE creation from `useVendorPayments.ts` hook.

### Step 4 — Bridge IPD Ward Medications to Charges
When `medication_administration` records are inserted, auto-create corresponding `ipd_charges` entries so discharge billing captures all medication costs.

### Step 5 — Trilingual Labels
Add translation keys for any new status messages or alerts in `en.ts`, `ur.ts`, `ar.ts`.

## Files to Change
1. **New migration** — Drop `auto_post_invoice` trigger, add idempotency guard to vendor payment trigger
2. **`src/hooks/usePOSSessions.ts`** — Remove dead GL posting code from session close
3. **`src/hooks/useVendorPayments.ts`** — Remove manual JE creation (rely on trigger)
4. **New migration** — Trigger on `medication_administration` to create `ipd_charges`
5. **`src/lib/i18n/translations/en.ts`**, **`ur.ts`**, **`ar.ts`** — New labels


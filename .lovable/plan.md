

# Accounting Voucher Module — Full Redesign

## Current State Analysis

The existing `JournalEntryFormPage.tsx` is a **generic journal entry form** with:
- Single date field, description, notes, reference type selector
- Simple debit/credit line table with account picker
- No voucher type concept (CPV/CRV/BPV/BRV/JV)
- No payment/receipt account header field
- No branch selector, no cost center on lines (DB supports it but UI doesn't use it)
- No posting date (only entry date)
- No currency/exchange rate support
- No cheque/instrument fields for bank vouchers
- No confirmation dialog before posting
- No preview mode
- No audit trail display
- Lines lack cost_center_id (DB column exists but not exposed)

**Database already supports**: `branch_id`, `approved_by/at`, `posted_by/at`, `reversed_by/at`, `reversal_entry_id`, `is_reversed`, `fiscal_year_id`, `cost_center_id` on lines.

**Missing from DB**: `voucher_type`, `posting_date`, `currency`, `exchange_rate`, `cheque_number`, `instrument_date`, `payment_account_id`, `cancelled_by/at`, `status` enum.

---

## Plan

### Phase 1 — Database Migration

Add columns to `journal_entries`:
- `voucher_type` TEXT CHECK (CPV, CRV, BPV, BRV, JV) DEFAULT 'JV'
- `posting_date` DATE (defaults to entry_date)
- `currency` TEXT DEFAULT 'PKR'
- `exchange_rate` NUMERIC DEFAULT 1
- `payment_account_id` UUID REFERENCES accounts(id) — the cash/bank account for CPV/CRV/BPV/BRV
- `cheque_number` TEXT
- `instrument_date` DATE
- `instrument_reference` TEXT (deposit slip / transaction ref)
- `status` TEXT CHECK ('draft','posted','cancelled') DEFAULT 'draft'
- `cancelled_by` UUID REFERENCES profiles(id)
- `cancelled_at` TIMESTAMPTZ
- `external_reference` TEXT

Update `reference_type` constraint to include 'cpv','crv','bpv','brv'.

Add `branch_id` column to `journal_entry_lines` (currently only on header — needed for cross-branch lines).

Create DB function `generate_voucher_number(voucher_type, org_id)` that returns formatted numbers like `CPV-2026-00001`.

### Phase 2 — New Voucher Form Page

Replace the current `JournalEntryFormPage.tsx` with a comprehensive voucher creation form. Route remains `/app/accounts/journal-entries/new`.

**Header Section** (card):

| Field | CPV | CRV | BPV | BRV | JV |
|-------|-----|-----|-----|-----|-----|
| Voucher Type | mandatory | mandatory | mandatory | mandatory | mandatory |
| Voucher Number | auto, read-only | auto | auto | auto | auto |
| Entry Date | mandatory | mandatory | mandatory | mandatory | mandatory |
| Posting Date | mandatory | mandatory | mandatory | mandatory | mandatory |
| Branch | mandatory | mandatory | mandatory | mandatory | mandatory |
| Payment/Receipt Account | Cash (auto-filled, locked) | Cash (auto-filled, locked) | Bank (mandatory select) | Bank (mandatory select) | HIDDEN |
| Cheque No / Instrument | hidden | hidden | shown | shown | hidden |
| Instrument Date | hidden | hidden | shown | shown | hidden |
| Transaction Reference | hidden | hidden | shown | shown | hidden |
| Currency | shown | shown | shown | shown | shown |
| Exchange Rate | shown if foreign | shown if foreign | shown if foreign | shown if foreign | shown if foreign |
| External Reference | optional | optional | optional | optional | optional |
| Description / Narration | mandatory | mandatory | mandatory | mandatory | mandatory |
| Cost Center | optional | optional | optional | optional | optional |
| Status | Draft (default) | Draft | Draft | Draft | Draft |

**Line Items Section**:

Each line: Account (picker, posting-only) | Description | Debit | Credit | Cost Center | Branch

Rules by voucher type:
- **CPV**: Credit side auto-generated from cash account. User enters debit lines only. System creates balancing credit line on save.
- **CRV**: Debit side auto-generated from cash account. User enters credit lines only.
- **BPV**: Credit side auto-generated from selected bank account. User enters debit lines only.
- **BRV**: Debit side auto-generated from selected bank account. User enters credit lines only.
- **JV**: Fully manual debit and credit entry on all lines.

For CPV/CRV/BPV/BRV, show a simplified "counter entries" table where user only fills the opposite side. The payment/receipt account line is shown as a read-only summary row showing the auto-balancing amount.

**Validation Rules** (enforced in UI):
- Hard: voucher type, dates, branch, description required
- Hard: min 2 lines (1 user + 1 auto for cash/bank types; 2 user lines for JV)
- Hard: total DR = total CR
- Hard: no negative values, no zero-value posting
- Hard: no line with both debit and credit > 0
- Hard: payment account mandatory for CPV/CRV/BPV/BRV
- Hard: cheque number mandatory if bank voucher and payment method is cheque
- Soft warnings: backdated posting, posting to inactive accounts, missing narration on lines

**Action Buttons**:
- "Save Draft" — saves with status=draft, is_posted=false
- "Post Voucher" — confirmation dialog, then saves with status=posted, is_posted=true
- "Preview" — modal showing voucher summary before posting

**UX Improvements**:
- Running totals with sticky footer row
- Difference amount shown in red when unbalanced
- Post button disabled until balanced
- Auto-focus flow with Enter key navigation
- Formatted number inputs with locale-aware decimals
- Row duplication button
- Account search by code and name (already in AccountPicker)
- Contextual labels: "Cash Account" for CPV/CRV, "Bank Account" for BPV/BRV

### Phase 3 — Posting Engine Updates

Modify `handleSave`:
1. Call `generate_voucher_number` RPC for entry_number
2. For CPV/CRV/BPV/BRV, auto-insert the payment/receipt account line
3. Set `voucher_type`, `posting_date`, `currency`, `exchange_rate`, `payment_account_id`, `status`
4. Set `cheque_number`, `instrument_date`, `instrument_reference` for bank types
5. Include `cost_center_id` and `branch_id` on each line
6. Validate account is active before posting
7. Store `posted_by`, `posted_at` on post

### Phase 4 — Trilingual Labels

Add all new labels to `en.ts`, `ur.ts`, `ar.ts`:
- Voucher type names (CPV, CRV, BPV, BRV, JV) with descriptions
- Field labels: posting date, cheque number, instrument date, bank account, cash account, exchange rate
- Action labels: preview, post voucher, cancel voucher
- Validation messages
- Status labels: draft, posted, cancelled

### Phase 5 — Journal Entry Detail Page Updates

Update `JournalEntryDetailPage.tsx` to display:
- Voucher type badge
- Payment/receipt account
- Cheque/instrument details for bank vouchers
- Status with color coding
- Audit trail (created by, posted by, approved by)
- "Cancel Voucher" action (creates reversal entry, sets status=cancelled)

---

## Files to Change

1. **New migration** — add voucher columns to `journal_entries`, `generate_voucher_number` function
2. **`src/pages/app/accounts/JournalEntryFormPage.tsx`** — complete rewrite as voucher form
3. **`src/pages/app/accounts/JournalEntryDetailPage.tsx`** — add voucher type display, cancel action
4. **`src/pages/app/accounts/JournalEntriesPage.tsx`** — add voucher type filter column
5. **`src/lib/i18n/translations/en.ts`** — English labels
6. **`src/lib/i18n/translations/ur.ts`** — Urdu labels
7. **`src/lib/i18n/translations/ar.ts`** — Arabic labels

## Scope Note

This plan focuses on the form and posting logic. Maker-checker approval workflow, role-based access control on individual voucher actions, and attachment support are deferred to a follow-up phase to keep this deliverable focused and testable.


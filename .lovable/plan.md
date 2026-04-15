
# Healthcare ERP Finance Module — Comprehensive Gap Analysis & Fix Plan

## Executive Summary

After deep analysis of all triggers, schema, hooks, pages, and GL posting logic, the system has a solid foundation with 15+ auto-posting triggers, a 4-level CoA, and functional revenue drill-down. However, **12 critical gaps** remain that break full audit traceability and financial integrity.

---

## 1. Root Cause Analysis

The core architecture follows a correct pattern: `Source Transaction → DB Trigger → Journal Entry`. However, the triggers post **lump-sum amounts** without granular breakdowns, several transaction types lack reversal logic, and the invoice schema is missing key linkage columns.

---

## 2. Critical Gaps (Ordered by Severity)

### GAP 1 — CRITICAL: Invoice Trigger Posts `total_amount` as Single Revenue Line
**Problem**: `post_invoice_to_journal()` posts `NEW.total_amount` (which is `subtotal + tax - discount`) as a single credit to revenue. This means:
- **Discount** is buried inside revenue (understates gross revenue, no Discounts Allowed account)
- **Tax/VAT** is buried inside revenue (understates revenue, no Tax Payable posting)
- Gross revenue, discounts, and tax are invisible in the GL

**Fix**: Refactor the trigger to post 3 lines:
```
DR  AR-001              = total_amount
CR  Revenue (4xxx)      = subtotal
CR  Tax Payable (2200)  = tax_amount
DR  Discounts Allowed   = discount_amount  (contra-revenue)
```
Create accounts: `DISC-001` (Discounts Allowed, contra-revenue), use existing `2200` (Tax Payable).

### GAP 2 — CRITICAL: Invoice Cancellation Has No GL Reversal
**Problem**: `useCancelInvoice()` sets `status='cancelled'` but **never reverses the journal entry**. The GL permanently shows revenue and AR for cancelled invoices.

**Fix**: Create trigger `on UPDATE of invoices` — when status changes to `cancelled`, post a reversal journal entry (mirror of original with opposite DR/CR) linked as `reference_type='invoice_cancellation'`.

### GAP 3 — CRITICAL: No `doctor_id`, `admission_id`, `appointment_id` on Invoices Table
**Problem**: The `invoices` table has no direct linkage to doctor, admission, or appointment. Traceability relies entirely on `invoice_items.doctor_id` (often NULL) and prefix-based routing (INV-, IPD-, LAB-). There's no way to query "all invoices for admission X" or "all invoices for doctor Y" without scanning invoice_items.

**Fix**: Add columns to `invoices`:
```sql
ALTER TABLE invoices ADD COLUMN doctor_id UUID REFERENCES doctors(id);
ALTER TABLE invoices ADD COLUMN admission_id UUID REFERENCES admissions(id);
ALTER TABLE invoices ADD COLUMN appointment_id UUID REFERENCES appointments(id);
ALTER TABLE invoices ADD COLUMN department TEXT;
```
Populate during invoice creation in `InvoiceFormPage.tsx` and OPD checkout/IPD discharge flows.

### GAP 4 — CRITICAL: No Patient Statement Page
**Problem**: No page exists to show a complete financial ledger per patient (all invoices, payments, deposits, refunds, credit notes, outstanding balance). Searched for "PatientStatement" — zero results.

**Fix**: Create `PatientStatementPage.tsx` at `/app/billing/patient-statement/:patientId` showing chronological list of all financial transactions for a patient with running balance.

### GAP 5 — HIGH: Credit Note Trigger Always Reverses to `REV-001` (OPD Revenue)
**Problem**: `post_credit_note_to_journal()` hardcodes `REV-001` as the revenue account to debit. If the original invoice was IPD (4010) or Lab (4030), the reversal hits the wrong account.

**Fix**: Look up the original invoice's revenue account from the linked journal entry and reverse against the same account.

### GAP 6 — HIGH: No Revenue Line-Item Breakdown in Journal
**Problem**: A single invoice with Lab test (₹500) + Consultation (₹1000) + Pharmacy (₹200) posts as one lump ₹1700 to a single revenue account based on prefix. There's no per-service-category revenue split in the GL.

**Fix**: Enhance `post_invoice_to_journal()` to iterate `invoice_items`, classify each by `service_type.category`, and post to the appropriate revenue account (4110 OPD, 4200 Lab, REV-PHARM-001 Pharmacy, etc.). This gives granular revenue by department in the GL natively.

### GAP 7 — HIGH: No Insurance Receivable Separate from Patient AR
**Problem**: All invoices post to `AR-001` regardless of payer. Insurance-covered invoices should post the insurer's portion to a separate `AR-INS-001` (Insurance Receivables) account.

**Fix**: During invoice creation, if insurance split exists, post:
```
DR  AR-001      = patient copay portion
DR  AR-INS-001  = insurance portion
CR  Revenue     = total
```

### GAP 8 — HIGH: POS Trigger Hardcodes Cash — No Payment Method Resolution
**Problem**: `post_pos_to_journal()` always debits `CASH-001`. If POS sale is paid by card or bank, the wrong asset account is hit.

**Fix**: Resolve payment method from `pharmacy_pos_transactions.payment_method_id` → `payment_methods.ledger_account_id`, same pattern as the payment trigger.

### GAP 9 — MEDIUM: Reports Use Raw Aggregation, Not GL
**Problem**: `useDepartmentPnL` aggregates from `journal_entry_lines` joined to `accounts` by category. This is correct. However, `useDepartmentRevenue` queries `invoice_items` directly (bypassing GL), meaning report totals may not match GL totals if triggers failed or had edge cases.

**Fix**: All financial reports should source from `journal_entry_lines` (the GL) as the single source of truth, not from operational tables. Restructure `useDepartmentRevenue` to use GL data.

### GAP 10 — MEDIUM: No Partial PO Receipt Tracking in UI
**Problem**: `purchase_order_items.received_quantity` exists but the PO detail page doesn't show pending vs received quantities. Multiple GRNs per PO are supported at the DB level but UI doesn't surface fulfillment status.

**Fix**: Add fulfillment status cards to PO detail page showing per-item: ordered qty, received qty (sum from GRN items), pending qty.

### GAP 11 — MEDIUM: No Write-Off Mechanism for Bad Debts
**Problem**: No way to write off uncollectable patient or insurance receivables. No write-off journal entry (DR Bad Debt Expense, CR AR).

**Fix**: Add "Write Off" action on aged receivables with journal posting.

### GAP 12 — LOW: Revenue Summary vs Ledger Reconciliation Report Missing
**Problem**: No report comparing invoice-level revenue totals against GL revenue account balances to detect posting gaps.

**Fix**: Enhance `ARReconciliationPage` to include a Revenue Reconciliation tab.

---

## 3. Required Journal Entries by Transaction Type

| Transaction | Debit | Credit | Status |
|---|---|---|---|
| Invoice Created | AR-001 | Revenue (by dept) + Tax Payable - Disc Allowed | **BROKEN** (no tax/discount split) |
| Payment Received | Cash/Bank (via payment method) | AR-001 | Working |
| Invoice Cancelled | Revenue | AR-001 (reversal) | **MISSING** |
| Deposit Collected | Cash/Bank | LIA-DEP-001 | Working |
| Deposit Applied | LIA-DEP-001 | AR-001 | Working |
| Deposit Refunded | LIA-DEP-001 | Cash/Bank | Working |
| Credit Note | Revenue | AR-001 | **BROKEN** (wrong revenue account) |
| POS Sale | Cash/Bank + COGS | Revenue + Inventory | **BROKEN** (cash hardcoded) |
| GRN Verified | INV-001 | AP-001 | Working |
| Vendor Payment | AP-001 | Cash/Bank | Working |
| Payroll | Salary Expense | Cash/Bank | Working |
| Expense | Expense (by category) | Cash/Bank | Working |
| Write-Off | Bad Debt Expense | AR-001 | **MISSING** |
| Insurance Split | AR-001 + AR-INS-001 | Revenue | **MISSING** |

---

## 4. Implementation Plan (Phased)

### Phase 1: Fix GL Posting Integrity (Migration-only, no UI changes)
1. **Refactor `post_invoice_to_journal()`** — Split into subtotal/tax/discount lines
2. **Add invoice cancellation reversal trigger** — Auto-reverse on status='cancelled'
3. **Fix credit note trigger** — Look up original invoice's revenue account
4. **Fix POS trigger** — Resolve payment method dynamically
5. **Create missing accounts** — `DISC-001`, `AR-INS-001`, `BAD-DEBT-001`

### Phase 2: Schema & Traceability Columns
6. **Add `doctor_id`, `admission_id`, `appointment_id`, `department`** to invoices table
7. **Populate linkage columns** in InvoiceFormPage, OPD checkout, IPD discharge flows

### Phase 3: Enhance Existing Reports (Restructure, not new pages)
8. **Restructure Revenue Drill-Down** — Add invoice-item-level breakdown with per-service revenue account mapping
9. **Restructure Department P&L** — Add clickable drill-down from department total → invoices → items
10. **Add Revenue Reconciliation tab** to ARReconciliationPage
11. **Add PO Fulfillment Status** to existing PO detail page

### Phase 4: Missing Pages (Reuse patterns from existing)
12. **Patient Statement Page** — Complete financial ledger per patient
13. **Write-Off Dialog** on Receivables/Aging page
14. **Insurance Receivable split** in invoice posting

### Phase 5: Line-Item Revenue Posting (Advanced)
15. **Enhance invoice trigger** to post per-item to correct revenue accounts based on service_type category

---

## 5. Files to Change

| File/Migration | Change |
|---|---|
| Migration: GL posting fixes | Refactor 3 triggers + create 1 new trigger + create 3 accounts |
| Migration: Invoice schema | Add 4 columns to invoices |
| `src/hooks/useBilling.ts` | Populate new invoice columns during creation |
| `src/pages/app/billing/InvoiceFormPage.tsx` | Pass doctor/admission/appointment IDs |
| `src/pages/app/accounts/RevenueDrillDownPage.tsx` | Add item-level expansion rows |
| `src/pages/app/accounts/DepartmentPnLPage.tsx` | Add clickable invoice drill-down |
| `src/pages/app/accounts/ARReconciliationPage.tsx` | Add Revenue Recon tab |
| `src/pages/app/accounts/ReceivablesPage.tsx` | Add Write-Off action |
| New: `src/pages/app/billing/PatientStatementPage.tsx` | Patient financial ledger |
| `src/hooks/useRevenueDrillDown.ts` | Add item-level data fetching |
| `src/lib/i18n/translations/{en,ar,ur}.ts` | New translation keys |
| `src/App.tsx` | Route for patient statement |

**Total: 2 migrations, 1 new page, ~10 file edits**

---

## 6. Test Cases / UAT Scenarios

1. Create OPD invoice with discount + tax → Verify GL shows 3 separate lines (revenue, tax payable, discount)
2. Cancel an invoice → Verify reversal journal auto-created, AR and revenue zeroed out
3. Create IPD invoice → Credit note against it → Verify credit note reverses against IPD Revenue (4010), not OPD (REV-001)
4. POS sale paid by card → Verify GL debits bank account, not cash
5. View Patient Statement → Shows all invoices, payments, deposits, refunds with running balance
6. Department P&L → Click OPD Revenue → See invoice list → Click invoice → See items
7. Revenue Drill-Down → Select Lab Revenue → See all lab invoices with patient/doctor breakdown
8. Write off aged receivable → Verify Bad Debt Expense journal posted
9. Create PO → Partial GRN → Verify PO shows remaining pending quantity
10. Revenue total in Department P&L === Sum of revenue account balances in Trial Balance

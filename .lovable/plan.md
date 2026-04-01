

# Complete Accounting Flow Audit Report

## GL Trigger Map — All Transaction Types

```text
TRANSACTION              TRIGGER                     GL ENTRY                                    STATUS
──────────────────────── ─────────────────────────── ─────────────────────────────────────────── ──────
Invoice Created          post_invoice_to_journal     DR AR-001, CR REV (prefix-based routing)   ⚠️ ISSUES
Payment Received         post_payment_to_journal     DR Cash/Bank (method ledger), CR AR-001    ✅ PASS
Patient Deposit          post_patient_deposit_to_j   DR Cash, CR DEP-001 (liability)            ✅ PASS
Deposit Applied          post_patient_deposit_to_j   DR DEP-001, CR AR-001                      ✅ PASS
Deposit Refund           post_patient_deposit_to_j   DR DEP-001, CR Cash                        ✅ PASS
Expense Created          post_expense_to_journal     DR 5500, CR 1000                           ⚠️ ISSUE
GRN Verified             post_grn_to_journal         DR INV-001, CR AP-001                      ✅ PASS
Vendor Payment           post_vendor_payment_to_j    DR AP-001, CR Cash/Bank (method ledger)    ✅ PASS
POS Sale (Pharmacy)      post_pos_to_journal         DR Cash, CR REV-PHARM + DR COGS, CR INV    ✅ PASS
Payroll Completed        post_payroll_to_journal     DR EXP-SAL-001, CR CASH-001                ✅ PASS
Stock Write-off          post_stock_writeoff_to_j    DR EXP-WO-001, CR INV-001                  ✅ PASS
Shipping Cost            post_shipping_cost_to_j     DR EXP-SHIP-001, CR CASH-001               ✅ PASS
Financial Donation       post_donation_to_journal    DR Cash, CR Donation Revenue                ✅ PASS
Credit/Debit Note        post_credit_note_to_j       DR/CR Revenue, CR/DR AR                    ✅ PASS
Doctor Settlement        (manual JE via code)         DR Settlement Expense, CR Cash             ✅ PASS
```

---

## Issues Found

### ISSUE 1: Invoice Trigger — No Idempotency Guard (HIGH)

The `post_invoice_to_journal` fires on `AFTER INSERT` and posts a journal entry for every new invoice. However, unlike the GRN trigger, it has **no idempotency check**. If an invoice row is somehow inserted twice (retry, race condition), duplicate journal entries are created — doubling revenue and AR.

Additionally, the trigger fires on INSERT only with status check `IN ('pending', 'paid', 'partially_paid')`. If an invoice is created as `draft` and later updated to `pending`, **no journal entry is posted at all** because the trigger only fires on INSERT.

**Fix**: Add idempotency guard (`IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type = 'invoice' AND reference_id = NEW.id) THEN RETURN NEW;`) and change the trigger to fire on `AFTER INSERT OR UPDATE` with proper old/new status comparison.

### ISSUE 2: Invoice Trigger — Manual Balance Updates Conflict with update_account_balance Trigger (MEDIUM)

Lines 53-54 of the invoice trigger manually update `accounts.current_balance`:
```sql
UPDATE public.accounts SET current_balance = current_balance + NEW.total_amount ...
```
But the `update_account_balance` trigger on `journal_entry_lines` also recalculates the full balance from scratch. This causes **double-counting** — the balance gets updated once by the manual UPDATE and then recalculated by the auto-trigger. The same issue existed in the payment trigger but was fixed in a later migration.

**Fix**: Remove the two manual `UPDATE accounts SET current_balance` lines from `post_invoice_to_journal`. The `update_account_balance` trigger handles it automatically.

### ISSUE 3: Expense Trigger — Hardcoded Account Numbers (LOW-MEDIUM)

The expense trigger uses hardcoded account numbers `5500` (Administrative Expenses) and `1000` (Cash in Hand) via direct SELECT. If these accounts don't exist in a new organization, the expense journal entry is created but **no lines are inserted** (the `IF ... IS NOT NULL` check silently skips). This means the journal entry exists as an empty shell with no debit/credit lines.

Also, all expenses go to `5500` regardless of category (petty_cash, refund, staff_advance, etc.). Categories should route to different expense accounts.

**Fix**: Use `get_or_create_default_account` instead of direct SELECT, and add category-based routing similar to the invoice prefix routing.

### ISSUE 4: Expense Trigger — Payment Method Not Considered (LOW)

Expenses can have a `payment_method_id` but the trigger always credits `1000` (Cash). If an expense was paid via bank transfer, it should credit the bank account (via `payment_methods.ledger_account_id`).

**Fix**: Look up `payment_methods.ledger_account_id` when `payment_method_id` is set, fall back to Cash.

### ISSUE 5: P&L Report — Organization Filter Missing (MEDIUM)

The `useDetailedPnL` hook fetches all accounts without filtering by `organization_id`. The query at line 684 does:
```typescript
.from("accounts").select(...).eq("is_active", true).eq("is_header", false)
```
This will pull accounts from ALL organizations if RLS is not perfectly configured. Should add `.eq("organization_id", profile.organization_id)`.

Similarly, the journal lines query at line 697 does not filter by organization.

**Fix**: Add `.eq("organization_id", profile.organization_id)` to both queries.

### ISSUE 6: GRN Journal — Missing branch_id (LOW)

The latest GRN trigger (`20260401232733`) inserts journal entries without `branch_id`. Earlier versions included it. This means GRN entries won't appear in branch-filtered reports (Consolidated P&L).

**Fix**: Add `branch_id` to the GRN journal entry INSERT from `NEW.branch_id` or by looking up the PO's branch.

---

## Verification Summary by Flow

### 1. Invoice → GL ⚠️
- Invoices ARE posted to GL on creation
- Revenue routing works by prefix (OPD→REV-001, IPD→4010, Lab→4030, Dialysis→4040)
- **Problem**: Manual balance update causes double-counting with `update_account_balance` trigger
- **Problem**: No idempotency guard

### 2. Expense Processing ⚠️
- Expenses ARE posted to GL on creation
- **Problem**: All categories go to single account 5500
- **Problem**: Payment method not considered (always Cash)
- **Problem**: Uses direct SELECT instead of `get_or_create_default_account`

### 3. Requisition → PO → GRN → Payment ✅ (with recent fixes)
- GRN verified → DR INV-001, CR AP-001 ✅
- Vendor Payment → DR AP-001, CR Cash/Bank ✅
- Idempotency guard present on GRN trigger ✅
- Requisition link now preserved via `purchase_orders.requisition_id` ✅

### 4. POS/Pharmacy Sales ✅
- Revenue posted with COGS recognition ✅
- DR Cash, CR Pharmacy Revenue + DR COGS, CR Inventory ✅

### 5. P&L Report Accuracy ⚠️
- Revenue groups correctly separated by account type
- COGS separated from operating expenses (EXP-COGS pattern)
- Gross Profit = Revenue - COGS ✅
- **Problem**: Missing organization_id filter on queries
- **Problem**: Invoice double-counting affects totals

### 6. Audit Trail ✅
- Every transaction has `reference_type` + `reference_id` for traceability
- Journal entry numbers follow convention: JE-INV, JE-PAY, JE-EXP, JE-GRN, JE-VP, JE-POS, JE-PAY, JE-WO, JE-SHP
- General Ledger page shows running balances with source badges

---

## Proposed Fixes (Migration)

### Fix 1: Invoice trigger — add idempotency + remove manual balance updates
- Add `IF EXISTS` check for duplicate prevention
- Remove the two `UPDATE accounts SET current_balance` lines
- Keep trigger as `AFTER INSERT` (invoices are created with status pending)

### Fix 2: Expense trigger — use proper account resolution + category routing
- Replace hardcoded `SELECT id FROM accounts WHERE account_number = '5500'` with `get_or_create_default_account`
- Add category→account mapping:
  - `petty_cash` → EXP-PETTY-001
  - `refund` → EXP-REF-001
  - `staff_advance` → EXP-ADV-001
  - `misc`/`other` → 5500
- Resolve payment method ledger account when `payment_method_id` is set

### Fix 3: GRN trigger — add branch_id

### Fix 4: P&L hook — add organization_id filter

### Fix 5: Recalculate affected account balances
Run `update_account_balance` recalculation for AR-001 and all revenue accounts to correct any double-counted balances from Issue 2.

## Files to Change
- `supabase/migrations/new.sql` — all trigger fixes + balance recalculation
- `src/hooks/useFinancialReports.ts` — add organization_id filter to P&L queries




# Fix: IPD Deposits Must Show as Invoices + Count in Session Collections

## Problem
When an IPD admission deposit is collected (e.g., Alii Raza's Rs. 100,000), only a `patient_deposits` record is created. This means:
1. **Not visible in Invoices list** — the invoices page queries the `invoices` table only
2. **Not counted in session `total_collections`** — line 335 of `useBillingSessions.ts` only sums `payments`, excluding deposits
3. **Alii Raza's existing deposit** has no corresponding invoice record

## Solution

### 1. Create a Deposit Invoice alongside the Deposit Record
Update `useCreateIPDDeposit` to also create an `invoices` record (status: `paid`) and a `payments` record when the deposit status is `completed`. This ensures:
- The deposit appears in the Invoices list page
- The payment links to the billing session, so it counts in session collections
- GL is still handled by the DB trigger on `patient_deposits` (no double-posting since the invoice trigger posts DR AR / CR Revenue, but we will set the invoice status to `paid` with a special note marking it as a deposit — we need to be careful here)

**Important accounting note**: A deposit is NOT revenue. Creating a standard invoice would incorrectly post DR AR / CR Revenue via the `post_invoice_to_journal` trigger. Instead, we should:
- Create the invoice with a `deposit` flag or use the existing `notes` field to mark it
- Record the payment against the invoice (which triggers DR Cash / CR AR) 
- The deposit trigger already posts DR Cash / CR LIA-DEP-001

This would cause **double DR Cash** — one from the payment trigger and one from the deposit trigger. So the correct approach is:

**Option A (Recommended)**: Don't create a separate invoice. Instead, include `patient_deposits` in the Invoices list page query and in session collection totals. This avoids GL conflicts entirely.

### Revised Approach: Show Deposits in Invoices List + Fix Session Collections

#### File 1: `src/pages/app/billing/InvoicesListPage.tsx`
- Add a second query to fetch `patient_deposits` with type `deposit` and status `completed`
- Merge deposit records into the invoice list, formatted as invoice-like rows:
  - `invoice_number` → deposit reference or `DEP-YYMMDD-XXXX`
  - `status` → show as `paid`
  - `total_amount` / `paid_amount` → deposit amount
  - Patient info from the join
- Add a visual indicator (badge/icon) to distinguish deposit entries from regular invoices

#### File 2: `src/hooks/useBillingSessions.ts` (line 335)
- Include deposit amounts in `totalCollections`:
```typescript
const depositTotal = (sessionDeposits || [])
  .filter(d => d.type === 'deposit')
  .reduce((sum, d) => sum + Number(d.amount), 0);
const totalCollections = paymentTotal + depositTotal;
const transactionCount = (payments?.length || 0) + (sessionDeposits?.filter(d => d.type === 'deposit')?.length || 0);
```

#### File 3: `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`
- Add keys: `invoices.deposit`, `invoices.depositInvoice`, `billing.depositCollection`

## No Migration Needed
Alii Raza's deposit already exists in `patient_deposits`. Once the Invoices list page includes deposits, it will appear automatically.

## Files Changed
- `src/pages/app/billing/InvoicesListPage.tsx` — merge `patient_deposits` into invoice list
- `src/hooks/useBillingSessions.ts` — include deposits in `totalCollections` calculation
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new labels




# Fix: Receipt & Invoice Summary — 3-Section Deposit/Payment Breakdown

## Problem
The current receipt and invoice summary mixes deposit applications with cash payments in a single confusing "Previous Paid" line. Balance can show negative numbers. No deposit utilization section exists.

## Solution
Restructure both `InvoiceTotals` (on-screen) and `PrintableReceipt` / `PrintablePaymentReceipt` (print) into 3 clear sections per the user's specification.

## Changes

### 1. `InvoiceTotals.tsx` — Redesign into 3 sections

Add new props: `depositAvailable`, `remainingDeposit`, `previousCashPayments`, `thisPayment`.

**Section 1 — Invoice Totals** (existing, no change): Subtotal, Tax, Discount, Net Total.

**Section 2 — Deposit Utilization** (only when `depositApplied > 0` or `depositAvailable > 0`):
- Deposit Available
- Deposit Applied (green)
- Remaining Deposit

**Section 3 — Settlement Details**:
- Previous Cash Payments (only if > 0)
- This Payment (only if > 0)
- Total Settled (bold, border-top)
- Balance Due (red) / Refund Due (blue) / Fully Settled (green)

Rules: Balance Due never negative. If overpaid → show Refund Due. If zero → Fully Settled.

### 2. `PrintableReceipt.tsx` — Same 3-section layout for thermal print

Add `depositApplied`, `depositAvailable`, `remainingDeposit` optional props.

Replace the current summary section with:
- Net Invoice Total
- Deposit section (if applicable): Available → Applied → Remaining
- Previous Cash Payments (calculated as `previousPaid - depositApplied`)
- This Payment
- Dashed separator
- Total Settled
- Balance Due / Refund Due / Fully Settled

Never show negative balance.

### 3. `PrintablePaymentReceipt.tsx` — Same deposit/settlement split

Add `depositApplied`, `depositAvailable`, `remainingDeposit`, `previousCashPayments` optional props.

After the "Total:" row, add deposit utilization section and settlement section before payment details. Balance Due already exists — add Refund Due / Fully Settled logic.

### 4. `PaymentCollectionPage.tsx` — Pass deposit data to receipt

Query `patient_deposits` for `type = 'applied'` on this invoice to get `depositApplied`. Query deposit balance for `depositAvailable`. Pass these to `PrintableReceipt`.

Calculate `previousCashPayments` = total payments on invoice (excluding current) — query `payments` table for this invoice, sum amounts, subtract current payment.

### 5. `InvoiceDetailPage.tsx` — Pass new props to InvoiceTotals

Already has `depositAppliedAmount`. Add `depositAvailable` from existing `availableDeposit` variable. Calculate `remainingDeposit = depositAvailable - depositApplied` (clamped to 0 if deposit was from a previous balance). No `thisPayment` needed here (detail page, not payment page).

### 6. Translation keys (en.ts, ar.ts, ur.ts)

New keys:
- `billing.netInvoiceTotal` / صافي المبلغ / خالص رقم
- `billing.depositAvailable` / الإيداع المتاح / دستیاب ڈپازٹ
- `billing.depositApplied_full` / الإيداع المطبق / لاگو شدہ ڈپازٹ
- `billing.remainingDeposit` / الإيداع المتبقي / بقیہ ڈپازٹ
- `billing.previousCashPayments` / المدفوعات النقدية السابقة / سابقہ نقد ادائیگیاں
- `billing.thisPayment` / هذه الدفعة / یہ ادائیگی
- `billing.totalSettled` / إجمالي التسوية / کل تصفیہ
- `billing.balanceDue` / الرصيد المستحق / واجب الادا بیلنس
- `billing.refundDue` / مبلغ الاسترداد / واپسی واجب الادا
- `billing.fullySettled` / تمت التسوية بالكامل / مکمل تصفیہ

## Files Changed
- `src/components/billing/InvoiceTotals.tsx`
- `src/components/billing/PrintableReceipt.tsx`
- `src/components/billing/PrintablePaymentReceipt.tsx`
- `src/pages/app/billing/PaymentCollectionPage.tsx`
- `src/pages/app/billing/InvoiceDetailPage.tsx`
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`


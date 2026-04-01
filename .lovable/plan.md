

# Fix: PrintableInvoice (A4 TAX INVOICE) Missing 3-Section Breakdown

## Problem
The A4 print invoice (`PrintableInvoice.tsx`) was never updated with the 3-section layout. It still shows flat "Paid" and "BALANCE DUE" lines — mixing deposit applied with cash payments. The thermal receipts (`PrintableReceipt` and `PrintablePaymentReceipt`) were updated but this component was missed.

## Fix

### 1. `PrintableInvoice.tsx` — Replace totals section (lines 587-633)

Replace the current flat totals with the 3-section layout:

**Section 1 — Invoice Totals** (existing subtotal/tax/discount + "Net Invoice Total" instead of "TOTAL")

**Section 2 — Deposit Utilization** (conditional, only if deposit exists):
- Deposit Available
- Deposit Applied (green)
- Remaining Deposit

**Section 3 — Settlement Details** (conditional, only if any payment exists):
- Previous Cash Payments
- This Payment (if applicable)
- Total Settled (bold, border-top)
- Balance Due (red) / Refund Due (blue) / Fully Settled (green)

Add new props: `depositApplied`, `depositAvailable`, `remainingDeposit`, `previousCashPayments`.

Calculate settlement:
```
cashPayments = previousCashPayments ?? max(paid_amount - depositApplied, 0)
totalSettled = depositApplied + cashPayments
balanceDue = max(total - totalSettled, 0)
refundDue = totalSettled > total ? totalSettled - total : 0
```

### 2. `InvoiceDetailPage.tsx` — Pass deposit data to PrintableInvoice

Already has `depositAppliedAmount` and `availableDeposit` variables. Pass them:
```
depositApplied={depositAppliedAmount}
depositAvailable={availableDeposit}
remainingDeposit={Math.max((availableDeposit || 0) - depositAppliedAmount, 0)}
```

Also pass `currencySymbol` and `taxLabel` from country config.

### 3. Amount in Words — Use net total (no change needed, already uses `invoice.total_amount`)

## Files Changed
- `src/components/billing/PrintableInvoice.tsx` — add props, replace totals with 3-section layout
- `src/pages/app/billing/InvoiceDetailPage.tsx` — pass deposit props to PrintableInvoice


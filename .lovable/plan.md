

# Fix: Invoice Summary Should Show Deposit Application Breakdown

## Problem
When an IPD invoice is generated, the deposit is auto-applied and added to `paid_amount`. But the Invoice Detail page only shows a single "Paid" line in the summary — it doesn't distinguish between **deposit applied** vs **cash collected**. The user wants to see:

1. **Subtotal** — total charges
2. **Deposit Applied** — how much was applied from patient's advance deposit
3. **Cash Collected** — actual payments received
4. **Balance Due** — remaining amount (if deposit < invoice total)
5. **Refund Due** — overpayment (if deposit > invoice total)

## Current Flow (Already Working)
- `useGenerateIPDInvoice` auto-applies deposit: calculates `applyAmount = min(availableBalance, totalAmount)`, sets `paid_amount = applyAmount`, creates `patient_deposits` record with `type='applied'`
- GL is correct: DR LIA-DEP-001, CR AR-001

## What's Missing
The **InvoiceTotals** component and **InvoiceDetailPage** don't query or display deposit applications separately from cash payments.

## Plan

### File 1: `src/pages/app/billing/InvoiceDetailPage.tsx`
- Add a query to fetch deposit applications linked to this invoice:
  ```sql
  SELECT amount FROM patient_deposits 
  WHERE invoice_id = :id AND type = 'applied'
  ```
- Calculate: `depositApplied` = sum of applied deposits, `cashCollected` = total paid_amount - depositApplied
- Pass `depositApplied` to `InvoiceTotals`

### File 2: `src/components/billing/InvoiceTotals.tsx`
- Add optional `depositApplied` prop
- When present, show breakdown:
  - "Deposit Applied" line (green) showing deposit amount
  - "Cash Collected" line showing actual cash payments
  - Keep existing "Paid" line as fallback when no deposit data
- Show "Balance Due" in red if balance > 0
- Show "Refund Due" in blue if deposit exceeds total (overpayment scenario)

### File 3: `src/components/ipd/InvoiceStatusPanel.tsx`
- Already handles refund/balance display — ensure consistency with updated InvoiceTotals

### File 4: Translation keys
- Add `billing.depositApplied`, `billing.cashCollected`, `billing.refundDue` in en/ar/ur

## Example Display

```text
Subtotal                     Rs. 350,000
Tax                          Rs. 0
Discount                     Rs. 0
─────────────────────────────────────────
Total                        Rs. 350,000

Deposit Applied              Rs. 350,000  (green)
Cash Collected               Rs. 0
─────────────────────────────────────────
Balance Due                  Rs. 0        (or "Fully Settled" in green)
```

If deposit was Rs. 422,000 on a Rs. 350,000 invoice:
```text
Total                        Rs. 350,000
Deposit Applied              Rs. 350,000  (green, capped at total)
Remaining Deposit Balance    Rs. 72,000   (info, available for future use)
Balance Due                  Rs. 0        (Fully Settled)
```

## Files Changed
- `src/pages/app/billing/InvoiceDetailPage.tsx` — query deposit applications for invoice
- `src/components/billing/InvoiceTotals.tsx` — add deposit/cash breakdown display
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new labels


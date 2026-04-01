

# Create Full Deposit Detail Page (Like Invoice Detail Page)

## Problem
Deposit entries in the invoice list currently open a small dialog popup. The user wants them to navigate to a **full page** — same experience as clicking a regular invoice opens `/app/billing/invoices/:id`.

## Plan

### 1. Create `DepositDetailPage.tsx`
New page at `src/pages/app/billing/DepositDetailPage.tsx` — a full-page view modeled after `InvoiceDetailPage.tsx`:
- **PageHeader** with back button and title "Deposit Details"
- **Amount & Status card** — large amount, status badge, type (deposit/refund/applied)
- **Details card** — patient info (linked), date, payment method, reference number, collected by, notes
- **GL / Journal Entries card** — fetch journal entries by `reference_type='deposit'` and `reference_id`, show DR/CR lines with account numbers and names
- **Actions** — "View Patient Billing" button, link to GL entry
- All labels in 3 languages (en/ar/ur)

### 2. Add Route in `App.tsx`
```
/app/billing/deposits/:id → DepositDetailPage
```

### 3. Update Navigation (Remove Dialog)
- **`InvoicesListPage.tsx`**: Change deposit row click to `navigate(/app/billing/deposits/${depositId})` instead of opening `DepositDetailDialog`
- **`MobileInvoiceList.tsx`**: Same — navigate to full page on deposit card click
- Remove `DepositDetailDialog` import and state from both files

### 4. Translation Keys
Add `billing.depositDetail` page title in en/ar/ur (reuse existing keys where possible).

## Files Changed
- `src/pages/app/billing/DepositDetailPage.tsx` — new full page (reuse logic from `DepositDetailDialog`)
- `src/App.tsx` — add route
- `src/pages/app/billing/InvoicesListPage.tsx` — navigate instead of dialog
- `src/components/mobile/MobileInvoiceList.tsx` — navigate instead of dialog
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — page title key


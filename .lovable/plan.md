

# Dialysis Billing & Service Charges Integration

## Current State: NO BILLING EXISTS

The dialysis module has:
- `invoice_id` column on `dialysis_sessions` table (exists but never populated)
- `service_types` table has "Dialysis Session" (8000) and "Dialysis Monthly Package" (80000) entries seeded
- Zero code that creates invoices on session completion
- No consumables/supplies tracking per session
- No pricing breakdown on session creation or completion
- No link from completed sessions to the billing/invoices module

## What to Build

### 1. Auto-generate invoice on session completion
**File: `src/pages/app/dialysis/DialysisSessionDetailPage.tsx`**

When nurse/admin clicks "Complete Session":
- Query `service_types` for the "Dialysis Session" service to get default price
- Create an `invoices` record (patient_id, total_amount, status: "pending")
- Create `invoice_items` entries for: session charge, consumables (dialyzer, lines, etc.)
- Update `dialysis_sessions.invoice_id` with the new invoice ID
- Show success toast with invoice number and link to invoice

### 2. Add service charge configuration to session creation
**File: `src/pages/app/dialysis/DialysisNewSessionPage.tsx`**

Add a "Charges" section at the bottom of the new session form:
- Auto-fetch default price from `service_types` where name matches "Dialysis Session"
- Show editable fields: Session Fee, Consumables, Additional Charges
- Store these as session metadata (or apply at completion time)

### 3. Add consumables tracking per session
**File: `src/hooks/useDialysis.ts`**

Add `useDialysisSessionCharges` hook and `useGenerateDialysisInvoice` mutation:
- `useGenerateDialysisInvoice`: Creates invoice + invoice_items + updates session.invoice_id
- Follows exact same pattern as lab order invoice generation in `useLabOrders.ts`

### 4. Show billing status on session detail & sessions list
**Files: `DialysisSessionDetailPage.tsx`, `DialysisSessionsPage.tsx`**

- Session Detail: Show invoice badge (Pending/Paid/No Invoice) with link to `/app/billing/invoices/{id}`
- Sessions List: Add "Invoice" column showing status badge
- Include invoice in session query select: `invoices(id, invoice_number, status, total_amount)`

### 5. Add "Generate Invoice" button for completed sessions without invoice
**File: `src/pages/app/dialysis/DialysisSessionDetailPage.tsx`**

For completed sessions where `invoice_id` is null, show a "Generate Invoice" button that creates the invoice retroactively.

### 6. i18n keys
Add keys for: "Generate Invoice", "Session Fee", "Consumables", "Invoice Generated", "No Invoice", "View Invoice", dialysis billing labels in en/ar/ur.

## Technical Details

Invoice generation follows the exact lab order pattern:
```
1. Generate invoice_number: INV-{YYYYMMDD}-{random3}
2. Insert into invoices (patient_id, org_id, branch_id, total_amount, balance_amount, status: "pending")
3. Insert invoice_items (session fee line + consumable lines)
4. Update dialysis_sessions SET invoice_id = new_invoice.id
```

Service type lookup: `SELECT id, default_price FROM service_types WHERE name = 'Dialysis Session'`

## Files Changed
- `src/hooks/useDialysis.ts` — add `useGenerateDialysisInvoice` mutation, `useDialysisServicePrice` hook
- `src/pages/app/dialysis/DialysisSessionDetailPage.tsx` — invoice generation on complete, billing status card, generate invoice button
- `src/pages/app/dialysis/DialysisSessionsPage.tsx` — add invoice status column
- `src/pages/app/dialysis/DialysisNewSessionPage.tsx` — add charges preview section
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — billing-related keys

